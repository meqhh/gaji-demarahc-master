import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth.js';
import karyawanRoutes from './routes/karyawan.js';
import cutiRoutes from './routes/cuti.js';
import absensiRoutes from './routes/absensi.js';
import gajiRoutes from './routes/gaji.js';
import treatmentRoutes from './routes/treatment.js';
import slipGajiRoutes from './routes/slipGaji.js';

// Load environment variables
dotenv.config();

// Validate JWT secret
if (!process.env.JWT_SECRET) {
  console.error('❌ Missing JWT_SECRET environment variable. Create `server/.env` with `JWT_SECRET=your_jwt_secret` or set it in the environment.');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize file-based database
console.log('✓ File-based database initialized');

// Routes
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Gaji Demara API',
    version: '1.0.0',
    database: 'File-based JSON storage',
    endpoints: {
      auth: '/api/auth',
      karyawan: '/api/karyawan',
      cuti: '/api/cuti',
      absensi: '/api/absensi',
      gaji: '/api/gaji',
      treatment: '/api/treatment',
      slipGaji: '/api/slip-gaji'
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/karyawan', karyawanRoutes);
app.use('/api/cuti', cutiRoutes);
app.use('/api/absensi', absensiRoutes);
app.use('/api/gaji', gajiRoutes);
app.use('/api/treatment', treatmentRoutes);
app.use('/api/slip-gaji', slipGajiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
  console.log(`📚 API Documentation tersedia di http://localhost:${PORT}/api`);
  console.log(`🏥 Health check di http://localhost:${PORT}/api/health`);
});

export default app;
