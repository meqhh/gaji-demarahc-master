import Cuti from '../models/Cuti.js';

// Get all cuti
export const getAllCuti = async (req, res) => {
  try {
    const cuti = await Cuti.find().populate('karyawanId').sort({ createdAt: -1 });
    res.json({
      success: true,
      message: 'Data cuti berhasil diambil',
      data: cuti
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get cuti by ID
export const getCutiById = async (req, res) => {
  try {
    const cuti = await Cuti.findById(req.params.id).populate('karyawanId');
    if (!cuti) {
      return res.status(404).json({ success: false, message: 'Pengajuan cuti tidak ditemukan' });
    }
    res.json({ success: true, data: cuti });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get cuti by karyawan
export const getCutiByKaryawan = async (req, res) => {
  try {
    const cuti = await Cuti.find({ karyawanId: req.params.karyawanId }).sort({ createdAt: -1 });
    res.json({
      success: true,
      message: 'Data cuti karyawan berhasil diambil',
      data: cuti
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create cuti
export const createCuti = async (req, res) => {
  try {
    const { karyawanId, nama, tanggal, lama, alasan } = req.body;
    
    if (!karyawanId || !nama || !tanggal || !lama || !alasan) {
      return res.status(400).json({ success: false, message: 'Data tidak lengkap' });
    }
    
    const newCuti = new Cuti(req.body);
    await newCuti.save();
    
    res.status(201).json({
      success: true,
      message: 'Pengajuan cuti berhasil dibuat',
      data: newCuti
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update cuti status
export const updateCutiStatus = async (req, res) => {
  try {
    const { status, rejectionReason, updatedBy } = req.body;
    
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status harus diisi' });
    }
    
    if (status === 'Ditolak' && !rejectionReason) {
      return res.status(400).json({ success: false, message: 'Alasan penolakan harus diisi' });
    }
    
    const updateData = {
      status,
      updatedBy,
      updatedAt: new Date()
    };
    
    if (status === 'Ditolak') {
      updateData.rejectionReason = rejectionReason;
    }
    
    const cuti = await Cuti.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!cuti) {
      return res.status(404).json({ success: false, message: 'Pengajuan cuti tidak ditemukan' });
    }
    
    res.json({
      success: true,
      message: `Pengajuan cuti berhasil diubah menjadi ${status}`,
      data: cuti
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete cuti
export const deleteCuti = async (req, res) => {
  try {
    const cuti = await Cuti.findByIdAndDelete(req.params.id);
    
    if (!cuti) {
      return res.status(404).json({ success: false, message: 'Pengajuan cuti tidak ditemukan' });
    }
    
    res.json({
      success: true,
      message: 'Pengajuan cuti berhasil dihapus'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
