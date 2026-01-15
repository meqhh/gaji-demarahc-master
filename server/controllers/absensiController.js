import Absensi from '../models/Absensi.js';

// Get all absensi
export const getAllAbsensi = async (req, res) => {
  try {
    const absensi = await Absensi.find().populate('karyawanId').sort({ tanggal: -1 });
    res.json({
      success: true,
      message: 'Data absensi berhasil diambil',
      data: absensi
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get absensi by karyawan
export const getAbsensiByKaryawan = async (req, res) => {
  try {
    const absensi = await Absensi.find({ karyawanId: req.params.karyawanId }).sort({ tanggal: -1 });
    res.json({
      success: true,
      message: 'Data absensi karyawan berhasil diambil',
      data: absensi
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create absensi
export const createAbsensi = async (req, res) => {
  try {
    const { karyawanId, nama, tanggal, status } = req.body;
    
    if (!karyawanId || !nama || !tanggal || !status) {
      return res.status(400).json({ success: false, message: 'Data tidak lengkap' });
    }
    
    const newAbsensi = new Absensi(req.body);
    await newAbsensi.save();
    
    res.status(201).json({
      success: true,
      message: 'Absensi berhasil ditambahkan',
      data: newAbsensi
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update absensi
export const updateAbsensi = async (req, res) => {
  try {
    const absensi = await Absensi.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    
    if (!absensi) {
      return res.status(404).json({ success: false, message: 'Absensi tidak ditemukan' });
    }
    
    res.json({
      success: true,
      message: 'Absensi berhasil diperbarui',
      data: absensi
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete absensi
export const deleteAbsensi = async (req, res) => {
  try {
    const absensi = await Absensi.findByIdAndDelete(req.params.id);
    
    if (!absensi) {
      return res.status(404).json({ success: false, message: 'Absensi tidak ditemukan' });
    }
    
    res.json({
      success: true,
      message: 'Absensi berhasil dihapus'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
