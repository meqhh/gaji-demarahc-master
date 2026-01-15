import express from 'express';
import { getAllTreatment, getTreatmentByKaryawan, createTreatment, updateTreatment, deleteTreatment } from '../controllers/treatmentController.js';
import { auth, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, getAllTreatment);
router.get('/karyawan/:karyawanId', auth, getTreatmentByKaryawan);
router.post('/', auth, adminOnly, createTreatment);
router.put('/:id', auth, adminOnly, updateTreatment);
router.delete('/:id', auth, adminOnly, deleteTreatment);

export default router;
