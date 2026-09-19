import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Brand from '../components/common/Brand'
import CeiboMark from '../components/common/CeiboMark'
import { apiRequest, TOKEN_KEY } from '../services/api'

export default function Login({ onLogin }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('admin@ceibo.studio')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      const payload = await apiRequest('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
      localStorage.setItem(TOKEN_KEY, payload.token)
      onLogin(payload.user)
      navigate(payload.redirectTo || (payload.user.role === 'SUPERADMIN' ? '/superadmin' : '/customer'), { replace: true })
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="auth-shell">
      <div className="auth-panel auth-panel--visual">
        <button className="back-button" onClick={() => navigate('/')} aria-label="Volver al inicio">←</button>
        <div className="auth-visual-content">
          <Brand light />
          <div>
            <span className="visual-label">Bienvenido a</span>
            <h1>Un lugar para<br /><em>hacerlo posible.</em></h1>
          </div>
          <span className="visual-caption">CEIBO / 02. GEOMÉTRICA</span>
        </div>
      </div>
      <div className="auth-panel auth-panel--form">
        <div className="form-wrap">
          <div className="form-heading">
            <CeiboMark small />
            <span className="eyebrow">Acceso privado</span>
            <h2>Ingresar</h2>
            <p>Entrá a tu espacio de trabajo Ceibo.</p>
          </div>
          <form onSubmit={handleSubmit}>
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
            <label htmlFor="password">Contraseña</label>
            <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required placeholder="••••••••" />
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="submit-button" type="submit" disabled={isLoading}>
              {isLoading ? 'Ingresando...' : 'Ingresar'} <span aria-hidden="true">→</span>
            </button>
          </form>
          <p className="form-note">¿Necesitás ayuda? <a href="mailto:hola@ceibo.com">Contactanos</a></p>
        </div>
      </div>
    </main>
  )
}
