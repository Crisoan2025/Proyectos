const pool = require('../db');

/**
 * ¿Por qué existe este controller?
 * "La liga" no tiene una entidad propia (su branding estaba hardcodeado en el front).
 * Lo modelamos como un singleton: la tabla `settings` siempre tiene una sola fila (id = 1)
 * con el nombre y el logo de la liga. Así el front puede leer/editar el branding global.
 */

/**
 * GET /api/settings — público.
 * Lo consume el navbar y el hero para mostrar nombre + logo de la liga.
 */
const obtenerSettings = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM settings WHERE id = 1');
        // Si por algún motivo no existe la fila, devolvemos defaults razonables.
        res.json(result.rows[0] || { id: 1, league_name: 'Liga TPO', league_logo_url: null });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Error al obtener la configuración de la liga" });
    }
};

/**
 * PUT /api/settings — protegido.
 * Actualiza el nombre y/o el logo de la liga.
 */
const actualizarSettings = async (req, res) => {
    const { league_name, league_logo_url } = req.body;

    if (league_name !== undefined && !String(league_name).trim()) {
        return res.status(400).json({ error: "El nombre de la liga no puede estar vacío." });
    }

    try {
        // COALESCE: si un campo no viene en el body, conserva el valor actual.
        // (league_logo_url admite null explícito para "quitar el logo").
        const result = await pool.query(
            `UPDATE settings
             SET league_name = COALESCE($1, league_name),
                 league_logo_url = $2
             WHERE id = 1
             RETURNING *`,
            [league_name ?? null, league_logo_url ?? null]
        );
        res.json({ message: "Configuración de la liga actualizada", settings: result.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Error al actualizar la configuración de la liga" });
    }
};

module.exports = { obtenerSettings, actualizarSettings };
