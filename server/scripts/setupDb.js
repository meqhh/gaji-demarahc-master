import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  });

  try {
    console.log('📊 Starting database setup...');

    // Create database
    const dbName = process.env.DB_NAME || 'demara_gaji';
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`✓ Database ${dbName} created/exists`);

    // Switch to database
    await connection.query(`USE ${dbName}`);

    // Read and execute SQL dump
    const sqlPath = path.join(__dirname, '../../demara_gaji.sql');
    if (!fs.existsSync(sqlPath)) {
      console.error('❌ SQL file not found at:', sqlPath);
      process.exit(1);
    }

    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    await connection.query(sqlContent);

    console.log('✓ Database tables created successfully');
    console.log('✓ Database setup complete!');

  } catch (err) {
    console.error('❌ Database setup failed:', err.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

setupDatabase();
