import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Endpoint de login (recibe mail y password)
router.post('/login', authController.login);

// Endpoint para verificar sesión actual
router.get('/me', authenticate, authController.me);

export default router;
