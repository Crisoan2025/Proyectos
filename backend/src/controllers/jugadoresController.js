const pool = require('../db');

/**
 * GET - Obtener todos los jugadores
 * Realiza una consulta con LEFT JOIN entre la tabla "players" y "teams" para
 * incluir el nombre del equipo al que pertenece cada jugador.
 * Se usa LEFT JOIN (en vez de JOIN) para que también se muestren jugadores
 * que no tengan equipo asignado (team_id = null).
 * Los resultados se ordenan alfabéticamente por apellido (surname ASC).
 */
const obtenerJugadores = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT p.*, t.name AS team_name 
            FROM players p
            LEFT JOIN teams t ON p.team_id = t.id
            ORDER BY p.surname ASC
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).send('Error al obtener jugadores');
    }
};

/**
 * POST - Crear un nuevo jugador
 * Recibe del body: name, surname, category y team_id.
 * Validación: nombre y apellido son campos obligatorios; si faltan,
 * responde con un 400 (Bad Request).
 * Inserta el jugador en la tabla "players" y devuelve el registro creado
 * con todos sus campos gracias a RETURNING *.
 */
const crearJugador = async (req, res) => {
    const { name, surname, category, team_id } = req.body;
    if (!name || !surname) return res.status(400).json({ message: "Nombre y apellido son obligatorios." });

    try {
        const result = await pool.query(
            'INSERT INTO players (name, surname, category, team_id) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, surname, category, team_id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.log("🚨 EL VAR DICE:", err.message); // <-- Esto nos va a decir la verdad
        res.status(500).json({ message: "Error al crear jugador" });
    }
};

/**
 * PUT - Editar un jugador existente
 * Recibe el ID del jugador por parámetro de ruta (req.params) y los nuevos
 * valores de name, surname, category y team_id por el body.
 * Actualiza todos esos campos en la tabla "players" para el jugador indicado.
 * Devuelve el registro actualizado junto con un mensaje de confirmación.
 */
const editarJugador = async (req, res) => {
    const { id } = req.params;
    const { name, surname, category, team_id } = req.body;

    if (!name || !surname) return res.status(400).json({ message: "Nombre y apellido son obligatorios." });

    try {
        const result = await pool.query(
            'UPDATE players SET name = $1, surname = $2, category = $3, team_id = $4 WHERE id = $5 RETURNING *',
            [name, surname, category, team_id, id]
        );
        res.json({ message: "Jugador actualizado", jugador: result.rows[0] });
    } catch (err) {
        res.status(500).send("Error al actualizar");
    }
};

/**
 * DELETE - Borrar un jugador
 * Recibe el ID del jugador por parámetro de ruta y lo elimina de la tabla "players".
 * No verifica si el jugador existe antes de intentar borrarlo; si el ID no existe,
 * la consulta simplemente no afecta ninguna fila pero no lanza error.
 */
const borrarJugador = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM players WHERE id = $1', [id]);
        res.json({ message: "Jugador eliminado" });
    } catch (err) {
        res.status(500).send("Error al borrar");
    }
};

module.exports = { obtenerJugadores, crearJugador, editarJugador, borrarJugador };