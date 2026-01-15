import express from 'express';
import { getAllCuti, getCutiById, getCutiByKaryawan, createCuti, updateCutiStatus, deleteCuti } from '../controllers/cutiController.js';
import { auth, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, getAllCuti);
router.get('/:id', auth, getCutiById);
router.get('/karyawan/:karyawanId', auth, getCutiByKaryawan);
router.post('/', auth, createCuti);
router.put('/:id', auth, adminOnly, updateCutiStatus);
router.delete('/:id', auth, adminOnly, deleteCuti);

export default router;
