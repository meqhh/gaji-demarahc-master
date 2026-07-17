import express from 'express';
import { getAllCuti, getCutiById, getCutiByKaryawan, getCutiKuota, createCuti, updateCuti, updateCutiStatus, deleteCuti } from '../controllers/cutiController.js';
import { auth, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, getAllCuti);
// IMPORTANT: route /kuota/:karyawanId harus SEBELUM /:id agar tidak tertangkap sebagai ID
router.get('/kuota/:karyawanId', auth, getCutiKuota);
router.get('/karyawan/:karyawanId', auth, getCutiByKaryawan);
router.get('/:id', auth, getCutiById);
router.post('/', auth, createCuti);
router.put('/:id', auth, updateCuti);
router.put('/:id/status', auth, adminOnly, updateCutiStatus);
router.delete('/:id', auth, adminOnly, deleteCuti);

export default router;
