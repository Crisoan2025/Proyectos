const pool = require('../db');
const { getActiveSeasonId } = require('../helpers/seasonHelper');

/**
 * ¿Por qué existe esta función?
 * Para armar el "Fixture" visual; muestra quién juega contra quién.
 * 
 * ¿Para qué se hace así (Decisiones de diseño)?
 * - Ahora soporta filtros opcionales por temporada y categoría via query params.
 * - Si no se manda season_id, usa la temporada activa por defecto.
 */
const obtenerPartidos = async (req, res) => {
    const { season_id, category } = req.query;

    try {
        const seasonFilter = season_id || await getActiveSeasonId();
        if (!seasonFilter) return res.json([]);

        let query = `
            SELECT m.*, tl.name as local_name, tv.name as visitor_name 
            FROM matches m
            JOIN teams tl ON m.local_team_id = tl.id
            JOIN teams tv ON m.visitor_team_id = tv.id
            WHERE m.season_id = $1
        `;
        const params = [seasonFilter];

        if (category) {
            query += ` AND m.category = $2`;
            params.push(category);
        }

        query += ` ORDER BY m.id DESC`;

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Error al obtener partidos" });
    }
};

/**
 * ¿Por qué existe esta función?
 * Para crear el calendario de juegos de la temporada.
 * 
 * ¿Para qué se hace así (Decisiones de diseño)?
 * - Automáticamente asigna el season_id de la temporada activa.
 * - Automáticamente toma la categoría del equipo local y la asigna al partido.
 * - VALIDA que ambos equipos sean de la misma categoría. Un equipo Senior no puede
 *   jugar contra uno Junior porque son niveles de competencia distintos.
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
        // Obtener temporada activa
        const seasonId = await getActiveSeasonId();
        if (!seasonId) {
            return res.status(400).json({ error: "No hay temporada activa. Creá una temporada primero." });
        }

        // Verificar que ambos equipos sean de la misma categoría
        const localTeam = await pool.query('SELECT category FROM teams WHERE id = $1', [local_team_id]);
        const visitorTeam = await pool.query('SELECT category FROM teams WHERE id = $1', [visitor_team_id]);

        if (localTeam.rows.length === 0 || visitorTeam.rows.length === 0) {
            return res.status(404).json({ error: "Uno de los equipos no existe." });
        }

        if (localTeam.rows[0].category !== visitorTeam.rows[0].category) {
            return res.status(400).json({ 
                error: `No se puede programar: ${localTeam.rows[0].category} vs ${visitorTeam.rows[0].category}. Los equipos deben ser de la misma categoría.` 
            });
        }

        const matchCategory = localTeam.rows[0].category;

        const result = await pool.query(
            'INSERT INTO matches (local_team_id, visitor_team_id, match_date, match_time, location, status, season_id, category) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [local_team_id, visitor_team_id, match_date, match_time || '20:00', location || 'Estadio Central', 'pendiente', seasonId, matchCategory]
        );
        res.status(201).json({ message: "Partido programado", partido: result.rows[0] });
    } catch (err) {
        console.error("Error:", err.message);
        res.status(500).json({ error: "Error al guardar el partido." });
    }
};

/**
 * ¿Por qué existe esta función?
 * Para manejar reprogramaciones logísticas.
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
 * ¿Por qué existe esta función?
 * Esta es la columna vertebral de la liga. Toma el resultado crudo de un partido
 * e instantáneamente actualiza la tabla de posiciones de la temporada correspondiente.
 * 
 * ¿Para qué se hace así (Decisiones de diseño)?
 * - Ahora actualiza `team_stats` (filtrado por team_id + season_id) en vez de la tabla `teams`.
 *   Esto garantiza que los puntos se asignen a la temporada correcta.
 * - Usamos transacciones ACID para que ambos equipos se actualicen juntos o ninguno.
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

        const checkMatch = await pool.query('SELECT status FROM matches WHERE id = $1', [id]);
        if (!checkMatch.rows[0]) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ error: "Partido no encontrado." });
        }
        if (checkMatch.rows[0].status === 'jugado') {
            await pool.query('ROLLBACK');
            return res.status(400).json({ error: "Este partido ya tiene un resultado cargado." });
        }

        const matchResult = await pool.query(
            "UPDATE matches SET local_points = $1, visitor_points = $2, status = 'jugado' WHERE id = $3 RETURNING *",
            [local_points, visitor_points, id]
        );
        const match = matchResult.rows[0];

        const seasonId = match.season_id;

        let local_won = 0, local_tied = 0, local_lost = 0, local_pts = 0;
        let visitor_won = 0, visitor_tied = 0, visitor_lost = 0, visitor_pts = 0;

        if (local_points > visitor_points) {
            local_won = 1; visitor_lost = 1; local_pts = 3;
        } else if (local_points < visitor_points) {
            visitor_won = 1; local_lost = 1; visitor_pts = 3;
        } else {
            local_tied = 1; visitor_tied = 1; local_pts = 1; visitor_pts = 1;
        }

        // Actualizar team_stats del equipo LOCAL para esta temporada
        await pool.query(`
            UPDATE team_stats SET played = played + 1, won = won + $1, tied = tied + $2, lost = lost + $3,
            points = points + $4, points_for = points_for + $5, points_against = points_against + $6
            WHERE team_id = $7 AND season_id = $8
        `, [local_won, local_tied, local_lost, local_pts, local_points, visitor_points, match.local_team_id, seasonId]);

        // Actualizar team_stats del equipo VISITANTE para esta temporada
        await pool.query(`
            UPDATE team_stats SET played = played + 1, won = won + $1, tied = tied + $2, lost = lost + $3,
            points = points + $4, points_for = points_for + $5, points_against = points_against + $6
            WHERE team_id = $7 AND season_id = $8
        `, [visitor_won, visitor_tied, visitor_lost, visitor_pts, visitor_points, local_points, match.visitor_team_id, seasonId]);

        await pool.query('COMMIT');
        res.json({ message: "¡Resultado cargado y posiciones actualizadas!" });
    } catch (err) {
        await pool.query('ROLLBACK');
        res.status(500).json({ error: "Error al procesar el resultado" });
    }
};

/**
 * ¿Por qué existe esta función?
 * Para evitar "Partidos fantasma" que se programaron pero por fuerza mayor jamás se jugarán.
 */
const borrarPartido = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('BEGIN');

        const matchResult = await pool.query('SELECT * FROM matches WHERE id = $1', [id]);
        if (!matchResult.rows[0]) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ error: "Partido no encontrado." });
        }

        const partido = matchResult.rows[0];

        if (partido.status === 'jugado') {
            // Revertir estadísticas del equipo local
            await pool.query(`
                UPDATE team_stats SET played = played - 1, points_for = points_for - $1,
                points_against = points_against - $2,
                won = CASE WHEN $1 > $2 THEN won - 1 ELSE won END,
                lost = CASE WHEN $1 < $2 THEN lost - 1 ELSE lost END,
                tied = CASE WHEN $1 = $2 THEN tied - 1 ELSE tied END,
                points = CASE WHEN $1 > $2 THEN points - 3 WHEN $1 = $2 THEN points - 1 ELSE points END
                WHERE team_id = $3 AND season_id = $4
            `, [partido.local_points, partido.visitor_points, partido.local_team_id, partido.season_id]);

            // Revertir estadísticas del equipo visitante
            await pool.query(`
                UPDATE team_stats SET played = played - 1, points_for = points_for - $1,
                points_against = points_against - $2,
                won = CASE WHEN $1 > $2 THEN won - 1 ELSE won END,
                lost = CASE WHEN $1 < $2 THEN lost - 1 ELSE lost END,
                tied = CASE WHEN $1 = $2 THEN tied - 1 ELSE tied END,
                points = CASE WHEN $1 > $2 THEN points - 3 WHEN $1 = $2 THEN points - 1 ELSE points END
                WHERE team_id = $3 AND season_id = $4
            `, [partido.visitor_points, partido.local_points, partido.visitor_team_id, partido.season_id]);
        }

        await pool.query('DELETE FROM matches WHERE id = $1', [id]);
        await pool.query('COMMIT');
        res.json({ message: "Partido eliminado y estadísticas actualizadas." });
    } catch (err) {
        await pool.query('ROLLBACK');
        res.status(500).json({ error: "Error al borrar el partido" });
    }
};

module.exports = { crearPartido, cargarResultado, editarPartido, borrarPartido, obtenerPartidos };