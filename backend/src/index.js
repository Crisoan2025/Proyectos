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
const temporadasRoutes = require('./routes/temporadas');

// USAR LAS RUTAS (Definimos el prefijo /api)
app.use('/api/auth', authRoutes);     // Ejemplo: POST /api/auth/login
app.use('/api/equipos', equiposRoutes);   // Ejemplo: GET /api/equipos
app.use('/api/jugadores', jugadoresRoutes); // Ejemplo: GET /api/jugadores
app.use('/api/partidos', partidosRoutes); // Ejemplo: GET /api/partidos
app.use('/api/temporadas', temporadasRoutes); // Ejemplo: GET /api/temporadas

/**
 * ¿Por qué existe este middleware?
 * Para atrapar cualquier error no capturado por los controllers individuales.
 * Sin esto, Express devolvería un HTML genérico de error que el frontend no puede parsear.
 * Con esto, siempre devolvemos JSON estructurado: { error: "mensaje" }.
 */
app.use((err, req, res, next) => {
    console.error('Error no capturado:', err.stack);
    res.status(500).json({ error: "Error interno del servidor" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor entrando en el puerto ${PORT}`);
});