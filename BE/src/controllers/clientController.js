import { clientService } from '../services/clientService.js';

export const clientController = {
  async list(req, res, next) {
    try {
      const { status = 'active', search = '' } = req.query;
      const result = await clientService.getClients({ status, search });
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const result = await clientService.createClient(req.body);
      return res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const result = await clientService.getClientById(id);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const result = await clientService.updateClientStatus(id, status);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async createUser(req, res, next) {
    try {
      const result = await clientService.createUser(req.params.id, req.body);
      return res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  async deleteUser(req, res, next) {
    try {
      const result = await clientService.deleteUser(req.params.id, req.params.userId);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const result = await clientService.updateClient(req.params.id, req.body);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      const result = await clientService.deleteClient(req.params.id);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};
