import { usersDB } from '../database/fileDb.js';

export const getPublicKaryawan = (req, res) => {
  try {
    const users = usersDB.getAll();
    const karyawans = users
      .filter(u => u && u.role && String(u.role).toLowerCase() === 'karyawan')
      .map(u => {
        const { password, ...safe } = u;
        return safe;
      });

    res.json({ success: true, message: 'Public karyawan list', data: karyawans });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export default { getPublicKaryawan };