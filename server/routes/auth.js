import express from 'express';
import { register, login, getCurrentUser, getAllUsers, updateUser } from '../controllers/authController.js';
import { auth, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, getCurrentUser);
router.get('/users', auth, adminOnly, getAllUsers);
router.put('/profile', auth, updateUser);

export default router;
