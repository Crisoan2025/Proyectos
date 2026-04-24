const pool = require('../db');

/**
 * ¿Por qué existe esta función?
 * Para renderizar la sección de "Roster" (lista de jugadores) en el panel de administración
 * y tener un pantallazo general de quién juega dónde.
 * 
 * ¿Para qué se hace así (Decisiones de diseño)?
 * - Usamos `LEFT JOIN teams`: ¿Por qué LEFT JOIN y no un simple JOIN? Para que la consulta no devuelva 
 *   una lista vacía para aquellos jugadores que momentáneamente no tienen equipo (agentes libres).
 * - Ordenamos por `surname ASC` para facilitar visualmente la búsqueda del administrador.
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
 * ¿Por qué existe esta función?
 * Para incorporar nuevos talentos a la liga y asignarlos, opcionalmente, a un equipo activo.
 * 
 * ¿Para qué se hace así (Decisiones de diseño)?
 * - Validamos `name` y `surname` agresivamente parando el flujo con un `return res.status(400)`. 
 *   ¿Por qué? Porque un registro basura en la base de datos es peor que un error en pantalla. 
 *   Obligamos a que la data entrante sea de calidad antes de siquiera tocar la base de datos.
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
        console.log("🚨 EL VAR DICE:", err.message); 
        res.status(500).json({ message: "Error al crear jugador" });
    }
};

/**
 * ¿Por qué existe esta función?
 * Para reflejar traspasos de jugadores entre equipos (trades) o corregir errores en sus categorías.
 * 
 * ¿Para qué se hace así (Decisiones de diseño)?
 * - Pedimos todos los campos (`name`, `surname`, `category`, `team_id`) aunque solo vaya a cambiar uno. 
 *   Para una app pequeña es más fácil hacer un UPDATE completo enviando todo el formulario desde el front, 
 *   que hacer lógica compleja en el backend para actualizar campos dinámicos (PATCH dinámico).
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
 * ¿Por qué existe esta función?
 * Para remover jugadores que han sido suspendidos permanentemente, se han retirado o introducidos por error.
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