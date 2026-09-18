import prisma from '../config/prisma.js';

export const employeeService = {
  /**
   * Obtiene todos los colaboradores de una sucursal con métricas consolidadas.
   */
  async getEmployeesByLocation(locationId) {
    if (!locationId) {
      const error = new Error('locationId es requerido');
      error.statusCode = 400;
      throw error;
    }

    const location = await prisma.location.findUnique({
      where: { id: locationId },
      include: {
        qrCodes: { where: { status: 'active' } },
        organization: { select: { id: true, name: true } },
      },
    });

    const employees = await prisma.employee.findMany({
      where: { locationId },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            feedbacks: true,
            recognitions: true,
          },
        },
        ledgerEntries: {
          where: { status: 'confirmed' },
          select: { amount: true },
        },
      },
    });

    return {
      success: true,
      location,
      employees: employees.map((emp) => {
        const totalPoints = emp.ledgerEntries.reduce((acc, curr) => acc + curr.amount, 0);
        return {
          id: emp.id,
          name: emp.name,
          email: emp.email,
          phone: emp.phone,
          position: emp.position,
          avatarUrl: emp.avatarUrl,
          status: emp.status,
          totalPoints,
          feedbackCount: emp._count.feedbacks,
          recognitionCount: emp._count.recognitions,
          createdAt: emp.createdAt,
        };
      }),
    };
  },

  /**
   * Obtiene el perfil completo de un colaborador con evidencia y reconocimientos.
   */
  async getEmployeeProfile(employeeId) {
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        location: {
          select: { id: true, name: true, organizationId: true },
        },
        recognitions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        ledgerEntries: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!employee) {
      const error = new Error('Colaborador no encontrado');
      error.statusCode = 404;
      throw error;
    }

    const confirmedPoints = employee.ledgerEntries
      .filter((e) => e.status === 'confirmed')
      .reduce((acc, curr) => acc + curr.amount, 0);

    const pendingPoints = employee.ledgerEntries
      .filter((e) => e.status === 'pending')
      .reduce((acc, curr) => acc + curr.amount, 0);

    return {
      success: true,
      employee: {
        id: employee.id,
        name: employee.name,
        position: employee.position,
        avatarUrl: employee.avatarUrl,
        status: employee.status,
        location: employee.location,
        points: {
          confirmed: confirmedPoints,
          pending: pendingPoints,
        },
        recentRecognitions: employee.recognitions,
        recentLedger: employee.ledgerEntries,
      },
    };
  },

  /**
   * Da de alta un nuevo colaborador en una sucursal.
   */
  async createEmployee(locationId, data) {
    const name = (data.name || '').trim();
    const position = (data.position || 'Colaborador').trim();
    const email = (data.email || '').trim().toLowerCase() || null;
    const phone = (data.phone || '').trim() || null;
    const avatarUrl = data.avatarUrl || null;

    if (!name) {
      const error = new Error('El nombre del colaborador es obligatorio');
      error.statusCode = 400;
      throw error;
    }

    const employee = await prisma.employee.create({
      data: {
        locationId,
        name,
        position,
        email,
        phone,
        avatarUrl,
        status: 'active',
      },
    });

    return {
      success: true,
      employee,
    };
  },

  /**
   * Actualiza los datos o estado de un colaborador.
   */
  async updateEmployee(employeeId, data) {
    const existing = await prisma.employee.findUnique({ where: { id: employeeId } });
    if (!existing) {
      const error = new Error('Colaborador no encontrado');
      error.statusCode = 404;
      throw error;
    }

    const updated = await prisma.employee.update({
      where: { id: employeeId },
      data: {
        ...(data.name ? { name: data.name.trim() } : {}),
        ...(data.position ? { position: data.position.trim() } : {}),
        ...(data.status ? { status: data.status } : {}),
        ...(data.avatarUrl !== undefined ? { avatarUrl: data.avatarUrl } : {}),
      },
    });

    return {
      success: true,
      employee: updated,
    };
  },
};
