import { usersDB } from '../database/fileDb.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Register
export const register = async (req, res) => {
  try {
    const { nama, email, password, role } = req.body;
    
    if (!nama || !email || !password) {
      return res.status(400).json({ success: false, message: 'Data tidak lengkap' });
    }
    
    // Check if email already exists
    const existingUser = usersDB.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email sudah terdaftar' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const newUser = {
      id: `USR${Date.now()}`,
      nama,
      email,
      password: hashedPassword,
      role: role || 'karyawan',
      createdAt: new Date().toISOString(),
      lastLogin: null
    };
    
    usersDB.save(newUser);
    
    res.status(201).json({
      success: true,
      message: 'User berhasil terdaftar'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email dan password harus diisi' });
    }
    
    const user = usersDB.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Email atau password salah' });
    }
    
    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Email atau password salah' });
    }
    
    // Update last login
    user.lastLogin = new Date().toISOString();
    usersDB.save(user);
    
    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, nama: user.nama },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      message: 'Login berhasil',
      data: {
        token,
        user: {
          id: user.id,
          nama: user.nama,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get current user
export const getCurrentUser = async (req, res) => {
  try {
    const user = usersDB.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }
    
    const { password, ...userWithoutPassword } = user;
    res.json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all users (admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = usersDB.getAll();
    const usersWithoutPassword = users.map(u => {
      const { password, ...user } = u;
      return user;
    });
    
    res.json({
      success: true,
      message: 'Data user berhasil diambil',
      data: usersWithoutPassword
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const { nama, email } = req.body;
    
    const user = usersDB.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }
    
    if (nama) user.nama = nama;
    if (email) user.email = email;
    user.updatedAt = new Date().toISOString();
    
    usersDB.save(user);
    
    const { password, ...userWithoutPassword } = user;
    res.json({
      success: true,
      message: 'User berhasil diperbarui',
      data: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export default {
  register,
  login,
  getCurrentUser,
  getAllUsers,
  updateUser
};
