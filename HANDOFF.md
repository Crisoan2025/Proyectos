# 🏀 Handoff — Proyecto Liga Baloncesto (TPO)

> Documento de traspaso. Resume **todo lo trabajado con Claude Code** en las últimas
> sesiones (hasta el **2026-05-29**) para que otro agente (Antigravity) pueda continuar
> con contexto completo. No describe el proyecto entero, sino **lo que cambió y por qué**,
> más el trabajo pendiente recomendado.

---

## 1. Stack del proyecto

| Capa | Tecnología |
|------|-----------|
| **Backend** | Node.js + Express, PostgreSQL (`pg.Pool`), JWT (auth), bcrypt, `express-rate-limit` |
| **Frontend** | React 19 + Vite 8, React Router 7, Tailwind v4, shadcn/ui (style `base-nova` sobre `@base-ui/react`), `lucide-react`, `sonner` (toasts), `date-fns` |
| **DB** | PostgreSQL local o Supabase (`DATABASE_URL`). Modelo multi-temporada: `team_stats (team_id, season_id)` con UNIQUE |

**Estructura frontend (feature-based):** `src/features/{auth,matches,players,teams,admin}/`,
páginas en `src/pages/`, UI compartida en `src/components/ui/` (shadcn), servicio HTTP central
en `src/services/api.js`, hooks en `src/hooks/`.

### Cómo correr
```bash
# Backend
cd backend && npm install && npm run dev      # levanta Express (puerto 3000 por defecto)

# Frontend
cd frontend && npm install && npm run dev      # Vite
cd frontend && npm run build                   # valida compilación/JSX
```
El frontend apunta a `import.meta.env.VITE_API_URL || 'http://localhost:3000/api'`.

---

## 2. Sesión A — Análisis + corrección de 2 bugs críticos

Se hizo primero un **informe de análisis** (back + front) sin tocar código, y luego se
aplicaron dos fixes solicitados, **comentando cada corrección en el código** (estilo del
proyecto).

### 🐛 Bug #1 — Transacciones que NO eran atómicas (backend)

**Causa raíz:** se usaba `pool.query('BEGIN')`, `pool.query('COMMIT')`, etc. `pg.Pool` entrega
una **conexión distinta por cada `.query()`** y la libera enseguida, así que `BEGIN / UPDATE /
COMMIT` podían repartirse en conexiones diferentes → la transacción no envolvía nada, el
`ROLLBACK` no revertía y quedaban conexiones *"idle in transaction"*.

**Fix:** patrón de **una sola conexión dedicada**:
```js
const client = await pool.connect();
try {
  await client.query('BEGIN');
  // ... todas las queries usan `client`, NO `pool` ...
  await client.query('COMMIT');
} catch (err) {
  await client.query('ROLLBACK');
  res.status(500).json({ error: "..." });
} finally {
  client.release();   // siempre devuelve la conexión al pool
}
```

**Archivos/funciones corregidas:**
- `backend/src/controllers/partidosController.js` → `cargarResultado`, `borrarPartido`
- `backend/src/controllers/temporadasController.js` → `crearTemporada`
- `backend/src/controllers/equiposController.js` → `crearEquipo`
  *(este 4º caso no estaba en la lista original; se descubrió con un `grep` de verificación)*

> Nota: `getActiveSeasonId()` (un simple SELECT) queda fuera de la transacción a propósito.

### 🐛 Bug #2 — El login recargaba la página y ocultaba el error (frontend)

**Causa raíz:** `handleResponse` en `api.js` trataba **cualquier 401** como "sesión vencida" y
hacía `window.location.href = '/login'` (recarga dura). Como una contraseña incorrecta también
devuelve 401, recargaba antes de poder mostrar el error. Bug secundario: se leía `data.message`
pero el backend siempre responde `{ error: "..." }`.

**Fix:**
- `frontend/src/services/api.js` → `handleResponse(res, options)` ahora acepta
  `redirectOn401` (default `true`) + guarda anti-loop (no redirige si ya estás en `/login`).
  Los 4 métodos (`get/post/put/del`) propagan `options`.
- `frontend/src/features/auth/pages/Login.jsx` → llama
  `api.post('/auth/login', {...}, false, { redirectOn401: false })` y lee `data.error`.

**Verificado por el usuario:** ya no parpadea al recargar, muestra el mensaje correcto, y el
rate-limit bloquea la IP tras 5 intentos (15 min, in-memory; se aplica solo a `POST /auth/login`).

---

## 3. Sesión B — Features de UI (2026-05-29)

### ✅ 3.1 — CRUD de Equipos en el panel Admin

**Problema:** la sección **Equipos** de `/admin` solo permitía **crear** (renderizaba solo
`TeamForm`). No se podían ver, editar ni eliminar — a diferencia de Partidos y Jugadores.

**El backend YA estaba completo** (no se tocó): `backend/src/routes/equipos.js` ya expone
`PUT /equipos/:id` (`editarEquipo`) y `DELETE /equipos/:id` (`borrarEquipo`), ambos protegidos
con `verificarToken`. `DELETE` borra `team_stats` en cascada (`ON DELETE CASCADE`).

**Cambios (solo frontend), siguiendo los patrones de `PlayerTable`/`MatchTable`/`MatchForm`:**
- **NUEVO** `frontend/src/features/teams/components/TeamTable.jsx` — tabla presentacional
  (Equipo / DT / Cat. / Opciones). Botón editar (lápiz) → `onEditTeam`; botón borrar (tacho)
  con `AlertDialog` de confirmación → `api.del('/equipos/:id')`. Muestra `data.error` por toast
  si el backend rechaza el borrado.
- **MODIFICADO** `frontend/src/features/teams/components/TeamForm.jsx` — ahora es **form dual
  (alta/edición)** con `forwardRef` + `useImperativeHandle({ iniciarEdicion(equipo) })`, igual
  que `MatchForm`. En edición: borde rojo, "ACTUALIZAR EQUIPO" + "CANCELAR EDICIÓN", hace `PUT`;
  en alta hace `POST` y autogenera el estadio. **Preserva** `equipo.stadium` al editar (el campo
  estadio no se muestra en el form). Callback renombrado `onTeamCreated` → `onTeamSaved`.
- **MODIFICADO** `frontend/src/pages/Admin.jsx` — el `case 'equipos'` pasó a layout de dos
  columnas (form + tabla). Se agregó `teamFormRef`, `handleEditTeam` y `handleTeamSaved`
  (recarga equipos **y** partidos, para que el fixture refleje un nombre de equipo editado).

### ✅ 3.2 — Ocultar la cinta de partidos en /login

**Problema:** el `ScoreboardRibbon` (cinta de marcadores estilo NBA) se mostraba en **todas**
las rutas públicas, incluida `/login`, donde quedaba feo.

**Cambio:** `frontend/src/App.jsx` — el `Layout` ya inspecciona `location.pathname` (lo usa para
`/admin`). Se agregó `const isLogin = location.pathname === '/login'` y se condicionó el render:
`{!isLogin && <ScoreboardRibbon />}`. Se sigue mostrando en Inicio/Equipos/Jugadores.

### ✅ 3.3 — Rediseño del Login con el bloque shadcn `login-01`

**Objetivo:** que `/login` se vea más prolijo apoyándose en un componente de shadcn.

**Cambios:**
- Se instaló **solo** el componente `label` vía CLI (`npx shadcn add label`) — era lo único que
  faltaba. Se decidió **NO** instalar el bloque entero para evitar sobrescribir
  `button/card/input` ya existentes y no dejar un `login-form.jsx` huérfano.
- **MODIFICADO** `frontend/src/features/auth/pages/Login.jsx` — adopta la **estructura** de
  `login-01` (Card → `CardHeader`/`CardTitle`/`CardDescription` → `CardContent` con campos
  `Label` + `Input`), **adaptada a la paleta NBA** (`bg-nba-card`, `bg-nba-dark`, `bg-nba-red`,
  `font-heading`). Cada input tiene `<Label htmlFor>` (mejora de accesibilidad).
  **La lógica de auth del Bug #2 se conservó intacta.**
- **NUEVO** `frontend/src/components/ui/label.jsx` (generado por la CLI).

> Todos los cambios de frontend compilan (`npm run build` OK).

---

## 4. Archivos tocados (resumen)

**Backend (Sesión A):**
- `src/controllers/partidosController.js`, `temporadasController.js`, `equiposController.js`

**Frontend (Sesión A):**
- `src/services/api.js`, `src/features/auth/pages/Login.jsx`

**Frontend (Sesión B):**
- `src/features/teams/components/TeamTable.jsx` *(nuevo)*
- `src/features/teams/components/TeamForm.jsx`
- `src/pages/Admin.jsx`
- `src/App.jsx`
- `src/features/auth/pages/Login.jsx` *(rediseño)*
- `src/components/ui/label.jsx` *(nuevo, shadcn)*

> El código tiene comentarios marcando cada cambio: `🔧 CORRECCIÓN`, `🔧 AMPLIACIÓN`,
> `🎨 REDISEÑO`. Buscar esos marcadores ayuda a ubicar lo modificado.

---

## 5. Trabajo pendiente / recomendaciones para Antigravity

Priorizado. Nada de esto está hecho todavía.

### 🎨 Diseño / UX (de una revisión estética hecha esta sesión)
1. **Contraste (accesibilidad):** `--color-nba-gray (#8A8A8A)` sobre `--color-nba-card (#1E1E1E)`
   queda ~3.5:1, **por debajo de WCAG AA (4.5:1)**, y se usa mucho en texto chico (0.65–0.7rem).
   Subir ese gris (o usar `nba-lightgray #B0B0B0`, que sí pasa).
2. **Semántica de color de botones inconsistente:** "crear" usa **rojo** en Equipos, **azul** en
   Partidos, **verde** en Temporadas; y el rojo se usa tanto para acción primaria (GUARDAR) como
   destructiva (BORRAR). Recomendado: **rojo solo para destructivo**, un color fijo para primario.
3. **Posible bug de tipografía:** en `frontend/src/index.css`, `--font-heading` se define como
   `"Roboto Condensed"` (línea ~21) pero **se pisa** en `@theme inline` con `var(--font-sans)`
   → Geist (líneas ~34-35). La fuente condensada "deportiva" probablemente **no se aplica**.
   Verificar en DevTools y resolver el conflicto.
4. **Mobile sin navegación:** en `NavigationBar.jsx` los links centrales son `hidden md:flex`
   pero **no hay menú hamburguesa** que los reemplace en celular.
5. **Contenido placeholder:** `Home.jsx` tiene `TITULARES` hardcodeado (noticias falsas), links
   `href="#"`, "Ver más" sin destino, hero dice "en vivo" sin datos en vivo, y `PlayoffBracket`
   siempre muestra "Por definir". Conectar a datos reales o suavizar los textos.
6. **Exceso de UPPERCASE + tracking** en toda la UI: funciona para el look NBA pero cansa;
   dejar cuerpos/listas en sentence-case daría aire.

### 🛠️ Código / arquitectura
7. **Helper `withTransaction`:** las 4 funciones con transacción repiten el patrón
   `pool.connect()/try/catch/finally`. Extraer un `backend/src/helpers/withTransaction.js` (DRY).
8. **`PlayoffBracket.jsx`** es solo visual (semis/final fijas en "Por definir"); falta la lógica
   real de avance del bracket.
9. **CORS abierto** en el backend: revisar y restringir orígenes para producción.

### 🔒 Seguridad
10. **`supabase_migration.sql`** (raíz del repo) contiene **hashes bcrypt y emails reales de
    admin**, y NO está excluido por `.gitignore` (solo se ignoran `.env` y `*.png`). Revisar
    antes de cualquier push público.

---

## 6. Notas / convenciones útiles

- **`api.js`**: `get/post/put/del`. `put` y `del` mandan token por defecto (`auth=true`); los
  componentes-tabla llaman a `api` directamente (no via los hooks `useTeams.deleteTeam`, etc.).
- **Navegación del admin NO es por URL:** dentro de `/admin/*` las secciones (Partidos/Jugadores/
  Equipos/Temporadas) se cambian con un **estado local** `activeSection` en `Admin.jsx`
  (`AdminSidebar` llama a `setActiveSection`). La URL siempre queda en `/admin`; recargar vuelve a
  "Partidos". *(Posible mejora: sub-rutas reales `/admin/equipos`, etc.)*
- **Patrón de edición:** form con `forwardRef` + `useImperativeHandle.iniciarEdicion(item)`,
  disparado desde la tabla por el padre (`MatchForm` y ahora `TeamForm`).
- **Auth:** JWT en `localStorage`, `AuthContext` centraliza `isAuthenticated`/`login`/`logout`;
  `ProtectedRoute` redirige a `/login` si no hay sesión.
