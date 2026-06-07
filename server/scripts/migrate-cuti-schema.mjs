import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const connection = await mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'demara_gaji'
});

async function migrateCutiSchema() {
  try {
    console.log('🔧 Migrating cuti table schema...');
    
    // Check if columns exist and add them if missing
    const [columns] = await connection.query('SHOW COLUMNS FROM cuti');
    const existingColumns = columns.map(c => c.Field);
    
    console.log('Current columns:', existingColumns);
    
    // Add missing columns
    const columnsToAdd = {
      'nama': "ALTER TABLE cuti ADD COLUMN nama varchar(100) DEFAULT NULL",
      'tanggal': "ALTER TABLE cuti ADD COLUMN tanggal date DEFAULT NULL",
      'lama': "ALTER TABLE cuti ADD COLUMN lama int(11) DEFAULT 1",
      'rejection_reason': "ALTER TABLE cuti ADD COLUMN rejection_reason text",
      'updated_by': "ALTER TABLE cuti ADD COLUMN updated_by varchar(100) DEFAULT NULL",
      'updated_at': "ALTER TABLE cuti ADD COLUMN updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
    };
    
    for (const [colName, alterSql] of Object.entries(columnsToAdd)) {
      if (!existingColumns.includes(colName)) {
        try {
          console.log(`Adding column: ${colName}...`);
          await connection.query(alterSql);
          console.log(`✅ Added column ${colName}`);
        } catch (err) {
          console.error(`Error adding column ${colName}:`, err.message);
        }
      } else {
        console.log(`Column ${colName} already exists`);
      }
    }
    
    // Rename old date columns to new format if they exist
    const oldColumns = ['tanggal_mulai', 'tanggal_selesai'];
    for (const oldCol of oldColumns) {
      if (existingColumns.includes(oldCol)) {
        try {
          console.log(`Dropping old column: ${oldCol}...`);
          await connection.query(`ALTER TABLE cuti DROP COLUMN ${oldCol}`);
          console.log(`✅ Dropped column ${oldCol}`);
        } catch (err) {
          console.error(`Error dropping column ${oldCol}:`, err.message);
        }
      }
    }
    
    // Update enum status values to match application
    try {
      console.log('Updating status enum values...');
      await connection.query("ALTER TABLE cuti MODIFY status enum('Pending','Disetujui','Ditolak') DEFAULT 'Pending'");
      console.log('✅ Updated status enum');
    } catch (err) {
      console.error('Error updating status enum:', err.message);
    }
    
    // Verify final schema
    const [finalColumns] = await connection.query('SHOW COLUMNS FROM cuti');
    console.log('\n✅ Final schema:');
    finalColumns.forEach(c => {
      console.log(`   - ${c.Field}: ${c.Type} (${c.Null === 'YES' ? 'nullable' : 'NOT NULL'})`);
    });
    
    console.log('\n✅ Migration completed!');
    
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

migrateCutiSchema();
