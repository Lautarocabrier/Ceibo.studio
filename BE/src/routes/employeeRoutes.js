import { Router } from 'express';
import { employeeController } from '../controllers/employeeController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Todas las rutas de administración requieren autenticación
router.use(authenticate);

// Colaboradores
router.get('/', employeeController.getEmployeesByLocation);
router.get('/:id/profile', employeeController.getEmployeeProfile);
router.post('/', employeeController.createEmployee);
router.patch('/:id', employeeController.updateEmployee);

// Auditoría de Feedbacks por el Manager
router.get('/audit/feedbacks', employeeController.getFeedbacks);
router.post('/audit/feedbacks/:id/review', employeeController.reviewFeedback);

// Módulo CRM de clientes captados
router.get('/crm/customers', employeeController.getCustomers);

export default router;
