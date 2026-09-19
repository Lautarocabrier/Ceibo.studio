import { useState, useEffect } from 'react'
import { apiRequest } from '../../services/api'

export default function AuditFeedbacksView({ organizationId }) {
  const [feedbacks, setFeedbacks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('flagged')
  const [processingId, setProcessingId] = useState(null)
  const [message, setMessage] = useState('')

  async function loadFeedbacks() {
    setIsLoading(true); setMessage('')
    try {
      const res = await apiRequest(`/employees/audit/feedbacks?status=${filter}&limit=20`)
      setFeedbacks(res.feedbacks || [])
    } catch (err) {
      setMessage(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadFeedbacks() }, [filter])

  async function handleReview(feedbackId, action) {
    setProcessingId(feedbackId)
    try {
      await apiRequest(`/employees/audit/feedbacks/${feedbackId}/review`, {
        method: 'POST',
        body: JSON.stringify({ action }),
      })
      await loadFeedbacks()
    } catch (err) {
      alert(`Error al auditar feedback: ${err.message}`)
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <section className="manager-view">
      <div className="manager-view-intro">
        <span className="dashboard-kicker">Control de Integridad y Anti-Abuso</span>
        <h2>Bandeja de Auditoría de Feedbacks</h2>
        <p>Revisá las calificaciones marcadas por ráfagas de tiempo o correos temporales para confirmar o revocar puntos y reconocimientos.</p>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 15 }}>
        <button
          className={`secondary-button ${filter === 'flagged' ? 'primary-action' : ''}`}
          style={{ height: 34, padding: '0 15px' }}
          onClick={() => setFilter('flagged')}
        >
          Marcados para revisión
        </button>
        <button
          className={`secondary-button ${filter === 'approved' ? 'primary-action' : ''}`}
          style={{ height: 34, padding: '0 15px' }}
          onClick={() => setFilter('approved')}
        >
          Aprobados
        </button>
        <button
          className={`secondary-button ${filter === 'rejected' ? 'primary-action' : ''}`}
          style={{ height: 34, padding: '0 15px' }}
          onClick={() => setFilter('rejected')}
        >
          Rechazados
        </button>
      </div>

      {message && <p className="form-error">{message}</p>}

      {isLoading ? (
        <p className="empty-state">Cargando bandeja de auditoría...</p>
      ) : feedbacks.length ? (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Colaborador</th>
                <th>Rating</th>
                <th>Comentario</th>
                <th>Alerta Anti-Abuso</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {feedbacks.map((fb) => (
                <tr key={fb.id}>
                  <td>{new Date(fb.createdAt).toLocaleString()}</td>
                  <td><strong>{fb.employee?.name || 'General / Local'}</strong></td>
                  <td>{'★'.repeat(fb.rating)} ({fb.rating}/5)</td>
                  <td>{fb.comment || '—'}</td>
                  <td>
                    {fb.flagReason ? (
                      <span className="badge badge--flagged">{fb.flagReason}</span>
                    ) : (
                      <span className="badge badge--approved">Limpio</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge badge--${fb.status}`}>{fb.status}</span>
                  </td>
                  <td>
                    {fb.status === 'flagged' ? (
                      <div className="audit-actions">
                        <button
                          className="approve-btn"
                          disabled={processingId === fb.id}
                          onClick={() => handleReview(fb.id, 'approve')}
                        >
                          Aprobar
                        </button>
                        <button
                          className="reject-btn"
                          disabled={processingId === fb.id}
                          onClick={() => handleReview(fb.id, 'reject')}
                        >
                          Rechazar
                        </button>
                      </div>
                    ) : (
                      <small style={{ color: '#7c827b' }}>Auditado</small>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="manager-empty-state">
          <span>✓</span>
          <strong>No hay feedbacks en esta bandeja</strong>
          <p>No se registran calificaciones con estado "{filter}".</p>
        </div>
      )}
    </section>
  )
}
