/**
 * Migration: Tambah kolom foto, tempat_lahir, tanggal_lahir, status ke tabel karyawan
 * Jalankan: node server/scripts/addMissingColumns.js
 */

import pool from '../database/mysql.js';

async function migrate() {
  const conn = await pool.getConnection();
  try {
    console.log('🔄 Mengecek dan menambah kolom foto, tempat_lahir, tanggal_lahir, status ke tabel karyawan...');

    const [columns] = await conn.query(`SHOW COLUMNS FROM karyawan`);
    const existingCols = columns.map(c => c.Field);

    const addColumnIfNotExists = async (colName, colDef) => {
      if (!existingCols.includes(colName)) {
        await conn.query(`ALTER TABLE karyawan ADD COLUMN ${colName} ${colDef}`);
        console.log(`✅ Kolom ${colName} berhasil ditambahkan`);
      } else {
        console.log(`ℹ️  Kolom ${colName} sudah ada, dilewati`);
      }
    };

    await addColumnIfNotExists('foto', 'LONGTEXT NULL COMMENT \'Base64 foto profil\'');
    await addColumnIfNotExists('tempat_lahir', 'VARCHAR(100) NULL');
    await addColumnIfNotExists('tanggal_lahir', 'DATE NULL');
    await addColumnIfNotExists('status', 'VARCHAR(50) NULL');

    console.log('🎉 Migration selesai!');
  } catch (err) {
    console.error('❌ Migration gagal:', err);
    process.exit(1);
  } finally {
    conn.release();
    process.exit(0);
  }
}

migrate();
