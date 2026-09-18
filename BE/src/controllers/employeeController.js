import prisma from '../config/prisma.js';
import { employeeService } from '../services/employeeService.js';
import { feedbackService } from '../services/feedbackService.js';
import { customerService } from '../services/customerService.js';

export const employeeController = {
  async getEmployeesByLocation(req, res, next) {
    try {
      const { locationId } = req.query;
      const isSuperAdmin = req.user.role === 'SUPERADMIN';
      const userOrgId = isSuperAdmin
        ? (req.query.organizationId || null)
        : (req.user.organizationId || req.user.clientId);

      let targetLocationId = locationId;
      if (!targetLocationId && userOrgId) {
        const defaultLoc = await prisma.location.findFirst({
          where: { organizationId: userOrgId },
          select: { id: true },
        });
        if (defaultLoc) targetLocationId = defaultLoc.id;
      }

      if (!targetLocationId) {
        const error = new Error('locationId es requerido');
        error.statusCode = 400;
        throw error;
      }

      if (!isSuperAdmin) {
        const location = await prisma.location.findUnique({
          where: { id: targetLocationId },
          select: { organizationId: true },
        });

        if (!location) {
          const error = new Error('Sucursal no encontrada');
          error.statusCode = 404;
          throw error;
        }

        if (location.organizationId !== userOrgId) {
          const error = new Error('Acceso no autorizado a esta sucursal');
          error.statusCode = 403;
          throw error;
        }
      }

      const result = await employeeService.getEmployeesByLocation(targetLocationId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getEmployeeProfile(req, res, next) {
    try {
      const { id } = req.params;
      const result = await employeeService.getEmployeeProfile(id);

      const isSuperAdmin = req.user.role === 'SUPERADMIN';
      const userOrgId = isSuperAdmin
        ? (req.query.organizationId || null)
        : (req.user.organizationId || req.user.clientId);

      if (!isSuperAdmin && result.employee.location.organizationId !== userOrgId) {
        const error = new Error('Acceso no autorizado a este colaborador');
        error.statusCode = 403;
        throw error;
      }

      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async createEmployee(req, res, next) {
    try {
      const { locationId, ...data } = req.body;
      const isSuperAdmin = req.user.role === 'SUPERADMIN';
      const userOrgId = isSuperAdmin
        ? (req.body.organizationId || req.query.organizationId || null)
        : (req.user.organizationId || req.user.clientId);

      let targetLocationId = locationId;
      if (!targetLocationId && userOrgId) {
        const defaultLoc = await prisma.location.findFirst({
          where: { organizationId: userOrgId },
          select: { id: true },
        });
        if (defaultLoc) targetLocationId = defaultLoc.id;
      }

      if (!targetLocationId) {
        const error = new Error('locationId es requerido');
        error.statusCode = 400;
        throw error;
      }

      if (!isSuperAdmin) {
        const location = await prisma.location.findUnique({
          where: { id: targetLocationId },
          select: { organizationId: true },
        });

        if (!location) {
          const error = new Error('Sucursal no encontrada');
          error.statusCode = 404;
          throw error;
        }

        if (location.organizationId !== userOrgId) {
          const error = new Error('Acceso no autorizado a esta sucursal');
          error.statusCode = 403;
          throw error;
        }
      }

      const result = await employeeService.createEmployee(targetLocationId, data);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  async updateEmployee(req, res, next) {
    try {
      const { id } = req.params;

      const isSuperAdmin = req.user.role === 'SUPERADMIN';
      const userOrgId = isSuperAdmin
        ? (req.body.organizationId || req.query.organizationId || null)
        : (req.user.organizationId || req.user.clientId);

      if (!isSuperAdmin) {
        const employee = await prisma.employee.findUnique({
          where: { id },
          include: { location: { select: { organizationId: true } } },
        });

        if (!employee) {
          const error = new Error('Colaborador no encontrado');
          error.statusCode = 404;
          throw error;
        }

        if (employee.location.organizationId !== userOrgId) {
          const error = new Error('Acceso no autorizado a este colaborador');
          error.statusCode = 403;
          throw error;
        }
      }

      const result = await employeeService.updateEmployee(id, req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getFeedbacks(req, res, next) {
    try {
      const isSuperAdmin = req.user.role === 'SUPERADMIN';
      const organizationId = isSuperAdmin
        ? (req.query.organizationId || null)
        : (req.user.organizationId || req.user.clientId);

      const result = await feedbackService.getFeedbacks(organizationId, req.query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async reviewFeedback(req, res, next) {
    try {
      const { id } = req.params;
      const { action } = req.body;

      const isSuperAdmin = req.user.role === 'SUPERADMIN';
      const userOrgId = isSuperAdmin
        ? (req.body.organizationId || req.query.organizationId || null)
        : (req.user.organizationId || req.user.clientId);

      if (!isSuperAdmin) {
        const feedback = await prisma.feedback.findUnique({
          where: { id },
          select: { organizationId: true },
        });

        if (!feedback) {
          const error = new Error('Feedback no encontrado');
          error.statusCode = 404;
          throw error;
        }

        if (feedback.organizationId !== userOrgId) {
          const error = new Error('Acceso no autorizado a este feedback');
          error.statusCode = 403;
          throw error;
        }
      }

      const result = await feedbackService.reviewFlaggedFeedback(id, {
        action,
        managerUserId: req.user.id,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getCustomers(req, res, next) {
    try {
      const isSuperAdmin = req.user.role === 'SUPERADMIN';
      const organizationId = isSuperAdmin
        ? (req.query.organizationId || null)
        : (req.user.organizationId || req.user.clientId);

      if (!organizationId) {
        const error = new Error('organizationId es requerido para consultar la lista de clientes');
        error.statusCode = 400;
        throw error;
      }

      const result = await customerService.getCustomersByOrganization(organizationId, req.query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
};
