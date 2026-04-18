const express = require('express');
const router = express.Router();
const verificarToken = require('../middlewares/authMiddleware');
const { obtenerEquipos, obtenerEquipoPorId, crearEquipo, editarEquipo, borrarEquipo } = require('../controllers/equiposController');

// Todas las rutas quedan súper ordenadas y legibles
router.get('/', obtenerEquipos);
router.get('/:id', obtenerEquipoPorId);
router.post('/', verificarToken, crearEquipo);
router.put('/:id', verificarToken, editarEquipo);
router.delete('/:id', verificarToken, borrarEquipo);

module.exports = router;