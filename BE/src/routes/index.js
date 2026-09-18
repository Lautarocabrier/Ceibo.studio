import { Router } from 'express';
import authRoutes from './authRoutes.js';
import clientRoutes from './clientRoutes.js';
import publicRoutes from './publicRoutes.js';
import employeeRoutes from './employeeRoutes.js';
import { authController } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Rutas con prefijo estándar /api
router.use('/api/auth', authRoutes);
router.use('/api/clients', clientRoutes);
router.use('/api/public', publicRoutes);
router.use('/api/employees', employeeRoutes);

// Alias directos en la raíz para facilitar la integración con el Frontend
router.post('/login', authController.login);
router.get('/me', authenticate, authController.me);
router.use('/clients', clientRoutes);
router.use('/public', publicRoutes);
router.use('/employees', employeeRoutes);

export default router;
