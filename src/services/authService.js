// API Base URL - change this based on environment
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5555/api';

// Derive a friendly server URL for error messages (strip trailing /api or slashes)
function getServerUrl() {
  const raw = process.env.REACT_APP_API_URL || 'http://localhost:5555/api';
  let base = String(raw).replace(/\/+$/, '');
  base = base.replace(/\/api$/i, '');
  return base;
}

// Helper: parse response safely
async function parseResponse(response) {
  let data = null;
  try {
    data = await response.json();
  } catch (e) {
    // response not JSON or empty
    data = null;
  }

  if (!response.ok) {
    const message = (data && data.message) || response.statusText || 'Request failed';
    throw new Error(message);
  }

  return data;
}

function networkErrorToMessage(error) {
  const serverUrl = getServerUrl();
  if (!error) return 'Gagal terhubung ke server';
  if (error instanceof TypeError) return `Tidak dapat terhubung ke server. Pastikan backend menyala di ${serverUrl}`;
  if (typeof error.message === 'string' && error.message.includes('Failed to fetch')) return `Tidak dapat terhubung ke server. Pastikan backend menyala di ${serverUrl}`;
  return error.message || 'Terjadi kesalahan pada jaringan';
}

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

    return await parseResponse(response);
  } catch (error) {
    throw new Error(networkErrorToMessage(error));
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
        role: userData.role || 'karyawan',
        ...(userData.adminKey ? { adminKey: userData.adminKey } : {})
      })
    });

    return await parseResponse(response);
  } catch (error) {
    throw new Error(networkErrorToMessage(error) || 'Gagal mendaftar ke server');
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

    return await parseResponse(response);
  } catch (error) {
    throw new Error(networkErrorToMessage(error) || 'Gagal mengambil data user');
  }
};

// Update user profile dengan token
export const updateUserProfile = async (token, profileData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(profileData)
    });

    return await parseResponse(response);
  } catch (error) {
    throw new Error(networkErrorToMessage(error) || 'Gagal memperbarui profil');
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

    return await parseResponse(response);
  } catch (error) {
    throw new Error(networkErrorToMessage(error) || 'Gagal mengambil data karyawan');
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

    return await parseResponse(response);
  } catch (error) {
    throw new Error(networkErrorToMessage(error) || 'Gagal mengambil data karyawan');
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

    return await parseResponse(response);
  } catch (error) {
    throw new Error(networkErrorToMessage(error) || 'Gagal membuat data karyawan');
  }
};

// Update karyawan (admin only)
export const updateKaryawan = async (token, karyawanId, karyawanData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/karyawan/${karyawanId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(karyawanData)
    });

    return await parseResponse(response);
  } catch (error) {
    throw new Error(networkErrorToMessage(error) || 'Gagal memperbarui data karyawan');
  }
};

// Update karyawan profile (karyawan can update their own profile)
export const updateKaryawanProfile = async (token, karyawanId, karyawanData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/karyawan/profile/${karyawanId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(karyawanData)
    });

    return await parseResponse(response);
  } catch (error) {
    throw new Error(networkErrorToMessage(error) || 'Gagal memperbarui profil karyawan');
  }
};

// Delete karyawan (admin only)
export const deleteKaryawan = async (token, karyawanId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/karyawan/${karyawanId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    return await parseResponse(response);
  } catch (error) {
    throw new Error(networkErrorToMessage(error) || 'Gagal menghapus data karyawan');
  }
};

// Get profile dropdown options
export const getProfileOptions = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/karyawan/options/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    return await parseResponse(response);
  } catch (error) {
    throw new Error(networkErrorToMessage(error) || 'Gagal mengambil opsi dropdown');
  }
};

// Generic resource helpers for gaji, absensi, cuti, treatment, slip-gaji
const makeResourceHelpers = (resourcePath) => ({
  create: async (token, data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${resourcePath}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      return await parseResponse(response);
    } catch (error) {
      throw new Error(networkErrorToMessage(error) || `Gagal membuat data ${resourcePath}`);
    }
  },
  update: async (token, id, data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${resourcePath}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      return await parseResponse(response);
    } catch (error) {
      throw new Error(networkErrorToMessage(error) || `Gagal memperbarui data ${resourcePath}`);
    }
  },
  delete: async (token, id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${resourcePath}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      return await parseResponse(response);
    } catch (error) {
      throw new Error(networkErrorToMessage(error) || `Gagal menghapus data ${resourcePath}`);
    }
  }
});

export const gajiApi = makeResourceHelpers('gaji');
export const absensiApi = makeResourceHelpers('absensi');
export const cutiApi = makeResourceHelpers('cuti');
export const treatmentApi = makeResourceHelpers('treatment');
export const slipGajiApi = makeResourceHelpers('slip-gaji');

const authService = {
  loginUser,
  registerUser,
  getCurrentUser,
  updateUserProfile,
  getKaryawanList,
  getKaryawanById,
  createKaryawan,
  updateKaryawan,
  updateKaryawanProfile,
  deleteKaryawan,
  getProfileOptions
};

export default authService;
