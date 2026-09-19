import { useNavigate } from 'react-router-dom'
import Brand from '../components/common/Brand'
import LandingFooter from '../components/Landing/LandingFooter'
import HeroBotanicalIllustration from '../components/Landing/HeroBotanicalIllustration'
import GlobalTalentSequence from '../components/Landing/GlobalTalentSequence'

export default function Landing() {
  const navigate = useNavigate()
  return (
    <div className="landing-shell">
      <header className="site-header">
        <Brand />
        <button className="login-trigger" onClick={() => navigate('/login')}>
          Ingresar <span aria-hidden="true">↗</span>
        </button>
      </header>

      <section className="landing-content">
        <div className="eyebrow">Plataforma de gestión · 2026</div>
        <h1>Potenciamos<br /><em>tu equipo</em></h1>
        <p className="landing-copy">Las personas motivadas generan resultados extraordinarios</p>
        <button className="landing-action" onClick={() => navigate('/login')}>
          Ingresar a la plataforma <span aria-hidden="true">→</span>
        </button>
      </section>

      <HeroBotanicalIllustration />

      {/* Interactive Global Talent Sequence Showcase */}
      <GlobalTalentSequence />

      <LandingFooter />
    </div>
  )
}

