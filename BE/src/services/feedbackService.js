import prisma from '../config/prisma.js';
import { antiAbuseService } from './antiAbuseService.js';
import { customerService } from './customerService.js';

export const feedbackService = {
  /**
   * Procesa la recepción de un feedback público desde un código QR.
   */
  async submitFeedback({
    qrToken,
    rating,
    employeeId = null,
    dimensionIds = [],
    comment = null,
    clientFingerprint = null,
    customer = null,
    ip = null,
  }) {
    // 1. Validar calificación
    const numRating = Number(rating);
    if (!Number.isInteger(numRating) || numRating < 1 || numRating > 5) {
      const error = new Error('La calificación debe ser un número entero entre 1 y 5');
      error.statusCode = 400;
      throw error;
    }

    // 2. Resolver QR y sucursal
    if (!qrToken) {
      const error = new Error('Token de código QR obligatorio');
      error.statusCode = 400;
      throw error;
    }

    const qrCode = await prisma.qRCode.findUnique({
      where: { token: qrToken },
      include: {
        location: true,
      },
    });

    if (!qrCode || qrCode.status !== 'active') {
      const error = new Error('Código QR inválido o inactivo');
      error.statusCode = 404;
      throw error;
    }

    const { locationId } = qrCode;
    const { organizationId } = qrCode.location;

    // Si se especificó un empleado, verificar que exista y pertenezca a la sucursal
    let employee = null;
    if (employeeId) {
      employee = await prisma.employee.findFirst({
        where: { id: employeeId, locationId, status: 'active' },
      });
      if (!employee) {
        const error = new Error('Colaborador no encontrado o inactivo en esta sucursal');
        error.statusCode = 404;
        throw error;
      }
    }

    // 3. Evaluar reglas anti-abuso (Silent Checks)
    const ipHash = antiAbuseService.hashIp(ip);
    const evaluation = await antiAbuseService.evaluateFeedback({
      clientFingerprint,
      employeeId: employee ? employee.id : null,
      customerData: customer,
    });

    // 4. Si el dispositivo intentó calificar al mismo empleado en < 24h, rechazar y registrar auditoría
    if (evaluation.status === 'rejected') {
      await prisma.feedback.create({
        data: {
          organizationId,
          locationId,
          employeeId: employee ? employee.id : null,
          qrCodeId: qrCode.id,
          rating: numRating,
          comment: comment ? comment.trim() : null,
          clientFingerprint,
          ipHash,
          verificationLevel: evaluation.verificationLevel,
          status: 'rejected',
          flagReason: evaluation.flagReason,
        },
      });

      return {
        success: false,
        status: 'rejected',
        flagReason: evaluation.flagReason,
        message: 'Ya has calificado a este colaborador recientemente desde este dispositivo.',
      };
    }

    // 5. Registrar o actualizar cliente (Lead CRM) si proporcionó datos
    let customerRecord = null;
    if (evaluation.contact && (evaluation.contact.email || evaluation.contact.phone)) {
      customerRecord = await customerService.findOrCreateCustomer(organizationId, {
        email: evaluation.contact.email,
        phone: evaluation.contact.phone,
        name: customer?.name,
        marketingOptIn: customer?.marketingOptIn ?? true,
      });
    }

    // 6. Transacción atómica: Guardar Feedback, Dimensiones, PerformanceEvent y aplicar Reglas
    const result = await prisma.$transaction(async (tx) => {
      // Crear Feedback
      const createdFeedback = await tx.feedback.create({
        data: {
          organizationId,
          locationId,
          employeeId: employee ? employee.id : null,
          qrCodeId: qrCode.id,
          customerId: customerRecord ? customerRecord.id : null,
          rating: numRating,
          comment: comment ? comment.trim() : null,
          source: 'qr',
          clientFingerprint,
          ipHash,
          verificationLevel: evaluation.verificationLevel,
          status: evaluation.status,
          flagReason: evaluation.flagReason,
        },
      });

      // Asociar Dimensiones destacadas
      if (Array.isArray(dimensionIds) && dimensionIds.length > 0) {
        for (const dimId of dimensionIds) {
          await tx.feedbackDimension.create({
            data: {
              feedbackId: createdFeedback.id,
              dimensionId: dimId,
              highlighted: true,
            },
          });
        }
      }

      // Crear PerformanceEvent (unidad atómica de desempeño)
      const performanceEvent = await tx.performanceEvent.create({
        data: {
          organizationId,
          locationId,
          employeeId: employee ? employee.id : null,
          feedbackId: createdFeedback.id,
          source: 'customer',
          type: numRating >= 4 ? 'recognition' : 'rating',
          score: numRating,
          evidence: comment ? comment.trim() : null,
        },
      });

      // Evaluar Reglas activas para otorgar puntos y reconocimientos
      let recognition = null;
      let ledgerEntry = null;

      if (employee) {
        const activeRule = await tx.rule.findFirst({
          where: {
            organizationId,
            eventType: 'feedback_received',
            isActive: true,
            minRating: { lte: numRating },
          },
          orderBy: { minRating: 'desc' },
        });

        if (activeRule) {
          const isFlagged = evaluation.status === 'flagged';

          // Solo creamos el Reconocimiento de inmediato si el feedback está aprobado (no flagged)
          if (!isFlagged) {
            recognition = await tx.recognition.create({
              data: {
                organizationId,
                employeeId: employee.id,
                performanceEventId: performanceEvent.id,
                ruleId: activeRule.id,
                category: activeRule.recognitionTitle,
                message: comment ? comment.trim() : `Reconocimiento por calificación de ${numRating} estrellas`,
                source: 'automatic',
              },
            });
          }

          // Otorgar puntos en Ledger (confirmed si aprobado, pending si flagged)
          ledgerEntry = await tx.pointLedgerEntry.create({
            data: {
              employeeId: employee.id,
              performanceEventId: performanceEvent.id,
              recognitionId: recognition ? recognition.id : null,
              ruleId: activeRule.id,
              amount: activeRule.pointsToAward,
              reason: `Feedback comensal (${numRating}★)`,
              status: isFlagged ? 'pending' : 'confirmed',
            },
          });
        }
      }

      return {
        feedback: createdFeedback,
        performanceEvent,
        recognition,
        ledgerEntry,
      };
    });

    return {
      success: true,
      message: 'Feedback registrado con éxito',
      feedbackId: result.feedback.id,
      status: result.feedback.status,
      flagReason: result.feedback.flagReason,
      verificationLevel: result.feedback.verificationLevel,
      customerCaptured: Boolean(customerRecord),
      pointsAwarded: result.ledgerEntry ? result.ledgerEntry.amount : 0,
      pointsStatus: result.ledgerEntry ? result.ledgerEntry.status : null,
    };
  },

  /**
   * Obtiene feedbacks de una organización con filtros de status (ej. 'flagged' para el Manager).
   */
  async getFeedbacks(organizationId, { status, locationId, employeeId, page = 1, limit = 20 } = {}) {
    const where = {};
    if (organizationId) where.organizationId = organizationId;

    if (status) where.status = status;
    if (locationId) where.locationId = locationId;
    if (employeeId) where.employeeId = employeeId;

    const safeLimit = Math.max(1, parseInt(limit, 10) || 20);
    const safePage = Math.max(1, parseInt(page, 10) || 1);
    const safeSkip = (safePage - 1) * safeLimit;

    const [total, feedbacks] = await Promise.all([
      prisma.feedback.count({ where }),
      prisma.feedback.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: safeSkip,
        take: safeLimit,
        include: {
          employee: {
            select: { id: true, name: true, position: true },
          },
          customer: {
            select: { id: true, email: true, name: true },
          },
          dimensions: {
            include: { dimension: true },
          },
        },
      }),
    ]);

    return {
      success: true,
      total,
      page: safePage,
      limit: safeLimit,
      feedbacks,
    };
  },

  /**
   * Acción del Manager para auditar un feedback en estado 'flagged'.
   */
  async reviewFlaggedFeedback(feedbackId, { action, managerUserId }) {
    if (!['approve', 'reject'].includes(action)) {
      const error = new Error('Acción inválida: debe ser "approve" o "reject"');
      error.statusCode = 400;
      throw error;
    }

    const feedback = await prisma.feedback.findUnique({
      where: { id: feedbackId },
      include: {
        performanceEvents: {
          include: {
            ledgerEntries: true,
            recognitions: true,
          },
        },
      },
    });

    if (!feedback) {
      const error = new Error('Feedback no encontrado');
      error.statusCode = 404;
      throw error;
    }

    if (feedback.status !== 'flagged') {
      const error = new Error(`El feedback ya ha sido auditado previamente (estado actual: ${feedback.status})`);
      error.statusCode = 400;
      throw error;
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    await prisma.$transaction(async (tx) => {
      // 1. Actualizar feedback
      await tx.feedback.update({
        where: { id: feedbackId },
        data: { status: newStatus },
      });

      // 2. Actualizar estado de los puntos y gestionar reconocimientos
      for (const pe of feedback.performanceEvents) {
        if (action === 'approve') {
          for (const entry of pe.ledgerEntries) {
            let recognitionId = entry.recognitionId;

            // Si no tenía reconocimiento creado (porque estaba flagged), crearlo al aprobar
            if (!recognitionId && entry.ruleId && feedback.employeeId) {
              const rule = await tx.rule.findUnique({ where: { id: entry.ruleId } });
              if (rule) {
                const createdRec = await tx.recognition.create({
                  data: {
                    organizationId: feedback.organizationId,
                    employeeId: feedback.employeeId,
                    performanceEventId: pe.id,
                    ruleId: rule.id,
                    category: rule.recognitionTitle,
                    message: feedback.comment || `Reconocimiento por calificación de ${feedback.rating} estrellas`,
                    source: 'automatic',
                  },
                });
                recognitionId = createdRec.id;
              }
            }

            await tx.pointLedgerEntry.update({
              where: { id: entry.id },
              data: {
                status: 'confirmed',
                ...(recognitionId ? { recognitionId } : {}),
              },
            });
          }
        } else {
          // Rechazado: cancelar ledger y borrar cualquier reconocimiento huérfano vinculado
          for (const entry of pe.ledgerEntries) {
            await tx.pointLedgerEntry.update({
              where: { id: entry.id },
              data: { status: 'cancelled' },
            });
          }

          await tx.recognition.deleteMany({
            where: { performanceEventId: pe.id },
          });
        }
      }
    });

    return {
      success: true,
      message: `Feedback ${action === 'approve' ? 'aprobado' : 'rechazado'} con éxito`,
      newStatus,
    };
  },
};
