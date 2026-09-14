import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { requireRole, requireSuperAdmin } from '../../src/middleware/role.js';
import { authenticate } from '../../src/middleware/auth.js';

describe('Unit Tests: Middleware de Roles y Seguridad', () => {
  describe('requireRole & requireSuperAdmin', () => {
    it('debe retornar 401 si no hay usuario en la request', () => {
      const req = {};
      let statusCode = null;
      let jsonPayload = null;

      const res = {
        status: (code) => {
          statusCode = code;
          return {
            json: (data) => {
              jsonPayload = data;
            },
          };
        },
      };

      const next = () => {
        throw new Error('next() no debería haber sido llamado');
      };

      requireSuperAdmin(req, res, next);

      assert.equal(statusCode, 401);
      assert.equal(jsonPayload.success, false);
      assert.equal(jsonPayload.message, 'No autenticado');
    });

    it('debe retornar 403 si el rol del usuario no coincide con SUPERADMIN', () => {
      const req = {
        user: { id: 'usr_1', role: 'CUSTOMER' },
      };
      let statusCode = null;
      let jsonPayload = null;

      const res = {
        status: (code) => {
          statusCode = code;
          return {
            json: (data) => {
              jsonPayload = data;
            },
          };
        },
      };

      const next = () => {
        throw new Error('next() no debería haber sido llamado');
      };

      requireSuperAdmin(req, res, next);

      assert.equal(statusCode, 403);
      assert.equal(jsonPayload.success, false);
      assert.match(jsonPayload.message, /Acceso denegado/);
    });

    it('debe llamar a next() si el usuario tiene rol SUPERADMIN', () => {
      const req = {
        user: { id: 'usr_admin', role: 'SUPERADMIN' },
      };
      let nextCalled = false;

      const res = {};
      const next = () => {
        nextCalled = true;
      };

      requireSuperAdmin(req, res, next);

      assert.equal(nextCalled, true);
    });

    it('requireRole con múltiples roles debe permitir cualquiera de los permitidos', () => {
      const checkRole = requireRole('SUPERADMIN', 'CUSTOMER');
      let nextCount = 0;
      const next = () => {
        nextCount++;
      };

      checkRole({ user: { role: 'CUSTOMER' } }, {}, next);
      checkRole({ user: { role: 'SUPERADMIN' } }, {}, next);

      assert.equal(nextCount, 2);
    });
  });

  describe('authenticate middleware', () => {
    it('debe retornar 401 si falta el header Authorization', async () => {
      const req = { headers: {} };
      let statusCode = null;
      let jsonPayload = null;

      const res = {
        status: (code) => {
          statusCode = code;
          return {
            json: (data) => {
              jsonPayload = data;
            },
          };
        },
      };

      const next = () => {};

      await authenticate(req, res, next);

      assert.equal(statusCode, 401);
      assert.equal(jsonPayload.success, false);
      assert.match(jsonPayload.message, /Token no proporcionado/);
    });

    it('debe retornar 401 si el token no comienza con Bearer', async () => {
      const req = { headers: { authorization: 'Basic 12345' } };
      let statusCode = null;
      let jsonPayload = null;

      const res = {
        status: (code) => {
          statusCode = code;
          return {
            json: (data) => {
              jsonPayload = data;
            },
          };
        },
      };

      const next = () => {};

      await authenticate(req, res, next);

      assert.equal(statusCode, 401);
      assert.equal(jsonPayload.success, false);
    });

    it('debe retornar 401 si el token JWT es inválido', async () => {
      const req = { headers: { authorization: 'Bearer token_invalido_xyz' } };
      let statusCode = null;
      let jsonPayload = null;

      const res = {
        status: (code) => {
          statusCode = code;
          return {
            json: (data) => {
              jsonPayload = data;
            },
          };
        },
      };

      const next = () => {};

      await authenticate(req, res, next);

      assert.equal(statusCode, 401);
      assert.equal(jsonPayload.success, false);
      assert.match(jsonPayload.message, /inválido/);
    });
  });
});
