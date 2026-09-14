  import { useState } from 'react'
  import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'

  const API_URL = import.meta.env.VITE_API_URL || '/api'

  function CeiboMark({ light = false, small = false }) {
    return <span className={`brand-mark ${small ? 'brand-mark--small' : ''} ${light ? 'brand-mark--light' : ''}`} aria-hidden="true"><i /><i /><i /><i /></span>
  }

  function Brand({ light = false }) {
    return <div className={`brand ${light ? 'brand--light' : ''}`}><CeiboMark light={light} /><span>ceibo</span></div>
  }

  function Landing() {
    const navigate = useNavigate()
    return (
      <main className="landing-shell">
        <header className="site-header"><Brand /><button className="login-trigger" onClick={() => navigate('/login')}>Ingresar <span aria-hidden="true">↗</span></button></header>
        <section className="landing-content"><div className="eyebrow">Plataforma de gestión · 2026</div><h1>Naturaleza<br /><em>que nos une.</em></h1><p className="landing-copy">Un espacio simple para hacer crecer lo que importa.</p><button className="landing-action" onClick={() => navigate('/login')}>Ingresar a la plataforma <span aria-hidden="true">→</span></button></section>
        <footer className="landing-footer"><span>CEIBO / EXPERIENCIAS QUE CONECTAN</span><span>BUENOS AIRES · ARGENTINA</span></footer><div className="botanical-shape" aria-hidden="true"><span /><span /><span /></div>
      </main>
    )
  }

  function Login({ onLogin }) {
    const navigate = useNavigate()
    const [email, setEmail] = useState('superadmin@ceibo.com')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    async function handleSubmit(event) {
      event.preventDefault()
      setError('')
      setIsLoading(true)
      try {
        if (!password) throw new Error('Ingresá tu contraseña para continuar.')
        if (import.meta.env.VITE_USE_API === 'true') {
          const response = await fetch(`${API_URL}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
          if (!response.ok) throw new Error('El email o la contraseña no son correctos.')
          onLogin((await response.json()).user)
          navigate('/superadmin')
        } else {
          await new Promise((resolve) => setTimeout(resolve, 350))
          onLogin({ name: 'Super Admin', email, role: 'super_admin' })
          navigate('/superadmin')
        }
      } catch (submitError) {
        setError(submitError.message)
      } finally {
        setIsLoading(false)
      }
    }

    return (
      <main className="auth-shell">
        <div className="auth-panel auth-panel--visual"><button className="back-button" onClick={() => navigate('/')} aria-label="Volver al inicio">←</button><div className="auth-visual-content"><Brand light /><div><span className="visual-label">Bienvenido a</span><h1>Un lugar para<br /><em>hacerlo posible.</em></h1></div><span className="visual-caption">CEIBO / 02. GEOMÉTRICA</span></div></div>
        <div className="auth-panel auth-panel--form"><div className="form-wrap"><div className="form-heading"><CeiboMark small /><span className="eyebrow">Acceso privado</span><h2>Ingresar</h2><p>Entrá a tu espacio de trabajo Ceibo.</p></div><form onSubmit={handleSubmit}><label htmlFor="email">Email</label><input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /><label htmlFor="password">Contraseña</label><input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required placeholder="••••••••" />{error && <p className="form-error" role="alert">{error}</p>}<button className="submit-button" type="submit" disabled={isLoading}>{isLoading ? 'Ingresando...' : 'Ingresar'} <span aria-hidden="true">→</span></button></form><p className="form-note">¿Necesitás ayuda? <a href="mailto:hola@ceibo.com">Contactanos</a></p></div></div>
      </main>
    )
  }

  const initialBusinesses = [
    { id: 1, name: 'Negocio ejemplo uno', phone: '3515040000', location: 'Córdoba, Argentina', logo: '', admins: [] },
    { id: 2, name: 'Negocio ejemplo dos', phone: '3215432532', location: 'Buenos Aires, Argentina', logo: '', admins: [] },
  ]

  function BusinessIcon() { return <span className="business-icon" aria-hidden="true">▥</span> }

  function Sidebar({ isOpen, onClose, onLogout }) {
    return <><div className={`sidebar-backdrop ${isOpen ? 'is-visible' : ''}`} onClick={onClose} /><aside className={`admin-sidebar ${isOpen ? 'is-open' : ''}`}><div className="sidebar-top"><div className="sidebar-brand"><span className="sidebar-brand-mark"><CeiboMark small light /></span><div><strong>Panel Super Admin</strong><small>Gestión de negocios</small></div></div><button className="sidebar-close" onClick={onClose} aria-label="Cerrar menú">×</button><nav aria-label="Navegación principal"><span className="nav-item nav-item--active"><BusinessIcon />Negocios</span></nav></div><div className="sidebar-profile"><strong>Administrador Ceibo</strong><span>admin@ceibo.app</span><button className="sidebar-logout" onClick={onLogout}><span aria-hidden="true">↪</span> Cerrar sesión</button></div></aside></>
  }

  function BusinessCard({ business, onEdit, onDelete, onLogo, onAdmin }) {
    return <article className="business-card"><div className="business-card-heading">{business.logo ? <img className="business-logo" src={business.logo} alt="" /> : <BusinessIcon />}<div><h2>{business.name}</h2><span>{business.phone}</span></div></div><div className="business-actions"><button onClick={() => onEdit(business)} aria-label={`Editar ${business.name}`}>♢ <span>Editar</span></button><button onClick={() => onLogo(business)} aria-label={`Cambiar logo de ${business.name}`}>▧ <span>Logo</span></button><button onClick={() => onAdmin(business)} aria-label={`Administrar ${business.name}`}>♙ <span>Admin{business.admins.length ? ` (${business.admins.length})` : ''}</span></button><button className="delete-action" onClick={() => onDelete(business)} aria-label={`Eliminar ${business.name}`}>× <span>Eliminar</span></button></div></article>
  }

  function Modal({ title, children, onClose }) {
    return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><header className="modal-header"><div><span className="eyebrow">Panel Super Admin</span><h2 id="modal-title">{title}</h2></div><button className="modal-close" onClick={onClose} aria-label="Cerrar">×</button></header>{children}</section></div>
  }

  function BusinessForm({ business, onSave, onClose }) {
    const [form, setForm] = useState(business || { name: '', phone: '', location: '', logo: '', admins: [] })
    const setField = (field, value) => setForm((current) => ({ ...current, [field]: value }))
    return <form className="modal-form" onSubmit={(event) => { event.preventDefault(); onSave({ ...form, name: form.name.trim() }) }}><label htmlFor="business-name">Nombre del negocio</label><input id="business-name" value={form.name} onChange={(event) => setField('name', event.target.value)} placeholder="Ej. Estudio Ceibo" required autoFocus /><label htmlFor="business-phone">Teléfono</label><input id="business-phone" value={form.phone} onChange={(event) => setField('phone', event.target.value)} placeholder="Ej. 351 555 0000" required /><label htmlFor="business-location">Ubicación</label><input id="business-location" value={form.location} onChange={(event) => setField('location', event.target.value)} placeholder="Ciudad, país" /><div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancelar</button><button type="submit" className="primary-action">Guardar negocio</button></div></form>
  }

  function AdminForm({ business, onSave, onClose }) {
    const [form, setForm] = useState({ name: '', email: '', password: '' })
    const setField = (field, value) => setForm((current) => ({ ...current, [field]: value }))
    return <form className="modal-form" onSubmit={(event) => { event.preventDefault(); onSave({ ...form, businessId: business.id }); setForm({ name: '', email: '', password: '' }) }}><p className="modal-context">Admins de <strong>{business.name}</strong></p><label htmlFor="admin-name">Nombre completo</label><input id="admin-name" value={form.name} onChange={(event) => setField('name', event.target.value)} placeholder="Ej. María González" required autoFocus /><label htmlFor="admin-email">Gmail</label><input id="admin-email" type="email" value={form.email} onChange={(event) => setField('email', event.target.value)} placeholder="nombre@gmail.com" required /><label htmlFor="admin-password">Contraseña temporal</label><input id="admin-password" type="password" value={form.password} onChange={(event) => setField('password', event.target.value)} placeholder="Mínimo 8 caracteres" minLength="8" required /><div className="admin-list">{business.admins.map((admin) => <div className="admin-list-item" key={admin.email}><span className="admin-avatar">{admin.name.charAt(0).toUpperCase()}</span><div><strong>{admin.name}</strong><small>{admin.email}</small></div></div>)}</div><div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cerrar</button><button type="submit" className="primary-action">Agregar admin</button></div></form>
  }

  function SuperAdmin({ user, onLogout }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [businesses, setBusinesses] = useState(initialBusinesses)
    const [modal, setModal] = useState(null)
    const [logoBusiness, setLogoBusiness] = useState(null)

    function saveBusiness(business) { setBusinesses((current) => business.id ? current.map((item) => item.id === business.id ? business : item) : [...current, { ...business, id: Date.now() }]); setModal(null) }
    function deleteBusiness(business) { if (window.confirm(`¿Eliminar ${business.name}?`)) setBusinesses((current) => current.filter((item) => item.id !== business.id)) }
    function addAdmin(admin) { setBusinesses((current) => current.map((item) => item.id === admin.businessId ? { ...item, admins: [...item.admins, admin] } : item)); setModal((current) => ({ ...current, business: { ...current.business, admins: [...current.business.admins, admin] } })) }
    function changeLogo(event) { const file = event.target.files?.[0]; if (!file) return; const url = URL.createObjectURL(file); setBusinesses((current) => current.map((item) => item.id === logoBusiness.id ? { ...item, logo: url } : item)); setLogoBusiness(null) }

    return <main className="admin-shell admin-dashboard"><Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onLogout={onLogout} /><section className="dashboard-main"><header className="dashboard-header"><button className="menu-trigger" onClick={() => setIsSidebarOpen(true)} aria-label="Abrir menú">☰</button><div><div className="dashboard-kicker">Panel de gestión</div><h1>Negocios</h1><p>Creá nuevos negocios y administrá sus accesos.</p></div><button className="primary-action" onClick={() => setModal({ type: 'business' })}><span aria-hidden="true">+</span> Nuevo negocio</button></header><section className="business-section business-section--first"><div className="section-heading"><div><span className="dashboard-kicker">Tu espacio de trabajo</span><h2>Negocios activos</h2></div><span className="business-count">{businesses.length} activos</span></div><div className="business-grid">{businesses.map((business) => <BusinessCard key={business.id} business={business} onEdit={(item) => setModal({ type: 'business', business: item })} onDelete={deleteBusiness} onLogo={setLogoBusiness} onAdmin={(item) => setModal({ type: 'admin', business: item })} />)}</div></section></section>{modal?.type === 'business' && <Modal title={modal.business ? 'Editar negocio' : 'Nuevo negocio'} onClose={() => setModal(null)}><BusinessForm business={modal.business} onSave={saveBusiness} onClose={() => setModal(null)} /></Modal>}{modal?.type === 'admin' && <Modal title="Administrar accesos" onClose={() => setModal(null)}><AdminForm business={businesses.find((item) => item.id === modal.business.id) || modal.business} onSave={addAdmin} onClose={() => setModal(null)} /></Modal>}{logoBusiness && <Modal title="Logo del negocio" onClose={() => setLogoBusiness(null)}><div className="logo-upload"><div className="logo-preview">{logoBusiness.logo ? <img src={logoBusiness.logo} alt="Vista previa del logo" /> : <BusinessIcon />}</div><p>Subí una imagen pequeña para identificar este negocio.</p><label className="upload-button" htmlFor="business-logo">Elegir imagen</label><input id="business-logo" type="file" accept="image/png,image/jpeg,image/webp" onChange={changeLogo} /></div></Modal>}</main>
  }

  function ProtectedRoute({ user, children }) { return user ? children : <Navigate to="/login" replace /> }

  export default function App() {
    const [user, setUser] = useState(null)
    return <BrowserRouter><Routes><Route path="/" element={<Landing />} /><Route path="/login" element={<Login onLogin={(session) => setUser(session)} />} /><Route path="/superadmin" element={<ProtectedRoute user={user}><SuperAdmin user={user} onLogout={() => setUser(null)} /></ProtectedRoute>} /><Route path="*" element={<Navigate to="/" replace />} /></Routes></BrowserRouter>
  }

