import { karyawanDB } from '../database/mysqlDb.js';

// Get all karyawan
export const getAllKaryawan = async (req, res) => {
  try {
    const karyawan = await karyawanDB.getAll();
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
    const karyawan = await karyawanDB.findById(req.params.id);
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
    const existingEmail = await karyawanDB.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'Email sudah digunakan' });
    }
    
    // Cek NIP duplikat
    const existingNip = await karyawanDB.findOne({ nip });
    if (existingNip) {
      return res.status(400).json({ success: false, message: 'NIP sudah digunakan' });
    }
    
    const newKaryawan = {
      ...req.body,
      nama,
      email,
      nip,
      posisi,
      departemen,
      tanggalMasuk,
      gajiPokok
    };
    
    await karyawanDB.save(newKaryawan);
    
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
    const karyawan = await karyawanDB.findById(req.params.id);
    
    if (!karyawan) {
      return res.status(404).json({ success: false, message: 'Karyawan tidak ditemukan' });
    }
    
    const updatedKaryawan = {
      ...karyawan,
      ...req.body
    };
    
    await karyawanDB.save(updatedKaryawan);
    
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
    const karyawan = await karyawanDB.findById(req.params.id);
    
    if (!karyawan) {
      return res.status(404).json({ success: false, message: 'Karyawan tidak ditemukan' });
    }
    
    await karyawanDB.delete(req.params.id);
    
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
