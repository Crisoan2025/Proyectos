const pool = require('./src/db');

async function fixSequences() {
  try {
    const tables = ['teams', 'players', 'matches', 'seasons', 'users'];
    
    for (const table of tables) {
      console.log(`Checking sequence for ${table}...`);
      const maxRes = await pool.query(`SELECT MAX(id) FROM ${table}`);
      const maxId = maxRes.rows[0].max || 0;
      
      console.log(`Max ID for ${table} is ${maxId}. Setting sequence...`);
      await pool.query(`SELECT setval('public.${table}_id_seq', ${maxId > 0 ? maxId : 1}, true)`);
      console.log(`Sequence for ${table} fixed.`);
    }
    
    console.log('All sequences updated successfully!');
  } catch (err) {
    console.error('Error fixing sequences:', err.message);
  } finally {
    process.exit();
  }
}

fixSequences();
