const pool = require('../db');

/**
 * ¿Por qué existe esta función?
 * Para armar el "Fixture" visual; es la que muestra quién juega contra quién (o quién ya jugó) en el frontend.
 * 
 * ¿Para qué se hace así (Decisiones de diseño)?
 * - Hacemos dos `JOIN` a la tabla de `teams` en vez de uno. ¿Por qué? Porque un partido tiene a dos equipos 
 *   independientes (local_team_id y visitor_team_id). Si no hiciéramos el JOIN, el frontend solo vería 
 *   números de ID estáticos en vez de los nombres "Lions" o "Tigres".
 */
const obtenerPartidos = async (req, res) => {
    try {
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
 * ¿Por qué existe esta función?
 * Para crear el calendario de juegos de toda la temporada regular.
 * 
 * ¿Para qué se hace así (Decisiones de diseño)?
 * - Validamos que `local_team_id !== visitor_team_id`. Esto previene a nivel API una imposibilidad física 
 *   (un equipo no puede jugar un partido contra sí mismo).
 * - Forzamos el `status` a ser siempre `'pendiente'`. ¿Por qué no dejamos que el usuario lo mande? 
 *   Para evitar corrupciones de datos donde alguien ingrese un partido recién creado como "jugado" 
 *   y arruine la lógica de cálculo de puntos de la tabla general.
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
 * ¿Por qué existe esta función?
 * Para manejar contingencias climáticas, problemas de alquiler de estadio o reprogramaciones logísticas.
 * Solo cambia la información temporal/espacial, no altera los equipos que se enfrentan.
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
 * Esta es la columna vertebral de la liga. Toma el resultado crudo de un partido (local vs visitante) 
 * e instantáneamente mueve la tabla de posiciones entera.
 * 
 * ¿Para qué se hace así (Decisiones de diseño)?
 * - Usamos bloques `BEGIN`, `COMMIT`, y `ROLLBACK` (Concepto de TRANSACCIÓN ACID). 
 *   ¿Por qué? Porque si modificamos el puntaje del equipo local, y justo antes de modificar al visitante 
 *   se corta la luz o crashea el servidor Node, los equipos terminarían "desfasados" en sus puntos totales.
 *   Usando `BEGIN/COMMIT`, le decimos a PostgreSQL: "O aplicás todo el bloque junto, o no cambies nada."
 * - Cálculos en JavaScript antes de enviar: Calculamos local_won/tied/lost en Node y lo mandamos como variable 
 *   ($1, $2) al query final. Esto centraliza la regla de negocio (Tanto = Victoria = 3 pts) en nuestra capa 
 *   controladora y no en la base de datos.
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
 * ¿Por qué existe esta función?
 * Para evitar "Partidos fantasma" que se programaron pero por fuerza mayor jamás se jugarán.
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