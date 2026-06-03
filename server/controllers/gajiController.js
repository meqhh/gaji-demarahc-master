import Gaji from '../models/Gaji.js';

// Get all gaji
export const getAllGaji = async (req, res) => {
  try {
    const gaji = await Gaji.find().populate('karyawanId').sort({ periode: -1 });
    res.json({
      success: true,
      message: 'Data gaji berhasil diambil',
      data: gaji
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get gaji by karyawan
export const getGajiByKaryawan = async (req, res) => {
  try {
    const gaji = await Gaji.find({ karyawanId: req.params.karyawanId }).sort({ periode: -1 });
    res.json({
      success: true,
      message: 'Data gaji karyawan berhasil diambil',
      data: gaji
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
    
    const newGaji = new Gaji(req.body);
    await newGaji.save();
    
    res.status(201).json({
      success: true,
      message: 'Data gaji berhasil ditambahkan',
      data: newGaji
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update gaji
export const updateGaji = async (req, res) => {
  try {
    const gaji = await Gaji.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    
    if (!gaji) {
      return res.status(404).json({ success: false, message: 'Data gaji tidak ditemukan' });
    }
    
    res.json({
      success: true,
      message: 'Data gaji berhasil diperbarui',
      data: gaji
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete gaji
export const deleteGaji = async (req, res) => {
  try {
    const gaji = await Gaji.findByIdAndDelete(req.params.id);
    
    if (!gaji) {
      return res.status(404).json({ success: false, message: 'Data gaji tidak ditemukan' });
    }
    
    res.json({
      success: true,
      message: 'Data gaji berhasil dihapus'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
