// Script de prueba y verificación de la API de Ceibo Backend
import http from 'http';

const BASE_URL = 'http://localhost:5000';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const fetchOptions = {
    method: options.method || 'GET',
    headers,
  };

  if (options.body) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  const res = await fetch(url, fetchOptions);
  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data };
}

async function runTests() {
  console.log('🧪 Iniciando pruebas de endpoints...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message, details = '') {
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${message} - ${details}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const health = await request('/health');
    assert(health.status === 200 && health.data.status === 'ok', 'GET /health responde 200 OK');

    // 2. Login con credenciales inválidas
    const invalidLogin = await request('/login', {
      method: 'POST',
      body: { email: 'admin@ceibo.studio', password: 'wrongpassword' },
    });
    assert(invalidLogin.status === 401 && invalidLogin.data.success === false, 'POST /login con contraseña incorrecta retorna 401');

    // 3. Login exitoso de Super Admin
    const superAdminLogin = await request('/login', {
      method: 'POST',
      body: { email: 'admin@ceibo.studio', password: 'Admin123!' },
    });
    assert(
      superAdminLogin.status === 200 &&
      superAdminLogin.data.success === true &&
      superAdminLogin.data.redirectTo === '/superadmin' &&
      !!superAdminLogin.data.token,
      'POST /login con Super Admin retorna 200, JWT y redirectTo: "/superadmin"'
    );

    const token = superAdminLogin.data?.token;

    // 4. GET /me con token de Super Admin
    const meRes = await request('/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert(meRes.status === 200 && meRes.data.user.role === 'SUPERADMIN', 'GET /me valida sesión del Super Admin');

    // 5. GET /clients sin token
    const unauthorizedClients = await request('/clients');
    assert(unauthorizedClients.status === 401, 'GET /clients sin token retorna 401');

    // 6. GET /clients con token Super Admin
    const clientsList = await request('/clients', {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert(clientsList.status === 200 && Array.isArray(clientsList.data.clients), 'GET /clients lista clientes activos correctamente');

    // 7. POST /clients con datos incompletos
    const badClient = await request('/clients', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { email: 'invalido' },
    });
    assert(badClient.status === 400, 'POST /clients valida campos obligatorios (retorna 400)');

    // 8. POST /clients con nuevo cliente
    const testEmail = `cafe_${Date.now()}@ceibo.studio`;
    const newClientRes = await request('/clients', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        name: 'Café de Especialidad San Telmo',
        email: testEmail,
        phone: '+54 11 4321-8765',
        contactName: 'Lucía Giménez',
        password: 'CafePassword2026!',
      },
    });

    assert(
      newClientRes.status === 201 &&
      newClientRes.data.success === true &&
      newClientRes.data.client.email === testEmail,
      'POST /clients crea nuevo cliente y usuario asociado (retorna 201)'
    );

    const createdClientId = newClientRes.data?.client?.id;

    // 9. Login con las credenciales del nuevo cliente
    const clientLogin = await request('/login', {
      method: 'POST',
      body: { email: testEmail, password: 'CafePassword2026!' },
    });
    assert(
      clientLogin.status === 200 &&
      clientLogin.data.user.role === 'CUSTOMER' &&
      clientLogin.data.redirectTo === '/customer',
      'POST /login con nuevo cliente retorna 200 y redirectTo: "/customer"'
    );

    // 10. El cliente no puede acceder al endpoint de superadmin /clients
    const clientToken = clientLogin.data?.token;
    const forbiddenClients = await request('/clients', {
      headers: { Authorization: `Bearer ${clientToken}` },
    });
    assert(forbiddenClients.status === 403, 'GET /clients bloquea a un usuario con rol CUSTOMER (retorna 403)');

    // 11. Cambiar estado de cliente a inactive
    if (createdClientId) {
      const toggleRes = await request(`/clients/${createdClientId}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: { status: 'inactive' },
      });
      assert(toggleRes.status === 200 && toggleRes.data.client.status === 'inactive', 'PATCH /clients/:id/status permite desactivar cliente');

      // 12. Login del cliente desactivado debe ser rechazado
      const inactiveLogin = await request('/login', {
        method: 'POST',
        body: { email: testEmail, password: 'CafePassword2026!' },
      });
      assert(inactiveLogin.status === 403, 'POST /login bloquea el acceso si la cuenta de cliente está inactiva (403)');

      // Reactivar cliente
      await request(`/clients/${createdClientId}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: { status: 'active' },
      });
    }

    console.log(`\n================================`);
    console.log(`Resumen de Pruebas: ${passed} Pasaron, ${failed} Fallaron.`);
    console.log(`================================\n`);

    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('Error durante las pruebas:', error);
    process.exit(1);
  }
}

runTests();
