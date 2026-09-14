import bcrypt from 'bcryptjs';
import prisma from '../config/prisma.js';

export const clientService = {
  async getClients({ status = 'active', search = '' }) {
    const where = {};

    // Si status es 'all', no filtramos por estado; de lo contrario filtramos por status (por defecto 'active')
    if (status && status !== 'all') {
      where.status = status;
    }

    if (search && search.trim() !== '') {
      const searchTerm = search.trim();
      where.OR = [
        { name: { contains: searchTerm } },
        { email: { contains: searchTerm } },
        { contactName: { contains: searchTerm } },
        { phone: { contains: searchTerm } },
      ];
    }

    const clients = await prisma.client.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
          },
        },
      },
    });

    return {
      success: true,
      count: clients.length,
      clients,
    };
  },

  async createClient(data) {
    const email = (data.email || data.mail || '').trim().toLowerCase();
    const phone = (data.phone || data.telefono || '').trim();
    const contactName = (data.contactName || data.encargado || data.nombreEncargado || '').trim();
    const password = data.password || data.contraseña || '';
    const name = (data.name || data.businessName || data.nombreNegocio || contactName).trim();

    // Validaciones
    if (!email) {
      const error = new Error('El correo electrónico (mail) es obligatorio');
      error.statusCode = 400;
      throw error;
    }

    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const error = new Error('El formato del correo electrónico es inválido');
      error.statusCode = 400;
      throw error;
    }

    if (!contactName) {
      const error = new Error('El nombre del encargado es obligatorio');
      error.statusCode = 400;
      throw error;
    }

    if (!password || password.length < 6) {
      const error = new Error('La contraseña asignada debe tener al menos 6 caracteres');
      error.statusCode = 400;
      throw error;
    }

    // Verificar si el email ya existe en Client o User
    const existingClient = await prisma.client.findUnique({ where: { email } });
    if (existingClient) {
      const error = new Error('Ya existe un cliente registrado con ese correo electrónico');
      error.statusCode = 409;
      throw error;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      const error = new Error('Ya existe un usuario con ese correo electrónico');
      error.statusCode = 409;
      throw error;
    }

    // Hashear contraseña asignada
    const passwordHash = await bcrypt.hash(password, 10);

    // Transacción: crear Cliente y Usuario asignado
    const result = await prisma.$transaction(async (tx) => {
      const client = await tx.client.create({
        data: {
          name: name || contactName,
          email,
          phone,
          contactName,
          status: 'active',
        },
      });

      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          name: contactName,
          role: 'CUSTOMER',
          clientId: client.id,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
      });

      return { client, user };
    });

    return {
      success: true,
      message: 'Cliente creado exitosamente',
      client: {
        ...result.client,
        assignedUser: result.user,
      },
    };
  },

  async getClientById(id) {
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
      },
    });

    if (!client) {
      const error = new Error('Cliente no encontrado');
      error.statusCode = 404;
      throw error;
    }

    return {
      success: true,
      client,
    };
  },

  async updateClientStatus(id, status) {
    if (!['active', 'inactive'].includes(status)) {
      const error = new Error('El estado debe ser "active" o "inactive"');
      error.statusCode = 400;
      throw error;
    }

    const existingClient = await prisma.client.findUnique({ where: { id } });
    if (!existingClient) {
      const error = new Error('Cliente no encontrado');
      error.statusCode = 404;
      throw error;
    }

    const updatedClient = await prisma.client.update({
      where: { id },
      data: { status },
    });

    return {
      success: true,
      message: `Cliente ${status === 'active' ? 'activado' : 'desactivado'} con éxito`,
      client: updatedClient,
    };
  },
};
