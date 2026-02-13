import { usersDB } from '../database/fileDb.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Register
export const register = async (req, res) => {
  try {
    const { nama, email, password, role, adminKey } = req.body;
    
    if (!nama || !email || !password) {
      return res.status(400).json({ success: false, message: 'Data tidak lengkap' });
    }
    
    // Check if email already exists
    const existingUser = usersDB.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email sudah terdaftar' });
    }
    
    // If attempting to register as admin, require admin registration key.
    // Allow a fallback: if ADMIN_REGISTER_KEY is not set and no admin exists yet,
    // permit creation of the first admin (useful for fresh clones/development machines).
    if (role && role.toString().toLowerCase() === 'admin') {
      const requiredKey = process.env.ADMIN_REGISTER_KEY;
      const allUsers = usersDB.getAll();
      const anyAdminExists = allUsers.some(u => u.role && u.role.toString().toLowerCase() === 'admin');

      if (!requiredKey) {
        if (!anyAdminExists) {
          console.warn('⚠️ ADMIN_REGISTER_KEY not set — allowing first admin registration without key');
          // allow creation of first admin
        } else {
          return res.status(500).json({ success: false, message: 'Server not configured for admin registration' });
        }
      } else {
        if (!adminKey || adminKey !== requiredKey) {
          return res.status(403).json({ success: false, message: 'Kunci registrasi admin tidak valid' });
        }
      }
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
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
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
    
    // Ensure JWT secret is set
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ success: false, message: 'Server configuration error: JWT_SECRET not set' });
    }

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
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
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
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
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
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Update user profile (including admin profile fields)
export const updateUser = async (req, res) => {
  try {
    const { nama, email, telepon, alamat, biografi, departemen } = req.body;
    
    const user = usersDB.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }
    
    // Update basic info
    if (nama) user.nama = nama;
    if (email) user.email = email;
    
    // Update profile fields (if provided, null/empty string is valid)
    if (telepon !== undefined) user.telepon = telepon || null;
    if (alamat !== undefined) user.alamat = alamat || null;
    if (biografi !== undefined) user.biografi = biografi || null;
    if (departemen !== undefined) {
      const validDepartements = ['HR', 'Keuangan', 'IT', 'Operasional', 'Admin', 'Kesehatan', 'Pendidikan', 'Lainnya'];
      user.departemen = validDepartements.includes(departemen) ? departemen : null;
    }
    
    user.updatedAt = new Date().toISOString();
    usersDB.save(user);
    
    const { password, ...userWithoutPassword } = user;
    res.json({
      success: true,
      message: 'Profil berhasil diperbarui',
      data: userWithoutPassword
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export default {
  register,
  login,
  getCurrentUser,
  getAllUsers,
  updateUser
};
