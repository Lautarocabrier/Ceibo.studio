import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import prisma from '../config/prisma.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Acceso no autorizado: Token no proporcionado',
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Acceso no autorizado: Token malformado',
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.secret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'El token de sesión ha expirado',
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Token de sesión inválido',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        organizationId: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado o sesión revocada',
      });
    }

    req.user = {
      ...user,
      clientId: user.organizationId,
    };
    next();
  } catch (error) {
    next(error);
  }
};
