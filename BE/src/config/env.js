import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Asegurar carga de .env desde la raíz de BE
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET || 'ceibo_superadmin_default_secret_key_2026',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  superadmin: {
    email: (process.env.SUPERADMIN_EMAIL || 'admin@ceibo.studio').toLowerCase().trim(),
    password: process.env.SUPERADMIN_PASSWORD || 'Admin123!',
    name: process.env.SUPERADMIN_NAME || 'Super Admin Ceibo',
  },
};
