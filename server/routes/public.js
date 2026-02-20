import express from 'express';
import { getPublicKaryawan } from '../controllers/publicController.js';

const router = express.Router();

// Public endpoints
router.get('/karyawan', getPublicKaryawan);

export default router;
