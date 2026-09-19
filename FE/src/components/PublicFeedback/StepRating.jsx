export default function StepRating({ qrData, rating, setRating, onNext }) {
  return (
    <div>
      <div className="feedback-header" style={{ marginBottom: 12 }}>
        <h1>¿Cómo fue tu experiencia?</h1>
        <p>{qrData.qr?.label || 'Mesa'} · Tu opinión premia a quienes te atienden</p>
      </div>

      <div className="stars-selector">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            type="button"
            key={star}
            className={`star-btn ${star <= rating ? 'is-active' : ''}`}
            onClick={() => setRating(star)}
            aria-label={`${star} estrellas`}
          >
            ★
          </button>
        ))}
      </div>

      <p className="rating-caption">
        {rating === 5
          ? '¡Excelente servicio!'
          : rating === 4
          ? 'Muy buena atención'
          : rating === 3
          ? 'Servicio regular'
          : rating === 2
          ? 'Podría mejorar'
          : 'Mala experiencia'}
      </p>

      <button
        type="button"
        className="submit-button"
        style={{ width: '100%', justifyContent: 'center' }}
        onClick={onNext}
      >
        Continuar <span>→</span>
      </button>
    </div>
  )
}
