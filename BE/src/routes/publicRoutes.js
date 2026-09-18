import { Router } from 'express';
import { publicController } from '../controllers/publicController.js';

const router = Router();

// GET /api/public/qr/:token -> Resuelve datos de la sucursal, comensal y colaboradores
router.get('/qr/:token', publicController.getQrDetails);

// POST /api/public/feedback -> Envío de feedback de comensal con control anti-abuso
router.post('/feedback', publicController.submitFeedback);

export default router;
