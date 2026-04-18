import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'demara_gaji'
});

async function fixDatabase() {
  const conn = await pool.getConnection();
  
  try {
    console.log('🔧 Fixing database AUTO_INCREMENT...');
    
    // Fix users table AUTO_INCREMENT
    await conn.query('ALTER TABLE users AUTO_INCREMENT = 1');
    console.log('✅ Fixed users table');
    
    // Fix karyawan table AUTO_INCREMENT
    await conn.query('ALTER TABLE karyawan AUTO_INCREMENT = 1');
    console.log('✅ Fixed karyawan table');
    
    // Fix other tables
    const tables = ['absensi', 'cuti', 'gaji', 'slip_gaji', 'treatment', 'detail_treatment'];
    for (const table of tables) {
      await conn.query(`ALTER TABLE ${table} AUTO_INCREMENT = 1`);
      console.log(`✅ Fixed ${table} table`);
    }
    
    // Check table structure
    const [tables_list] = await conn.query('SHOW TABLES');
    console.log('\n📋 Tables in database:');
    tables_list.forEach(t => {
      const tableName = Object.values(t)[0];
      console.log(`   - ${tableName}`);
    });
    
    console.log('\n✅ Database fixed successfully!');
    
  } catch (err) {
    console.error('❌ Error fixing database:', err.message);
  } finally {
    conn.release();
    await pool.end();
  }
}

fixDatabase();
