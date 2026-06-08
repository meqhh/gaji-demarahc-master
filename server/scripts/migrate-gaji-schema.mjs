import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const connection = await mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'demara_gaji'
});

async function migrateGajiSchema() {
  try {
    console.log('🔧 Migrating gaji table schema...');
    
    // Check if columns exist
    const [columns] = await connection.query('SHOW COLUMNS FROM gaji');
    const existingColumns = columns.map(c => c.Field);
    
    console.log('Current columns:', existingColumns);
    
    // Add missing columns
    const columnsToAdd = {
      'tanggal': "ALTER TABLE gaji ADD COLUMN tanggal DATETIME DEFAULT NULL",
      'pasien': "ALTER TABLE gaji ADD COLUMN pasien VARCHAR(255) DEFAULT NULL",
      'nama_pasien': "ALTER TABLE gaji ADD COLUMN nama_pasien VARCHAR(255) DEFAULT NULL",
      'klinik': "ALTER TABLE gaji ADD COLUMN klinik VARCHAR(255) DEFAULT NULL",
      'klinik_home_service': "ALTER TABLE gaji ADD COLUMN klinik_home_service VARCHAR(255) DEFAULT NULL",
      'treatment': "ALTER TABLE gaji ADD COLUMN treatment VARCHAR(255) DEFAULT NULL",
      'harga': "ALTER TABLE gaji ADD COLUMN harga DECIMAL(15,2) DEFAULT 0",
      'fee': "ALTER TABLE gaji ADD COLUMN fee DECIMAL(15,2) DEFAULT 0",
      'fee_percent': "ALTER TABLE gaji ADD COLUMN fee_percent DECIMAL(5,2) DEFAULT 0",
      'fee_amount': "ALTER TABLE gaji ADD COLUMN fee_amount DECIMAL(15,2) DEFAULT 0",
      'tunjangan': "ALTER TABLE gaji ADD COLUMN tunjangan DECIMAL(15,2) DEFAULT 0",
      'potongan_asuransi': "ALTER TABLE gaji ADD COLUMN potongan_asuransi DECIMAL(15,2) DEFAULT 0",
      'potongan_tax': "ALTER TABLE gaji ADD COLUMN potongan_tax DECIMAL(15,2) DEFAULT 0",
      'status': "ALTER TABLE gaji ADD COLUMN status VARCHAR(50) DEFAULT 'Draft'"
    };
    
    for (const [colName, alterSql] of Object.entries(columnsToAdd)) {
      if (!existingColumns.includes(colName)) {
        try {
          console.log(`Adding column: ${colName}...`);
          await connection.query(alterSql);
          console.log(`✅ Added column ${colName}`);
        } catch (err) {
          if (err.message.includes('Duplicate column name')) {
            console.log(`Column ${colName} already exists`);
          } else {
            console.error(`Error adding column ${colName}:`, err.message);
          }
        }
      } else {
        console.log(`Column ${colName} already exists`);
      }
    }
    
    // Verify final schema
    const [finalColumns] = await connection.query('SHOW COLUMNS FROM gaji');
    console.log('\n✅ Final gaji table schema:');
    finalColumns.forEach(c => {
      console.log(`   - ${c.Field}: ${c.Type} (${c.Null === 'YES' ? 'nullable' : 'NOT NULL'})`);
    });
    
    console.log('\n✅ Migration completed successfully!');
    console.log('⚠️  Note: Server process must be restarted to clear column cache');
    
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

migrateGajiSchema();
