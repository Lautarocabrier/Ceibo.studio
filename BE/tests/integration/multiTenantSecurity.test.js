import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../../src/app.js';
import prisma from '../../src/config/prisma.js';
import bcrypt from 'bcryptjs';

describe('Integration Tests: Seguridad y Aislamiento Multi-Tenant (Prevención de IDOR)', async () => {
  const timestamp = Date.now();
  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Crear Organización A
  const orgA = await prisma.organization.create({
    data: {
      name: `Org Alpha ${timestamp}`,
      email: `alpha_${timestamp}@test.com`,
      status: 'active',
    },
  });

  const locationA = await prisma.location.create({
    data: {
      organizationId: orgA.id,
      name: 'Sucursal Alpha',
      status: 'active',
    },
  });

  const employeeA = await prisma.employee.create({
    data: {
      locationId: locationA.id,
      name: 'Empleado Alpha',
      position: 'Cajero',
      status: 'active',
    },
  });

  const feedbackA = await prisma.feedback.create({
    data: {
      organizationId: orgA.id,
      locationId: locationA.id,
      employeeId: employeeA.id,
      rating: 5,
      status: 'flagged',
      flagReason: 'DISPOSABLE_EMAIL',
    },
  });

  // 2. Crear Organización B y Usuario B
  const orgB = await prisma.organization.create({
    data: {
      name: `Org Beta ${timestamp}`,
      email: `beta_${timestamp}@test.com`,
      status: 'active',
    },
  });

  const locationB = await prisma.location.create({
    data: {
      organizationId: orgB.id,
      name: 'Sucursal Beta',
      status: 'active',
    },
  });

  const userB = await prisma.user.create({
    data: {
      email: `user_b_${timestamp}@test.com`,
      passwordHash,
      name: 'Manager Beta',
      role: 'CUSTOMER',
      organizationId: orgB.id,
    },
  });

  await prisma.organizationMember.create({
    data: {
      organizationId: orgB.id,
      userId: userB.id,
      role: 'MANAGER',
      status: 'active',
    },
  });

  // Iniciar sesión con Usuario B
  const loginRes = await request(app)
    .post('/login')
    .send({ email: userB.email, password: 'Password123!' });

  const tokenB = loginRes.body.token;
  assert.ok(tokenB, 'Usuario B debe autenticarse correctamente');

  it('GET /api/employees en sucursal ajena debe responder 403 Forbidden', async () => {
    const res = await request(app)
      .get(`/api/employees?locationId=${locationA.id}`)
      .set('Authorization', `Bearer ${tokenB}`);

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /Acceso no autorizado a esta sucursal/);
  });

  it('GET /api/employees/:id/profile de colaborador ajeno debe responder 403 Forbidden', async () => {
    const res = await request(app)
      .get(`/api/employees/${employeeA.id}/profile`)
      .set('Authorization', `Bearer ${tokenB}`);

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /Acceso no autorizado a este colaborador/);
  });

  it('POST /api/employees creando colaborador en sucursal ajena debe responder 403 Forbidden', async () => {
    const res = await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({
        locationId: locationA.id,
        name: 'Empleado Infiltrado',
      });

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /Acceso no autorizado a esta sucursal/);
  });

  it('PATCH /api/employees/:id modificando colaborador ajeno debe responder 403 Forbidden', async () => {
    const res = await request(app)
      .patch(`/api/employees/${employeeA.id}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .send({
        position: 'Posición Cambiada Maliciosamente',
      });

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /Acceso no autorizado a este colaborador/);
  });

  it('POST /api/employees/audit/feedbacks/:id/review de feedback ajeno debe responder 403 Forbidden', async () => {
    const res = await request(app)
      .post(`/api/employees/audit/feedbacks/${feedbackA.id}/review`)
      .set('Authorization', `Bearer ${tokenB}`)
      .send({
        action: 'approve',
      });

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /Acceso no autorizado a este feedback/);
  });

  it('GET /api/employees en su propia sucursal (Org B) debe responder 200 OK', async () => {
    const res = await request(app)
      .get(`/api/employees?locationId=${locationB.id}`)
      .set('Authorization', `Bearer ${tokenB}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.employees));
  });
});
