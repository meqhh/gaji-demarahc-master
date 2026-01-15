import Treatment from '../models/Treatment.js';

// Get all treatment
export const getAllTreatment = async (req, res) => {
  try {
    const treatment = await Treatment.find().populate('karyawanId').sort({ tanggal: -1 });
    res.json({
      success: true,
      message: 'Data treatment berhasil diambil',
      data: treatment
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get treatment by karyawan
export const getTreatmentByKaryawan = async (req, res) => {
  try {
    const treatment = await Treatment.find({ karyawanId: req.params.karyawanId }).sort({ tanggal: -1 });
    res.json({
      success: true,
      message: 'Data treatment karyawan berhasil diambil',
      data: treatment
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create treatment
export const createTreatment = async (req, res) => {
  try {
    const { karyawanId, nama, tipeLayanan, tanggal } = req.body;
    
    if (!karyawanId || !nama || !tipeLayanan || !tanggal) {
      return res.status(400).json({ success: false, message: 'Data tidak lengkap' });
    }
    
    const newTreatment = new Treatment(req.body);
    await newTreatment.save();
    
    res.status(201).json({
      success: true,
      message: 'Data treatment berhasil ditambahkan',
      data: newTreatment
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update treatment
export const updateTreatment = async (req, res) => {
  try {
    const treatment = await Treatment.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    
    if (!treatment) {
      return res.status(404).json({ success: false, message: 'Data treatment tidak ditemukan' });
    }
    
    res.json({
      success: true,
      message: 'Data treatment berhasil diperbarui',
      data: treatment
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete treatment
export const deleteTreatment = async (req, res) => {
  try {
    const treatment = await Treatment.findByIdAndDelete(req.params.id);
    
    if (!treatment) {
      return res.status(404).json({ success: false, message: 'Data treatment tidak ditemukan' });
    }
    
    res.json({
      success: true,
      message: 'Data treatment berhasil dihapus'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
