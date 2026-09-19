export default function StepLead({
  qrData,
  customer,
  setCustomer,
  isSubmitting,
  onBack,
}) {
  return (
    <div>
      <div className="lead-box">
        <h4>Club de Comensales · Beneficios</h4>
        <p>Dejá tu contacto para recibir promociones y regalos en tu próxima visita.</p>
        <input
          type="text"
          placeholder="Tu nombre (opcional)"
          value={customer.name}
          onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
        />
        <input
          type="email"
          placeholder="Tu email (opcional)"
          value={customer.email}
          onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
        />
        <input
          type="tel"
          placeholder="Tu teléfono (opcional)"
          value={customer.phone}
          onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
        />
        <label className="optin">
          <input
            type="checkbox"
            checked={customer.marketingOptIn}
            onChange={(e) => setCustomer({ ...customer, marketingOptIn: e.target.checked })}
          />
          Acepto recibir novedades y beneficios de {qrData.organization?.name}
        </label>
      </div>

      <div className="step-actions">
        <button
          type="button"
          className="ghost-back-btn"
          onClick={onBack}
        >
          ← Volver
        </button>
        <button
          type="submit"
          className="submit-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Enviando...' : 'ENVIAR CALIFICACIÓN'} <span>→</span>
        </button>
      </div>
    </div>
  )
}
