import bcrypt from 'bcryptjs';
import { config } from '../config/env.js';
import prisma from '../config/prisma.js';

export async function seedSuperAdmin() {
  const email = config.superadmin.email;
  const password = config.superadmin.password;
  const name = config.superadmin.name;

  try {
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return existing;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const superadmin = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role: 'SUPERADMIN',
      },
    });

    console.log(`✅ Super Admin inicial creado: ${email}`);
    return superadmin;
  } catch (error) {
    console.error('❌ Error al inicializar Super Admin:', error);
    throw error;
  }
}

export async function seedDemoData() {
  try {
    // 1. Crear o buscar organización demo
    let org = await prisma.organization.findFirst({
      where: { name: 'Café Martínez Palermo' },
    });

    if (!org) {
      org = await prisma.organization.create({
        data: {
          name: 'Café Martínez Palermo',
          email: 'palermo@cafemartinez.demo',
          phone: '+54 11 4777-8899',
          contactName: 'Lucía Fernández',
          status: 'active',
          monthlyRewardBudget: 50000,
        },
      });
      console.log(`✅ Organización demo creada: ${org.name}`);
    }

    // 2. Crear sucursal demo
    let location = await prisma.location.findFirst({
      where: { organizationId: org.id, name: 'Palermo Soho' },
    });

    if (!location) {
      location = await prisma.location.create({
        data: {
          organizationId: org.id,
          name: 'Palermo Soho',
          address: 'Honduras 4850, CABA',
          phone: '+54 11 4777-8899',
          status: 'active',
        },
      });
      console.log(`✅ Sucursal demo creada: ${location.name}`);
    }

    // 3. Crear colaboradores demo
    const employeeNames = [
      { name: 'Martín Gómez', position: 'Camarero', email: 'martin@cafemartinez.demo' },
      { name: 'Sofía Rodríguez', position: 'Barista', email: 'sofia@cafemartinez.demo' },
    ];

    for (const emp of employeeNames) {
      const existingEmp = await prisma.employee.findFirst({
        where: { locationId: location.id, name: emp.name },
      });
      if (!existingEmp) {
        await prisma.employee.create({
          data: {
            locationId: location.id,
            name: emp.name,
            position: emp.position,
            email: emp.email,
            status: 'active',
          },
        });
        console.log(`✅ Empleado demo creado: ${emp.name}`);
      }
    }

    // 4. Crear dimensiones de desempeño
    const dimensions = [
      { name: 'Amabilidad', description: 'Trato cálido, atento y respetuoso', icon: 'smile' },
      { name: 'Rapidez', description: 'Servicio ágil y eficiente sin demoras', icon: 'zap' },
      { name: 'Resolución', description: 'Capacidad para responder dudas y resolver pedidos', icon: 'check-circle' },
    ];

    for (const dim of dimensions) {
      const existingDim = await prisma.dimension.findFirst({
        where: { organizationId: org.id, name: dim.name },
      });
      if (!existingDim) {
        await prisma.dimension.create({
          data: {
            organizationId: org.id,
            name: dim.name,
            description: dim.description,
            icon: dim.icon,
            active: true,
          },
        });
        console.log(`✅ Dimensión demo creada: ${dim.name}`);
      }
    }

    // 5. Crear QR Code demo
    const existingQr = await prisma.qRCode.findUnique({
      where: { token: 'qr_palermo_mesa_1' },
    });

    if (!existingQr) {
      await prisma.qRCode.create({
        data: {
          locationId: location.id,
          token: 'qr_palermo_mesa_1',
          label: 'Mesa 1',
          type: 'table',
          status: 'active',
        },
      });
      console.log(`✅ Código QR demo creado: qr_palermo_mesa_1 (Mesa 1)`);
    }

    // 6. Crear regla automática de puntos y reconocimiento
    const existingRule = await prisma.rule.findFirst({
      where: { organizationId: org.id, name: 'Reconocimiento 5 Estrellas' },
    });

    if (!existingRule) {
      await prisma.rule.create({
        data: {
          organizationId: org.id,
          name: 'Reconocimiento 5 Estrellas',
          eventType: 'feedback_received',
          minRating: 5,
          pointsToAward: 10,
          recognitionTitle: 'Customer Hero',
          isActive: true,
        },
      });
      console.log(`✅ Regla demo creada: Reconocimiento 5 Estrellas`);
    }

    return { org, location };
  } catch (error) {
    console.error('❌ Error al inicializar datos demo:', error);
    throw error;
  }
}

// Ejecutar directamente si se llama como script
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  (async () => {
    await seedSuperAdmin();
    await seedDemoData();
    await prisma.$disconnect();
    console.log('🎉 Seed finalizado con éxito');
    process.exit(0);
  })().catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
}
