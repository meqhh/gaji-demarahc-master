import express from 'express';
import { getAllKaryawan, getKaryawanById, createKaryawan, updateKaryawan, deleteKaryawan, updateKaryawanProfile, getProfileOptions } from '../controllers/karyawanController.js';
import { auth, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/options/profile', auth, getProfileOptions); // Get dropdown options - MUST BE BEFORE /:id routes
router.get('/', auth, getAllKaryawan);
router.put('/profile/:id', auth, updateKaryawanProfile); // New endpoint for karyawan to update their own profile - MUST BE BEFORE /:id
router.get('/:id', auth, getKaryawanById);
router.post('/', auth, adminOnly, createKaryawan);
router.put('/:id', auth, adminOnly, updateKaryawan);
router.delete('/:id', auth, adminOnly, deleteKaryawan);

export default router;
