const pool = require('../db');

/**
 * ¿Por qué existe este helper?
 * La consulta "obtener temporada activa" se repetía en 5 funciones distintas.
 * Centralizarla aquí cumple el principio DRY (Don't Repeat Yourself) y garantiza
 * que si cambiamos la lógica de selección de temporada, solo tocamos un lugar.
 * 
 * @returns {number|null} El ID de la temporada activa, o null si no hay ninguna.
 */
const getActiveSeasonId = async () => {
    const result = await pool.query('SELECT id FROM seasons WHERE is_active = true LIMIT 1');
    return result.rows.length > 0 ? result.rows[0].id : null;
};

module.exports = { getActiveSeasonId };
