import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { apiRequest } from '../services/api'
import { getClientFingerprint } from '../utils/fingerprint'
import Brand from '../components/common/Brand'
import StepRating from '../components/PublicFeedback/StepRating'
import StepEmployee from '../components/PublicFeedback/StepEmployee'
import StepDimensions from '../components/PublicFeedback/StepDimensions'
import StepLead from '../components/PublicFeedback/StepLead'
import FeedbackSuccess from '../components/PublicFeedback/FeedbackSuccess'

export default function PublicFeedback() {
  const { token } = useParams()
  const [qrData, setQrData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentStep, setCurrentStep] = useState(1) // 1: Rating, 2: Employee, 3: Dimensions, 4: Lead
  const [rating, setRating] = useState(5)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('')
  const [selectedDimensions, setSelectedDimensions] = useState([])
  const [comment, setComment] = useState('')
  const [customer, setCustomer] = useState({ name: '', email: '', phone: '', marketingOptIn: true })
  const [searchQuery, setSearchQuery] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedResult, setSubmittedResult] = useState(null)

  useEffect(() => {
    async function loadQr() {
      setIsLoading(true); setError('')
      try {
        const payload = await apiRequest(`/public/qr/${token}`)
        setQrData(payload)
        if (payload.employees?.length) {
          setSelectedEmployeeId(payload.employees[0].id)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    loadQr()
  }, [token])

  function toggleDimension(dimId) {
    setSelectedDimensions((current) =>
      current.includes(dimId) ? current.filter((id) => id !== dimId) : [...current, dimId]
    )
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setIsSubmitting(true)
    setError('')
    try {
      const clientFingerprint = getClientFingerprint()
      const payload = await apiRequest('/public/feedback', {
        method: 'POST',
        body: JSON.stringify({
          qrToken: token,
          rating,
          employeeId: selectedEmployeeId || null,
          dimensionIds: selectedDimensions,
          comment: comment.trim() || undefined,
          clientFingerprint,
          customer: customer.email || customer.phone ? customer : null,
        }),
      })
      setSubmittedResult(payload)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="feedback-shell">
        <div className="feedback-card" style={{ textAlign: 'center' }}>
          <p>Cargando experiencia Ceibo Studio...</p>
        </div>
      </div>
    )
  }

  if (error && !qrData) {
    return (
      <div className="feedback-shell">
        <div className="feedback-card" style={{ textAlign: 'center' }}>
          <span style={{ fontSize: 40, color: '#c54d2d' }}>!</span>
          <h2>Código QR no disponible</h2>
          <p style={{ color: '#69706b', margin: '10px 0 20px' }}>{error}</p>
          <Link to="/" className="primary-action" style={{ display: 'inline-flex', justifyContent: 'center' }}>
            Ir al inicio
          </Link>
        </div>
      </div>
    )
  }

  if (submittedResult) {
    return (
      <FeedbackSuccess
        submittedResult={submittedResult}
        onReset={() => {
          setSubmittedResult(null)
          setCurrentStep(1)
        }}
      />
    )
  }

  const filteredEmployees = (qrData?.employees || []).filter((emp) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return emp.name.toLowerCase().includes(q) || (emp.position && emp.position.toLowerCase().includes(q))
  })

  return (
    <div className="feedback-shell">
      <div className="feedback-card">
        {/* Cabecera común de marca */}
        <div className="feedback-header">
          <Brand />
          <span className="eyebrow" style={{ marginTop: 12, display: 'block' }}>
            {qrData.organization?.name} · {qrData.location?.name}
          </span>
        </div>

        {/* Indicador de pasos */}
        <div className="phase-stepper-wrap">
          <div className="phase-stepper">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`phase-step-pill ${
                  currentStep === step ? 'is-active' : currentStep > step ? 'is-completed' : ''
                }`}
              />
            ))}
          </div>
          <span className="phase-step-label">
            Paso {currentStep} de 4 ·{' '}
            {currentStep === 1
              ? 'Experiencia'
              : currentStep === 2
              ? 'Atención'
              : currentStep === 3
              ? 'Destacados'
              : 'Beneficios'}
          </span>
        </div>

        {error && <p className="form-error" style={{ textAlign: 'center' }}>{error}</p>}

        <form onSubmit={handleSubmit}>
          {/* FASE 1: CALIFICACIÓN POR ESTRELLAS */}
          {currentStep === 1 && (
            <StepRating
              qrData={qrData}
              rating={rating}
              setRating={setRating}
              onNext={() => setCurrentStep(2)}
            />
          )}

          {/* FASE 2: QUIÉN TE ATENDIÓ */}
          {currentStep === 2 && (
            <StepEmployee
              qrData={qrData}
              filteredEmployees={filteredEmployees}
              selectedEmployeeId={selectedEmployeeId}
              setSelectedEmployeeId={setSelectedEmployeeId}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onBack={() => setCurrentStep(1)}
              onNext={() => setCurrentStep(3)}
            />
          )}

          {/* FASE 3: DESTACADOS Y COMENTARIO */}
          {currentStep === 3 && (
            <StepDimensions
              qrData={qrData}
              selectedDimensions={selectedDimensions}
              toggleDimension={toggleDimension}
              comment={comment}
              setComment={setComment}
              onBack={() => setCurrentStep(2)}
              onNext={() => setCurrentStep(4)}
            />
          )}

          {/* FASE 4: CLUB DE COMENSALES Y ENVÍO */}
          {currentStep === 4 && (
            <StepLead
              qrData={qrData}
              customer={customer}
              setCustomer={setCustomer}
              isSubmitting={isSubmitting}
              onBack={() => setCurrentStep(3)}
            />
          )}
        </form>
      </div>
    </div>
  )
}
