import pool from './mysql.js';

// Users Database Operations
const usersDB = {
  getAll: async () => {
    try {
      const conn = await pool.getConnection();
      const [rows] = await conn.query('SELECT * FROM users');
      conn.release();
      return rows;
    } catch (err) {
      console.error('Error in usersDB.getAll:', err);
      return [];
    }
  },

  findOne: async (query) => {
    try {
      const conn = await pool.getConnection();
      let sql = 'SELECT * FROM users WHERE 1=1';
      const values = [];
      
      for (const [key, value] of Object.entries(query)) {
        sql += ` AND ${key} = ?`;
        values.push(value);
      }
      
      const [rows] = await conn.query(sql, values);
      conn.release();
      return rows[0] || null;
    } catch (err) {
      console.error('Error in usersDB.findOne:', err);
      return null;
    }
  },

  findById: async (id) => {
    try {
      const conn = await pool.getConnection();
      const [rows] = await conn.query('SELECT * FROM users WHERE id = ?', [id]);
      conn.release();
      return rows[0] || null;
    } catch (err) {
      console.error('Error in usersDB.findById:', err);
      return null;
    }
  },

  save: async (user) => {
    try {
      const conn = await pool.getConnection();
      
      if (user.id) {
        // Update existing
        const fields = Object.keys(user).filter(k => k !== 'id' && k !== 'created_at');
        const values = fields.map(k => user[k]);
        values.push(user.id);
        
        const setClause = fields.map(f => `${f} = ?`).join(', ');
        await conn.query(`UPDATE users SET ${setClause} WHERE id = ?`, values);
      } else {
        // Create new - exclude created_at (use SQL DEFAULT)
        const keys = Object.keys(user).filter(k => k !== 'created_at');
        const placeholders = keys.map(() => '?').join(', ');
        const values = keys.map(k => user[k]);
        
        const [result] = await conn.query(
          `INSERT INTO users (${keys.join(', ')}) VALUES (${placeholders})`,
          values
        );
        user.id = result.insertId;
      }
      
      conn.release();
      return user;
    } catch (err) {
      console.error('Error in usersDB.save:', err);
      throw err;
    }
  },

  delete: async (id) => {
    try {
      const conn = await pool.getConnection();
      await conn.query('DELETE FROM users WHERE id = ?', [id]);
      conn.release();
    } catch (err) {
      console.error('Error in usersDB.delete:', err);
    }
  }
};

// Karyawan Database Operations
const karyawanDB = {
  getAll: async () => {
    try {
      const conn = await pool.getConnection();
      const [rows] = await conn.query('SELECT * FROM karyawan');
      conn.release();
      return rows;
    } catch (err) {
      console.error('Error in karyawanDB.getAll:', err);
      return [];
    }
  },

  findOne: async (query) => {
    try {
      const conn = await pool.getConnection();
      let sql = 'SELECT * FROM karyawan WHERE 1=1';
      const values = [];
      
      for (const [key, value] of Object.entries(query)) {
        sql += ` AND ${key} = ?`;
        values.push(value);
      }
      
      const [rows] = await conn.query(sql, values);
      conn.release();
      return rows[0] || null;
    } catch (err) {
      console.error('Error in karyawanDB.findOne:', err);
      return null;
    }
  },

  findById: async (id) => {
    try {
      const conn = await pool.getConnection();
      const [rows] = await conn.query('SELECT * FROM karyawan WHERE id = ?', [id]);
      conn.release();
      return rows[0] || null;
    } catch (err) {
      console.error('Error in karyawanDB.findById:', err);
      return null;
    }
  },

  save: async (karyawan) => {
    try {
      const conn = await pool.getConnection();
      
      if (karyawan.id) {
        // Update existing
        const fields = Object.keys(karyawan).filter(k => k !== 'id');
        const values = fields.map(k => karyawan[k]);
        values.push(karyawan.id);
        
        const setClause = fields.map(f => `${f} = ?`).join(', ');
        await conn.query(`UPDATE karyawan SET ${setClause} WHERE id = ?`, values);
      } else {
        // Create new - exclude created_at (use SQL DEFAULT)
        const keys = Object.keys(karyawan).filter(k => k !== 'created_at');
        const placeholders = keys.map(() => '?').join(', ');
        const values = keys.map(k => karyawan[k]);
        
        const [result] = await conn.query(
          `INSERT INTO karyawan (${keys.join(', ')}) VALUES (${placeholders})`,
          values
        );
        karyawan.id = result.insertId;
      }
      
      conn.release();
      return karyawan;
    } catch (err) {
      console.error('Error in karyawanDB.save:', err);
      throw err;
    }
  },

  delete: async (id) => {
    try {
      const conn = await pool.getConnection();
      await conn.query('DELETE FROM karyawan WHERE id = ?', [id]);
      conn.release();
    } catch (err) {
      console.error('Error in karyawanDB.delete:', err);
    }
  }
};

// Slip Gaji Database Operations
const slipGajiDB = {
  getAll: async () => {
    try {
      const conn = await pool.getConnection();
      const [rows] = await conn.query('SELECT * FROM slip_gaji');
      conn.release();
      return rows;
    } catch (err) {
      console.error('Error in slipGajiDB.getAll:', err);
      return [];
    }
  },

  findById: async (id) => {
    try {
      const conn = await pool.getConnection();
      const [rows] = await conn.query('SELECT * FROM slip_gaji WHERE id = ?', [id]);
      conn.release();
      return rows[0] || null;
    } catch (err) {
      console.error('Error in slipGajiDB.findById:', err);
      return null;
    }
  },

  findByKaryawanAndMonth: async (karyawanId, bulan, tahun) => {
    try {
      const conn = await pool.getConnection();
      const [rows] = await conn.query(
        'SELECT * FROM slip_gaji WHERE karyawan_id = ? AND bulan = ? AND tahun = ?',
        [karyawanId, bulan, tahun]
      );
      conn.release();
      return rows[0] || null;
    } catch (err) {
      console.error('Error in slipGajiDB.findByKaryawanAndMonth:', err);
      return null;
    }
  },

  save: async (slipGaji) => {
    try {
      const conn = await pool.getConnection();
      
      const keys = Object.keys(slipGaji).filter(k => k !== 'created_at');
      const placeholders = keys.map(() => '?').join(', ');
      const values = keys.map(k => slipGaji[k]);
      
      const [result] = await conn.query(
        `INSERT INTO slip_gaji (${keys.join(', ')}) VALUES (${placeholders})`,
        values
      );
      slipGaji.id = result.insertId;
      
      conn.release();
      return slipGaji;
    } catch (err) {
      console.error('Error in slipGajiDB.save:', err);
      throw err;
    }
  }
};

// Cuti Database Operations
const cutiDB = {
  getAll: async () => {
    try {
      const conn = await pool.getConnection();
      const [rows] = await conn.query('SELECT * FROM cuti');
      conn.release();
      return rows;
    } catch (err) {
      console.error('Error in cutiDB.getAll:', err);
      return [];
    }
  },

  findById: async (id) => {
    try {
      const conn = await pool.getConnection();
      const [rows] = await conn.query('SELECT * FROM cuti WHERE id = ?', [id]);
      conn.release();
      return rows[0] || null;
    } catch (err) {
      console.error('Error in cutiDB.findById:', err);
      return null;
    }
  },

  save: async (cuti) => {
    try {
      const conn = await pool.getConnection();
      cuti.created_at = new Date();
      
      if (cuti.id) {
        const fields = Object.keys(cuti).filter(k => k !== 'id');
        const values = fields.map(k => cuti[k]);
        values.push(cuti.id);
        
        const setClause = fields.map(f => `${f} = ?`).join(', ');
        await conn.query(`UPDATE cuti SET ${setClause} WHERE id = ?`, values);
      } else {
        const keys = Object.keys(cuti).filter(k => k !== 'created_at');
        const placeholders = keys.map(() => '?').join(', ');
        const values = keys.map(k => cuti[k]);
        
        const [result] = await conn.query(
          `INSERT INTO cuti (${keys.join(', ')}) VALUES (${placeholders})`,
          values
        );
        cuti.id = result.insertId;
      }
      
      conn.release();
      return cuti;
    } catch (err) {
      console.error('Error in cutiDB.save:', err);
      throw err;
    }
  }
};

// Absensi Database Operations
const absensiDB = {
  getAll: async () => {
    try {
      const conn = await pool.getConnection();
      const [rows] = await conn.query('SELECT * FROM absensi');
      conn.release();
      return rows;
    } catch (err) {
      console.error('Error in absensiDB.getAll:', err);
      return [];
    }
  },

  findById: async (id) => {
    try {
      const conn = await pool.getConnection();
      const [rows] = await conn.query('SELECT * FROM absensi WHERE id = ?', [id]);
      conn.release();
      return rows[0] || null;
    } catch (err) {
      console.error('Error in absensiDB.findById:', err);
      return null;
    }
  },

  save: async (absensi) => {
    try {
      const conn = await pool.getConnection();
      absensi.created_at = new Date();
      
      if (absensi.id) {
        const fields = Object.keys(absensi).filter(k => k !== 'id');
        const values = fields.map(k => absensi[k]);
        values.push(absensi.id);
        
        const setClause = fields.map(f => `${f} = ?`).join(', ');
        await conn.query(`UPDATE absensi SET ${setClause} WHERE id = ?`, values);
      } else {
        const keys = Object.keys(absensi).filter(k => k !== 'created_at');
        const placeholders = keys.map(() => '?').join(', ');
        const values = keys.map(k => absensi[k]);
        
        const [result] = await conn.query(
          `INSERT INTO absensi (${keys.join(', ')}) VALUES (${placeholders})`,
          values
        );
        absensi.id = result.insertId;
      }
      
      conn.release();
      return absensi;
    } catch (err) {
      console.error('Error in absensiDB.save:', err);
      throw err;
    }
  }
};

// Gaji Database Operations
const gajiDB = {
  getAll: async () => {
    try {
      const conn = await pool.getConnection();
      const [rows] = await conn.query('SELECT * FROM gaji');
      conn.release();
      return rows;
    } catch (err) {
      console.error('Error in gajiDB.getAll:', err);
      return [];
    }
  },

  findById: async (id) => {
    try {
      const conn = await pool.getConnection();
      const [rows] = await conn.query('SELECT * FROM gaji WHERE id = ?', [id]);
      conn.release();
      return rows[0] || null;
    } catch (err) {
      console.error('Error in gajiDB.findById:', err);
      return null;
    }
  },

  save: async (gaji) => {
    try {
      const conn = await pool.getConnection();
      gaji.created_at = new Date();
      
      if (gaji.id) {
        const fields = Object.keys(gaji).filter(k => k !== 'id');
        const values = fields.map(k => gaji[k]);
        values.push(gaji.id);
        
        const setClause = fields.map(f => `${f} = ?`).join(', ');
        await conn.query(`UPDATE gaji SET ${setClause} WHERE id = ?`, values);
      } else {
        const keys = Object.keys(gaji).filter(k => k !== 'created_at');
        const placeholders = keys.map(() => '?').join(', ');
        const values = keys.map(k => gaji[k]);
        
        const [result] = await conn.query(
          `INSERT INTO gaji (${keys.join(', ')}) VALUES (${placeholders})`,
          values
        );
        gaji.id = result.insertId;
      }
      
      conn.release();
      return gaji;
    } catch (err) {
      console.error('Error in gajiDB.save:', err);
      throw err;
    }
  }
};

// Treatment Database Operations
const treatmentDB = {
  getAll: async () => {
    try {
      const conn = await pool.getConnection();
      const [rows] = await conn.query('SELECT * FROM treatment');
      conn.release();
      return rows;
    } catch (err) {
      console.error('Error in treatmentDB.getAll:', err);
      return [];
    }
  },

  findById: async (id) => {
    try {
      const conn = await pool.getConnection();
      const [rows] = await conn.query('SELECT * FROM treatment WHERE id = ?', [id]);
      conn.release();
      return rows[0] || null;
    } catch (err) {
      console.error('Error in treatmentDB.findById:', err);
      return null;
    }
  },

  save: async (treatment) => {
    try {
      const conn = await pool.getConnection();
      treatment.created_at = new Date();
      
      if (treatment.id) {
        const fields = Object.keys(treatment).filter(k => k !== 'id');
        const values = fields.map(k => treatment[k]);
        values.push(treatment.id);
        
        const setClause = fields.map(f => `${f} = ?`).join(', ');
        await conn.query(`UPDATE treatment SET ${setClause} WHERE id = ?`, values);
      } else {
        const keys = Object.keys(treatment).filter(k => k !== 'created_at');
        const placeholders = keys.map(() => '?').join(', ');
        const values = keys.map(k => treatment[k]);
        
        const [result] = await conn.query(
          `INSERT INTO treatment (${keys.join(', ')}) VALUES (${placeholders})`,
          values
        );
        treatment.id = result.insertId;
      }
      
      conn.release();
      return treatment;
    } catch (err) {
      console.error('Error in treatmentDB.save:', err);
      throw err;
    }
  }
};

export { usersDB, karyawanDB, slipGajiDB, cutiDB, absensiDB, gajiDB, treatmentDB };
export default { usersDB, karyawanDB, slipGajiDB, cutiDB, absensiDB, gajiDB, treatmentDB };
