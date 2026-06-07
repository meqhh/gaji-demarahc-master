import pool from '../database/mysql.js';

async function main() {
  try {
    const [rows] = await pool.query('SELECT id, karyawan_id, nama, tanggal, lama, status FROM cuti LIMIT 20');
    console.log(JSON.stringify(rows, null, 2));
  } catch (err) {
    console.error('DEBUG ERROR', err);
  } finally {
    await pool.end();
  }
}

main();
