// API Base URL - change this based on environment
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Login dengan backend API
export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    return data;
  } catch (error) {
    throw new Error(error.message || 'Gagal login ke server');
  }
};

// Register user dengan backend API
export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nama: userData.nama,
        email: userData.email,
        password: userData.password,
        role: 'karyawan'
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    return data;
  } catch (error) {
    throw new Error(error.message || 'Gagal mendaftar ke server');
  }
};

// Get current user dengan token
export const getCurrentUser = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch current user');
    }

    return data;
  } catch (error) {
    throw new Error(error.message || 'Gagal mengambil data user');
  }
};

// Get all karyawan dari backend
export const getKaryawanList = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/karyawan`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch karyawan');
    }

    return data;
  } catch (error) {
    throw new Error(error.message || 'Gagal mengambil data karyawan');
  }
};

// Get karyawan by ID
export const getKaryawanById = async (token, karyawanId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/karyawan/${karyawanId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch karyawan');
    }

    return data;
  } catch (error) {
    throw new Error(error.message || 'Gagal mengambil data karyawan');
  }
};

// Create karyawan (admin only)
export const createKaryawan = async (token, karyawanData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/karyawan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(karyawanData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create karyawan');
    }

    return data;
  } catch (error) {
    throw new Error(error.message || 'Gagal membuat data karyawan');
  }
};

export default {
  loginUser,
  registerUser,
  getCurrentUser,
  getKaryawanList,
  getKaryawanById,
  createKaryawan
};
