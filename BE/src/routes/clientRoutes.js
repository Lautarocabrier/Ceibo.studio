import { Router } from 'express';
import { clientController } from '../controllers/clientController.js';
import { authenticate } from '../middleware/auth.js';
import { requireSuperAdmin } from '../middleware/role.js';

const router = Router();

// Todas las rutas de gestión de clientes requieren autenticación y rol SUPERADMIN
router.use(authenticate, requireSuperAdmin);

// Listar clientes activos (o filtrados por status/search)
router.get('/', clientController.list);

// Crear nuevo cliente (mail, teléfono, nombre de encargado, password)
router.post('/', clientController.create);

// Obtener detalle de cliente por ID
router.get('/:id', clientController.getById);

// Actualizar estado de cliente (active / inactive)
router.patch('/:id/status', clientController.updateStatus);

export default router;
