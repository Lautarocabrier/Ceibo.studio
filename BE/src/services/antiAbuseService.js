import crypto from 'crypto';
import prisma from '../config/prisma.js';

// Lista de dominios comunes de correos temporales / descartables
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'temp-mail.org',
  'tempmail.com',
  '10minutemail.com',
  '10minutemail.net',
  'guerrillamail.com',
  'guerrillamail.net',
  'guerrillamail.org',
  'sharklasers.com',
  'yopmail.com',
  'yopmail.net',
  'mailinator.com',
  'throwawaymail.com',
  'getairmail.com',
  'dispostable.com',
  'trashmail.com',
  'fakemailgenerator.com',
]);

const IP_SALT = process.env.ANTI_ABUSE_SALT || 'ceibo_anti_abuse_salt_2026';

export const antiAbuseService = {
  /**
   * Hashea la dirección IP del cliente con un salt secreto para preservar la privacidad.
   */
  hashIp(ip) {
    if (!ip) return null;
    return crypto.createHmac('sha256', IP_SALT).update(ip.trim()).digest('hex');
  },

  /**
   * Valida si un email o teléfono es legítimo y no pertenece a un dominio descartable.
   */
  validateContact(customerData) {
    if (!customerData) {
      return { isValid: false, isVerified: false, email: null, phone: null };
    }

    const rawEmail = (customerData.email || '').trim().toLowerCase();
    const rawPhone = (customerData.phone || '').trim();

    if (!rawEmail && !rawPhone) {
      return { isValid: false, isVerified: false, email: null, phone: null };
    }

    if (rawEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(rawEmail)) {
        return { isValid: false, isVerified: false, error: 'Formato de correo inválido' };
      }

      const domain = rawEmail.split('@')[1];
      if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
        return {
          isValid: false,
          isVerified: false,
          error: 'No se permiten dominios de correo temporal',
          isDisposable: true,
        };
      }

      return {
        isValid: true,
        isVerified: true,
        email: rawEmail,
        phone: rawPhone || null,
      };
    }

    // Si proporcionó solo teléfono
    if (rawPhone.length >= 8) {
      return {
        isValid: true,
        isVerified: true,
        email: null,
        phone: rawPhone,
      };
    }

    return { isValid: false, isVerified: false, error: 'Número de teléfono demasiado corto' };
  },

  /**
   * Comprueba si el mismo dispositivo ya calificó al mismo empleado en las últimas 24 horas.
   */
  async checkDeviceDuplicate(clientFingerprint, employeeId, windowHours = 24) {
    if (!clientFingerprint || !employeeId) return false;

    const threshold = new Date(Date.now() - windowHours * 60 * 60 * 1000);

    const existing = await prisma.feedback.findFirst({
      where: {
        clientFingerprint,
        employeeId,
        createdAt: { gte: threshold },
      },
    });

    return Boolean(existing);
  },

  /**
   * Comprueba si un empleado ha recibido una ráfaga inusual de calificaciones (e.g. >= 3 en 15 min).
   */
  async checkVelocityBurst(employeeId, burstThreshold = 3, windowMinutes = 15) {
    if (!employeeId) return false;

    const threshold = new Date(Date.now() - windowMinutes * 60 * 1000);

    const recentCount = await prisma.feedback.count({
      where: {
        employeeId,
        createdAt: { gte: threshold },
      },
    });

    return recentCount >= burstThreshold;
  },

  /**
   * Evalúa el estado final del feedback aplicando las capas de defensa.
   */
  async evaluateFeedback({ clientFingerprint, employeeId, customerData }) {
    // 1. Validar contacto
    const contactValidation = this.validateContact(customerData);
    const verificationLevel = contactValidation.isVerified ? 'verified' : 'anonymous';

    // 2. Control de duplicidad por dispositivo en < 24h (prioridad máxima para evitar auto-reconocimiento)
    if (employeeId) {
      const isDuplicate = await this.checkDeviceDuplicate(clientFingerprint, employeeId);
      if (isDuplicate) {
        return {
          status: 'rejected',
          flagReason: 'DUPLICATE_DEVICE_24H',
          verificationLevel,
          contact: contactValidation.isValid ? contactValidation : null,
        };
      }
    }

    // 3. Control de correos descartables / temporales
    if (customerData?.email && contactValidation.isDisposable) {
      return {
        status: 'flagged',
        flagReason: 'DISPOSABLE_EMAIL',
        verificationLevel: 'anonymous',
        contact: null,
      };
    }

    // 4. Control de ráfaga (Velocity Burst)
    if (employeeId) {
      const isBurst = await this.checkVelocityBurst(employeeId);
      if (isBurst) {
        return {
          status: 'flagged',
          flagReason: 'VELOCITY_BURST',
          verificationLevel,
          contact: contactValidation.isValid ? contactValidation : null,
        };
      }
    }

    return {
      status: 'approved',
      flagReason: null,
      verificationLevel,
      contact: contactValidation.isValid ? contactValidation : null,
    };
  },
};
