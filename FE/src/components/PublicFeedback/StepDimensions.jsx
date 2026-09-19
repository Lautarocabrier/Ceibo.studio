export default function StepDimensions({
  qrData,
  selectedDimensions,
  toggleDimension,
  comment,
  setComment,
  onBack,
  onNext,
}) {
  return (
    <div>
      <div className="feedback-header" style={{ marginBottom: 14 }}>
        <h1>¿Qué destacarías?</h1>
        <p>Elegí los aspectos que marcaron la diferencia</p>
      </div>

      {qrData.dimensions?.length > 0 && (
        <div className="dimensions-chips">
          {qrData.dimensions.map((dim) => (
            <button
              type="button"
              key={dim.id}
              className={`dim-chip ${selectedDimensions.includes(dim.id) ? 'is-selected' : ''}`}
              onClick={() => toggleDimension(dim.id)}
            >
              ✦ {dim.name}
            </button>
          ))}
        </div>
      )}

      <label htmlFor="feedback-comment" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: '#48504b' }}>
        Comentario o felicitación
      </label>
      <textarea
        id="feedback-comment"
        className="feedback-textarea"
        placeholder="Escribí unas palabras para tu camarero o el local..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <div className="step-actions">
        <button
          type="button"
          className="ghost-back-btn"
          onClick={onBack}
        >
          ← Volver
        </button>
        <button
          type="button"
          className="submit-button"
          onClick={onNext}
        >
          Siguiente <span>→</span>
        </button>
      </div>
    </div>
  )
}
