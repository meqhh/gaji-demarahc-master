import mongoose from 'mongoose';

const slipGajiSchema = new mongoose.Schema({
  karyawanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Karyawan',
    required: true
  },
  gajiId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gaji',
    required: true
  },
  nama: {
    type: String,
    required: true
  },
  periode: {
    type: String,
    required: true
  },
  nip: String,
  posisi: String,
  departemen: String,
  gajiPokok: Number,
  tunjangan: Number,
  bonus: Number,
  totalPenghasilan: Number,
  potonganAsuransi: Number,
  potonganTax: Number,
  totalPotongan: Number,
  gajiNetto: Number,
  tanggalGajian: Date,
  tanda_tangan_admin: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export default mongoose.model('SlipGaji', slipGajiSchema);
