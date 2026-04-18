import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'demara_gaji',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true
});

// Test connection
pool.getConnection()
  .then(conn => {
    console.log('✓ MySQL database connected');
    const ensureKaryawanColumns = async () => {
      const columnQueries = [
        "ALTER TABLE karyawan ADD COLUMN IF NOT EXISTS email VARCHAR(150) NULL",
        "ALTER TABLE karyawan ADD COLUMN IF NOT EXISTS tempat_lahir VARCHAR(150) NULL",
        "ALTER TABLE karyawan ADD COLUMN IF NOT EXISTS tanggal_lahir DATE NULL",
        "ALTER TABLE karyawan ADD COLUMN IF NOT EXISTS tgl_masuk DATE NULL",
        "ALTER TABLE karyawan ADD COLUMN IF NOT EXISTS tgl_kontrak DATE NULL",
        "ALTER TABLE karyawan ADD COLUMN IF NOT EXISTS lama_kontrak VARCHAR(100) NULL",
        "ALTER TABLE karyawan ADD COLUMN IF NOT EXISTS foto LONGTEXT NULL"
      ];

      for (const query of columnQueries) {
        try {
          await conn.query(query);
        } catch (err) {
          console.warn('⚠️ Could not apply karyawan schema update:', err.message);
        }
      }
    };

    // Allow multiple accounts using same email by removing unique index when present.
    conn.query("SHOW INDEX FROM users WHERE Key_name = 'email'")
      .then(([rows]) => {
        if (Array.isArray(rows) && rows.length > 0) {
          return conn.query('ALTER TABLE users DROP INDEX email')
            .then(() => console.log('✓ Dropped unique index users.email'));
        }
        return null;
      })
      .then(() => ensureKaryawanColumns())
      .then(() => console.log('✓ Karyawan profile columns ready'))
      .catch(err => {
        // Keep app running even if index operation is not needed/possible.
        console.warn('⚠️ Could not adjust users.email index:', err.message);
      })
      .finally(() => conn.release());
  })
  .catch(err => {
    console.error('❌ MySQL connection failed:', err.message);
  });

export default pool;
