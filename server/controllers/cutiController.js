import { cutiDB } from '../database/mysqlDb.js';

const BATAS_CUTI = 12; // Jatah cuti tahunan (hari)

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

/**
 * Hitung kuota cuti karyawan berdasarkan riwayat cuti.
 * Pending ikut dihitung agar karyawan tidak bisa spam pengajuan.
 */
const hitungKuotaCuti = (riwayatCuti, excludeId = null) => {
  const rows = Array.isArray(riwayatCuti) ? riwayatCuti : [];
  const filtered = excludeId
    ? rows.filter(c => String(c.id) !== String(excludeId))
    : rows;

  const cutiDisetujui = filtered
    .filter(c => c.status === 'Disetujui')
    .reduce((sum, c) => sum + Number(c.lama || 0), 0);

  const cutiPending = filtered
    .filter(c => c.status === 'Pending')
    .reduce((sum, c) => sum + Number(c.lama || 0), 0);

  const cutiTerpakai = cutiDisetujui + cutiPending; // total terhitung (Disetujui + Pending)
  const sisaCuti = BATAS_CUTI - cutiTerpakai;

  return { totalJatah: BATAS_CUTI, cutiDisetujui, cutiPending, cutiTerpakai, sisaCuti };
};

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

// GET /api/cuti/kuota/:karyawanId — info kuota cuti karyawan secara real-time
export const getCutiKuota = async (req, res) => {
  try {
    const riwayat = await cutiDB.findByKaryawanId(req.params.karyawanId);
    const kuota = hitungKuotaCuti(riwayat);
    res.json({
      success: true,
      data: kuota
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
        message: 'Data tidak lengkap: karyawanId, nama, tanggal, lama, dan alasan wajib diisi'
      });
    }

    const lamaNum = Number(lama);
    if (isNaN(lamaNum) || lamaNum < 1) {
      return res.status(400).json({ success: false, message: 'Durasi cuti minimal 1 hari' });
    }

    // Ambil seluruh riwayat cuti karyawan
    const riwayatCuti = await cutiDB.findByKaryawanId(karyawanId);
    const kuota = hitungKuotaCuti(riwayatCuti);

    // Tidak boleh mengajukan jika sisa kuota efektif habis (sudah termasuk pending)
    if (kuota.sisaCuti <= 0) {
      return res.status(400).json({
        success: false,
        message: `Hak cuti Anda sudah habis. (${kuota.cutiDisetujui} hari disetujui, ${kuota.cutiPending} hari menunggu persetujuan dari total ${BATAS_CUTI} hari)`
      });
    }

    // Tidak boleh mengajukan melebihi sisa kuota efektif
    if (lamaNum > kuota.sisaCuti) {
      return res.status(400).json({
        success: false,
        message: `Durasi cuti melebihi sisa kuota. Sisa kuota Anda: ${kuota.sisaCuti} hari (${kuota.cutiDisetujui} hari disetujui + ${kuota.cutiPending} hari pending dari total ${BATAS_CUTI} hari)`
      });
    }

    const payloadToSave = {
      ...camelToSnake(req.body),
      karyawan_id: karyawanId,
      created_at: new Date()
    };
    
    // Pastikan tidak ada id atau _id (temp ID dari frontend) yang masuk ke DB
    // agar cutiDB.save mendeteksinya sebagai INSERT, bukan UPDATE.
    delete payloadToSave.id;
    delete payloadToSave._id;
    delete payloadToSave.local_temp;
    delete payloadToSave.karyawan_id_camel; // just in case

    const newCuti = await cutiDB.save(payloadToSave);

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

// Update cuti (karyawan bisa edit cuti yang masih Pending)
export const updateCuti = async (req, res) => {
  try {
    const cuti = await cutiDB.findById(req.params.id);
    console.log('cuticuti');

    if (!cuti) {
      return res.status(404).json({
        success: false,
        message: 'Pengajuan cuti tidak ditemukan'
      });
    }

    // Jika ada perubahan pada field `lama`, lakukan validasi kuota
    if (req.body.lama !== undefined) {
      const lamaBaruNum = Number(req.body.lama);
      if (isNaN(lamaBaruNum) || lamaBaruNum < 1) {
        return res.status(400).json({ success: false, message: 'Durasi cuti minimal 1 hari' });
      }

      // Gunakan karyawan_id dari record yang ada
      const karyawanId = cuti.karyawan_id || req.body.karyawanId;
      if (karyawanId) {
        const riwayatCuti = await cutiDB.findByKaryawanId(karyawanId);
        // Exclude record yang sedang diedit agar durasinya tidak terhitung ganda
        const kuota = hitungKuotaCuti(riwayatCuti, req.params.id);

        if (lamaBaruNum > kuota.sisaCuti) {
          return res.status(400).json({
            success: false,
            message: `Durasi cuti melebihi sisa kuota. Sisa kuota tersedia: ${kuota.sisaCuti} hari (tidak termasuk pengajuan ini)`
          });
        }
      }
    }

    // Strip client-only fields agar tidak bermasalah saat MySQL UPDATE
    // Hapus juga `updatedAt` dan `updated_at` jika ada (karena dari frontend bentuknya string ISO yang bikin MySQL error)
    // eslint-disable-next-line no-unused-vars
    const { id: _id, karyawanId: _kId, localTemp: _lt, updatedAt: _ua1, updated_at: _ua2, ...bodyToUpdate } = req.body;

    const updatedCuti = await cutiDB.save({
      ...cuti,
      ...camelToSnake(bodyToUpdate),
      id: req.params.id,       // selalu pakai ID dari URL param (INT)
      updated_at: new Date()   // biarkan driver mysql2 memformat native Date
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

// Update cuti status (admin only) — validasi kuota saat menyetujui
export const updateCutiStatus = async (req, res) => {
  try {
    const { status, rejectionReason, updatedBy } = req.body;
    
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status harus diisi' });
    }

    const validStatuses = ['Pending', 'Disetujui', 'Ditolak'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Status tidak valid. Pilih: ${validStatuses.join(', ')}` });
    }

    const existingCuti = await cutiDB.findById(req.params.id);
    if (!existingCuti) {
      return res.status(404).json({ success: false, message: 'Pengajuan cuti tidak ditemukan' });
    }

    // Saat admin menyetujui, validasi total cuti disetujui tidak melebihi jatah
    if (status === 'Disetujui' && existingCuti.status !== 'Disetujui') {
      const karyawanId = existingCuti.karyawan_id;
      if (karyawanId) {
        const riwayatCuti = await cutiDB.findByKaryawanId(karyawanId);
        // Hitung hanya yang sudah Disetujui (exclude pending, exclude record ini)
        const totalDisetujui = riwayatCuti
          .filter(c => c.status === 'Disetujui' && String(c.id) !== String(req.params.id))
          .reduce((sum, c) => sum + Number(c.lama || 0), 0);

        const lamaPengajuan = Number(existingCuti.lama || 0);
        if (totalDisetujui + lamaPengajuan > BATAS_CUTI) {
          return res.status(400).json({
            success: false,
            message: `Tidak dapat menyetujui: total cuti disetujui akan menjadi ${totalDisetujui + lamaPengajuan} hari, melebihi batas ${BATAS_CUTI} hari/tahun`
          });
        }
      }
    }
    
    const updateData = {
      status,
      updatedBy,
      updatedAt: new Date()
    };
    
    if (status === 'Ditolak' && rejectionReason) {
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
