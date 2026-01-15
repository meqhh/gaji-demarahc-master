import Karyawan from '../models/Karyawan.js';

// Get all karyawan
export const getAllKaryawan = async (req, res) => {
  try {
    const karyawan = await Karyawan.find().sort({ createdAt: -1 });
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
    const karyawan = await Karyawan.findById(req.params.id);
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
    const existingEmail = await Karyawan.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'Email sudah digunakan' });
    }
    
    // Cek NIP duplikat
    const existingNip = await Karyawan.findOne({ nip });
    if (existingNip) {
      return res.status(400).json({ success: false, message: 'NIP sudah digunakan' });
    }
    
    const newKaryawan = new Karyawan(req.body);
    await newKaryawan.save();
    
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
    const karyawan = await Karyawan.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    
    if (!karyawan) {
      return res.status(404).json({ success: false, message: 'Karyawan tidak ditemukan' });
    }
    
    res.json({
      success: true,
      message: 'Karyawan berhasil diperbarui',
      data: karyawan
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete karyawan
export const deleteKaryawan = async (req, res) => {
  try {
    const karyawan = await Karyawan.findByIdAndDelete(req.params.id);
    
    if (!karyawan) {
      return res.status(404).json({ success: false, message: 'Karyawan tidak ditemukan' });
    }
    
    res.json({
      success: true,
      message: 'Karyawan berhasil dihapus'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
