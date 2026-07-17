# 📸 Plan de implementación — Imágenes (logo de liga + fotos de jugadores)

> Plan para la **sesión de mañana**. Objetivo: poder asociar imágenes a la **liga**
> (logo) y a los **jugadores** (foto), guardarlas vinculadas a la base de datos y
> mostrarlas en la página. Incluye, como extensión barata, **logos de equipos**
> (mismo patrón, muy recomendado porque mejora standings y cards).
>
> Stack actual: Express + PostgreSQL (`pg`) / Supabase · React + Vite · shadcn (el
> componente `Avatar` ya está instalado y soporta `AvatarImage` + fallback).

---

## 0. Decisión clave: ¿cómo guardamos la imagen?

No guardamos el binario de la imagen en columnas de la liga/jugador. Guardamos una
**URL/ruta (TEXT)** y la imagen vive en otro lado. Opciones, de menos a más infra:

| Opc | Cómo | Pros | Contras | Cuándo |
|-----|------|------|---------|--------|
| **A. URL externa** (pegar link) | columna `TEXT`, el admin pega un link a una imagen ya hosteada | Cero infra, se implementa en ~30 min, end-to-end completo | Depende de un host externo; no subís archivos propios | **MVP / Fase 1** |
| **B. Upload a disco** | `multer` + carpeta `uploads/` + `express.static` | Subís archivos reales, sin servicios externos | El disco es **efímero** en Render/Railway (se borra al redeploy) | Solo si corre local o VPS con disco persistente |
| **C. Upload a Supabase Storage** | `multer` (memoria) → bucket público → URL pública en la DB | Persistente, URLs públicas, encaja con que ya usan Supabase | Necesita `supabase-js` + bucket + **service key** en el back | **Fase 2 (producción)** |
| D. Base64 en la DB | guardar la imagen como string | Sin infra | Infla la DB y cada respuesta JSON; solo sirve para íconos diminutos | ❌ No recomendado |

**Recomendación:** hacer **Fase 1 (Opción A)** completa primero — deja la feature
andando de punta a punta (columna → formulario → display con fallback) — y después
**Fase 2 (Opción C)** para subir archivos de verdad. La columna `TEXT` no cambia entre
fases: en A guarda una URL externa, en C guarda la URL pública de Supabase.

---

## 1. Modelo de datos (migración SQL)

```sql
-- Fotos de jugadores y logos de equipos (nullable: la imagen es opcional)
ALTER TABLE players ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE teams   ADD COLUMN IF NOT EXISTS logo_url  TEXT;

-- "La liga": no existe tabla. Creamos un singleton de configuración global.
CREATE TABLE IF NOT EXISTS settings (
    id              integer PRIMARY KEY DEFAULT 1,
    league_name     varchar(100) DEFAULT 'Liga TPO',
    league_logo_url TEXT,
    CONSTRAINT settings_singleton CHECK (id = 1)   -- garantiza una sola fila
);
INSERT INTO settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
```

**Notas:**
- Correr esto **en la DB real** (Supabase). Y agregar las mismas columnas a
  `supabase_migration.sql` para que un setup fresco las tenga.
- Alternativa para el logo de liga: en vez de `settings`, una columna
  `seasons.logo_url` (cada temporada con su branding). Se eligió `settings` porque
  "la liga" es global, no por temporada. Si más adelante quieren branding por
  temporada, es un cambio chico.

---

## 2. Backend — Fase 1 (URL)

### 2.1 Jugadores — `jugadoresController.js`
- `crearJugador` / `editarJugador`: aceptar `photo_url` del body y sumarlo al
  `INSERT`/`UPDATE`. Las lecturas ya usan `SELECT *`, así que `photo_url` sale solo.
- Validación liviana: si viene, que sea string y (opcional) que matchee algo tipo
  `^https?://` para evitar basura.

### 2.2 Equipos — `equiposController.js`
- `crearEquipo` / `editarEquipo`: aceptar `logo_url` en `INSERT`/`UPDATE`.
- ⚠️ **`obtenerEquipos` selecciona columnas explícitas** (no `SELECT *`): hay que
  **agregar `t.logo_url`** al SELECT o no llega al front. (`obtenerEquipoPorId` usa
  `t.*`, ese sale solo.)

### 2.3 Liga — nuevos endpoints (archivo `settingsController.js` + `routes/settings.js`)
- `GET /api/settings` → **público** (lo consume el navbar/hero). Devuelve la fila 1.
- `PUT /api/settings` → **protegido** (`verificarToken`). Actualiza `league_name` y
  `league_logo_url`.
- Registrar la ruta en `index.js`: `app.use('/api/settings', settingsRoutes)`.

---

## 3. Backend — Fase 2 (upload real, Opción C: Supabase Storage)

1. En el dashboard de Supabase: crear un **bucket público** llamado `media`.
2. `npm i @supabase/supabase-js multer` en `backend`.
3. Env nuevas: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` (la *service role*, **solo en el
   back**, nunca en el front).
4. Endpoint `POST /api/upload` (protegido), `multer` con `memoryStorage`:
   - Validar `mimetype` (jpg/png/webp/svg) y tamaño (ej. máx 2 MB).
   - `supabase.storage.from('media').upload(path, buffer, { contentType })`.
   - Devolver la **URL pública** (`getPublicUrl`).
5. El front sube el archivo a `/api/upload`, recibe la URL y luego guarda esa URL con
   el `POST/PUT` normal del jugador/equipo/liga. **El upload y el guardado del registro
   quedan desacoplados** (más simple y reusable).

> Alternativa Opción B (disco): `multer` con `diskStorage` a `backend/uploads/`,
> `app.use('/uploads', express.static('uploads'))`, devolver `/uploads/<archivo>`.
> Recordar el caveat del disco efímero en hosting.

---

## 4. Frontend — Fase 1 (URL)

### 4.1 Jugadores
- **`PlayerForm.jsx`**: agregar input "URL de la foto (opcional)" → estado `photoUrl`,
  incluirlo en el `body` del submit y precargarlo en `iniciarEdicion(jugador)`.
- **`Jugadores.jsx`** y **`PlayerTable.jsx`**: usar el `Avatar` con imagen:
  ```jsx
  <Avatar className="w-12 h-12 shrink-0">
    <AvatarImage src={j.photo_url} alt={`${j.name} ${j.surname}`} />
    <AvatarFallback>{j.surname?.[0]}{j.name?.[0]}</AvatarFallback>
  </Avatar>
  ```
  El `AvatarFallback` ya muestra las iniciales **automáticamente** si no hay `src` o si
  la imagen falla al cargar → no hace falta lógica extra. (`AvatarImage` ya está
  exportado en `components/ui/avatar.jsx`.)

### 4.2 Equipos
- **`TeamForm.jsx`**: input "URL del logo (opcional)" (preservar como ya se preserva
  `stadium` al editar).
- Mostrar el logo donde hoy está el emoji 🏀: tarjetas de `Equipos.jsx`, fila de
  `TeamTable.jsx`, y opcionalmente la columna Equipo del standings en `Home.jsx`.
  Patrón con fallback al emoji:
  ```jsx
  {equipo.logo_url
    ? <img src={equipo.logo_url} alt={equipo.name} className="w-[50px] h-[50px] rounded-full object-cover border border-nba-border" onError={(e)=>{e.currentTarget.style.display='none'}} />
    : <span className="text-3xl ...">🏀</span>}
  ```

### 4.3 Liga
- **`AuthContext` o un nuevo `useSettings`/contexto liviano**: hacer `GET /api/settings`
  al montar la app y exponer `{ leagueName, leagueLogoUrl }`.
- **`NavigationBar.jsx`** y **hero de `Home.jsx`**: reemplazar el 🏀 + "LIGA TPO"
  hardcodeado por el logo/nombre de la liga (con fallback al emoji/“Liga TPO” si está
  vacío).
- **Admin**: agregar la edición. Lo más simple es sumarlo a la sección
  **Temporadas** (`src/pages/admin/TemporadasSection.jsx`) o crear una sección nueva
  "Liga/Configuración" con su subruta `/admin/liga` (siguiendo el patrón de Outlet ya
  montado). Form con nombre + URL del logo → `PUT /api/settings`.

---

## 5. Frontend — Fase 2 (subir archivo)

- Cambiar el input de texto por `<input type="file" accept="image/*">` con **preview**.
- Al elegir archivo: `POST /api/upload` (FormData), spinner mientras sube, recibir la
  URL y setearla en el estado (mismo `photoUrl`/`logoUrl` que ya existe).
- Mantener opcionalmente el campo URL como alternativa ("subir archivo **o** pegar link").

---

## 6. Orden sugerido para mañana (ruta crítica)

1. **Migración** (sección 1) en la DB real + actualizar `supabase_migration.sql`.
2. **Backend Fase 1** (jugadores + equipos + endpoints de settings).
3. **Frontend Fase 1** (forms + display + fallbacks). → **Probar end-to-end con URLs.**
4. ✅ *En este punto la feature ya funciona y se puede mostrar.* Commit/PR.
5. (Opcional, si sobra tiempo) **Fase 2**: upload real con Supabase Storage.

Hacer 1→4 primero garantiza algo funcionando aunque no se llegue a la Fase 2.

---

## 7. Checklist de pruebas

- [ ] Crear jugador con URL de foto → persiste, se ve, sobrevive recarga.
- [ ] Editar jugador: la foto se precarga en el form y se puede cambiar/borrar.
- [ ] URL rota o vacía → cae al fallback (iniciales / emoji) sin romper.
- [ ] Logo de equipo aparece en cards, tabla y standings.
- [ ] Logo + nombre de liga aparecen en navbar y hero; editables desde el admin.
- [ ] `GET /api/equipos` devuelve `logo_url` (acordarse del SELECT explícito).
- [ ] `npm run build` OK.
- [ ] (Fase 2) Subir jpg/png chico → vuelve URL pública y se guarda.

---

## 8. Gotchas / cosas a no olvidar

- **`obtenerEquipos` usa SELECT explícito** → sin agregar `t.logo_url` la imagen "no
  aparece" aunque esté en la DB. Es el error más probable.
- **Fallback del `Avatar`**: base-ui muestra el `AvatarFallback` solo si la imagen no
  carga; igual conviene probar una URL rota a propósito.
- **SVG subidos por usuarios = riesgo XSS** (un SVG puede traer `<script>`). Para el TPO
  el riesgo es bajo, pero si se permite subir logos, preferir raster (png/webp) o
  sanitizar. URLs externas a SVG conocidos están ok.
- **Tamaño/seguridad del upload (Fase 2)**: límite de ~2 MB y whitelist de mimetypes.
- **Service key de Supabase**: solo en el backend (`.env`), nunca en el front ni en git.
- **Disco efímero (Opción B)**: en hosting tipo Render/Railway los archivos subidos a
  `uploads/` se pierden al redeploy → por eso se recomienda la Opción C para producción.
- **Persistencia del plan**: este archivo (`PLAN_IMAGENES.md`) queda en el repo para
  retomar mañana.

---

## 9. Resumen de archivos a tocar

**Nuevos:**
- `backend/src/controllers/settingsController.js`, `backend/src/routes/settings.js`
- (Fase 2) `backend/src/controllers/uploadController.js`, `backend/src/routes/upload.js`
- (opcional) `frontend/src/features/.../useSettings` o contexto de liga
- (opcional) `frontend/src/pages/admin/LigaSection.jsx` (+ ruta `/admin/liga`)

**Modificados:**
- DB: `players`, `teams` (+ columnas), nueva tabla `settings`; `supabase_migration.sql`
- `backend/src/index.js` (registrar rutas nuevas)
- `backend/src/controllers/{jugadores,equipos}Controller.js`
- `frontend`: `PlayerForm`, `PlayerTable`, `Jugadores`, `TeamForm`, `TeamTable`,
  `Equipos`, `Home` (standings + hero), `NavigationBar`
