import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { clientService } from '../../src/services/clientService.js';
import { authService } from '../../src/services/authService.js';

describe('Unit Tests: Validaciones en Servicios', () => {
  describe('clientService - Validaciones de creación', () => {
    it('debe rechazar cliente sin email', async () => {
      await assert.rejects(
        async () => {
          await clientService.createClient({
            contactName: 'Carlos',
            password: 'ValidPassword123',
          });
        },
        (err) => {
          assert.equal(err.statusCode, 400);
          assert.match(err.message, /correo electrónico/);
          return true;
        }
      );
    });

    it('debe rechazar cliente con formato de email inválido', async () => {
      await assert.rejects(
        async () => {
          await clientService.createClient({
            email: 'email-no-valido',
            contactName: 'Carlos',
            password: 'ValidPassword123',
          });
        },
        (err) => {
          assert.equal(err.statusCode, 400);
          assert.match(err.message, /formato/);
          return true;
        }
      );
    });

    it('debe rechazar cliente sin nombre de encargado', async () => {
      await assert.rejects(
        async () => {
          await clientService.createClient({
            email: 'cliente@test.com',
            password: 'ValidPassword123',
          });
        },
        (err) => {
          assert.equal(err.statusCode, 400);
          assert.match(err.message, /encargado/);
          return true;
        }
      );
    });

    it('debe rechazar contraseña menor a 6 caracteres', async () => {
      await assert.rejects(
        async () => {
          await clientService.createClient({
            email: 'cliente@test.com',
            contactName: 'Carlos',
            password: '123',
          });
        },
        (err) => {
          assert.equal(err.statusCode, 400);
          assert.match(err.message, /al menos 6 caracteres/);
          return true;
        }
      );
    });

    it('updateClientStatus debe rechazar estados distintos a active o inactive', async () => {
      await assert.rejects(
        async () => {
          await clientService.updateClientStatus('fake-id', 'pending');
        },
        (err) => {
          assert.equal(err.statusCode, 400);
          assert.match(err.message, /active.*inactive/);
          return true;
        }
      );
    });
  });

  describe('authService - Validaciones de login', () => {
    it('debe rechazar login si falta el email o la contraseña', async () => {
      await assert.rejects(
        async () => {
          await authService.login({ email: '', password: '' });
        },
        (err) => {
          assert.equal(err.statusCode, 400);
          assert.match(err.message, /obligatorios/);
          return true;
        }
      );
    });

    it('debe rechazar login con usuario inexistente (401)', async () => {
      await assert.rejects(
        async () => {
          await authService.login({
            email: 'usuario_inexistente_999@ceibo.studio',
            password: 'Password123!',
          });
        },
        (err) => {
          assert.equal(err.statusCode, 401);
          assert.match(err.message, /Credenciales inválidas/);
          return true;
        }
      );
    });
  });
});
