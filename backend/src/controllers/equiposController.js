const pool = require('../db');

const obtenerEquipos = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT *, (points_for - points_against) AS goal_difference 
            FROM teams 
            ORDER BY points DESC, goal_difference DESC, points_for DESC
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).send('Error en el servidor');
    }
};

const obtenerEquipoPorId = async (req, res) => {
    const { id } = req.params;
    try {
        const equipoResult = await pool.query('SELECT *, (points_for - points_against) AS goal_difference FROM teams WHERE id = $1', [id]);
        if (equipoResult.rows.length === 0) {
            return res.status(404).json({ error: "Equipo no encontrado." });
        }

        const jugadoresResult = await pool.query('SELECT * FROM players WHERE team_id = $1 ORDER BY surname ASC', [id]);

        res.json({
            ...equipoResult.rows[0],
            jugadores: jugadoresResult.rows
        });
    } catch (err) {
        res.status(500).send('Error al obtener el equipo');
    }
};

const crearEquipo = async (req, res) => {
    // 1. Agregamos stadium a lo que recibimos del frontend
    const { name, coach_name, stadium } = req.body;

    if (!name) return res.status(400).json({ error: "El nombre del equipo es obligatorio." });
    if (!coach_name) return res.status(400).json({ error: "El nombre del entrenador es obligatorio." });

    try {
        const result = await pool.query(
            // 2. Agregamos stadium a la consulta SQL
            'INSERT INTO teams (name, coach_name, stadium) VALUES ($1, $2, $3) RETURNING *',
            [name, coach_name, stadium || 'Estadio Municipal'] 
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Error al crear el equipo" });
    }
};
const editarEquipo = async (req, res) => {
    const { id } = req.params;
    const { name, coach_name, stadium } = req.body;

    if (!name) return res.status(400).json({ error: "El nombre del equipo es obligatorio." });
    if (!coach_name) return res.status(400).json({ error: "El nombre del entrenador es obligatorio." });
    try {
        const result = await pool.query('UPDATE teams SET name = $1, coach_name = $2, stadium = $3 WHERE id = $4 RETURNING *', [name, coach_name, stadium, id]);
        res.json({ message: "Equipo actualizado", equipo: result.rows[0] });
    } catch (err) {
        res.status(500).send("Error al actualizar");
    }
};

const borrarEquipo = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM teams WHERE id = $1', [id]);
        res.json({ message: "¡Equipo eliminado!" });
    } catch (err) {
        res.status(500).send("Error al borrar");
    }
};

module.exports = { obtenerEquipos, obtenerEquipoPorId, crearEquipo, editarEquipo, borrarEquipo };