const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');
const rateLimit = require('express-rate-limit'); // Importamos el bloqueo por intentos

//  Configuramos la seguridad
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // Tiempo de castigo: 15 minutos
    max: 5, // Límite: 5 intentos fallidos por IP
    message: { 
        error: "Demasiados intentos de inicio de sesión fallidos. Por favor, intentá de nuevo en 15 minutos." 
    }
});

// Le pegamos el escudo SOLO a la ruta de login
router.post('/login', loginLimiter, login);

module.exports = router;