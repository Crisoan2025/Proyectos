#  Documentación Técnica — Frontend Liga de Baloncesto TPO

## 1. Información General

| Campo | Valor |
|---|---|
| **Framework** | React 19 |
| **Bundler / Dev server** | Vite |
| **Routing** | React Router 7 (SPA con rutas anidadas) |
| **Estilos** | Tailwind CSS v4 + shadcn/ui (estilo base-nova sobre `@base-ui/react`) |
| **Iconos / Toasts** | lucide-react · sonner |
| **Backend** | API REST en `VITE_API_URL` (default `http://localhost:3000/api`) |

---

## 2. Arquitectura: feature-based

El código se organiza **por dominio** (feature) y no por tipo de archivo. Cada feature agrupa su lógica de datos (`api/`), sus componentes (`components/`) y, si aplica, su contexto o páginas:

```
frontend/src/
├── features/                    # DOMINIO — una carpeta por área de negocio
│   ├── auth/                    #   Login, AuthContext (token JWT en un solo lugar)
│   ├── matches/                 #   MatchForm, MatchTable, ScoreboardRibbon, useMatches
│   ├── players/                 #   PlayerForm, PlayerTable, usePlayers
│   ├── teams/                   #   TeamForm, TeamTable, useTeams
│   ├── settings/                #   SettingsContext (branding global de la liga)
│   └── admin/                   #   AdminSidebar
├── pages/                       # VISTAS — componen features
│   ├── Home.jsx                 #   Standings + bracket + palmarés
│   ├── Equipos.jsx              #   Cards públicas con roster expandible
│   ├── Jugadores.jsx            #   Buscador + filtros (equipo, categoría)
│   ├── Admin.jsx                #   LAYOUT del panel (sidebar + <Outlet>)
│   └── admin/                   #   Una sección por sub-ruta real
│       ├── PartidosSection.jsx  #   /admin/partidos
│       ├── JugadoresSection.jsx #   /admin/jugadores
│       ├── EquiposSection.jsx   #   /admin/equipos
│       ├── TemporadasSection.jsx#   /admin/temporadas
│       └── LigaSection.jsx      #   /admin/liga (branding)
├── components/                  # UI COMPARTIDA entre páginas
│   ├── PlayoffBracket.jsx       #   Bracket con avance real de ganadores
│   ├── CategoryFilter.jsx       #   Tabs Todos/Senior/Junior reutilizado en 3 páginas
│   ├── NavigationBar.jsx        #   Navbar estilo NBA (mobile: Sheet)
│   ├── ProtectedRoute.jsx       #   Guard de rutas del admin
│   └── ui/                      #   Componentes shadcn generados (no se documentan)
├── hooks/
│   └── useApi.js                # Patrón de fetch con { data, loading, error, reload }
└── services/
    └── api.js                   # Cliente HTTP central (get/post/put/del)
```

**Regla de dependencia**: `pages` compone `features` y `components`; las features no se importan entre sí.

---

## 3. Flujo de datos

```
Componente ──► useApi('/endpoint') ──► services/api.js ──► fetch ──► Express
     ▲                                        │
     └── { data, loading, error, reload } ◄───┘
```

- **`services/api.js`**: único lugar donde se construyen los headers. Adjunta el JWT (`Authorization: Bearer`) cuando la operación lo requiere y **intercepta los 401** (token vencido → limpia el token y redirige a `/login`; el propio login pasa `redirectOn401: false` para mostrar el error en pantalla).
- **`hooks/useApi.js`**: encapsula el patrón fetch → json → estado con `loading` y `error`; expone `reload()` memoizado con `useCallback`.
- **Contextos globales**:
  - `AuthContext` — token en `localStorage` + `login/logout/isAuthenticated`. Consumido por `ProtectedRoute`, navbar y admin.
  - `SettingsContext` — branding de la liga (nombre + logo) cargado de `/api/settings`; `reloadSettings()` permite que editar el branding en el admin refresque navbar y hero en vivo.

---

## 4. Routing

```jsx
/                    → Home (standings + bracket + palmarés)
/equipos             → Equipos (cards + roster)
/jugadores           → Jugadores (buscador + filtros)
/login               → Login
/admin               → LAYOUT protegido (ProtectedRoute + Admin.jsx)
  ├── /admin/partidos    (default: index redirige acá)
  ├── /admin/jugadores
  ├── /admin/equipos
  ├── /admin/temporadas
  └── /admin/liga
```

El admin usa **rutas reales anidadas** (no estado local): recargar mantiene la sección, los links son compartibles y Atrás/Adelante funcionan. `Admin.jsx` es el layout — carga la data compartida una sola vez y la reparte a las secciones vía `<Outlet context={...}>` (`useOutletContext` en cada sección).

---

## 5. El bracket de playoffs (feature estrella)

`components/PlayoffBracket.jsx` recibe dos props desde Home:

1. **`equipos`** — el standings ya ordenado. Con el top 8 arma los cruces de cuartos: `1v8`, `4v5` (lado izquierdo) y `2v7`, `3v6` (lado derecho).
2. **`partidos`** — los partidos de playoffs (`phase != 'regular'`) de la misma temporada/categoría.

La función `encontrarGanador(teamA, teamB, fase, partidos)` busca un partido **jugado** de esa fase que enfrente a esos dos equipos (sin importar quién fue local) y devuelve al ganador por puntos. Con ella se resuelven las tres rondas en cascada:

```
cuartos (4 cruces) ──► semis (2 cruces con los ganadores) ──► final ──► 👑 campeón
```

Los cruces sin partido jugado muestran "Por definir". Los partidos de playoffs **no afectan el standings** (regla implementada en el backend).

---

## 6. Patrones y convenciones

- **Formularios duales (crear/editar)**: `MatchForm`, `TeamForm` y `PlayerForm` exponen `iniciarEdicion(entidad)` vía `forwardRef + useImperativeHandle`; el padre (sección del admin) dispara la edición desde el botón ✏️ de la tabla. Si hay id en edición → PUT, si no → POST.
- **Selects de base-ui**: siempre pasar `items={...}` (mapa value → label) cuando el value no coincide con la etiqueta visible (ids de equipos, fases). Sin eso, el trigger muestra el value crudo.
- **Tablas del admin**: el form tiene ancho fijo en desktop (`xl:w-80`) y la tabla toma el resto (`flex-1 min-w-0`); las celdas permiten wrap (`[&_td]:whitespace-normal`) para que los botones de acciones nunca queden detrás de un scroll horizontal.
- **Imágenes con fallback**: fotos de jugadores usan `Avatar + AvatarFallback` (iniciales); logos de equipos caen a 🏀 si la URL falla.
- **Feedback**: toasts de `sonner` para éxito/error en todas las mutaciones; `AlertDialog` de confirmación antes de cualquier borrado.
- **Estados de carga**: `Skeleton` de shadcn en las vistas públicas.

---

## 7. Sistema de diseño

Estética inspirada en NBA.com definida con tokens de Tailwind (`nba-dark`, `nba-card`, `nba-border`, `nba-red`, `nba-gold`, `nba-blue`, `nba-green`, `nba-gray`, `nba-lightgray`):

- Fondo oscuro (`nba-dark`) con cards (`nba-card`) y bordes sutiles.
- Tipografía condensada en mayúsculas para títulos (font-heading) + fuente legible para cuerpo.
- Acentos semánticos: rojo (marca/destructivo), dorado (destacado/playoffs), verde (victorias/éxito), azul (acciones).
- Los componentes de `components/ui/` son generados por shadcn y se estilizan por composición (className), no editándolos.

---

## 8. Cómo ejecutar

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173 (Vite)
npm run build      # build de producción en dist/
npm run lint       # ESLint
```

Variable opcional: `VITE_API_URL` si el backend no está en `http://localhost:3000/api`.
