const pool = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

/**
 * ¿Por qué existe esta función?
 * Para permitir que solo los administradores autorizados puedan acceder al panel de control (Panel VIP)
 * y realizar acciones críticas como crear equipos, programar partidos o cargar resultados, 
 * evitando que cualquier visitante público manipule la base de datos de la liga.
 * 
 * ¿Para qué se hace así (Decisiones de diseño)?
 * - Usamos `bcrypt.compare`: ¿Por qué no comparar la contraseña directamente? Porque las contraseñas
 *   jamás se guardan en texto plano en la base de datos por seguridad. Se comparan las versiones encriptadas.
 * - Usamos `jwt.sign`: ¿Para qué? Para darles a los administradores un "pase VIP" temporal. 
 *   Al no usar sesiones tradicionales, nuestro backend se mantiene ligero (stateless).
 * - Expiración (`expiresIn: '1h'`): ¿Por qué expira en una hora? Para reducir el daño si alguien deja
 *   su sesión de administrador abierta en una computadora pública. Si se va, la sesión muere sola poco después.
 */
const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) return res.status(401).json({ message: "Usuario no encontrado" });

        const user = result.rows[0];
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(401).json({ message: "Contraseña incorrecta" });

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: "¡Bienvenido Admin!", token });
    } catch (err) {
        res.status(500).send("Error en el login");
    }
};

module.exports = { login };