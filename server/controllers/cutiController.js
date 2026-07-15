import { cutiDB } from '../database/mysqlDb.js';

const snakeToCamel = (obj) =>
  Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key.replace(/_([a-z])/g, (_, c) => c.toUpperCase()),
      value
    ])
  );

const camelToSnake = (obj) =>
  Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key.replace(/([A-Z])/g, '_$1').toLowerCase(),
      value
    ])
  );

// Get all cuti
export const getAllCuti = async (req, res) => {
  try {
    const cuti = await cutiDB.getAll();
    res.json({
      success: true,
      message: 'Data cuti berhasil diambil',
      data: cuti.map(snakeToCamel)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get cuti by ID
export const getCutiById = async (req, res) => {
  try {
    const cuti = await cutiDB.findById(req.params.id);
    if (!cuti) {
      return res.status(404).json({ success: false, message: 'Pengajuan cuti tidak ditemukan' });
    }
    res.json({ success: true, data: snakeToCamel(cuti) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get cuti by karyawan
export const getCutiByKaryawan = async (req, res) => {
  try {
    const cuti = await cutiDB.findByKaryawanId(req.params.karyawanId);
    res.json({
      success: true,
      message: 'Data cuti karyawan berhasil diambil',
      data: cuti.map(snakeToCamel)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create cuti
export const createCuti = async (req, res) => {
  try {
    const { karyawanId, nama, tanggal, lama, alasan } = req.body;
    console.log("BODY:", req.body);

    if (!karyawanId || !nama || !tanggal || !lama || !alasan) {
      return res.status(400).json({
        success: false,
        message: 'Data tidak lengkap'
      });
    }

    const batasCuti = 12;

    // Validasi maksimal pengajuan sekali input
    if (Number(lama) > batasCuti) {
      return res.status(400).json({
        success: false,
        message: `Pengajuan cuti melebihi batas maksimal ${batasCuti} hari`
      });
    }

    // Ambil seluruh riwayat cuti karyawan
    const riwayatCuti = await cutiDB.findByKaryawanId(karyawanId);

    // Hitung total cuti yang sudah disetujui
    const totalCutiTerpakai = riwayatCuti
      .filter(cuti => cuti.status === 'Disetujui')
      .reduce((total, cuti) => total + Number(cuti.lama), 0);

    // Hitung sisa cuti
    const sisaCuti = batasCuti - totalCutiTerpakai;

    // Tidak boleh mengajukan jika sisa cuti habis
    if (sisaCuti <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Hak cuti Anda sudah habis.'
      });
    }

    // Tidak boleh mengajukan melebihi sisa cuti
    if (Number(lama) > sisaCuti) {
      return res.status(400).json({
        success: false,
        message: `Sisa cuti Anda hanya ${sisaCuti} hari.`
      });
    }

    const newCuti = await cutiDB.save({
      ...camelToSnake(req.body),
      karyawan_id: karyawanId,
      created_at: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Pengajuan cuti berhasil dibuat',
      data: snakeToCamel(newCuti)
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
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

    const existingCuti = await cutiDB.findById(req.params.id);
    if (!existingCuti) {
      return res.status(404).json({ success: false, message: 'Pengajuan cuti tidak ditemukan' });
    }
    
    const updateData = {
      status,
      updatedBy,
      updatedAt: new Date()
    };
    
    if (status === 'Ditolak') {
      updateData.rejectionReason = rejectionReason;
    }
    
    const cuti = await cutiDB.save({
      ...existingCuti,
      ...camelToSnake(updateData),
      id: req.params.id
    });
    
    res.json({
      success: true,
      message: `Pengajuan cuti berhasil diubah menjadi ${status}`,
      data: snakeToCamel(cuti)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete cuti
export const deleteCuti = async (req, res) => {
  try {
    const cuti = await cutiDB.findById(req.params.id);
    
    if (!cuti) {
      return res.status(404).json({ success: false, message: 'Pengajuan cuti tidak ditemukan' });
    }

    await cutiDB.delete(req.params.id);
    
    res.json({
      success: true,
      message: 'Pengajuan cuti berhasil dihapus'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update cuti
export const updateCuti = async (req, res) => {
  try {
    const cuti = await cutiDB.findById(req.params.id);

    if (!cuti) {
      return res.status(404).json({
        success: false,
        message: 'Pengajuan cuti tidak ditemukan'
      });
    }

    const updatedCuti = await cutiDB.save({
      ...cuti,
      ...camelToSnake(req.body),
      id: req.params.id
    });

    res.json({
      success: true,
      message: 'Pengajuan cuti berhasil diperbarui',
      data: snakeToCamel(updatedCuti)
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
