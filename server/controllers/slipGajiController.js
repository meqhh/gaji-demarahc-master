import SlipGaji from '../models/SlipGaji.js';
import Gaji from '../models/Gaji.js';

// Get all slip gaji
export const getAllSlipGaji = async (req, res) => {
  try {
    const slip = await SlipGaji.find().populate('karyawanId').populate('gajiId').sort({ createdAt: -1 });
    res.json({
      success: true,
      message: 'Data slip gaji berhasil diambil',
      data: slip
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get slip gaji by karyawan
export const getSlipGajiByKaryawan = async (req, res) => {
  try {
    const slip = await SlipGaji.find({ karyawanId: req.params.karyawanId }).sort({ createdAt: -1 });
    res.json({
      success: true,
      message: 'Data slip gaji karyawan berhasil diambil',
      data: slip
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create slip gaji from gaji data
export const createSlipGaji = async (req, res) => {
  try {
    const { gajiId, karyawanId, nama, periode } = req.body;
    
    if (!gajiId || !karyawanId || !nama || !periode) {
      return res.status(400).json({ success: false, message: 'Data tidak lengkap' });
    }
    
    // Ambil data gaji
    const gajiData = await Gaji.findById(gajiId);
    if (!gajiData) {
      return res.status(404).json({ success: false, message: 'Data gaji tidak ditemukan' });
    }
    
    const newSlip = new SlipGaji({
      ...req.body,
      gajiPokok: gajiData.gajiPokok,
      tunjangan: gajiData.tunjangan,
      bonus: gajiData.bonus,
      totalPenghasilan: gajiData.gajiKotor,
      potonganAsuransi: gajiData.potonganAsuransi,
      potonganTax: gajiData.potonganTax,
      totalPotongan: gajiData.potonganAsuransi + gajiData.potonganTax,
      gajiNetto: gajiData.gajiNetto,
      tanggalGajian: new Date()
    });
    
    await newSlip.save();
    
    res.status(201).json({
      success: true,
      message: 'Slip gaji berhasil dibuat',
      data: newSlip
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update slip gaji
export const updateSlipGaji = async (req, res) => {
  try {
    const slip = await SlipGaji.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!slip) {
      return res.status(404).json({ success: false, message: 'Slip gaji tidak ditemukan' });
    }
    
    res.json({
      success: true,
      message: 'Slip gaji berhasil diperbarui',
      data: slip
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete slip gaji
export const deleteSlipGaji = async (req, res) => {
  try {
    const slip = await SlipGaji.findByIdAndDelete(req.params.id);
    
    if (!slip) {
      return res.status(404).json({ success: false, message: 'Slip gaji tidak ditemukan' });
    }
    
    res.json({
      success: true,
      message: 'Slip gaji berhasil dihapus'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
