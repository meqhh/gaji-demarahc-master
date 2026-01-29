#!/usr/bin/env node

/**
 * Start Script - Runs both frontend and backend
 * Usage: npm run start:all
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting Gaji Demara Application...\n');

// Start backend
console.log('📦 Starting Backend Server (port 5000)...');
const backend = spawn('node', ['server.js'], {
  cwd: path.join(__dirname, 'server'),
  stdio: 'inherit',
  shell: true
});

// Wait a bit for backend to start
setTimeout(() => {
  console.log('\n🎨 Starting Frontend (port 3000)...');
  const frontend = spawn('npm', ['start'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true
  });

  // Handle termination
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Shutting down...');
    backend.kill();
    frontend.kill();
    process.exit(0);
  });
}, 2000);

backend.on('error', (err) => {
  console.error('❌ Backend failed to start:', err.message);
  process.exit(1);
});
