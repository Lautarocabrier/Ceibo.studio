import bcrypt from 'bcryptjs';
import prisma from '../config/prisma.js';

export const clientService = {
  async getClients({ status = 'active', search = '' }) {
    const where = {};

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

    const organizations = await prisma.organization.findMany({
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
      count: organizations.length,
      clients: organizations,
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

    // Verificar si el email ya existe en Organization o User
    const existingOrg = email ? await prisma.organization.findUnique({ where: { email } }) : null;
    if (existingOrg) {
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
      const organization = await tx.organization.create({
        data: {
          name,
          ...(email ? { email } : {}),
          ...(phone ? { phone } : {}),
          ...(contactName ? { contactName } : {}),
          status: 'active',
        },
      });

      if (!hasCredentials) return { organization, user: null };

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          name: contactName,
          role: 'CUSTOMER',
          organizationId: organization.id,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          organizationId: true,
        },
      });

      // Crear membresía como OWNER en OrganizationMember
      await tx.organizationMember.create({
        data: {
          organizationId: organization.id,
          userId: user.id,
          role: 'OWNER',
          status: 'active',
        },
      });

      return { organization, user };
    });

    return {
      success: true,
      message: 'Cliente creado exitosamente',
      client: {
        ...result.organization,
        assignedUser: result.user ? {
          ...result.user,
          clientId: result.user.organizationId,
        } : null,
      },
    };
  },

  async getClientById(id) {
    const organization = await prisma.organization.findUnique({
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
        locations: true,
      },
    });

    if (!organization) {
      const error = new Error('Cliente no encontrado');
      error.statusCode = 404;
      throw error;
    }

    return {
      success: true,
      client: organization,
    };
  },

  async updateClientStatus(id, status) {
    if (!['active', 'inactive'].includes(status)) {
      const error = new Error('El estado debe ser "active" o "inactive"');
      error.statusCode = 400;
      throw error;
    }

    const existingOrg = await prisma.organization.findUnique({ where: { id } });
    if (!existingOrg) {
      const error = new Error('Cliente no encontrado');
      error.statusCode = 404;
      throw error;
    }

    const updatedOrg = await prisma.organization.update({
      where: { id },
      data: { status },
    });

    return {
      success: true,
      message: `Cliente ${status === 'active' ? 'activado' : 'desactivado'} con éxito`,
      client: updatedOrg,
    };
  },

  async createUser(clientId, data) {
    const email = (data.email || data.mail || '').trim().toLowerCase();
    const password = data.password || data.contraseña || '';
    const name = (data.name || data.nombre || email.split('@')[0]).trim();

    const organization = await prisma.organization.findUnique({ where: { id: clientId } });
    if (!organization) {
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

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role: 'CUSTOMER',
        organizationId: clientId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        organizationId: true,
        createdAt: true,
      },
    });

    await prisma.organizationMember.create({
      data: {
        organizationId: clientId,
        userId: user.id,
        role: 'MANAGER',
        status: 'active',
      },
    });

    return {
      success: true,
      user: {
        ...user,
        clientId: user.organizationId,
      },
    };
  },

  async deleteUser(clientId, userId) {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        organizationId: clientId,
        role: 'CUSTOMER',
      },
    });

    if (!user) {
      const error = new Error('Administrador no encontrado');
      error.statusCode = 404;
      throw error;
    }

    await prisma.user.delete({ where: { id: userId } });
    return { success: true, message: 'Administrador eliminado' };
  },

  async updateClient(id, data) {
    const existing = await prisma.organization.findUnique({ where: { id } });
    if (!existing) {
      const error = new Error('Cliente no encontrado');
      error.statusCode = 404;
      throw error;
    }

    const updated = await prisma.organization.update({
      where: { id },
      data: {
        ...(data.name ? { name: data.name.trim() } : {}),
        ...(data.phone !== undefined ? { phone: data.phone?.trim() || null } : {}),
        ...(data.contactName !== undefined ? { contactName: data.contactName?.trim() || null } : {}),
        ...(data.status ? { status: data.status } : {}),
      },
    });

    return { success: true, message: 'Cliente actualizado con éxito', client: updated };
  },

  async deleteClient(id) {
    const existing = await prisma.organization.findUnique({ where: { id } });
    if (!existing) {
      const error = new Error('Cliente no encontrado');
      error.statusCode = 404;
      throw error;
    }

    await prisma.organization.delete({ where: { id } });
    return { success: true, message: 'Cliente eliminado con éxito' };
  },
};
