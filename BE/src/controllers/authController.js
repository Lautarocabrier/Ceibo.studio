import { authService } from '../services/authService.js';

export const authController = {
  async login(req, res, next) {
    try {
      const result = await authService.login(req.body);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async me(req, res, next) {
    try {
      const result = await authService.getCurrentUser(req.user.id);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};
