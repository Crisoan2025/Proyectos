const jwt = require('jsonwebtoken');

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