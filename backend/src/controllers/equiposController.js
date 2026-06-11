const pool = require('../db');
const { getActiveSeasonId } = require('../helpers/seasonHelper');

/**
 * ¿Por qué existe esta función?
 * Para alimentar la tabla de posiciones (Standings) que ven todos los usuarios.
 * 
 * ¿Para qué se hace así (Decisiones de diseño)?
 * - Ahora leemos de `team_stats` (JOIN con `teams`) filtrando por la temporada activa.
 *   Esto permite que cada temporada tenga su propia tabla de posiciones independiente.
 * - Aceptamos query params opcionales: `?category=Senior` y `?season_id=1` para filtrar.
 *   Si no se mandan, muestra todos los equipos de la temporada activa.
 * - El `ORDER BY` mantiene la regla de desempate: puntos > diferencia de tantos > tantos a favor.
 */
const obtenerEquipos = async (req, res) => {
    const { category, season_id } = req.query;

    try {
        const seasonFilter = season_id || await getActiveSeasonId();
        if (!seasonFilter) return res.status(404).json({ error: "No hay temporada activa." });

        let query = `
            SELECT t.id, t.name, t.coach_name, t.stadium, t.category,
                   ts.played, ts.won, ts.tied, ts.lost, ts.points,
                   ts.points_for, ts.points_against,
                   (ts.points_for - ts.points_against) AS goal_difference
            FROM teams t
            JOIN team_stats ts ON t.id = ts.team_id
            WHERE ts.season_id = $1
        `;
        const params = [seasonFilter];

        if (category) {
            query += ` AND t.category = $2`;
            params.push(category);
        }

        query += ` ORDER BY ts.points DESC, (ts.points_for - ts.points_against) DESC, ts.points_for DESC`;

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Error en el servidor" });
    }
};

/**
 * ¿Por qué existe esta función?
 * Para ver el detalle de un equipo específico junto con su roster (jugadores)
 * y sus estadísticas de la temporada activa.
 */
const obtenerEquipoPorId = async (req, res) => {
    const { id } = req.params;
    try {
        const seasonId = await getActiveSeasonId();

        const equipoResult = await pool.query(`
            SELECT t.*, 
                   ts.played, ts.won, ts.tied, ts.lost, ts.points,
                   ts.points_for, ts.points_against,
                   (ts.points_for - ts.points_against) AS goal_difference
            FROM teams t
            LEFT JOIN team_stats ts ON t.id = ts.team_id AND ts.season_id = $2
            WHERE t.id = $1
        `, [id, seasonId]);

        if (equipoResult.rows.length === 0) {
            return res.status(404).json({ error: "Equipo no encontrado." });
        }

        const jugadoresResult = await pool.query('SELECT * FROM players WHERE team_id = $1 ORDER BY surname ASC', [id]);

        res.json({
            ...equipoResult.rows[0],
            jugadores: jugadoresResult.rows
        });
    } catch (err) {
        res.status(500).json({ error: "Error al obtener el equipo" });
    }
};

/**
 * ¿Por qué existe esta función?
 * Para inscribir nuevas franquicias en la liga.
 * 
 * ¿Para qué se hace así (Decisiones de diseño)?
 * - Ahora recibe `category` (Senior o Junior) del body.
 * - Al crear el equipo, automáticamente crea un registro en `team_stats` 
 *   para la temporada activa con todo en 0.
 *
 * 🔧 CORRECCIÓN (Bug #1 — Transacciones que no eran atómicas): el INSERT del equipo
 *   y el INSERT de sus stats ahora corren sobre UNA sola conexión (`pool.connect()`),
 *   liberada en `finally`. Antes usaban `pool.query(...)` con BEGIN/COMMIT, que el
 *   Pool podía repartir en conexiones distintas (transacción no real). Nota: la
 *   lectura de la temporada activa (getActiveSeasonId) es un simple SELECT y puede
 *   quedar fuera de la transacción sin problema.
 */
const crearEquipo = async (req, res) => {
    const { name, coach_name, stadium, category } = req.body;

    if (!name) return res.status(400).json({ error: "El nombre del equipo es obligatorio." });
    if (!coach_name) return res.status(400).json({ error: "El nombre del entrenador es obligatorio." });

    // 🔧 CORRECCIÓN Bug #1: una sola conexión dedicada para toda la transacción.
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const result = await client.query(
            'INSERT INTO teams (name, coach_name, stadium, category) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, coach_name, stadium || 'Estadio Municipal', category || 'Senior']
        );
        const newTeam = result.rows[0];

        // Crear stats en 0 para la temporada activa
        const seasonId = await getActiveSeasonId();
        if (seasonId) {
            await client.query(
                'INSERT INTO team_stats (team_id, season_id) VALUES ($1, $2)',
                [newTeam.id, seasonId]
            );
        }

        await client.query('COMMIT');
        res.status(201).json(newTeam);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err.message);
        res.status(500).json({ error: "Error al crear el equipo" });
    } finally {
        // Devolvemos la conexión al pool pase lo que pase.
        client.release();
    }
};

/**
 * ¿Por qué existe esta función?
 * Para corregir errores de tipeo o actualizar datos del equipo.
 */
const editarEquipo = async (req, res) => {
    const { id } = req.params;
    const { name, coach_name, stadium, category } = req.body;

    if (!name) return res.status(400).json({ error: "El nombre del equipo es obligatorio." });
    if (!coach_name) return res.status(400).json({ error: "El nombre del entrenador es obligatorio." });
    try {
        const result = await pool.query(
            'UPDATE teams SET name = $1, coach_name = $2, stadium = $3, category = $4 WHERE id = $5 RETURNING *',
            [name, coach_name, stadium, category || 'Senior', id]
        );
        // 🔧 CORRECCIÓN: si el UPDATE no tocó ninguna fila, el equipo no existe.
        // Antes respondíamos 200 "Equipo actualizado" con equipo: undefined (éxito falso).
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Equipo no encontrado." });
        }
        res.json({ message: "Equipo actualizado", equipo: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: "Error al actualizar" });
    }
};

/**
 * ¿Por qué existe esta función?
 * Para dar de baja a un equipo que abandona la liga.
 * Las estadísticas en team_stats se borran automáticamente gracias a ON DELETE CASCADE.
 */
const borrarEquipo = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM teams WHERE id = $1', [id]);
        // 🔧 CORRECCIÓN: un DELETE que no encuentra fila NO falla en SQL (afecta 0 filas).
        // Antes respondíamos 200 "¡Equipo eliminado!" aunque el id no existiera (éxito falso).
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Equipo no encontrado." });
        }
        res.json({ message: "¡Equipo eliminado!" });
    } catch (err) {
        res.status(500).json({ error: "Error al borrar" });
    }
};

module.exports = { obtenerEquipos, obtenerEquipoPorId, crearEquipo, editarEquipo, borrarEquipo };