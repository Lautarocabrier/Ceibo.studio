import { useState } from 'react'
import bgImage from '../../assets/plants footer/background.webp'
import leftPlant from '../../assets/plants footer/lefth-plant.webp'
import rightPlant from '../../assets/plants footer/rigth-plant.webp'
import sloganImg from '../../assets/plants footer/slogan-personas-que-hacen-crecer-empresas.webp'
import Modal from '../common/Modal'

export default function LandingFooter() {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', company: '', message: '' })
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSubmitted(true)
  }

  const handleClose = () => {
    setIsDemoModalOpen(false)
    setIsSubmitted(false)
    setFormData({ name: '', email: '', company: '', message: '' })
  }

  return (
    <>
      <footer
        className="botanical-footer"
        style={{ backgroundImage: `url("${bgImage}")` }}
        aria-label="Pie de página Ceibo"
      >
        {/* Left Plant Foliage */}
        <div className="botanical-footer__left-plant" aria-hidden="true">
          <img src={leftPlant} alt="" className="botanical-footer__plant-img" />
        </div>

        {/* Left Slogan & Botanical Sprout Icon */}
        <div className="botanical-footer__slogan-wrapper">
          <svg
            className="botanical-footer__sprout-icon"
            width="32"
            height="42"
            viewBox="0 0 32 42"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            {/* Stem */}
            <path
              d="M11 39 C12 30 14.5 21 21 13"
              stroke="#f0ece1"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            {/* Left Leaf */}
            <path
              d="M13.5 26 C8.5 25.5 2.5 21.5 3.5 14.5 C7 12 13 15.5 14.5 23 Z"
              stroke="#f0ece1"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <path
              d="M5.8 19 C9.5 18.5 12 20.5 14.5 23"
              stroke="#f0ece1"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            {/* Right / Top Leaf */}
            <path
              d="M18 17 C18 10 23 3 28 4.8 C29.8 9.5 25.5 17 19 17 Z"
              stroke="#f0ece1"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <path
              d="M19 17 C23 13 25.5 8.5 28 4.8"
              stroke="#f0ece1"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>

          <img
            src={sloganImg}
            alt="Personas que hacen crecer empresas."
            className="botanical-footer__slogan-img"
          />
        </div>

        {/* Center Content: Eyebrow + Title + CTA Button */}
        <div className="botanical-footer__center">
          <span className="botanical-footer__eyebrow">
            El talento florece cuando se lo cultiva
          </span>
          <h2 className="botanical-footer__heading">
            ¿Listo para descubrir el potencial<br />de tu equipo?
          </h2>
          <button
            type="button"
            className="botanical-footer__cta-btn"
            onClick={() => setIsDemoModalOpen(true)}
            id="btn-solicitar-demo"
          >
            <span>Solicitar demo</span>
            <span className="botanical-footer__cta-arrow" aria-hidden="true">→</span>
          </button>
        </div>

        {/* Right Plant Foliage */}
        <div className="botanical-footer__right-plant" aria-hidden="true">
          <img src={rightPlant} alt="" className="botanical-footer__plant-img" />
        </div>

        {/* Right Brand Text */}
        <div className="botanical-footer__brand">
          <span className="botanical-footer__brand-title">CEIBO</span>
          <span className="botanical-footer__brand-subtitle">TALENT INTELLIGENCE</span>
        </div>
      </footer>

      {/* Demo Request Modal */}
      {isDemoModalOpen && (
        <Modal title="Solicitar Demostración" onClose={handleClose}>
          {isSubmitted ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ fontSize: '38px', marginBottom: '16px' }}>🌱</div>
              <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#303934', marginBottom: '8px' }}>
                ¡Gracias por tu interés!
              </h3>
              <p style={{ color: '#69706b', fontSize: '14px', lineHeight: 1.5, marginBottom: '24px' }}>
                Nos pondremos en contacto contigo a la brevedad para coordinar una sesión personalizada de Ceibo.
              </p>
              <button
                type="button"
                className="submit-button"
                onClick={handleClose}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Cerrar
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <p style={{ color: '#69706b', fontSize: '13px', marginBottom: '20px', lineHeight: 1.5 }}>
                Descubre cómo potenciar y activar el talento en tu organización. Completa tus datos y nos comunicaremos contigo.
              </p>

              <label htmlFor="demo-name">Nombre y Apellido</label>
              <input
                id="demo-name"
                required
                placeholder="Ej. Martín Gómez"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />

              <label htmlFor="demo-email">Email Corporativo</label>
              <input
                id="demo-email"
                type="email"
                required
                placeholder="martin@tuempresa.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />

              <label htmlFor="demo-company">Empresa / Negocio</label>
              <input
                id="demo-company"
                required
                placeholder="Nombre de la empresa"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              />

              <label htmlFor="demo-message">Mensaje (opcional)</label>
              <input
                id="demo-message"
                placeholder="Cuéntanos brevemente sobre tu equipo o desafío"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />

              <button type="submit" className="submit-button" style={{ marginTop: '8px' }}>
                <span>Enviar solicitud</span>
                <span aria-hidden="true">→</span>
              </button>
            </form>
          )}
        </Modal>
      )}
    </>
  )
}
