import app from './app.js';
import { config } from './config/env.js';
import { seedSuperAdmin } from './db/seed.js';

const PORT = config.port;

async function startServer() {
  try {
    // Inicializar / verificar existencia de usuario Super Admin
    await seedSuperAdmin();

    app.listen(PORT, () => {
      console.log('====================================================');
      console.log(`🚀 Ceibo Studio Backend corriendo en http://localhost:${PORT}`);
      console.log(`📡 Endpoints disponibles:`);
      console.log(`   - POST   /login           (o /api/auth/login)`);
      console.log(`   - GET    /me              (o /api/auth/me)`);
      console.log(`   - GET    /clients         (o /api/clients)`);
      console.log(`   - POST   /clients         (o /api/clients)`);
      console.log(`   - PATCH  /clients/:id/status (o /api/clients/:id/status)`);
      console.log(`   - GET    /health`);
      console.log('----------------------------------------------------');
      console.log(`🔑 Super Admin por defecto:`);
      console.log(`   Email:    ${config.superadmin.email}`);
      console.log(`   Password: ${config.superadmin.password}`);
      console.log('====================================================');
    });
  } catch (error) {
    console.error('❌ Error fatal al iniciar el servidor:', error);
    process.exit(1);
  }
}

startServer();
