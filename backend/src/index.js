require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// IMPORTAR LAS RUTAS MODULARES
const authRoutes = require('./routes/auth');
const equiposRoutes = require('./routes/equipos');
const jugadoresRoutes = require('./routes/jugadores');
const partidosRoutes = require('./routes/partidos');

// USAR LAS RUTAS (Definimos el prefijo /api)
app.use('/api/auth', authRoutes);     // Ejemplo: POST /api/auth/login
app.use('/api/equipos', equiposRoutes);   // Ejemplo: GET /api/equipos
app.use('/api/jugadores', jugadoresRoutes); // Ejemplo: GET /api/jugadores
app.use('/api/partidos', partidosRoutes); // Ejemplo: GET /api/partidos

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor entrando en el puerto ${PORT}`);
});