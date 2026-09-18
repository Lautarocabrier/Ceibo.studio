import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { antiAbuseService } from '../../src/services/antiAbuseService.js';

describe('Unit Tests: Servicio Anti-Abuso', () => {
  describe('validateContact', () => {
    it('debe aceptar correo electrónico válido estándar', () => {
      const result = antiAbuseService.validateContact({ email: 'comensal@gmail.com' });
      assert.equal(result.isValid, true);
      assert.equal(result.isVerified, true);
      assert.equal(result.email, 'comensal@gmail.com');
    });

    it('debe rechazar dominios de correos temporales / descartables', () => {
      const result = antiAbuseService.validateContact({ email: 'trampa@temp-mail.org' });
      assert.equal(result.isValid, false);
      assert.equal(result.isVerified, false);
      assert.equal(result.isDisposable, true);
      assert.match(result.error, /correo temporal/i);
    });

    it('debe rechazar formato de correo inválido', () => {
      const result = antiAbuseService.validateContact({ email: 'no-es-un-mail' });
      assert.equal(result.isValid, false);
      assert.match(result.error, /formato de correo/i);
    });

    it('debe aceptar número de teléfono válido si no hay email', () => {
      const result = antiAbuseService.validateContact({ phone: '+54 11 9876-5432' });
      assert.equal(result.isValid, true);
      assert.equal(result.isVerified, true);
      assert.equal(result.phone, '+54 11 9876-5432');
    });

    it('debe devolver anónimo si no se proporciona ningún dato de contacto', () => {
      const result = antiAbuseService.validateContact(null);
      assert.equal(result.isValid, false);
      assert.equal(result.isVerified, false);
    });
  });

  describe('hashIp', () => {
    it('debe generar un hash SHA-256 no nulo para una dirección IP', () => {
      const hash1 = antiAbuseService.hashIp('190.220.10.5');
      const hash2 = antiAbuseService.hashIp('190.220.10.5');
      const hash3 = antiAbuseService.hashIp('190.220.10.6');

      assert.ok(hash1);
      assert.equal(hash1, hash2, 'Misma IP debe producir el mismo hash');
      assert.notEqual(hash1, hash3, 'Distintas IP deben producir hashes diferentes');
    });

    it('debe retornar null si la IP no está definida', () => {
      assert.equal(antiAbuseService.hashIp(null), null);
    });
  });
});
