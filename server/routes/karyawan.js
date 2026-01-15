import express from 'express';
import { getAllKaryawan, getKaryawanById, createKaryawan, updateKaryawan, deleteKaryawan } from '../controllers/karyawanController.js';
import { auth, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, getAllKaryawan);
router.get('/:id', auth, getKaryawanById);
router.post('/', auth, adminOnly, createKaryawan);
router.put('/:id', auth, adminOnly, updateKaryawan);
router.delete('/:id', auth, adminOnly, deleteKaryawan);

export default router;
