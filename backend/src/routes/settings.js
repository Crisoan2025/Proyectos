const express = require('express');
const router = express.Router();
const verificarToken = require('../middlewares/authMiddleware');
const { obtenerSettings, actualizarSettings } = require('../controllers/settingsController');

router.get('/', obtenerSettings);                    // público: branding de la liga
router.put('/', verificarToken, actualizarSettings); // protegido: editar branding

module.exports = router;
