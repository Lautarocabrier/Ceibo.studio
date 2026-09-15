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
    const name = (data.name || data.businessName || data.nombreNegocio || '').trim();

    const hasCredentials = Boolean(email || contactName || password);
    if (hasCredentials) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        const error = new Error('El formato del correo electrónico es inválido');
        error.statusCode = 400;
        throw error;
      }
      if (!contactName) {
        const error = new Error('El nombre del encargado es obligatorio cuando se crea un acceso');
        error.statusCode = 400;
        throw error;
      }
      if (password.length < 6) {
        const error = new Error('La contraseña asignada debe tener al menos 6 caracteres');
        error.statusCode = 400;
        throw error;
      }
    }
    if (!name) {
      const error = new Error('El nombre del negocio es obligatorio');
      error.statusCode = 400;
      throw error;
    }

    // Verificar si el email ya existe en Client o User
    const existingClient = email ? await prisma.client.findUnique({ where: { email } }) : null;
    if (existingClient) {
      const error = new Error('Ya existe un cliente registrado con ese correo electrónico');
      error.statusCode = 409;
      throw error;
    }

    const existingUser = email ? await prisma.user.findUnique({ where: { email } }) : null;
    if (existingUser) {
      const error = new Error('Ya existe un usuario con ese correo electrónico');
      error.statusCode = 409;
      throw error;
    }

    const result = await prisma.$transaction(async (tx) => {
      const client = await tx.client.create({
        data: {
          name,
          ...(email ? { email } : {}),
          ...(phone ? { phone } : {}),
          ...(contactName ? { contactName } : {}),
          status: 'active',
        },
      });
      if (!hasCredentials) return { client, user: null };
      const passwordHash = await bcrypt.hash(password, 10);
      const user = await tx.user.create({ data: { email, passwordHash, name: contactName, role: 'CUSTOMER', clientId: client.id }, select: { id: true, email: true, name: true, role: true, createdAt: true } });
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

  async createUser(clientId, data) {
    const email = (data.email || data.mail || '').trim().toLowerCase();
    const password = data.password || data.contraseña || '';
    const name = (data.name || data.nombre || email.split('@')[0]).trim();
    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client) {
      const error = new Error('Negocio no encontrado');
      error.statusCode = 404;
      throw error;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      const error = new Error('Ingresá un email válido');
      error.statusCode = 400;
      throw error;
    }
    if (password.length < 6) {
      const error = new Error('La contraseña debe tener al menos 6 caracteres');
      error.statusCode = 400;
      throw error;
    }
    if (await prisma.user.findUnique({ where: { email } })) {
      const error = new Error('Ya existe un usuario con ese correo electrónico');
      error.statusCode = 409;
      throw error;
    }
    const user = await prisma.user.create({
      data: { email, passwordHash: await bcrypt.hash(password, 10), name, role: 'CUSTOMER', clientId },
      select: { id: true, email: true, name: true, role: true, clientId: true, createdAt: true },
    });
    return { success: true, user };
  },

  async deleteUser(clientId, userId) {
    const user = await prisma.user.findFirst({ where: { id: userId, clientId, role: 'CUSTOMER' } });
    if (!user) {
      const error = new Error('Administrador no encontrado');
      error.statusCode = 404;
      throw error;
    }
    await prisma.user.delete({ where: { id: userId } });
    return { success: true, message: 'Administrador eliminado' };
  },
};
