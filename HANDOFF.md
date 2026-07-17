# 🏀 Handoff — Proyecto Liga Baloncesto (TPO)

> Documento de traspaso. Resume **todo lo trabajado con Claude Code** en las últimas
> sesiones (hasta el **2026-06-10**) para que otro agente pueda continuar
> con contexto completo. No describe el proyecto entero, sino **lo que cambió y por qué**,
> más el trabajo pendiente recomendado.
>
> **Estado de `main` (2026-06-10):** todo lo descrito abajo está **mergeado en `main`**
> (PRs #1, #2, #5, #6, #7). El build de producción pasa. Para verlo todo junto:
> `git checkout main && git pull`, luego levantar backend y frontend.

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

## 3.5 — Sesiones C–F (2026-06-10): integridad, jugadores, subrutas y UI

Cuatro tandas de trabajo, cada una mergeada a `main` como un PR independiente.

### 🐛 PR #2 — Bugs de integridad de datos (back + front)

**Bug "éxito falso":** operaciones que afectan 0 filas igual respondían 200.
- `editarEquipo` / `borrarEquipo` (`equiposController.js`): ahora chequean
  `result.rows.length` / `rowCount` → **404** si el id no existe (antes 200 mintiendo).
- `MatchTable.handleBorrar`: ahora mira `res.ok` (antes siempre mostraba toast verde).

**Bug "pérdida silenciosa de puntos":** `cargarResultado` (`partidosController.js`)
hacía `UPDATE team_stats ... WHERE team_id AND season_id`; si un equipo **no tenía
fila de stats** para esa temporada, el UPDATE afectaba 0 filas **sin error**, el partido
quedaba `'jugado'` y se hacía COMMIT → puntos perdidos sin aviso. **Fix:** se captura el
`rowCount` de ambos UPDATE; si alguno ≠ 1 → `ROLLBACK` + **409** (el partido vuelve a
`pendiente` y es reintentable). *Disparador real del estado roto: crear un equipo cuando
NO hay temporada activa (`crearEquipo` salta el INSERT de stats si `!seasonId`).*

### ✅ PR #5 — Edición de jugadores en el panel admin

El backend ya exponía `PUT /jugadores/:id` (`editarJugador`); **solo faltaba el front**
(mismo hueco que tuvo Equipos). Se replicó el patrón `MatchForm`/`TeamForm`:
- `PlayerForm.jsx` → form **dual alta/edición** con `forwardRef` +
  `useImperativeHandle.iniciarEdicion(jugador)`. Callback `onPlayerCreated` → `onPlayerSaved`.
- `PlayerTable.jsx` → botón **editar (lápiz)** vía `onEditPlayer` + chequeo `res.ok` en la baja.
- `Admin.jsx` → `playerFormRef`, `handleEditPlayer` y wiring.

### 🔀 PR #6 — Navegación del admin por subrutas reales

**Resuelve la limitación notada en la sección 6:** la navegación dejó de ser por estado
local (`activeSection`) y pasó a **rutas reales**: `/admin/partidos`, `/admin/jugadores`,
`/admin/equipos`, `/admin/temporadas`. Patrón **layout + `<Outlet>`**:
- `Admin.jsx` es ahora el **layout**: carga la data compartida y la reparte por
  `useOutletContext`; el título del header se deriva de la URL.
- **Nuevos** `src/pages/admin/{Partidos,Jugadores,Equipos,Temporadas}Section.jsx`
  (cada uno con su propio `ref` de edición).
- `AdminSidebar.jsx` navega con `navigate('/admin/...')` y resalta el activo según la ruta.
- `App.jsx` define rutas anidadas con `index` redirect y catch-all **absoluto**
  (`<Navigate to="/admin/partidos">`; uno relativo entraba en loop).
- **Beneficios:** recargar mantiene la sección, deep-linking y atrás/adelante del navegador.

### 🎨 PR #7 — Pulido visual + mejor uso de shadcn

- **`CategoryFilter.jsx`** (nuevo, sobre `<Tabs>`): reemplaza el filtro Todos/Senior/Junior
  que estaba **triplicado a mano** en `Home`, `Equipos` y `Jugadores` (DRY).
- **Menú hamburguesa mobile** en `NavigationBar` con `<Sheet>` (**resuelve el pendiente #4**:
  antes los links centrales eran `hidden md:flex` sin reemplazo en celular).
- **Menú de usuario** con `<DropdownMenu>`: **única vía de logout fuera del admin**
  (antes "Cerrar sesión" solo existía en el sidebar del panel).
- **`Avatar`** de jugadores con `<Avatar>`/`<AvatarFallback>` (listo para fotos vía `AvatarImage`).
- **Fix `font-heading`** (**resuelve el pendiente #3**): se importó Roboto Condensed de Google
  Fonts y se quitó el override `--font-heading: var(--font-sans)` en `@theme inline`. Ahora la
  tipografía condensada deportiva sí se aplica. *(Para producción: migrar a `@fontsource/roboto-condensed`.)*
- **Fixes menores:** roster expandido en `Equipos` usaba `animate-pulse` (parpadeo infinito de
  skeleton) → `animate-in fade-in`; `verDetalle` ahora chequea `res.ok`; se quitó el
  `cursor-pointer` engañoso de `ScoreboardRibbon` (no era clickeable).

> Verificado en vivo (preview): Tabs, Sheet, DropdownMenu, logout, deep-linking de subrutas y
> edición de jugadores. `npm run build` OK con todo integrado en `main`.

### ⚠️ Nota sobre los hashes/emails en `supabase_migration.sql`
El dueño del repo decidió que **para este proyecto académico no es un problema** tener los
hashes bcrypt y emails de admin en el dump. Queda documentado (era el pendiente #10) pero
**no se va a corregir** por decisión explícita.

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

## 5. Trabajo pendiente / recomendaciones

Priorizado. **Resueltos al 2026-06-10:** #3 (fuente, PR #7), #4 (mobile nav, PR #7).
**Descartado por decisión del dueño:** #10 (credenciales en el dump — ver nota en sección 3.5).

### 🎨 Diseño / UX (pendientes)
1. **Contraste (accesibilidad):** `--color-nba-gray (#8A8A8A)` sobre `--color-nba-card (#1E1E1E)`
   queda ~3.5:1, **por debajo de WCAG AA (4.5:1)**, y se usa mucho en texto chico (0.65–0.7rem).
   Subir ese gris (o usar `nba-lightgray #B0B0B0`, que sí pasa).
2. **Semántica de color de botones inconsistente:** "crear" usa **rojo** en Equipos, **azul** en
   Partidos, **verde** en Temporadas; y el rojo se usa tanto para acción primaria (GUARDAR) como
   destructiva (BORRAR). Recomendado: **rojo solo para destructivo**, un color fijo para primario.
3. ~~**Bug de tipografía** (`--font-heading` pisado por Geist).~~ ✅ **Hecho (PR #7).**
4. ~~**Mobile sin navegación** (faltaba hamburguesa).~~ ✅ **Hecho (PR #7, `<Sheet>`).**
5. **Contenido placeholder:** `Home.jsx` tiene `TITULARES` hardcodeado (noticias falsas), links
   `href="#"`, "Ver más" sin destino, hero dice "en vivo" sin datos en vivo, y `PlayoffBracket`
   siempre muestra "Por definir". Conectar a datos reales o suavizar los textos.
6. **Exceso de UPPERCASE + tracking** en toda la UI: funciona para el look NBA pero cansa;
   dejar cuerpos/listas en sentence-case daría aire.

### 🛠️ Código / arquitectura (pendientes)
7. **Helper `withTransaction`:** las funciones con transacción repiten el patrón
   `pool.connect()/try/catch/finally`. Extraer un `backend/src/helpers/withTransaction.js` (DRY).
8. **`PlayoffBracket.jsx`** es solo visual (semis/final fijas en "Por definir"); falta la lógica
   real de avance del bracket.
9. **CORS abierto** en el backend: revisar y restringir orígenes para producción.
11. **Contrato de error inconsistente:** `authMiddleware.js` responde `{ message }` mientras que
    todos los controllers responden `{ error }` (y el front lee `data.error`). Unificar a `{ error }`
    para que el mensaje de token vencido se muestre.
12. **shadcn instalados sin usar / por agregar:** `separator` (decorativo), y candidatos a sumar:
    `combobox` (búsqueda en los Select de equipos del admin), `alert` (errores con jerarquía),
    `collapsible` (expandir roster en Equipos), `scroll-area` (cinta de marcadores). Ver review
    de la sesión F.

---

## 6. Notas / convenciones útiles

- **`api.js`**: `get/post/put/del`. `put` y `del` mandan token por defecto (`auth=true`); los
  componentes-tabla llaman a `api` directamente (no via los hooks `useTeams.deleteTeam`, etc.).
- **Navegación del admin ES por URL (desde PR #6):** cada sección es una ruta real
  (`/admin/partidos`, `/admin/jugadores`, `/admin/equipos`, `/admin/temporadas`). `Admin.jsx` es
  el layout (carga data, reparte por `useOutletContext`, renderiza `<Outlet>`); las secciones
  viven en `src/pages/admin/*Section.jsx`. Recargar mantiene la sección.
- **Patrón de edición:** form con `forwardRef` + `useImperativeHandle.iniciarEdicion(item)`,
  disparado desde la tabla por el padre (`MatchForm` y ahora `TeamForm`).
- **Auth:** JWT en `localStorage`, `AuthContext` centraliza `isAuthenticated`/`login`/`logout`;
  `ProtectedRoute` redirige a `/login` si no hay sesión.

---

## 7. Sesiones de julio 2026 — Playoffs, entrega y documentación

### 🖼️ PR #8 — Imágenes (Fase 1: URLs) `feat/images`
- Migración **002**: `players.photo_url`, `teams.logo_url` y tabla `settings` (singleton id=1
  con `league_name` + `league_logo_url`). Runner propio: `node migrations/run.js <archivo.sql>`.
- Fotos de jugadores con `Avatar + AvatarFallback` (iniciales); logos de equipos en standings,
  cards públicas y admin (fallback 🏀); sección **Liga** en el admin para el branding global,
  consumido en vivo por navbar/hero vía `SettingsContext`.
- Fase 2 (upload real a Supabase Storage) quedó explícitamente diferida.

### 🏆 PR #9 — Playoffs funcionales, filtros y fixes `feat/playoffs-y-filtros`
- Migración **003**: columna `matches.phase` (`regular` default | `cuartos` | `semis` | `final`).
- **Reglas de negocio en backend**: los playoffs NO tocan `team_stats` (ni al cargar resultado
  ni al revertir en borrado) y no admiten empate (400). `?phase=` como filtro en GET /partidos.
- **Bracket funcional** (resuelve el pendiente #8 de la sección 5): `PlayoffBracket` recibe los
  partidos de playoffs y hace avanzar ganadores (cuartos → semis → final → 👑 campeón);
  `encontrarGanador()` matchea el partido jugado por par de equipos + fase.
- **Admin**: selector de fase en `MatchForm`, badge dorado 🏆 CUARTOS/SEMIS/FINAL en `MatchTable`.
- **Jugadores**: dropdown de filtro por equipo (derivado de los propios jugadores + "Agente
  Libre"), combinable con búsqueda y categoría.
- **Palmarés en Home** (resuelve el pendiente #5, TITULARES): `GET /api/temporadas/campeones`
  (ganador de la final por temporada/categoría, `DISTINCT ON` contra duplicados) reemplaza a
  las noticias hardcodeadas.
- **Fix Selects de base-ui**: el trigger mostraba el value crudo (id del equipo, "2" en vez del
  nombre de la temporada). Solución: prop `items={...}` en cada `Select` cuyo value ≠ etiqueta.
- **Fix layout admin**: los botones editar/borrar quedaban tras un scroll horizontal. Causa
  doble: form y tabla compartían `flex-1` (50/50) y las celdas shadcn traen `whitespace-nowrap`.
  Solución: form `xl:w-80` fijo + tabla `flex-1 min-w-0` + `[&_td]:whitespace-normal`.
- **Comentarios**: banner en `authMiddleware` (estaba sin documentar), config dual explicada en
  `db.js`, limpieza del ruido línea-por-línea en `routes/jugadores.js`.

### 📦 Entrega (2026-07-16)
- PRs **#8** y **#9** mergeados a `main` (`3cb87e0`); ramas feature borradas local y remoto.
- **Documentación de entrega**: `README.md` raíz nuevo (features, wireframes → producto,
  arquitectura y ER en mermaid, capturas de Supabase, instalación, tabla de endpoints),
  `DOCUMENTACION_TECNICA.md` actualizada (phase, settings, campeones, migraciones),
  `frontend/DOCUMENTACION_FRONTEND.md` nueva, assets en `docs/img/` (wireframes del PDF
  convertidos a PNG, capturas de la app y de Supabase).

### ⚠️ Pendientes que siguen abiertos (auditoría 2026-07-03)
- Hooks de features con mutaciones muertas/rotas: `usePlayers.deletePlayer` llama `api.delete`
  (no existe; es `del`) y `useMatches.updateMatchScore` usa POST donde el back espera PUT.
  Nadie las usa hoy — decidir: arreglar y usar, o borrar.
- `asChild` usado en 5 archivos pero los componentes ui de base-ui usan la API `render`
  (warnings en consola + `<button>` anidados en Home).
- `borrarJugador` sin chequeo de `rowCount` (éxito falso con id inexistente).
- Handler 404 JSON faltante en `index.js` (rutas desconocidas devuelven HTML de Express).
- Ítems previos de la sección 5 que siguen: contraste WCAG, semántica de color de botones,
  `withTransaction`, CORS abierto, `{error}` vs `{message}`, uppercase excesivo.
- ~9 errores de ESLint preexistentes (reglas react-hooks) en `Admin.jsx` y otros.
