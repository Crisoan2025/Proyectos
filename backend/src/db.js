const { Pool } = require('pg');
require('dotenv').config();

/**
 * Conexión a PostgreSQL con configuración dual:
 * - Si existe DATABASE_URL (producción / Supabase), se usa esa cadena con SSL.
 *   `rejectUnauthorized: false` es necesario porque Supabase usa certificados
 *   autofirmados en su pooler.
 * - Si no, se arma la conexión con las credenciales locales del .env
 *   (DB_USER, DB_HOST, etc.) para desarrollo.
 * Se exporta un Pool (y no un Client) para reutilizar conexiones entre requests;
 * las transacciones reservan una conexión dedicada con pool.connect().
 */
const pool = new Pool(
  process.env.DATABASE_URL 
    ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
    : {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
      }
);

module.exports = pool;