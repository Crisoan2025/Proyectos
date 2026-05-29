const pool = require('../db');

/**
 * ¿Por qué existe esta función?
 * Para que el frontend pueda mostrar un selector de temporadas y permitir al usuario
 * navegar el historial de la liga (ej: "¿Cómo le fue a los Lions en la Temporada 2025?").
 */
const obtenerTemporadas = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM seasons ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Error al obtener temporadas" });
    }
};

/**
 * ¿Por qué existe esta función?
 * Para que los endpoints que necesitan saber "en qué temporada estamos" puedan obtenerla
 * sin que el frontend tenga que mandarla explícitamente en cada petición.
 */
const obtenerTemporadaActiva = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM seasons WHERE is_active = true LIMIT 1');
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "No hay temporada activa." });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Error al obtener temporada activa" });
    }
};

/**
 * ¿Por qué existe esta función?
 * Para permitir que el admin inicie una nueva temporada. Al hacerlo:
 * 1. Se desactivan todas las temporadas anteriores.
 * 2. Se crea la nueva temporada como activa.
 * 3. Se inicializan registros en team_stats con todo en 0 para cada equipo existente.
 * 
 * ¿Para qué se hace así (Decisiones de diseño)?
 * - Usamos una transacción porque son varias operaciones que deben completarse juntas.
 * - No borramos las stats anteriores; quedan como historial consultable.
 *
 * 🔧 CORRECCIÓN (Bug #1 — Transacciones que no eran atómicas): antes el
 *   BEGIN/UPDATE/INSERT/COMMIT usaban `pool.query(...)` (una conexión distinta por
 *   llamada), así que la transacción no era real. Ahora todo corre sobre un único
 *   `client` de `pool.connect()`, liberado en `finally`.
 */
const crearTemporada = async (req, res) => {
    const { name, start_date, end_date } = req.body;

    if (!name) return res.status(400).json({ error: "El nombre de la temporada es obligatorio." });

    // 🔧 CORRECCIÓN Bug #1: una sola conexión para toda la transacción (commit/rollback reales).
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Desactivar todas las temporadas anteriores
        await client.query('UPDATE seasons SET is_active = false');

        // Crear la nueva temporada como activa
        const seasonResult = await client.query(
            'INSERT INTO seasons (name, start_date, end_date, is_active) VALUES ($1, $2, $3, true) RETURNING *',
            [name, start_date || null, end_date || null]
        );
        const newSeason = seasonResult.rows[0];

        // Inicializar team_stats en 0 para todos los equipos en un solo query (evita N+1)
        const statsResult = await client.query(
            'INSERT INTO team_stats (team_id, season_id) SELECT id, $1 FROM teams RETURNING team_id',
            [newSeason.id]
        );

        await client.query('COMMIT');
        res.status(201).json({ 
            message: `¡Temporada "${name}" creada! ${statsResult.rowCount} equipos inicializados.`, 
            temporada: newSeason 
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Error al crear temporada:", err.message);
        res.status(500).json({ error: "Error al crear la temporada." });
    } finally {
        // Devolvemos la conexión al pool pase lo que pase.
        client.release();
    }
};

module.exports = { obtenerTemporadas, obtenerTemporadaActiva, crearTemporada };
