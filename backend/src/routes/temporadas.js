const express = require('express');
const router = express.Router();
const verificarToken = require('../middlewares/authMiddleware');
const { obtenerTemporadas, obtenerTemporadaActiva, crearTemporada } = require('../controllers/temporadasController');

// Rutas públicas: cualquiera puede ver las temporadas
router.get('/', obtenerTemporadas);
router.get('/activa', obtenerTemporadaActiva);

// Ruta protegida: solo el admin puede crear temporadas nuevas
router.post('/', verificarToken, crearTemporada);

module.exports = router;
