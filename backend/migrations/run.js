// Runner de migraciones simple: node migrations/run.js <archivo.sql>
// Usa la misma conexión que la app (db.js -> DATABASE_URL o credenciales locales).
const fs = require('fs');
const path = require('path');
const pool = require('../src/db');

(async () => {
  const file = process.argv[2];
  if (!file) {
    console.error('Uso: node migrations/run.js <archivo.sql>');
    process.exit(1);
  }
  const sql = fs.readFileSync(path.join(__dirname, file), 'utf8');
  try {
    await pool.query(sql);
    console.log(`✅ Migración aplicada: ${file}`);
  } catch (err) {
    console.error(`❌ Error aplicando ${file}:`, err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
