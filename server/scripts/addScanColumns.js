/**
 * Migration: Tambah kolom scan_kontrak dan scan_ttd ke tabel karyawan
 * Jalankan: node server/scripts/addScanColumns.js
 */

import pool from '../database/mysql.js';

async function migrate() {
  const conn = await pool.getConnection();
  try {
    console.log('🔄 Mengecek dan menambah kolom scan_kontrak & scan_ttd ke tabel karyawan...');

    const [columns] = await conn.query(`SHOW COLUMNS FROM karyawan`);
    const existingCols = columns.map(c => c.Field);

    if (!existingCols.includes('scan_kontrak')) {
      await conn.query(`ALTER TABLE karyawan ADD COLUMN scan_kontrak LONGTEXT NULL COMMENT 'Base64 scan/foto dokumen kontrak'`);
      console.log('✅ Kolom scan_kontrak berhasil ditambahkan');
    } else {
      console.log('ℹ️  Kolom scan_kontrak sudah ada, dilewati');
    }

    if (!existingCols.includes('scan_ttd')) {
      await conn.query(`ALTER TABLE karyawan ADD COLUMN scan_ttd LONGTEXT NULL COMMENT 'Base64 scan/foto tanda tangan'`);
      console.log('✅ Kolom scan_ttd berhasil ditambahkan');
    } else {
      console.log('ℹ️  Kolom scan_ttd sudah ada, dilewati');
    }

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
