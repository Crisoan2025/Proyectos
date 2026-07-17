const jwt = require('jsonwebtoken');

/**
 * ¿Por qué existe este middleware?
 * Es el "guardia de seguridad" de todas las rutas de escritura (POST/PUT/DELETE).
 * Sin él, cualquier visitante podría crear equipos, cargar resultados o borrar
 * jugadores llamando a la API directamente, sin pasar por el login.
 *
 * ¿Para qué se hace así (Decisiones de diseño)?
 * - Leemos el header `Authorization` con formato "Bearer <token>" (estándar HTTP);
 *   el slice(7) tolera también recibir el token pelado, sin el prefijo.
 * - `jwt.verify` valida la FIRMA con el secreto del servidor: un token adulterado
 *   o firmado por otro no pasa. También rechaza tokens vencidos (expiresIn: '1h'
 *   definido en el login), devolviendo 401 para que el front redirija al login.
 * - Guardamos el payload decodificado en `req.user` por si un controller
 *   necesita saber qué admin ejecutó la acción.
 */
const verificarToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ message: "No tienes token" });

    try {
        const tokenLimpio = token.startsWith('Bearer ') ? token.slice(7) : token;
        const decoded = jwt.verify(tokenLimpio, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Token inválido" });
    }
};

module.exports = verificarToken;