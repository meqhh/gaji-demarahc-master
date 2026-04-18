import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const connection = await mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true
});

const dbName = process.env.DB_NAME || 'demara_gaji';

async function setupDatabase() {
  try {
    console.log('🔧 Setting up database...');
    
    // Create database if not exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`✅ Database '${dbName}' ready`);
    
    // Switch to database
    await connection.query(`USE ${dbName}`);
    
    // Read SQL file
    const sqlPath = path.join(process.cwd(), '..', 'demara_gaji.sql');
    if (!fs.existsSync(sqlPath)) {
      console.error(`❌ SQL file not found: ${sqlPath}`);
      process.exit(1);
    }
    
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute SQL
    await connection.query(sqlContent);
    console.log('✅ All tables created successfully');
    
    // Verify tables
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`\n📋 Tables created (${tables.length}):`);
    tables.forEach((t, i) => {
      const tableName = Object.values(t)[0];
      console.log(`   ${i + 1}. ${tableName}`);
    });
    
    console.log('\n✅ Database setup completed!');
    console.log('📝 Now you can register/login in the app.\n');
    
  } catch (err) {
    console.error('❌ Database setup error:', err.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

setupDatabase();
