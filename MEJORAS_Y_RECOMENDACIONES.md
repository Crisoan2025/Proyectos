# 📋 Mejoras y Recomendaciones — Liga de Baloncesto TPO

> **Proyecto:** Liga de Baloncesto TPO  
> **Stack:** Node.js + Express + PostgreSQL (Supabase) / React 19 + Vite + Tailwind CSS + shadcn/ui  
> **Fecha de revisión:** Mayo 2026  
> **Revisado por:** Claude Code (Anthropic)

---

## Índice

1. [Problemas Críticos de Seguridad](#1-problemas-críticos-de-seguridad)
2. [Bugs Funcionales](#2-bugs-funcionales)
3. [Mejoras de Arquitectura](#3-mejoras-de-arquitectura)
4. [Mejoras de Calidad de Código](#4-mejoras-de-calidad-de-código)
5. [Limpieza del Repositorio](#5-limpieza-del-repositorio)
6. [Resumen de Prioridades](#6-resumen-de-prioridades)

---

## 1. Problemas Críticos de Seguridad

### 1.1 Credenciales reales commiteadas en el repositorio

**Archivo afectado:** `backend/.env`

El archivo `.env` está incluido en el historial de Git y contiene credenciales reales de producción:

```
# ❌ ESTO ESTÁ EXPUESTO EN EL REPOSITORIO
DATABASE_URL="postgresql://postgres.fsbnpiooseriqidgfyyp:1028861020Messi123@aws-1-us-west-2.pooler.supabase.com:5432/postgres"
JWT_SECRET=mi_clave_secreta_123
```

Cualquier persona con acceso al repositorio tiene acceso directo a la base de datos de Supabase.

**Acciones inmediatas requeridas:**
1. Cambiar la contraseña del proyecto en Supabase (Dashboard → Settings → Database).
2. Regenerar el JWT secret con una clave fuerte:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```
3. Verificar que `.env` esté correctamente listado en `.gitignore`.
4. Eliminar el `.env` del historial de Git:
   ```bash
   git filter-branch --force --index-filter "git rm --cached --ignore-unmatch backend/.env" --prune-empty --tag-name-filter cat -- --all
   ```

**Solución correcta:** El repositorio debe incluir solo un archivo de ejemplo `backend/.env.example` con valores ficticios:
```env
# backend/.env.example
DATABASE_URL="postgresql://usuario:contraseña@host:5432/nombre_db"
JWT_SECRET=generar_con_openssl_rand_hex_64
PORT=3000
```

---

### 1.2 JWT Secret débil

**Archivo afectado:** `backend/.env`

```
JWT_SECRET=mi_clave_secreta_123
```

Un secret predecible permite que cualquier persona forje tokens JWT válidos y acceda al panel de administración sin credenciales.

**Solución:**
```bash
# Generar un secret seguro
openssl rand -hex 64
# Resultado ejemplo: a3f8c2e1d4b7... (128 caracteres hexadecimales)
```

El secret generado reemplaza `mi_clave_secreta_123` en el `.env` de producción.

---

### 1.3 CORS completamente abierto

**Archivo afectado:** `backend/src/index.js` — línea 6

```js
// ❌ Actual: permite peticiones desde CUALQUIER origen
app.use(cors());
```

En producción esto permite que cualquier sitio web externo haga peticiones a la API.

**Solución:**
```js
// ✅ Restringir al dominio del frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

Agregar `FRONTEND_URL=https://tu-dominio.com` al `.env`.

---

### 1.4 Emails reales en el archivo de migración SQL

**Archivo afectado:** `supabase_migration.sql` — líneas 499–501

El dump de la base de datos incluye emails reales de administradores:
```sql
INSERT INTO public.users VALUES (5, 'cristian61020@gmail.com', '$2b$10$...', 'admin');
```

Si este archivo está en un repositorio público o compartido, expone datos personales.

**Solución:** El archivo de migración que se comparte debe contener solo la **estructura** (DDL), sin datos de usuarios reales. Los datos de prueba deben usar cuentas ficticias.

---

## 2. Bugs Funcionales

### 2.1 `api.delete` no existe — debería ser `api.del`

**Archivos afectados:**
- `frontend/src/features/teams/api/useTeams.js` — línea 17
- `frontend/src/features/matches/api/useMatches.js` — línea 25

El objeto `api` en `services/api.js` exporta el método como `del` (porque `delete` es una palabra reservada de JavaScript), pero ambos hooks lo llaman como `api.delete`, lo que resulta en un error en runtime al intentar eliminar un equipo o partido.

```js
// ❌ useTeams.js — línea 17
const res = await api.delete(`/equipos/${id}`, true);

// ❌ useMatches.js — línea 25
const res = await api.delete(`/partidos/${id}`, true);
```

**Solución:**
```js
// ✅ Usar el nombre correcto del método
const res = await api.del(`/equipos/${id}`, true);
const res = await api.del(`/partidos/${id}`, true);
```

---

### 2.2 Doble carga de resultado no está protegida

**Archivo afectado:** `backend/src/controllers/partidosController.js` — función `cargarResultado`

Si se llama a `PUT /api/partidos/:id/resultado` más de una vez para el mismo partido, las estadísticas de `team_stats` se **acumulan dos veces**: victorias, derrotas, puntos a favor, puntos en contra. Esto corrompe la tabla de posiciones.

```js
// ❌ Actual: no verifica si el partido ya fue jugado antes de actualizar
const matchResult = await pool.query(
  "UPDATE matches SET local_points = $1, visitor_points = $2, status = 'jugado' WHERE id = $3 RETURNING *",
  [local_points, visitor_points, id]
);
```

**Solución:** Agregar una verificación previa al update:
```js
// ✅ Verificar primero que el partido esté pendiente
const checkMatch = await pool.query(
  "SELECT status FROM matches WHERE id = $1",
  [id]
);
if (!checkMatch.rows[0]) {
  return res.status(404).json({ error: "Partido no encontrado." });
}
if (checkMatch.rows[0].status === 'jugado') {
  return res.status(400).json({ error: "Este partido ya tiene un resultado cargado." });
}
```

---

### 2.3 Eliminar un partido jugado no revierte las estadísticas

**Archivo afectado:** `backend/src/controllers/partidosController.js` — función `borrarPartido`

```js
// ❌ Actual: borra el partido pero los puntos ya acumulados en team_stats NO se descuentan
const borrarPartido = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM matches WHERE id = $1', [id]);
    res.json({ message: "Partido cancelado y eliminado" });
  }
  ...
};
```

Si se elimina un partido con `status = 'jugado'`, los puntos en la tabla de posiciones quedan intactos y la información es incorrecta.

**Solución:**
```js
// ✅ Si el partido estaba jugado, revertir las stats antes de borrar
const borrarPartido = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('BEGIN');

    const match = await pool.query('SELECT * FROM matches WHERE id = $1', [id]);
    if (!match.rows[0]) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ error: "Partido no encontrado." });
    }

    const partido = match.rows[0];

    if (partido.status === 'jugado') {
      // Revertir estadísticas del equipo local
      await pool.query(`
        UPDATE team_stats SET played = played - 1, points_for = points_for - $1,
        points_against = points_against - $2,
        won = CASE WHEN $1 > $2 THEN won - 1 ELSE won END,
        lost = CASE WHEN $1 < $2 THEN lost - 1 ELSE lost END,
        tied = CASE WHEN $1 = $2 THEN tied - 1 ELSE tied END,
        points = CASE WHEN $1 > $2 THEN points - 3 WHEN $1 = $2 THEN points - 1 ELSE points END
        WHERE team_id = $3 AND season_id = $4
      `, [partido.local_points, partido.visitor_points, partido.local_team_id, partido.season_id]);

      // Revertir estadísticas del equipo visitante
      await pool.query(`
        UPDATE team_stats SET played = played - 1, points_for = points_for - $1,
        points_against = points_against - $2,
        won = CASE WHEN $1 > $2 THEN won - 1 ELSE won END,
        lost = CASE WHEN $1 < $2 THEN lost - 1 ELSE lost END,
        tied = CASE WHEN $1 = $2 THEN tied - 1 ELSE tied END,
        points = CASE WHEN $1 > $2 THEN points - 3 WHEN $1 = $2 THEN points - 1 ELSE points END
        WHERE team_id = $3 AND season_id = $4
      `, [partido.visitor_points, partido.local_points, partido.visitor_team_id, partido.season_id]);
    }

    await pool.query('DELETE FROM matches WHERE id = $1', [id]);
    await pool.query('COMMIT');
    res.json({ message: "Partido eliminado y estadísticas actualizadas." });
  } catch (err) {
    await pool.query('ROLLBACK');
    res.status(500).json({ error: "Error al borrar el partido." });
  }
};
```

---

## 3. Mejoras de Arquitectura

### 3.1 Agregar un componente `ProtectedRoute`

**Archivo afectado:** `frontend/src/pages/Admin.jsx` — líneas 34–41

La protección de rutas actualmente usa un `useEffect` que primero renderiza el componente y después redirige. Esto produce un "flash" del panel de admin antes del redirect.

```jsx
// ❌ Actual: renderiza Admin y luego redirige (flash de contenido)
useEffect(() => {
  if (!isAuthenticated) {
    navigate('/login');
    return;
  }
}, [isAuthenticated]);
```

**Solución:** Crear un componente `ProtectedRoute` y usarlo en el router:

```jsx
// ✅ src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
```

```jsx
// ✅ En App.jsx — usar el componente en el router
import ProtectedRoute from './components/ProtectedRoute';

// Dentro de las Routes:
<Route path="/admin/*" element={
  <ProtectedRoute>
    <Admin />
  </ProtectedRoute>
} />
```

---

### 3.2 Manejar token expirado en el frontend

**Archivo afectado:** `frontend/src/services/api.js`

El JWT expira en 1 hora. Si el token vence mientras el admin trabaja, todas las llamadas protegidas devuelven `401` pero el frontend no hace nada visible al usuario. La sesión queda en un estado zombie: parece autenticado pero no puede operar.

**Solución:** Agregar un interceptor de respuestas en `api.js`:

```js
// ✅ En api.js — helper para manejar respuestas
const handleResponse = async (res) => {
  if (res.status === 401) {
    // Token expirado o inválido — limpiar sesión y redirigir
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
  return res;
};

// Aplicar en cada método:
get: async (endpoint, auth = false) => {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: auth ? buildHeaders(true) : {},
  });
  return handleResponse(res);
},
// ... (idem para post, put, del)
```

---

### 3.3 Unificar el data fetching en `Home.jsx` y `Equipos.jsx`

**Archivos afectados:** `frontend/src/pages/Home.jsx`, `frontend/src/pages/Equipos.jsx`

Ambas páginas reimplementan el patrón `useState + useEffect + loading + error` en lugar de usar el hook `useApi` que ya existe para exactamente eso.

```js
// ❌ Actual en Home.jsx y Equipos.jsx: código duplicado de data fetching
const [equipos, setEquipos] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
// ...fetch manual con try/catch...
```

**Solución:** Reemplazar por el hook existente:
```js
// ✅ Usar useApi — ya maneja loading, error y reload
import useApi from '../hooks/useApi';

const { data: equipos, loading, error, reload } = useApi('/equipos');
```

---

### 3.4 Agregar scripts de inicio en `package.json` del backend

**Archivo afectado:** `backend/package.json`

```json
// ❌ Actual: sin scripts útiles
"scripts": {
  "test": "echo \"Error: no test specified\" && exit 1"
}
```

Un desarrollador nuevo no sabe cómo iniciar el proyecto.

**Solución:**
```json
// ✅
"scripts": {
  "start": "node src/index.js",
  "dev": "nodemon src/index.js",
  "test": "echo \"Error: no test specified\" && exit 1"
}
```

---

### 3.5 Mover `shadcn` a devDependencies o eliminarlo

**Archivo afectado:** `frontend/package.json`

```json
// ❌ Actual: shadcn como dependencia de runtime (aumenta el bundle)
"dependencies": {
  "shadcn": "^4.7.0",
```

`shadcn` es una CLI que genera los componentes en `src/components/ui/`. No es una librería que se importa en el código, ya cumplió su función. Incluirla en `dependencies` hace que se instale innecesariamente en producción.

**Solución:**
```json
// ✅ Moverla a devDependencies (o eliminarla si ya no se agregarán componentes)
"devDependencies": {
  "shadcn": "^4.7.0",
```

---

### 3.6 Agregar un archivo de constantes para categorías

**Archivos afectados:** múltiples controllers y componentes

Los strings `'Senior'` y `'Junior'` están hardcodeados en al menos 8 archivos distintos. Si en el futuro se agrega una categoría nueva (ej: `'Sub-18'`), hay que buscarlos manualmente en todo el proyecto.

**Solución:**

```js
// ✅ backend/src/constants/categories.js
const CATEGORIES = {
  SENIOR: 'Senior',
  JUNIOR: 'Junior',
};
module.exports = CATEGORIES;
```

```js
// ✅ frontend/src/constants/categories.js
export const CATEGORIES = {
  SENIOR: 'Senior',
  JUNIOR: 'Junior',
};
export const CATEGORY_LIST = Object.values(CATEGORIES);
```

---

## 4. Mejoras de Calidad de Código

### 4.1 Inconsistencia de idioma en nombres

El proyecto mezcla español e inglés en la misma capa:

| Capa | Naming actual | Problema |
|------|---------------|----------|
| Rutas API | `/api/equipos`, `/api/jugadores` | Español |
| Hooks frontend | `useTeams`, `usePlayers`, `useMatches` | Inglés |
| Base de datos | `teams`, `players`, `matches` | Inglés |
| Variables en controllers | `equipos`, `jugadores`, `partidos` | Español |

**Recomendación:** Elegir un idioma para el código técnico (idealmente inglés por convención en la industria) y aplicarlo consistentemente. Los mensajes de error para el usuario final sí pueden estar en español.

---

### 4.2 Errores de base de datos no diferenciados

**Archivos afectados:** todos los controllers

```js
// ❌ Actual: todos los errores devuelven el mismo mensaje genérico
} catch (err) {
  res.status(500).json({ error: "Error en el servidor" });
}
```

No se distingue entre un error de violación de constraint único (crear un equipo con nombre duplicado) y un error de conexión a la base de datos. El frontend no puede mostrar un mensaje útil al usuario.

**Solución:** Verificar el código de error de PostgreSQL:

```js
// ✅ Detectar errores específicos de PostgreSQL
} catch (err) {
  console.error(err);
  if (err.code === '23505') { // unique_violation
    return res.status(409).json({ error: "Ya existe un registro con esos datos." });
  }
  if (err.code === '23503') { // foreign_key_violation
    return res.status(400).json({ error: "El registro referenciado no existe." });
  }
  res.status(500).json({ error: "Error interno del servidor." });
}
```

---

### 4.3 Validar que la categoría del jugador coincida con la del equipo

**Archivo afectado:** `backend/src/controllers/jugadoresController.js` — funciones `crearJugador` y `editarJugador`

Al asignar un jugador a un equipo, no se verifica que la categoría del jugador coincida con la categoría del equipo. Un jugador Junior podría asignarse a un equipo Senior sin que el sistema lo impida.

**Solución:**
```js
// ✅ Antes de insertar/actualizar, verificar compatibilidad de categorías
if (team_id && category) {
  const teamResult = await pool.query('SELECT category FROM teams WHERE id = $1', [team_id]);
  if (teamResult.rows.length > 0 && teamResult.rows[0].category !== category) {
    return res.status(400).json({
      error: `La categoría del jugador (${category}) no coincide con la del equipo (${teamResult.rows[0].category}).`
    });
  }
}
```

---

### 4.4 Inconsistencia en el formato de respuestas de error

Los controllers usan indistintamente `error` y `message` como clave en los objetos de error:

```js
// En jugadoresController.js usa 'message':
res.status(400).json({ message: "Nombre y apellido son obligatorios." });

// En equiposController.js usa 'error':
res.status(400).json({ error: "El nombre del equipo es obligatorio." });
```

El frontend tiene que manejar ambos casos. Estandarizar a siempre usar `error` para mensajes de error.

---

## 5. Limpieza del Repositorio

### 5.1 Agregar `dist/` al `.gitignore`

**Archivo afectado:** `frontend/dist/` (commiteado en git)

La carpeta `dist/` es el resultado de compilar el frontend con Vite (`npm run build`). Debe generarse en el servidor de despliegue, no almacenarse en el repositorio.

```
# ✅ Agregar al .gitignore raíz o al frontend/.gitignore
frontend/dist/
```

---

### 5.2 Eliminar archivos temporales del repositorio

Los siguientes archivos no deberían estar en el repositorio:

| Archivo | Razón |
|---------|-------|
| `backend/prueba.html` | Archivo de prueba temporal |
| `backend/fix_sequences.js` | Script de utilidad puntual, sin documentación |
| `frontend/src/assets/react.svg` | Asset por defecto de Vite, no usado |
| `frontend/src/assets/vite.svg` | Asset por defecto de Vite, no usado |

---

### 5.3 Organizar archivos fuera de su lugar

| Archivo/Carpeta | Problema | Solución |
|-----------------|----------|----------|
| `backend/fix_sequences.js` | Está en la raíz del backend, fuera de `src/` | Mover a `backend/scripts/` o documentarlo |
| `frontend/src/context/` | Carpeta vacía, artefacto de una refactorización | Eliminarla |
| `presentacion-tpo/` | Carpeta de la presentación mezclada con el código | Mover fuera del proyecto o a una rama separada |

---

### 5.4 Reorganizar la estructura raíz del proyecto

**Situación actual:**
```
proyecto-liga-baloncesto/
├── backend/
├── frontend/
├── presentacion-tpo/      ← mezcla proyecto + presentación
├── supabase_migration.sql ← bien ubicado
├── Screenshot *.png       ← capturas de pantalla no relacionadas
└── .gitignore             ← no cubre dist/ ni *.png
```

**Estructura recomendada:**
```
proyecto-liga-baloncesto/
├── backend/
├── frontend/
├── docs/
│   ├── supabase_migration.sql
│   └── presentacion/
├── .gitignore             ← cubrir dist/, *.png, .env
└── README.md              ← instrucciones de instalación y ejecución
```

---

## 6. Resumen de Prioridades

### 🚨 Crítico — Atender inmediatamente

| # | Problema | Archivo |
|---|----------|---------|
| 1 | Credenciales de BD en `.env` commiteado | `backend/.env` |
| 2 | JWT secret débil y expuesto | `backend/.env` |
| 3 | Bug: `api.delete` no existe (debería ser `api.del`) | `useTeams.js`, `useMatches.js` |

### 🔴 Alta prioridad — Bugs que corrompen datos

| # | Problema | Archivo |
|---|----------|---------|
| 4 | Doble carga de resultado no protegida | `partidosController.js` |
| 5 | Borrar partido jugado no revierte estadísticas | `partidosController.js` |

### 🟡 Media prioridad — Mejoras de arquitectura y UX

| # | Problema | Archivo |
|---|----------|---------|
| 6 | CORS wildcard en producción | `backend/src/index.js` |
| 7 | Sin `ProtectedRoute` — flash de contenido | `App.jsx` |
| 8 | Token expirado no manejado en frontend | `services/api.js` |
| 9 | `shadcn` en dependencies en vez de devDependencies | `frontend/package.json` |
| 10 | Sin scripts `start`/`dev` en backend | `backend/package.json` |

### 🔵 Baja prioridad — Calidad y mantenibilidad

| # | Problema | Archivos |
|---|----------|---------|
| 11 | Inconsistencia de idioma en nombres | Múltiples |
| 12 | Categorías hardcodeadas como strings | Múltiples |
| 13 | Errores de BD no diferenciados | Todos los controllers |
| 14 | `dist/` commiteado en git | `frontend/dist/` |
| 15 | Archivos temporales en el repo | `prueba.html`, `fix_sequences.js` |
| 16 | `Home.jsx`/`Equipos.jsx` no usan `useApi` hook | `pages/Home.jsx`, `pages/Equipos.jsx` |
| 17 | Sin validación categoría jugador-equipo | `jugadoresController.js` |
| 18 | Formato de error inconsistente (`error` vs `message`) | Controllers varios |

---

> **Nota:** Las mejoras están ordenadas por impacto real en el funcionamiento y seguridad del sistema. Los puntos críticos y de alta prioridad representan vulnerabilidades de seguridad o bugs que producen datos incorrectos en la base de datos. Los puntos de media y baja prioridad son mejoras que elevan la calidad del código sin que el sistema deje de funcionar.
