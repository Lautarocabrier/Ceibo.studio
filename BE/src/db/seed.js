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
      console.log(`ℹ️  Usuario Super Admin ya existe: ${email}`);
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

    console.log(`✅ Super Admin inicial creado con éxito:`);
    console.log(`   - Email: ${email}`);
    console.log(`   - Password: ${password}`);
    console.log(`   - Rol: SUPERADMIN`);

    return superadmin;
  } catch (error) {
    console.error('❌ Error al inicializar Super Admin:', error);
    throw error;
  }
}

// Ejecutar directamente si se llama como script
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedSuperAdmin()
    .then(async () => {
      await prisma.$disconnect();
      process.exit(0);
    })
    .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
