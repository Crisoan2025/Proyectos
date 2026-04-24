const pool = require('../db');

/**
 * ¿Por qué existe esta función?
 * Para alimentar la tabla de posiciones principal (Standings) que ven todos los usuarios en la página de inicio.
 * 
 * ¿Para qué se hace así (Decisiones de diseño)?
 * - El cálculo `(points_for - points_against) AS goal_difference`: Lo calculamos directamente en SQL ("al vuelo")
 *   porque es más eficiente que traer todos los datos y hacer la resta en JavaScript.
 * - El `ORDER BY points DESC, goal_difference DESC, points_for DESC`: Esta es la regla oficial de desempate
 *   en ligas de baloncesto. Si hay empate en puntos, define la diferencia de tantos y luego los tantos a favor.
 */
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

/**
 * ¿Por qué existe esta función?
 * Para poder ver el detalle de un equipo específico junto con todo su "roster" (lista de jugadores)
 * en una sola vista, ideal para páginas de perfil de equipo.
 * 
 * ¿Para qué se hace así (Decisiones de diseño)?
 * - Hacemos dos consultas separadas (primero el equipo, luego los jugadores) en vez de un solo JOIN masivo. 
 *   ¿Por qué? Porque si usáramos un JOIN profundo, los datos del equipo se repetirían por cada jugador 
 *   en el resultado, haciendo que el backend mande datos redundantes al frontend. 
 *   Así enviamos un JSON limpio: `{ ...datos_equipo, jugadores: [...] }`.
 */
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

/**
 * ¿Por qué existe esta función?
 * Para permitir que los administradores inscriban nuevas franquicias o equipos en la liga.
 * 
 * ¿Para qué se hace así (Decisiones de diseño)?
 * - Valores por defecto (`stadium || 'Estadio Municipal'`): Lo usamos para garantizar 
 *   que la base de datos no tenga campos nulos críticos si el admin olvida llenar un dato, 
 *   manteniendo la integridad visual en el frontend.
 * - `RETURNING *`: Evita tener que hacer un `SELECT` extra inmediatamente después del `INSERT`
 *   para devolverle al frontend el equipo recién creado con su nuevo ID asignado por la BD.
 */
const crearEquipo = async (req, res) => {
    const { name, coach_name, stadium } = req.body;

    if (!name) return res.status(400).json({ error: "El nombre del equipo es obligatorio." });
    if (!coach_name) return res.status(400).json({ error: "El nombre del entrenador es obligatorio." });

    try {
        const result = await pool.query(
            'INSERT INTO teams (name, coach_name, stadium) VALUES ($1, $2, $3) RETURNING *',
            [name, coach_name, stadium || 'Estadio Municipal'] 
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Error al crear el equipo" });
    }
};

/**
 * ¿Por qué existe esta función?
 * Para corregir errores de tipeo o actualizar datos (ej: cambio de entrenador o mudanza de estadio) 
 * sin tener que borrar y recrear el equipo, lo cual destruiría su historial de partidos.
 */
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

/**
 * ¿Por qué existe esta función?
 * Para dar de baja a un equipo que abandona la liga.
 * 
 * ¿Qué cuidado debemos tener aquí?
 * Si borramos un equipo que ya ha jugado partidos, en una base de datos relacional estricta esto 
 * fallaría por llaves foráneas. Asumimos que la BD tiene configurado `ON DELETE CASCADE` o que  
 * el admin comprende que borrar equipos a mitad de temporada altera las estadísticas globales.
 */
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