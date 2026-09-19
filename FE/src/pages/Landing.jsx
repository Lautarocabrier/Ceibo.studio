import { useNavigate } from 'react-router-dom'
import Brand from '../components/common/Brand'

export default function Landing() {
  const navigate = useNavigate()
  return (
    <main className="landing-shell">
      <header className="site-header">
        <Brand />
        <button className="login-trigger" onClick={() => navigate('/login')}>
          Ingresar <span aria-hidden="true">↗</span>
        </button>
      </header>
      <section className="landing-content">
        <div className="eyebrow">Plataforma de gestión · 2026</div>
        <h1>Naturaleza<br /><em>que nos une.</em></h1>
        <p className="landing-copy">Un espacio simple para hacer crecer lo que importa.</p>
        <button className="landing-action" onClick={() => navigate('/login')}>
          Ingresar a la plataforma <span aria-hidden="true">→</span>
        </button>
      </section>
      <footer className="landing-footer">
        <span>CEIBO / EXPERIENCIAS QUE CONECTAN</span>
        <span>BUENOS AIRES · ARGENTINA</span>
      </footer>
      <div className="botanical-shape" aria-hidden="true">
        <span /><span /><span />
      </div>
    </main>
  )
}
