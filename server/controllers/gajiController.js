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

const normalizeGajiResponse = (gaji) => {
  const camelized = snakeToCamel(gaji);
  if (!camelized.periode && camelized.bulan && camelized.tahun) {
    camelized.periode = `${String(camelized.bulan).padStart(2, '0')}-${camelized.tahun}`;
  }
  return camelized;
};

// Get all gaji
export const getAllGaji = async (req, res) => {
  try {
    const gaji = await gajiDB.getAll();
    res.json({
      success: true,
      message: 'Data gaji berhasil diambil',
      data: gaji.map(normalizeGajiResponse)
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
      data: gaji.map(normalizeGajiResponse)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create gaji
const parsePeriodeToMonthYear = (periode, tanggal) => {
  const result = {};
  if (periode) {
    const parts = String(periode).trim().split(/[-\/]/).map((p) => p.trim());
    if (parts.length >= 2) {
      result.bulan = parts[0].padStart(2, '0');
      result.tahun = Number(parts[1]);
    }
  }
  if ((!result.bulan || !result.tahun) && tanggal) {
    const date = new Date(tanggal);
    if (!Number.isNaN(date.getTime())) {
      result.bulan = String(date.getMonth() + 1).padStart(2, '0');
      result.tahun = date.getFullYear();
    }
  }
  return result;
};

export const createGaji = async (req, res) => {
  try {
    const { karyawanId, nama, periode, tanggal, gajiPokok, gajiKotor, gajiNetto } = req.body;

    if (!karyawanId || !nama || (!periode && !tanggal) || gajiPokok === undefined || gajiKotor === undefined || gajiNetto === undefined) {
      return res.status(400).json({ success: false, message: 'Data tidak lengkap' });
    }

    const monthYear = parsePeriodeToMonthYear(periode, tanggal);
    const dbPayload = {
      ...camelToSnake(req.body),
      ...monthYear,
      karyawan_id: karyawanId,
      created_at: new Date()
    };
    delete dbPayload.periode;

    const newGaji = await gajiDB.save(dbPayload);

    res.status(201).json({
      success: true,
      message: 'Data gaji berhasil ditambahkan',
      data: normalizeGajiResponse(newGaji)
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

    const { periode, tanggal } = req.body;
    const monthYear = parsePeriodeToMonthYear(periode, tanggal);

    const updatedGaji = await gajiDB.save({
      ...existingGaji,
      ...camelToSnake(req.body),
      ...monthYear,
      id: req.params.id,
      updated_at: new Date()
    });

    res.json({
      success: true,
      message: 'Data gaji berhasil diperbarui',
      data: normalizeGajiResponse(updatedGaji)
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
