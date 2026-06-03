import { gajiDB } from '../database/mysqlDb.js';

const camelToSnake = (obj) =>
  Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key.replace(/([A-Z])/g, '_$1').toLowerCase(),
      value
    ])
  );

const snakeToCamel = (obj) =>
  Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key.replace(/_([a-z])/g, (_, c) => c.toUpperCase()),
      value
    ])
  );

// Get all gaji
export const getAllGaji = async (req, res) => {
  try {
    const gaji = await gajiDB.getAll();
    res.json({
      success: true,
      message: 'Data gaji berhasil diambil',
      data: gaji.map(snakeToCamel)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get gaji by karyawan
export const getGajiByKaryawan = async (req, res) => {
  try {
    const gaji = await gajiDB.findByKaryawanId(req.params.karyawanId);
    res.json({
      success: true,
      message: 'Data gaji karyawan berhasil diambil',
      data: gaji.map(snakeToCamel)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create gaji
export const createGaji = async (req, res) => {
  try {
    const { karyawanId, nama, periode, gajiPokok, gajiKotor, gajiNetto } = req.body;

    if (!karyawanId || !nama || !periode || gajiPokok === undefined || gajiKotor === undefined || gajiNetto === undefined) {
      return res.status(400).json({ success: false, message: 'Data tidak lengkap' });
    }

    const dbPayload = {
      ...camelToSnake(req.body),
      karyawan_id: karyawanId,
      created_at: new Date()
    };

    const newGaji = await gajiDB.save(dbPayload);

    res.status(201).json({
      success: true,
      message: 'Data gaji berhasil ditambahkan',
      data: snakeToCamel(newGaji)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update gaji
export const updateGaji = async (req, res) => {
  try {
    const existingGaji = await gajiDB.findById(req.params.id);
    if (!existingGaji) {
      return res.status(404).json({ success: false, message: 'Data gaji tidak ditemukan' });
    }

    const updatedGaji = await gajiDB.save({
      ...existingGaji,
      ...camelToSnake(req.body),
      id: req.params.id,
      updated_at: new Date()
    });

    res.json({
      success: true,
      message: 'Data gaji berhasil diperbarui',
      data: snakeToCamel(updatedGaji)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete gaji
export const deleteGaji = async (req, res) => {
  try {
    const existingGaji = await gajiDB.findById(req.params.id);
    if (!existingGaji) {
      return res.status(404).json({ success: false, message: 'Data gaji tidak ditemukan' });
    }

    await gajiDB.delete(req.params.id);
    res.json({
      success: true,
      message: 'Data gaji berhasil dihapus'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
