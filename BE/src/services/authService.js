import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import prisma from '../config/prisma.js';

export const authService = {
  async login({ email, mail, password }) {
    const userEmail = (email || mail || '').trim().toLowerCase();

    if (!userEmail || !password) {
      const error = new Error('Email y contraseña son obligatorios');
      error.statusCode = 400;
      throw error;
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    });

    if (!user) {
      const error = new Error('Credenciales inválidas');
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      const error = new Error('Credenciales inválidas');
      error.statusCode = 401;
      throw error;
    }

    // Si es un cliente, verificar si la cuenta de cliente está activa
    if (user.role === 'CUSTOMER' && user.client && user.client.status !== 'active') {
      const error = new Error('La cuenta de cliente se encuentra inactiva o suspendida');
      error.statusCode = 403;
      throw error;
    }

    // Determinar ruta de redirección según el rol
    let redirectTo = '/customer';
    if (user.role === 'SUPERADMIN') {
      redirectTo = '/superadmin';
    }

    // Generar token JWT
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      clientId: user.clientId,
    };

    const token = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });

    return {
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        clientId: user.clientId,
        clientName: user.client?.name || null,
      },
      redirectTo,
    };
  },

  async getCurrentUser(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        clientId: true,
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
            status: true,
          },
        },
        createdAt: true,
      },
    });

    if (!user) {
      const error = new Error('Usuario no encontrado');
      error.statusCode = 404;
      throw error;
    }

    const redirectTo = user.role === 'SUPERADMIN' ? '/superadmin' : '/customer';

    return {
      success: true,
      user,
      redirectTo,
    };
  },
};
