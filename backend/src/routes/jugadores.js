const express = require('express');
const router = express.Router();
const verificarToken = require('../middlewares/authMiddleware');
const { obtenerJugadores, crearJugador, editarJugador, borrarJugador } = require('../controllers/jugadoresController');

// Ruta pública: cualquiera puede ver el listado de jugadores
router.get('/', obtenerJugadores);

// Rutas protegidas: solo el admin gestiona el roster
router.post('/', verificarToken, crearJugador);
router.put('/:id', verificarToken, editarJugador);
router.delete('/:id', verificarToken, borrarJugador);

module.exports = router;