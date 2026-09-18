import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../../src/app.js';
import { seedSuperAdmin, seedDemoData } from '../../src/db/seed.js';
import prisma from '../../src/config/prisma.js';

describe('Integration Tests: Flujo Público de QR, Feedback y Anti-Abuso', async () => {
  await seedSuperAdmin();
  const { org, location } = await seedDemoData();

  // Crear un empleado aislado para cada ejecución de tests
  const employee = await prisma.employee.create({
    data: {
      locationId: location.id,
      name: `Colaborador Test ${Date.now()}`,
      position: 'Camarero',
      status: 'active',
    },
  });

  // Obtener dimensiones
  const dimension = await prisma.dimension.findFirst({
    where: { organizationId: org.id },
  });

  const uniqueFingerprint = `device_${Date.now()}_test`;

  describe('GET /api/public/qr/:token', () => {
    it('debe retornar 404 para un token inexistente', async () => {
      const res = await request(app).get('/api/public/qr/token_falso_inexistente');
      assert.equal(res.status, 404);
      assert.equal(res.body.success, false);
    });

    it('debe resolver un token válido con sucursal, organización, colaboradores y dimensiones', async () => {
      const res = await request(app).get('/api/public/qr/qr_palermo_mesa_1');
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.organization.name, 'Café Martínez Palermo');
      assert.equal(res.body.location.name, 'Palermo Soho');
      assert.ok(Array.isArray(res.body.employees));
      assert.ok(res.body.employees.length > 0);
      assert.ok(Array.isArray(res.body.dimensions));
      assert.ok(res.body.dimensions.length > 0);
    });
  });

  describe('POST /api/public/feedback & Mecanismos Anti-Abuso', () => {
    it('debe rechazar feedback con calificación inválida (< 1 o > 5)', async () => {
      const res = await request(app)
        .post('/api/public/feedback')
        .send({
          qrToken: 'qr_palermo_mesa_1',
          rating: 6,
        });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /entre 1 y 5/);
    });

    it('debe registrar feedback verificado de 5 estrellas, captar lead CRM y otorgar 10 puntos', async () => {
      const customerEmail = `lead_${Date.now()}@cliente.com`;

      const res = await request(app)
        .post('/api/public/feedback')
        .send({
          qrToken: 'qr_palermo_mesa_1',
          rating: 5,
          employeeId: employee.id,
          dimensionIds: dimension ? [dimension.id] : [],
          comment: '¡Atención excepcional!',
          clientFingerprint: uniqueFingerprint,
          customer: {
            email: customerEmail,
            name: 'Comensal Feliz',
            phone: '+54 11 4444-5555',
            marketingOptIn: true,
          },
        });

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.equal(res.body.status, 'approved');
      assert.equal(res.body.verificationLevel, 'verified');
      assert.equal(res.body.customerCaptured, true);
      assert.equal(res.body.pointsAwarded, 10);
      assert.equal(res.body.pointsStatus, 'confirmed');

      // Verificar que el cliente comensal se guardó en la base de datos
      const savedCustomer = await prisma.customer.findFirst({
        where: { organizationId: org.id, email: customerEmail },
      });
      assert.ok(savedCustomer);
      assert.equal(savedCustomer.name, 'Comensal Feliz');
      assert.equal(savedCustomer.marketingOptIn, true);

      // Verificar que se creó el evento de desempeño y movimiento en el ledger
      const ledger = await prisma.pointLedgerEntry.findFirst({
        where: { employeeId: employee.id, status: 'confirmed' },
        orderBy: { createdAt: 'desc' },
      });
      assert.ok(ledger);
      assert.equal(ledger.amount, 10);
    });

    it('debe RECHAZAR con 409 si el mismo dispositivo intenta auto-calificarse en < 24hs', async () => {
      const res = await request(app)
        .post('/api/public/feedback')
        .send({
          qrToken: 'qr_palermo_mesa_1',
          rating: 5,
          employeeId: employee.id,
          comment: 'Intento de auto-reconocimiento duplicado',
          clientFingerprint: uniqueFingerprint, // Mismo fingerprint que el test anterior
          customer: {
            email: 'otro_mail@gmail.com',
          },
        });

      assert.equal(res.status, 409);
      assert.equal(res.body.success, false);
      assert.equal(res.body.status, 'rejected');
      assert.equal(res.body.flagReason, 'DUPLICATE_DEVICE_24H');
      assert.match(res.body.message, /recientemente desde este dispositivo/);
    });

    it('debe aceptar feedback anónimo (sin datos personales) desde un nuevo dispositivo', async () => {
      const res = await request(app)
        .post('/api/public/feedback')
        .send({
          qrToken: 'qr_palermo_mesa_1',
          rating: 4,
          employeeId: employee.id,
          clientFingerprint: `device_anon_${Date.now()}`,
          // Sin customer
        });

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.equal(res.body.verificationLevel, 'anonymous');
      assert.equal(res.body.status, 'approved');
      assert.equal(res.body.customerCaptured, false);
    });

    it('debe marcar como "flagged" si se utiliza un correo descartable/temporal', async () => {
      const res = await request(app)
        .post('/api/public/feedback')
        .send({
          qrToken: 'qr_palermo_mesa_1',
          rating: 5,
          employeeId: employee.id,
          clientFingerprint: `device_tempmail_${Date.now()}`,
          customer: {
            email: 'fake_bot@temp-mail.org',
          },
        });

      assert.equal(res.status, 201);
      assert.equal(res.body.status, 'flagged');
      assert.equal(res.body.flagReason, 'DISPOSABLE_EMAIL');
      assert.equal(res.body.pointsStatus, 'pending');
    });

    it('debe rechazar feedback si la calificación es un número decimal (ej. 3.5)', async () => {
      const res = await request(app)
        .post('/api/public/feedback')
        .send({
          qrToken: 'qr_palermo_mesa_1',
          rating: 3.5,
          employeeId: employee.id,
          clientFingerprint: `device_decimal_${Date.now()}`,
        });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /número entero entre 1 y 5/);
    });

    it('debe RECHAZAR con 409 si un dispositivo duplicado intenta evadir el bloqueo usando un correo descartable (anti-bypass)', async () => {
      // Usar el mismo clientFingerprint que ya calificó exitosamente a employee
      const res = await request(app)
        .post('/api/public/feedback')
        .send({
          qrToken: 'qr_palermo_mesa_1',
          rating: 5,
          employeeId: employee.id,
          clientFingerprint: uniqueFingerprint, // Mismo dispositivo
          customer: {
            email: 'hacker_evasion@temp-mail.org', // Intento de evasión con correo temporal
          },
        });

      assert.equal(res.status, 409, 'El dispositivo duplicado debe ser rechazado con 409, no aceptado como flagged');
      assert.equal(res.body.success, false);
      assert.equal(res.body.status, 'rejected');
      assert.equal(res.body.flagReason, 'DUPLICATE_DEVICE_24H');
    });

    it('debe detectar ráfaga (VELOCITY_BURST) y encolar como flagged cuando un colaborador recibe >= 3 calificaciones en 15 minutos', async () => {
      // Crear un colaborador aislado para la prueba de ráfaga
      const burstEmployee = await prisma.employee.create({
        data: {
          locationId: location.id,
          name: `Colaborador Burst ${Date.now()}`,
          position: 'Barista',
          status: 'active',
        },
      });

      // Enviar 3 calificaciones desde dispositivos distintos
      for (let i = 1; i <= 3; i++) {
        const res = await request(app)
          .post('/api/public/feedback')
          .send({
            qrToken: 'qr_palermo_mesa_1',
            rating: 5,
            employeeId: burstEmployee.id,
            clientFingerprint: `device_burst_${i}_${Date.now()}`,
          });

        assert.equal(res.status, 201);
      }

      // La 4ª calificación en la misma ventana de 15 minutos debe ser marcada como flagged (VELOCITY_BURST)
      const burstRes = await request(app)
        .post('/api/public/feedback')
        .send({
          qrToken: 'qr_palermo_mesa_1',
          rating: 5,
          employeeId: burstEmployee.id,
          clientFingerprint: `device_burst_4_${Date.now()}`,
          comment: 'Cuarta calificación consecutiva',
        });

      assert.equal(burstRes.status, 201);
      assert.equal(burstRes.body.status, 'flagged');
      assert.equal(burstRes.body.flagReason, 'VELOCITY_BURST');
      assert.equal(burstRes.body.pointsStatus, 'pending');
    });
  });
});
