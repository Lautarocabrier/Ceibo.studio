export default function FeedbackSuccess({ submittedResult, onReset }) {
  return (
    <div className="feedback-shell">
      <div className="feedback-card feedback-success-card">
        <span className="success-icon">✓</span>
        <h2>¡Muchas gracias por tu opinión!</h2>
        <p style={{ color: '#59615b', margin: '12px 0 20px' }}>
          {submittedResult.message || 'Tu feedback ayuda a reconocer el talento y dedicación de nuestro equipo.'}
        </p>
        {submittedResult.pointsAwarded > 0 && (
          <div style={{ background: '#f5e2d9', borderRadius: 10, padding: 12, marginBottom: 20 }}>
            <strong style={{ color: '#c54d2d', fontSize: 14 }}>
              + {submittedResult.pointsAwarded} puntos acreditados a tu colaborador
            </strong>
          </div>
        )}
        <button
          className="primary-action"
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={onReset}
        >
          Enviar otra opinión
        </button>
      </div>
    </div>
  )
}
