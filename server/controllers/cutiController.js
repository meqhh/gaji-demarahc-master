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

// Update cuti data (karyawan bisa edit saat status masih Pending, admin bisa update status)
export const updateCuti = async (req, res) => {
  try {
    const cuti = await Cuti.findById(req.params.id);
    if (!cuti) {
      return res.status(404).json({ success: false, message: 'Pengajuan cuti tidak ditemukan' });
    }

    const isAdmin = req.user?.role === 'admin';
    if (!isAdmin) {
      if (cuti.nama !== req.user?.name) {
        return res.status(403).json({ success: false, message: 'Tidak memiliki izin untuk mengubah cuti ini' });
      }
      if (cuti.status !== 'Pending') {
        return res.status(400).json({ success: false, message: 'Pengajuan cuti hanya dapat diedit saat status Pending' });
      }
    }

    const updates = {};
    if (req.body.tanggal !== undefined) updates.tanggal = req.body.tanggal;
    if (req.body.lama !== undefined) updates.lama = req.body.lama;
    if (req.body.alasan !== undefined) updates.alasan = req.body.alasan;
    if (req.body.nama !== undefined) updates.nama = req.body.nama;

    if (isAdmin && req.body.status !== undefined) {
      updates.status = req.body.status;
    }
    if (isAdmin && req.body.rejectionReason !== undefined) {
      updates.rejectionReason = req.body.rejectionReason;
    }

    if (!isAdmin) {
      updates.nama = req.user?.name || updates.nama;
    }

    updates.updatedBy = req.user?.name || req.user?.email || 'System';
    updates.updatedAt = new Date();

    const updatedCuti = await Cuti.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json({ success: true, message: 'Pengajuan cuti berhasil diperbarui', data: updatedCuti });
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
