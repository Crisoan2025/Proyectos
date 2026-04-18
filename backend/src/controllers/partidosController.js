const pool = require('../db');

/**
 * GET - Obtener todos los partidos
 * Realiza una consulta a la base de datos uniendo la tabla "matches" con "teams"
 * dos veces (una para el equipo local y otra para el visitante) para obtener
 * los nombres de ambos equipos junto con los datos del partido.
 * Devuelve los partidos ordenados por ID de forma descendente (los más recientes primero).
 */
const obtenerPartidos = async (req, res) => {
    try {
        // Hacemos un JOIN 
        const result = await pool.query(`
            SELECT m.*, tl.name as local_name, tv.name as visitor_name 
            FROM matches m
            JOIN teams tl ON m.local_team_id = tl.id
            JOIN teams tv ON m.visitor_team_id = tv.id
            ORDER BY m.id DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ message: "Error al obtener partidos" });
    }
};

/**
 * POST - Programar (crear) un nuevo partido
 * Recibe del body: local_team_id, visitor_team_id, match_date, match_time y location.
 * Validaciones:
 *   - Verifica que los campos obligatorios (equipos y fecha) estén presentes.
 *   - Impide que un equipo juegue contra sí mismo.
 * Si pasan las validaciones, inserta el partido en la tabla "matches" con
 * valores por defecto para hora ("20:00"), ubicación ("Estadio Central") y
 * estado ("pendiente") en caso de no proporcionarse.
 */
const crearPartido = async (req, res) => {
    const { local_team_id, visitor_team_id, match_date, match_time, location } = req.body;

    if (!local_team_id || !visitor_team_id || !match_date) {
        return res.status(400).json({ error: "Faltan datos obligatorios." });
    }
    if (local_team_id === visitor_team_id) {
        return res.status(400).json({ error: "Un equipo no puede jugar contra sí mismo." });
    }

    try {
        const result = await pool.query(
            'INSERT INTO matches (local_team_id, visitor_team_id, match_date, match_time, location, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [local_team_id, visitor_team_id, match_date, match_time || '20:00', location || 'Estadio Central', 'pendiente']
        );
        res.status(201).json({ message: "Partido programado", partido: result.rows[0] });
    } catch (err) {
        console.error("Error:", err.message);
        res.status(500).json({ error: "Error al guardar el partido." });
    }
};

/**
 * PUT - Editar / reprogramar un partido existente
 * Recibe el ID del partido por parámetro de ruta (req.params) y los nuevos
 * valores de match_date, match_time y location por el body.
 * Actualiza esos campos en la base de datos.
 * Si no se encuentra un partido con ese ID, responde con 404.
 */
const editarPartido = async (req, res) => {
    const { id } = req.params;
    const { match_date, match_time, location } = req.body;

    if (!match_date) return res.status(400).json({ error: "La fecha del partido es obligatoria." });

    try {
        const result = await pool.query(
            'UPDATE matches SET match_date = $1, match_time = $2, location = $3 WHERE id = $4 RETURNING *',
            [match_date, match_time, location, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Partido no encontrado." });
        }
        res.status(200).json({ message: "Partido reprogramado con éxito." });
    } catch (err) {
        console.error("Error al editar:", err.message);
        res.status(500).json({ error: "Error al intentar editar el partido." });
    }
};

/**
 * PUT - Cargar el resultado de un partido finalizado
 * Recibe el ID del partido por parámetro y los puntos de ambos equipos
 * (local_points, visitor_points) por el body.
 * 
 * Usa una TRANSACCIÓN (BEGIN / COMMIT / ROLLBACK) para garantizar que todas
 * las operaciones se completen o ninguna se aplique:
 *   1. Actualiza el marcador del partido y cambia su estado a "jugado".
 *   2. Determina quién ganó, perdió o empató y asigna los puntos de tabla
 *      (3 por victoria, 1 por empate, 0 por derrota).
 *   3. Actualiza las estadísticas del equipo LOCAL en la tabla "teams"
 *      (partidos jugados, ganados, empatados, perdidos, puntos, puntos a favor/en contra).
 *   4. Hace lo mismo para el equipo VISITANTE.
 * Si ocurre cualquier error, ejecuta ROLLBACK para revertir todos los cambios.
 */
const cargarResultado = async (req, res) => {
    const { id } = req.params;
    const { local_points, visitor_points } = req.body;

    if (local_points == null || visitor_points == null) {
        return res.status(400).json({ error: "Debés enviar los puntos de ambos equipos." });
    }
    if (local_points < 0 || visitor_points < 0) {
        return res.status(400).json({ error: "Los puntos no pueden ser negativos." });
    }

    try {
        await pool.query('BEGIN');

        const matchResult = await pool.query(
            "UPDATE matches SET local_points = $1, visitor_points = $2, status = 'jugado' WHERE id = $3 RETURNING *",
            [local_points, visitor_points, id]
        );
        const match = matchResult.rows[0];

        if (!match) throw new Error("Partido no encontrado");

        let local_won = 0, local_tied = 0, local_lost = 0, local_pts = 0;
        let visitor_won = 0, visitor_tied = 0, visitor_lost = 0, visitor_pts = 0;

        if (local_points > visitor_points) {
            local_won = 1; visitor_lost = 1; local_pts = 3;
        } else if (local_points < visitor_points) {
            visitor_won = 1; local_lost = 1; visitor_pts = 3;
        } else {
            local_tied = 1; visitor_tied = 1; local_pts = 1; visitor_pts = 1;
        }

        await pool.query(`
            UPDATE teams SET played = played + 1, won = won + $1, tied = tied + $2, lost = lost + $3,
            points = points + $4, points_for = points_for + $5, points_against = points_against + $6
            WHERE id = $7
        `, [local_won, local_tied, local_lost, local_pts, local_points, visitor_points, match.local_team_id]);

        await pool.query(`
            UPDATE teams SET played = played + 1, won = won + $1, tied = tied + $2, lost = lost + $3,
            points = points + $4, points_for = points_for + $5, points_against = points_against + $6
            WHERE id = $7
        `, [visitor_won, visitor_tied, visitor_lost, visitor_pts, visitor_points, local_points, match.visitor_team_id]);

        await pool.query('COMMIT');
        res.json({ message: "¡Resultado cargado y posiciones actualizadas!" });
    } catch (err) {
        await pool.query('ROLLBACK');
        res.status(500).send("Error al procesar el resultado");
    }
};

/**
 * DELETE - Borrar / cancelar un partido
 * Recibe el ID del partido por parámetro de ruta y lo elimina de la base de datos.
 * No realiza validaciones adicionales (por ejemplo, no verifica si el partido
 * ya fue jugado antes de eliminarlo).
 */
const borrarPartido = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM matches WHERE id = $1', [id]);
        res.json({ message: "Partido cancelado y eliminado" });
    } catch (err) {
        res.status(500).send("Error al borrar el partido");
    }
};

module.exports = { crearPartido, cargarResultado, editarPartido, borrarPartido, obtenerPartidos};