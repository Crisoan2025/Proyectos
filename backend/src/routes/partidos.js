const express = require('express');
const router = express.Router();
const verificarToken = require('../middlewares/authMiddleware');
// Importamos la nueva función
const { obtenerPartidos, crearPartido, cargarResultado, editarPartido, borrarPartido } = require('../controllers/partidosController');

// Agregamos la ruta pública para ver los partidos
router.get('/', obtenerPartidos);

router.post('/', verificarToken, crearPartido);// Permiso para crear partido
router.put('/:id/resultado', verificarToken, cargarResultado); //  Permiso para cargar el resultado
router.put('/:id', verificarToken, editarPartido); // Permiso para editar 
router.delete('/:id', verificarToken, borrarPartido);//Permiso para borrar


module.exports = router;