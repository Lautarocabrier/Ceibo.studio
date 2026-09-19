export default function ConfirmModal({ title, message, confirmLabel, onConfirm, onClose, isProcessing = false }) {
  return (
    <div className="confirm-backdrop" role="presentation">
      <section className="confirm-card" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title">
        <span className="confirm-icon" aria-hidden="true">!</span>
        <h2 id="confirm-title">{title}</h2>
        <p>{message}</p>
        <div className="confirm-actions">
          <button type="button" className="secondary-button" onClick={onClose} disabled={isProcessing}>Cancelar</button>
          <button type="button" className="danger-button" onClick={onConfirm} disabled={isProcessing}>
            {isProcessing ? 'Procesando...' : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  )
}
