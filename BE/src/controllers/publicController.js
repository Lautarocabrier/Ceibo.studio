import { qrService } from '../services/qrService.js';
import { feedbackService } from '../services/feedbackService.js';

export const publicController = {
  async getQrDetails(req, res, next) {
    try {
      const { token } = req.params;
      const result = await qrService.resolveQrToken(token);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async submitFeedback(req, res, next) {
    try {
      const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
      const result = await feedbackService.submitFeedback({
        ...req.body,
        ip: clientIp,
      });

      const statusCode = result.success ? 201 : 409;
      res.status(statusCode).json(result);
    } catch (error) {
      next(error);
    }
  },
};
