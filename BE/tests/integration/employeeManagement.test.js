import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../../src/app.js';
import { seedSuperAdmin, seedDemoData } from '../../src/db/seed.js';

describe('Integration Tests: Gestión de Empleados, CRM y Auditoría de Manager', async () => {
  await seedSuperAdmin();
  const { org, location } = await seedDemoData();

  let authToken = '';

  // Iniciar sesión con SuperAdmin para obtener token
  const loginRes = await request(app)
    .post('/login')
    .send({ email: 'admin@ceibo.studio', password: 'Admin123!' });
  authToken = loginRes.body.token;

  let createdEmployeeId = '';

  it('POST /api/employees debe dar de alta un nuevo colaborador en la sucursal', async () => {
    const res = await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        locationId: location.id,
        name: 'Camila Torres',
        position: 'Jefa de Salón',
        email: 'camila@cafemartinez.demo',
        phone: '+54 11 5555-6666',
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.employee.name, 'Camila Torres');
    assert.equal(res.body.employee.position, 'Jefa de Salón');
    assert.equal(res.body.employee.status, 'active');

    createdEmployeeId = res.body.employee.id;
  });

  it('GET /api/employees debe listar los colaboradores de una sucursal', async () => {
    const res = await request(app)
      .get(`/api/employees?locationId=${location.id}`)
      .set('Authorization', `Bearer ${authToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.employees));
    const found = res.body.employees.find((e) => e.id === createdEmployeeId);
    assert.ok(found, 'El colaborador creado debe figurar en la lista');
    assert.equal(typeof found.totalPoints, 'number');
  });

  it('GET /api/employees/:id/profile debe devolver perfil y balance de puntos', async () => {
    const res = await request(app)
      .get(`/api/employees/${createdEmployeeId}/profile`)
      .set('Authorization', `Bearer ${authToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.employee.id, createdEmployeeId);
    assert.ok(res.body.employee.points);
    assert.equal(typeof res.body.employee.points.confirmed, 'number');
  });

  it('PATCH /api/employees/:id debe permitir actualizar puesto o estado', async () => {
    const res = await request(app)
      .patch(`/api/employees/${createdEmployeeId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        position: 'Supervisora General',
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.employee.position, 'Supervisora General');
  });
  it('GET /api/employees sin locationId debe responder 400 Bad Request', async () => {
    const res = await request(app)
      .get('/api/employees')
      .set('Authorization', `Bearer ${authToken}`);

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /locationId es requerido/);
  });

  describe('Auditoría de Feedbacks Marcados (Manager / SuperAdmin)', () => {
    let flaggedFeedbackId = '';
    let flaggedEmployeeId = '';

    // Crear un feedback flagged para auditar
    it('debe crear un feedback marcado (flagged) mediante correo descartable', async () => {
      // Crear colaborador específico
      const empRes = await request(app)
        .post('/api/employees')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          locationId: location.id,
          name: 'Lucas Barista',
          position: 'Barista',
        });
      flaggedEmployeeId = empRes.body.employee.id;

      const fbRes = await request(app)
        .post('/api/public/feedback')
        .send({
          qrToken: 'qr_palermo_mesa_1',
          rating: 5,
          employeeId: flaggedEmployeeId,
          clientFingerprint: `device_flagged_${Date.now()}`,
          customer: {
            email: 'auditoria_bot@temp-mail.org',
          },
        });

      assert.equal(fbRes.status, 201);
      assert.equal(fbRes.body.status, 'flagged');
      assert.equal(fbRes.body.pointsStatus, 'pending');
      flaggedFeedbackId = fbRes.body.feedbackId;

      // Verificar que el colaborador NO tiene reconocimientos visibles mientras esté flagged
      const profileRes = await request(app)
        .get(`/api/employees/${flaggedEmployeeId}/profile`)
        .set('Authorization', `Bearer ${authToken}`);

      assert.equal(profileRes.body.employee.points.confirmed, 0);
      assert.equal(profileRes.body.employee.points.pending, 10);
      assert.equal(profileRes.body.employee.recentRecognitions.length, 0, 'No debe tener reconocimiento mientras esté flagged');
    });

    it('GET /api/employees/audit/feedbacks lista feedbacks marcados y soporta query params strings', async () => {
      const res = await request(app)
        .get(`/api/employees/audit/feedbacks?organizationId=${org.id}&status=flagged&page=1&limit=10`)
        .set('Authorization', `Bearer ${authToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(Array.isArray(res.body.feedbacks));
      assert.equal(res.body.limit, 10);
      assert.equal(res.body.page, 1);

      const found = res.body.feedbacks.find((f) => f.id === flaggedFeedbackId);
      assert.ok(found, 'El feedback marcado debe figurar en la bandeja de auditoría');
      assert.equal(found.status, 'flagged');
    });

    it('POST /api/employees/audit/feedbacks/:id/review con acción inválida retorna 400', async () => {
      const res = await request(app)
        .post(`/api/employees/audit/feedbacks/${flaggedFeedbackId}/review`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ action: 'invalido' });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /Acción inválida/);
    });

    it('POST /api/employees/audit/feedbacks/:id/review con action "reject" rechaza feedback, cancela puntos y NO deja reconocimiento', async () => {
      const res = await request(app)
        .post(`/api/employees/audit/feedbacks/${flaggedFeedbackId}/review`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ action: 'reject' });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.newStatus, 'rejected');

      // Verificar que los puntos pasaron a cancelled y no hay reconocimientos
      const profileRes = await request(app)
        .get(`/api/employees/${flaggedEmployeeId}/profile`)
        .set('Authorization', `Bearer ${authToken}`);

      assert.equal(profileRes.body.employee.points.confirmed, 0);
      assert.equal(profileRes.body.employee.points.pending, 0);
      assert.equal(profileRes.body.employee.recentRecognitions.length, 0, 'No debe existir ningún reconocimiento tras el rechazo');
    });

    it('POST /api/employees/audit/feedbacks/:id/review rechaza re-auditar un feedback ya resuelto (idempotencia)', async () => {
      const res = await request(app)
        .post(`/api/employees/audit/feedbacks/${flaggedFeedbackId}/review`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ action: 'approve' });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /ya ha sido auditado/);
    });

    it('POST /api/employees/audit/feedbacks/:id/review con action "approve" aprueba feedback, confirma puntos y otorga reconocimiento', async () => {
      // Crear otro feedback marcado para probar aprobación
      const fbRes = await request(app)
        .post('/api/public/feedback')
        .send({
          qrToken: 'qr_palermo_mesa_1',
          rating: 5,
          employeeId: flaggedEmployeeId,
          clientFingerprint: `device_approve_test_${Date.now()}`,
          customer: {
            email: 'disposable_review_2@temp-mail.org',
          },
        });

      const secondFeedbackId = fbRes.body.feedbackId;

      const reviewRes = await request(app)
        .post(`/api/employees/audit/feedbacks/${secondFeedbackId}/review`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ action: 'approve' });

      assert.equal(reviewRes.status, 200);
      assert.equal(reviewRes.body.newStatus, 'approved');

      // Verificar que los puntos pasaron a confirmed y el reconocimiento se creó
      const profileRes = await request(app)
        .get(`/api/employees/${flaggedEmployeeId}/profile`)
        .set('Authorization', `Bearer ${authToken}`);

      assert.equal(profileRes.body.employee.points.confirmed, 10);
      assert.equal(profileRes.body.employee.points.pending, 0);
      assert.equal(profileRes.body.employee.recentRecognitions.length, 1);
      assert.equal(profileRes.body.employee.recentRecognitions[0].category, 'Customer Hero');
    });
  });

  describe('Módulo CRM de Comensales (/crm/customers)', () => {
    it('GET /api/employees/crm/customers lista comensales con paginación strings y búsqueda', async () => {
      const res = await request(app)
        .get(`/api/employees/crm/customers?organizationId=${org.id}&page=1&limit=5&search=lead`)
        .set('Authorization', `Bearer ${authToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(Array.isArray(res.body.customers));
      assert.equal(typeof res.body.total, 'number');
      assert.equal(res.body.limit, 5);
      assert.equal(res.body.page, 1);
    });
  });
});
