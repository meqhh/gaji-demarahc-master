import fs from 'fs';
import path from 'path';

const examplePath = path.resolve(process.cwd(), '.env.example');
const targetPath = path.resolve(process.cwd(), '.env');

if (!fs.existsSync(examplePath)) {
  console.error('No .env.example found in project root. Cannot create .env automatically.');
  process.exit(1);
}

if (fs.existsSync(targetPath)) {
  console.log('.env already exists — no changes made.');
  process.exit(0);
}

fs.copyFileSync(examplePath, targetPath);
console.log('✅ Created .env from .env.example. Please edit .env and update sensitive values (e.g., JWT_SECRET) before running the server.');
