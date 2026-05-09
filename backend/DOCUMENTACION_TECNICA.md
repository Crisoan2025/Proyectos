# 🏀 Documentación Técnica — API Liga de Baloncesto TPO

## 1. Información General

| Campo | Valor |
|---|---|
| **Nombre del Proyecto** | Liga de Baloncesto TPO |
| **Versión** | 1.0.0 |
| **Tipo de Aplicación** | API REST (Backend) |
| **Tecnología Principal** | Node.js + Express.js |
| **Base de Datos** | PostgreSQL |
| **Sistema de Módulos** | CommonJS (`require` / `module.exports`) |
| **Puerto por defecto** | 3000 |
| **Autenticación** | JWT (JSON Web Tokens) |

---

## 2. Stack Tecnológico y Dependencias

### Dependencias de Producción

| Paquete | Versión | Propósito |
|---|---|---|
| `express` | ^5.2.1 | Framework web para crear el servidor HTTP y manejar las rutas REST |
| `pg` | ^8.20.0 | Cliente de PostgreSQL para Node.js. Permite ejecutar queries SQL parametrizadas |
| `jsonwebtoken` | ^9.0.3 | Generación y verificación de tokens JWT para autenticación |
| `bcrypt` | ^6.0.0 | Encriptación de contraseñas con algoritmo de hashing seguro |
| `cors` | ^2.8.6 | Middleware que habilita Cross-Origin Resource Sharing entre frontend y backend |
| `dotenv` | ^17.3.1 | Carga variables de entorno desde archivo `.env` |
| `express-rate-limit` | ^8.3.2 | Protección contra ataques de fuerza bruta limitando peticiones por IP |

### Dependencias de Desarrollo

| Paquete | Versión | Propósito |
|---|---|---|
| `nodemon` | ^3.1.14 | Reinicia automáticamente el servidor al detectar cambios en el código |

---

## 3. Arquitectura del Proyecto

### Patrón de Diseño: MVC (Model-View-Controller)

```
Frontend (React + Vite)          Backend (Node.js + Express)          Base de Datos
┌──────────────────┐             ┌──────────────────────┐             ┌──────────────┐
│                  │  HTTP/JSON  │                      │    SQL      │              │
│  Vista (View)    │ ──────────► │  Controller + Model  │ ──────────► │  PostgreSQL  │
│  Home.jsx        │             │  equiposController   │             │  teams       │
│  Admin.jsx       │ ◄────────── │  partidosController  │ ◄────────── │  players     │
│  Login.jsx       │   Response  │  jugadoresController │   Rows      │  matches     │
│                  │             │  authController      │             │  seasons     │
│                  │             │  temporadasController │             │  team_stats  │
└──────────────────┘             └──────────────────────┘             └──────────────┘
```

### Estructura de Archivos

```
backend/
├── .env                          # Variables de entorno (NO se sube al repo)
├── package.json                  # Dependencias y metadatos del proyecto
├── src/
│   ├── index.js                  # Punto de entrada del servidor
│   ├── db.js                     # Configuración de conexión a PostgreSQL
│   ├── controllers/              # Lógica de negocio (el "cerebro" de cada entidad)
│   │   ├── authController.js     # Login y generación de JWT
│   │   ├── equiposController.js  # CRUD de equipos + tabla de posiciones
│   │   ├── jugadoresController.js# CRUD de jugadores
│   │   ├── partidosController.js # CRUD de partidos + carga de resultados
│   │   └── temporadasController.js # Gestión de temporadas
│   ├── routes/                   # Definición de rutas HTTP
│   │   ├── auth.js               # POST /api/auth/login
│   │   ├── equipos.js            # CRUD /api/equipos
│   │   ├── jugadores.js          # CRUD /api/jugadores
│   │   ├── partidos.js           # CRUD /api/partidos
│   │   └── temporadas.js         # CRUD /api/temporadas
│   └── middlewares/              # Funciones intermedias
│       └── authMiddleware.js     # Verificación de token JWT
```

---

## 4. Modelo de Base de Datos

### Diagrama Entidad-Relación

```
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│   seasons    │       │  team_stats  │       │    teams    │
├─────────────┤       ├──────────────┤       ├─────────────┤
│ id (PK)     │◄──────│ season_id(FK)│       │ id (PK)     │
│ name        │       │ team_id (FK) │──────►│ name        │
│ start_date  │       │ played       │       │ coach_name  │
│ end_date    │       │ won          │       │ stadium     │
│ is_active   │       │ tied         │       │ category    │
└─────────────┘       │ lost         │       └──────┬──────┘
                      │ points       │              │
                      │ points_for   │              │ 1:N
                      │ points_against│              │
                      └──────────────┘       ┌──────┴──────┐
                                             │   players   │
┌─────────────┐                              ├─────────────┤
│   matches   │                              │ id (PK)     │
├─────────────┤                              │ name        │
│ id (PK)     │                              │ surname     │
│ local_team_id (FK) ──────────────────────► │ category    │
│ visitor_team_id (FK) ────────────────────► │ team_id(FK) │
│ season_id (FK)                             └─────────────┘
│ category    │
│ match_date  │       ┌─────────────┐
│ match_time  │       │    users    │
│ location    │       ├─────────────┤
│ local_points│       │ id (PK)     │
│ visitor_points      │ email       │
│ status      │       │ password    │
└─────────────┘       └─────────────┘
```

### Descripción de Tablas

#### `seasons` — Temporadas de la liga
| Columna | Tipo | Descripción |
|---|---|---|
| `id` | SERIAL PK | Identificador único auto-incremental |
| `name` | VARCHAR(100) | Nombre de la temporada (ej: "Temporada 2026") |
| `start_date` | DATE | Fecha de inicio |
| `end_date` | DATE | Fecha de finalización |
| `is_active` | BOOLEAN | Solo una temporada puede estar activa a la vez |

#### `teams` — Equipos de la liga
| Columna | Tipo | Descripción |
|---|---|---|
| `id` | SERIAL PK | Identificador único |
| `name` | VARCHAR | Nombre del equipo |
| `coach_name` | VARCHAR | Nombre del director técnico |
| `stadium` | VARCHAR | Estadio local del equipo |
| `category` | VARCHAR(20) | Categoría de competencia: "Senior" o "Junior" |

#### `team_stats` — Estadísticas por equipo por temporada
| Columna | Tipo | Descripción |
|---|---|---|
| `id` | SERIAL PK | Identificador único |
| `team_id` | INTEGER FK | Referencia al equipo |
| `season_id` | INTEGER FK | Referencia a la temporada |
| `played` | INTEGER | Partidos jugados |
| `won` | INTEGER | Partidos ganados |
| `tied` | INTEGER | Partidos empatados |
| `lost` | INTEGER | Partidos perdidos |
| `points` | INTEGER | Puntos en la tabla (Victoria=3, Empate=1, Derrota=0) |
| `points_for` | INTEGER | Puntos anotados a favor |
| `points_against` | INTEGER | Puntos recibidos en contra |

> **Constraint UNIQUE(team_id, season_id):** Un equipo solo puede tener un registro de estadísticas por temporada.

#### `players` — Jugadores
| Columna | Tipo | Descripción |
|---|---|---|
| `id` | SERIAL PK | Identificador único |
| `name` | VARCHAR | Nombre del jugador |
| `surname` | VARCHAR | Apellido del jugador |
| `category` | VARCHAR | Categoría: "Senior" o "Junior" |
| `team_id` | INTEGER FK | Equipo al que pertenece (nullable: puede ser agente libre) |

#### `matches` — Partidos programados y jugados
| Columna | Tipo | Descripción |
|---|---|---|
| `id` | SERIAL PK | Identificador único |
| `local_team_id` | INTEGER FK | Equipo local |
| `visitor_team_id` | INTEGER FK | Equipo visitante |
| `season_id` | INTEGER FK | Temporada a la que pertenece |
| `category` | VARCHAR(20) | Categoría del partido (heredada de los equipos) |
| `match_date` | TIMESTAMP | Fecha del partido |
| `match_time` | VARCHAR | Hora del partido (ej: "20:00") |
| `location` | VARCHAR | Estadio / Lugar del partido |
| `local_points` | INTEGER | Puntos anotados por el equipo local |
| `visitor_points` | INTEGER | Puntos anotados por el equipo visitante |
| `status` | VARCHAR | Estado: "pendiente" o "jugado" |

#### `users` — Administradores del sistema
| Columna | Tipo | Descripción |
|---|---|---|
| `id` | SERIAL PK | Identificador único |
| `email` | VARCHAR | Correo electrónico (credencial de acceso) |
| `password` | VARCHAR | Contraseña encriptada con bcrypt |

---

## 5. Endpoints de la API

### 🛡️ Autenticación

| Método | Ruta | Protegida | Descripción |
|---|---|---|---|
| `POST` | `/api/auth/login` | No (Rate Limited) | Autentica al administrador y devuelve un token JWT |

**Body de ejemplo:**
```json
{
  "email": "admin@tpo.com",
  "password": "contraseña_secreta"
}
```

**Respuesta exitosa (200):**
```json
{
  "message": "¡Bienvenido Admin!",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Seguridad:** Rate Limiting de 5 intentos cada 15 minutos por IP.

---

### 📅 Temporadas

| Método | Ruta | Protegida | Descripción |
|---|---|---|---|
| `GET` | `/api/temporadas` | No | Lista todas las temporadas |
| `GET` | `/api/temporadas/activa` | No | Devuelve la temporada activa |
| `POST` | `/api/temporadas` | Sí 🔒 | Crea nueva temporada (desactiva la anterior) |

**Body para crear (POST):**
```json
{
  "name": "Temporada 2027",
  "start_date": "2027-01-01",
  "end_date": "2027-12-31"
}
```

---

### 🏀 Equipos

| Método | Ruta | Protegida | Query Params | Descripción |
|---|---|---|---|---|
| `GET` | `/api/equipos` | No | `?category=Senior&season_id=1` | Tabla de posiciones (standings) |
| `GET` | `/api/equipos/:id` | No | — | Detalle de equipo + roster de jugadores |
| `POST` | `/api/equipos` | Sí 🔒 | — | Crear equipo nuevo |
| `PUT` | `/api/equipos/:id` | Sí 🔒 | — | Editar datos del equipo |
| `DELETE` | `/api/equipos/:id` | Sí 🔒 | — | Eliminar equipo |

**Body para crear/editar:**
```json
{
  "name": "Lakers",
  "coach_name": "Darvin Ham",
  "stadium": "Crypto.com Arena",
  "category": "Senior"
}
```

---

### 🏃‍♂️ Jugadores

| Método | Ruta | Protegida | Descripción |
|---|---|---|---|
| `GET` | `/api/jugadores` | No | Lista todos los jugadores con nombre de equipo |
| `POST` | `/api/jugadores` | Sí 🔒 | Fichar (crear) jugador nuevo |
| `PUT` | `/api/jugadores/:id` | Sí 🔒 | Editar datos o transferir a otro equipo |
| `DELETE` | `/api/jugadores/:id` | Sí 🔒 | Dar de baja a un jugador |

**Body para crear/editar:**
```json
{
  "name": "LeBron",
  "surname": "James",
  "category": "Senior",
  "team_id": 1
}
```

---

### 🏆 Partidos

| Método | Ruta | Protegida | Query Params | Descripción |
|---|---|---|---|---|
| `GET` | `/api/partidos` | No | `?category=Senior&season_id=1` | Fixture completo |
| `POST` | `/api/partidos` | Sí 🔒 | — | Programar partido nuevo |
| `PUT` | `/api/partidos/:id` | Sí 🔒 | — | Reprogramar fecha/hora/lugar |
| `PUT` | `/api/partidos/:id/resultado` | Sí 🔒 | — | Cargar resultado y actualizar standings |
| `DELETE` | `/api/partidos/:id` | Sí 🔒 | — | Cancelar y eliminar partido |

**Body para programar:**
```json
{
  "local_team_id": 1,
  "visitor_team_id": 2,
  "match_date": "2026-05-15",
  "match_time": "21:30",
  "location": "Estadio Nacional"
}
```

**Body para cargar resultado:**
```json
{
  "local_points": 105,
  "visitor_points": 98
}
```

---

## 6. Flujo de Autenticación

```
┌──────────┐         ┌──────────────┐         ┌──────────────┐
│  Admin   │         │   Backend    │         │  PostgreSQL  │
└────┬─────┘         └──────┬───────┘         └──────┬───────┘
     │                      │                        │
     │  POST /login         │                        │
     │  {email, password}   │                        │
     │─────────────────────►│                        │
     │                      │  SELECT * FROM users   │
     │                      │  WHERE email = $1      │
     │                      │───────────────────────►│
     │                      │                        │
     │                      │    user row            │
     │                      │◄───────────────────────│
     │                      │                        │
     │                      │  bcrypt.compare()      │
     │                      │  jwt.sign()            │
     │                      │                        │
     │  { token: "eyJ..." } │                        │
     │◄─────────────────────│                        │
     │                      │                        │
     │  POST /api/equipos   │                        │
     │  Authorization:      │                        │
     │  Bearer eyJ...       │                        │
     │─────────────────────►│                        │
     │                      │                        │
     │                      │  verificarToken()      │
     │                      │  jwt.verify()          │
     │                      │  ✅ Válido → next()    │
     │                      │                        │
     │                      │  INSERT INTO teams...  │
     │                      │───────────────────────►│
     │                      │                        │
     │  { equipo creado }   │                        │
     │◄─────────────────────│                        │
```

---

## 7. Flujo de Carga de Resultado (Transacción ACID)

Este es el proceso más crítico del sistema. Al cargar un resultado se ejecutan **4 operaciones** dentro de una transacción SQL:

```
1. BEGIN                           → Inicia transacción
2. UPDATE matches                  → Cambia status a "jugado" y guarda puntos
3. UPDATE team_stats (local)       → Suma played, won/tied/lost, points al equipo local
4. UPDATE team_stats (visitante)   → Suma played, won/tied/lost, points al equipo visitante
5. COMMIT                         → Confirma todos los cambios
   (o ROLLBACK si hay error)      → Revierte TODO si algo falla
```

**Sistema de puntos:**

| Resultado | Equipo ganador | Equipo perdedor |
|---|---|---|
| Victoria | +3 puntos | +0 puntos |
| Empate | +1 punto | +1 punto |

---

## 8. Middleware de Seguridad

### `verificarToken` (authMiddleware.js)

Este middleware se ejecuta **antes** de los controllers en las rutas protegidas.

**Flujo:**
1. Extrae el token del header `Authorization: Bearer <token>`
2. Limpia el prefijo "Bearer " si existe
3. Verifica la firma y expiración con `jwt.verify()`
4. Si es válido: adjunta los datos del usuario a `req.user` y llama a `next()`
5. Si es inválido o expiró: responde con `401 Token inválido`

### Rate Limiting (ruta de login)

Configuración: **5 intentos máximos cada 15 minutos por IP**.

---

## 9. Variables de Entorno (.env)

```env
DB_USER=tu_usuario_postgres
DB_HOST=localhost
DB_NAME=nombre_base_de_datos
DB_PASSWORD=tu_contraseña
DB_PORT=5432
JWT_SECRET=clave_secreta_para_firmar_tokens
PORT=3000
```

> **Importante:** Este archivo está incluido en `.gitignore` y NO se sube al repositorio por seguridad.

---

## 10. Validaciones Implementadas

| Endpoint | Validación | Código HTTP |
|---|---|---|
| Crear equipo | Nombre y entrenador obligatorios | 400 |
| Crear jugador | Nombre y apellido obligatorios | 400 |
| Crear partido | Equipos y fecha obligatorios | 400 |
| Crear partido | Un equipo no puede jugar contra sí mismo | 400 |
| Crear partido | Ambos equipos deben ser de la misma categoría | 400 |
| Crear partido | Debe existir una temporada activa | 400 |
| Cargar resultado | Puntos de ambos equipos obligatorios | 400 |
| Cargar resultado | Puntos no pueden ser negativos | 400 |
| Login | Rate Limiting: máx. 5 intentos / 15 min | 429 |
| Rutas protegidas | Token JWT válido y no expirado | 401/403 |

---

## 11. Cómo Ejecutar el Proyecto

### Requisitos previos
- Node.js v18+
- PostgreSQL instalado y corriendo
- Base de datos creada con las tablas correspondientes

### Instalación
```bash
cd backend
npm install
```

### Configuración
Crear archivo `.env` en la carpeta `backend/` con las variables listadas en la sección 9.

### Ejecución
```bash
# Modo producción
node src/index.js

# Modo desarrollo (con auto-reload)
npx nodemon src/index.js
```

El servidor se levanta en `http://localhost:3000`.
