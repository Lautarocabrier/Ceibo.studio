import prisma from '../config/prisma.js';

export const customerService = {
  /**
   * Registra o actualiza un cliente (lead) dentro de una organización.
   */
  async findOrCreateCustomer(organizationId, { email, phone, name, marketingOptIn = true }) {
    if (!organizationId) throw new Error('organizationId es requerido');
    if (!email && !phone) return null;

    const cleanEmail = email ? email.trim().toLowerCase() : null;
    const cleanPhone = phone ? phone.trim() : null;
    const cleanName = name ? name.trim() : null;

    // Si tiene email, buscamos por la clave compuesta (organizationId, email)
    if (cleanEmail) {
      const existing = await prisma.customer.findUnique({
        where: {
          organizationId_email: {
            organizationId,
            email: cleanEmail,
          },
        },
      });

      if (existing) {
        return await prisma.customer.update({
          where: { id: existing.id },
          data: {
            phone: cleanPhone || existing.phone,
            name: cleanName || existing.name,
            marketingOptIn: marketingOptIn ?? existing.marketingOptIn,
          },
        });
      }

      return await prisma.customer.create({
        data: {
          organizationId,
          email: cleanEmail,
          phone: cleanPhone,
          name: cleanName,
          marketingOptIn: Boolean(marketingOptIn),
        },
      });
    }

    // Si solo tiene teléfono
    const existingByPhone = await prisma.customer.findFirst({
      where: {
        organizationId,
        phone: cleanPhone,
      },
    });

    if (existingByPhone) {
      return await prisma.customer.update({
        where: { id: existingByPhone.id },
        data: {
          name: cleanName || existingByPhone.name,
          marketingOptIn: marketingOptIn ?? existingByPhone.marketingOptIn,
        },
      });
    }

    return await prisma.customer.create({
      data: {
        organizationId,
        email: null,
        phone: cleanPhone,
        name: cleanName,
        marketingOptIn: Boolean(marketingOptIn),
      },
    });
  },

  /**
   * Obtiene la lista de clientes captados para una organización (módulo CRM).
   */
  async getCustomersByOrganization(organizationId, { search = '', page = 1, limit = 50 } = {}) {
    if (!organizationId) {
      const error = new Error('organizationId es requerido');
      error.statusCode = 400;
      throw error;
    }

    const where = { organizationId };

    if (search && search.trim() !== '') {
      const query = search.trim();
      where.OR = [
        { email: { contains: query } },
        { phone: { contains: query } },
        { name: { contains: query } },
      ];
    }

    const safeLimit = Math.max(1, parseInt(limit, 10) || 50);
    const safePage = Math.max(1, parseInt(page, 10) || 1);
    const safeSkip = (safePage - 1) * safeLimit;

    const [total, customers] = await Promise.all([
      prisma.customer.count({ where }),
      prisma.customer.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: safeSkip,
        take: safeLimit,
        include: {
          _count: {
            select: { feedbacks: true },
          },
        },
      }),
    ]);

    return {
      success: true,
      total,
      page: safePage,
      limit: safeLimit,
      customers: customers.map((c) => ({
        id: c.id,
        email: c.email,
        phone: c.phone,
        name: c.name,
        marketingOptIn: c.marketingOptIn,
        feedbacksCount: c._count.feedbacks,
        createdAt: c.createdAt,
      })),
    };
  },
};
