import express from 'express';
import { getAllAbsensi, getAbsensiByKaryawan, createAbsensi, updateAbsensi, deleteAbsensi } from '../controllers/absensiController.js';
import { auth, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, getAllAbsensi);
router.get('/karyawan/:karyawanId', auth, getAbsensiByKaryawan);
router.post('/', auth, adminOnly, createAbsensi);
router.put('/:id', auth, adminOnly, updateAbsensi);
router.delete('/:id', auth, adminOnly, deleteAbsensi);

export default router;
