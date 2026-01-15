import express from 'express';
import { getAllSlipGaji, getSlipGajiByKaryawan, createSlipGaji, updateSlipGaji, deleteSlipGaji } from '../controllers/slipGajiController.js';
import { auth, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, getAllSlipGaji);
router.get('/karyawan/:karyawanId', auth, getSlipGajiByKaryawan);
router.post('/', auth, adminOnly, createSlipGaji);
router.put('/:id', auth, adminOnly, updateSlipGaji);
router.delete('/:id', auth, adminOnly, deleteSlipGaji);

export default router;
