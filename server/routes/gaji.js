import express from 'express';
import { getAllGaji, getGajiByKaryawan, createGaji, updateGaji, deleteGaji } from '../controllers/gajiController.js';
import { auth, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, getAllGaji);
router.get('/karyawan/:karyawanId', auth, getGajiByKaryawan);
router.post('/', auth, adminOnly, createGaji);
router.put('/:id', auth, adminOnly, updateGaji);
router.delete('/:id', auth, adminOnly, deleteGaji);

export default router;
