import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../../src/app.js';
import { seedSuperAdmin } from '../../src/db/seed.js';

describe('Integration Tests: Endpoints de API', async () => {
  // Asegurar que el Super Admin esté creado en la base de datos
  await seedSuperAdmin();

  let superAdminToken = '';
  let createdClientId = '';
  const testClientEmail = `unit_test_${Date.now()}@ceibo.studio`;
  const testClientPassword = 'Password123!';

  it('GET /health debe retornar 200 y status ok', async () => {
    const res = await request(app).get('/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'ok');
  });

  describe('Autenticación (/login y /me)', () => {
    it('POST /login con contraseña errónea debe responder 401', async () => {
      const res = await request(app)
        .post('/login')
        .send({ email: 'admin@ceibo.studio', password: 'bad_password' });

      assert.equal(res.status, 401);
      assert.equal(res.body.success, false);
      assert.equal(res.body.message, 'Credenciales inválidas');
    });

    it('POST /login con Super Admin debe responder 200 y redirectTo /superadmin', async () => {
      const res = await request(app)
        .post('/login')
        .send({ email: 'admin@ceibo.studio', password: 'Admin123!' });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.user.role, 'SUPERADMIN');
      assert.equal(res.body.redirectTo, '/superadmin');
      assert.ok(res.body.token, 'Debe incluir un token JWT');

      superAdminToken = res.body.token;
    });

    it('GET /me con token válido debe devolver información del usuario', async () => {
      const res = await request(app)
        .get('/me')
        .set('Authorization', `Bearer ${superAdminToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.user.email, 'admin@ceibo.studio');
      assert.equal(res.body.user.role, 'SUPERADMIN');
    });
  });

  describe('Gestión de Clientes (/clients)', () => {
    it('GET /clients sin token debe responder 401 Unauthorized', async () => {
      const res = await request(app).get('/clients');
      assert.equal(res.status, 401);
      assert.equal(res.body.success, false);
    });

    it('GET /clients con token de Super Admin debe responder 200 y listar clientes', async () => {
      const res = await request(app)
        .get('/clients')
        .set('Authorization', `Bearer ${superAdminToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(Array.isArray(res.body.clients));
    });

    it('POST /clients debe crear un nuevo cliente y responder 201', async () => {
      const res = await request(app)
        .post('/clients')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          name: 'Café Test Unitario',
          email: testClientEmail,
          phone: '+54 11 1234-5678',
          contactName: 'Encargado Prueba',
          password: testClientPassword,
        });

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.equal(res.body.client.email, testClientEmail);
      assert.equal(res.body.client.contactName, 'Encargado Prueba');
      assert.equal(res.body.client.status, 'active');
      assert.equal(res.body.client.assignedUser.role, 'CUSTOMER');

      createdClientId = res.body.client.id;
    });

    it('POST /clients con correo duplicado debe responder 409 Conflict', async () => {
      const res = await request(app)
        .post('/clients')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          name: 'Otro Café',
          email: testClientEmail, // duplicado
          phone: '+54 11 9999-9999',
          contactName: 'Otro Encargado',
          password: 'Password123!',
        });

      assert.equal(res.status, 409);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /Ya existe un cliente registrado/);
    });

    it('POST /login con credenciales del nuevo cliente debe devolver redirectTo /customer', async () => {
      const res = await request(app)
        .post('/login')
        .send({ email: testClientEmail, password: testClientPassword });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.user.role, 'CUSTOMER');
      assert.equal(res.body.redirectTo, '/customer');

      const customerToken = res.body.token;

      // El usuario CUSTOMER NO puede acceder a las rutas de SUPERADMIN
      const forbiddenRes = await request(app)
        .get('/clients')
        .set('Authorization', `Bearer ${customerToken}`);

      assert.equal(forbiddenRes.status, 403);
      assert.match(forbiddenRes.body.message, /Acceso denegado/);
    });

    it('PATCH /clients/:id/status permite desactivar y bloquear el login del cliente', async () => {
      // 1. Desactivar cliente
      const patchRes = await request(app)
        .patch(`/clients/${createdClientId}/status`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ status: 'inactive' });

      assert.equal(patchRes.status, 200);
      assert.equal(patchRes.body.client.status, 'inactive');

      // 2. Intentar login con la cuenta inactiva
      const loginRes = await request(app)
        .post('/login')
        .send({ email: testClientEmail, password: testClientPassword });

      assert.equal(loginRes.status, 403);
      assert.match(loginRes.body.message, /inactiva/);
    });
  });
});
