import crypto from 'crypto';
import prisma from '../config/prisma.js';

export const qrService = {
  /**
   * Resuelve el token de un código QR público para la pantalla de feedback del comensal.
   */
  async resolveQrToken(token) {
    if (!token) {
      const error = new Error('Token de código QR no proporcionado');
      error.statusCode = 400;
      throw error;
    }

    const qrCode = await prisma.qRCode.findUnique({
      where: { token },
      include: {
        location: {
          include: {
            organization: {
              select: {
                id: true,
                name: true,
                status: true,
              },
            },
            employees: {
              where: { status: 'active' },
              select: {
                id: true,
                name: true,
                position: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (!qrCode || qrCode.status !== 'active') {
      const error = new Error('Código QR inválido o inactivo');
      error.statusCode = 404;
      throw error;
    }

    const { location } = qrCode;
    const { organization } = location;

    if (location.status !== 'active' || organization.status !== 'active') {
      const error = new Error('La sucursal se encuentra temporalmente inactiva');
      error.statusCode = 403;
      throw error;
    }

    // Obtener dimensiones activas para la organización
    const dimensions = await prisma.dimension.findMany({
      where: { organizationId: organization.id, active: true },
      select: {
        id: true,
        name: true,
        description: true,
        icon: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return {
      success: true,
      qr: {
        id: qrCode.id,
        token: qrCode.token,
        label: qrCode.label,
        type: qrCode.type,
      },
      organization: {
        id: organization.id,
        name: organization.name,
      },
      location: {
        id: location.id,
        name: location.name,
        address: location.address,
      },
      employees: location.employees,
      dimensions,
    };
  },

  /**
   * Genera un nuevo código QR para una sucursal.
   */
  async createQrCode(locationId, { label = 'Mesa', type = 'table' } = {}) {
    const token = `qr_${crypto.randomBytes(8).toString('hex')}`;

    const qr = await prisma.qRCode.create({
      data: {
        locationId,
        token,
        label,
        type,
        status: 'active',
      },
    });

    return {
      success: true,
      qr,
    };
  },
};
