import { karyawanDB } from '../database/fileDb.js';

// Get all karyawan
export const getAllKaryawan = async (req, res) => {
  try {
    const karyawan = karyawanDB.getAll();
    res.json({
      success: true,
      message: 'Data karyawan berhasil diambil',
      data: karyawan
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get karyawan by ID
export const getKaryawanById = async (req, res) => {
  try {
    const karyawan = karyawanDB.findById(req.params.id);
    if (!karyawan) {
      return res.status(404).json({ success: false, message: 'Karyawan tidak ditemukan' });
    }
    res.json({ success: true, data: karyawan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create karyawan
export const createKaryawan = async (req, res) => {
  try {
    const { nama, email, nip, posisi, departemen, tanggalMasuk, gajiPokok } = req.body;
    
    // Validasi
    if (!nama || !email || !nip || !posisi || !departemen || !tanggalMasuk || !gajiPokok) {
      return res.status(400).json({ success: false, message: 'Data tidak lengkap' });
    }
    
    // Cek email duplikat
    const existingEmail = karyawanDB.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'Email sudah digunakan' });
    }
    
    // Cek NIP duplikat
    const existingNip = karyawanDB.findOne({ nip });
    if (existingNip) {
      return res.status(400).json({ success: false, message: 'NIP sudah digunakan' });
    }
    
    const newKaryawan = {
      id: `EMP${Date.now()}`,
      ...req.body,
      createdAt: new Date().toISOString()
    };
    
    karyawanDB.save(newKaryawan);
    
    res.status(201).json({
      success: true,
      message: 'Karyawan berhasil ditambahkan',
      data: newKaryawan
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update karyawan
export const updateKaryawan = async (req, res) => {
  try {
    const karyawan = karyawanDB.findById(req.params.id);
    
    if (!karyawan) {
      return res.status(404).json({ success: false, message: 'Karyawan tidak ditemukan' });
    }
    
    const updatedKaryawan = {
      ...karyawan,
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    karyawanDB.save(updatedKaryawan);
    
    res.json({
      success: true,
      message: 'Karyawan berhasil diperbarui',
      data: updatedKaryawan
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete karyawan
export const deleteKaryawan = async (req, res) => {
  try {
    const karyawan = karyawanDB.findById(req.params.id);
    
    if (!karyawan) {
      return res.status(404).json({ success: false, message: 'Karyawan tidak ditemukan' });
    }
    
    karyawanDB.delete(req.params.id);
    
    res.json({
      success: true,
      message: 'Karyawan berhasil dihapus'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export default {
  getAllKaryawan,
  getKaryawanById,
  createKaryawan,
  updateKaryawan,
  deleteKaryawan
};
