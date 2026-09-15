import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || '/api'
const TOKEN_KEY = 'ceibo_token'

async function apiRequest(path, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY)
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload.message || 'No se pudo completar la solicitud.')
  return payload
}

function CeiboMark({ light = false, small = false }) { return <span className={`brand-mark ${small ? 'brand-mark--small' : ''} ${light ? 'brand-mark--light' : ''}`} aria-hidden="true"><i /><i /><i /><i /></span> }
function Brand({ light = false }) { return <div className={`brand ${light ? 'brand--light' : ''}`}><CeiboMark light={light} /><span>ceibo</span></div> }

function Landing() {
  const navigate = useNavigate()
  return <main className="landing-shell"><header className="site-header"><Brand /><button className="login-trigger" onClick={() => navigate('/login')}>Ingresar <span aria-hidden="true">↗</span></button></header><section className="landing-content"><div className="eyebrow">Plataforma de gestión · 2026</div><h1>Naturaleza<br /><em>que nos une.</em></h1><p className="landing-copy">Un espacio simple para hacer crecer lo que importa.</p><button className="landing-action" onClick={() => navigate('/login')}>Ingresar a la plataforma <span aria-hidden="true">→</span></button></section><footer className="landing-footer"><span>CEIBO / EXPERIENCIAS QUE CONECTAN</span><span>BUENOS AIRES · ARGENTINA</span></footer><div className="botanical-shape" aria-hidden="true"><span /><span /><span /></div></main>
}

function Login({ onLogin }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('admin@ceibo.studio')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault(); setError(''); setIsLoading(true)
    try {
      const payload = await apiRequest('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
      localStorage.setItem(TOKEN_KEY, payload.token)
      onLogin(payload.user)
      navigate(payload.redirectTo || '/superadmin', { replace: true })
    } catch (submitError) { setError(submitError.message) } finally { setIsLoading(false) }
  }

  return <main className="auth-shell"><div className="auth-panel auth-panel--visual"><button className="back-button" onClick={() => navigate('/')} aria-label="Volver al inicio">←</button><div className="auth-visual-content"><Brand light /><div><span className="visual-label">Bienvenido a</span><h1>Un lugar para<br /><em>hacerlo posible.</em></h1></div><span className="visual-caption">CEIBO / 02. GEOMÉTRICA</span></div></div><div className="auth-panel auth-panel--form"><div className="form-wrap"><div className="form-heading"><CeiboMark small /><span className="eyebrow">Acceso privado</span><h2>Ingresar</h2><p>Entrá a tu espacio de trabajo Ceibo.</p></div><form onSubmit={handleSubmit}><label htmlFor="email">Email</label><input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /><label htmlFor="password">Contraseña</label><input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required placeholder="••••••••" />{error && <p className="form-error" role="alert">{error}</p>}<button className="submit-button" type="submit" disabled={isLoading}>{isLoading ? 'Ingresando...' : 'Ingresar'} <span aria-hidden="true">→</span></button></form><p className="form-note">¿Necesitás ayuda? <a href="mailto:hola@ceibo.com">Contactanos</a></p></div></div></main>
}

function BusinessIcon() { return <span className="business-icon" aria-hidden="true">▥</span> }

function Sidebar({ isOpen, onClose, onLogout, user }) {
  return <><div className={`sidebar-backdrop ${isOpen ? 'is-visible' : ''}`} onClick={onClose} /><aside className={`admin-sidebar ${isOpen ? 'is-open' : ''}`}><div className="sidebar-top"><div className="sidebar-brand"><span className="sidebar-brand-mark"><CeiboMark small light /></span><div><strong>Panel Super Admin</strong><small>Gestión de negocios</small></div></div><button className="sidebar-close" onClick={onClose} aria-label="Cerrar menú">×</button><nav aria-label="Navegación principal"><span className="nav-item nav-item--active"><BusinessIcon />Negocios</span></nav></div><div className="sidebar-profile"><strong>{user.name}</strong><span>{user.email}</span><button className="sidebar-logout" onClick={onLogout}><span aria-hidden="true">↪</span> Cerrar sesión</button></div></aside></>
}

function CustomerSidebar({ isOpen, onClose, onLogout, user }) {
  return <><div className={`sidebar-backdrop ${isOpen ? 'is-visible' : ''}`} onClick={onClose} /><aside className={`admin-sidebar customer-sidebar ${isOpen ? 'is-open' : ''}`}><div className="sidebar-top"><div className="sidebar-brand"><span className="sidebar-brand-mark"><CeiboMark small light /></span><div><strong>Panel de negocio</strong><small>{user.client?.name || user.clientName || 'Mi organización'}</small></div></div><button className="sidebar-close" onClick={onClose} aria-label="Cerrar menú">×</button><nav aria-label="Navegación principal"><span className="nav-item nav-item--active"><BusinessIcon />Resumen</span></nav></div><div className="sidebar-profile"><strong>{user.name}</strong><span>{user.email}</span><button className="sidebar-logout" onClick={onLogout}><span aria-hidden="true">↪</span> Cerrar sesión</button></div></aside></>
}

function Modal({ title, children, onClose }) { return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><header className="modal-header"><div><span className="eyebrow">Panel Super Admin</span><h2 id="modal-title">{title}</h2></div><button className="modal-close" onClick={onClose} aria-label="Cerrar">×</button></header>{children}</section></div> }

function BusinessForm({ onSave, onClose, isSaving }) {
  const [form, setForm] = useState({ name: '', location: '', phone: '' })
  const setField = (field, value) => setForm((current) => ({ ...current, [field]: value }))
  return <form className="modal-form" onSubmit={(event) => { event.preventDefault(); onSave(form) }}><p className="modal-context">Completá los datos básicos del negocio. Los accesos se configuran después desde <strong>Admin</strong>.</p><label htmlFor="business-name">Nombre del negocio</label><input id="business-name" value={form.name} onChange={(event) => setField('name', event.target.value)} placeholder="Ej. Estudio Ceibo" required autoFocus /><label htmlFor="business-location">Ubicación <span className="optional-label">Opcional</span></label><input id="business-location" value={form.location} onChange={(event) => setField('location', event.target.value)} placeholder="Ciudad, país" /><label htmlFor="business-phone">Teléfono <span className="optional-label">Opcional</span></label><input id="business-phone" value={form.phone} onChange={(event) => setField('phone', event.target.value)} placeholder="Ej. 351 555 0000" /><div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancelar</button><button type="submit" className="primary-action" disabled={isSaving}>{isSaving ? 'Creando...' : 'Crear negocio'}</button></div></form>
}

function BusinessEditForm({ business, onSave, onClose }) {
  const [form, setForm] = useState({ name: business.name || '', location: business.location || '', phone: business.phone || '' })
  const setField = (field, value) => setForm((current) => ({ ...current, [field]: value }))
  return <form className="modal-form" onSubmit={(event) => { event.preventDefault(); onSave({ ...business, ...form }) }}><label htmlFor="edit-business-name">Nombre del negocio</label><input id="edit-business-name" value={form.name} onChange={(event) => setField('name', event.target.value)} required autoFocus /><label htmlFor="edit-business-location">Ubicación</label><input id="edit-business-location" value={form.location} onChange={(event) => setField('location', event.target.value)} placeholder="Ciudad, país" /><label htmlFor="edit-business-phone">Teléfono</label><input id="edit-business-phone" value={form.phone} onChange={(event) => setField('phone', event.target.value)} placeholder="Ej. 351 555 0000" /><div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancelar</button><button type="submit" className="primary-action">Guardar cambios</button></div></form>
}

function ConfirmModal({ title, message, confirmLabel, onConfirm, onClose }) {
  return <div className="confirm-backdrop" role="presentation"><section className="confirm-card" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title"><span className="confirm-icon" aria-hidden="true">!</span><h2 id="confirm-title">{title}</h2><p>{message}</p><div className="confirm-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancelar</button><button type="button" className="danger-button" onClick={onConfirm}>{confirmLabel}</button></div></section></div>
}

function BusinessCard({ business, onEdit, onLogo, onAdmins, onStatusChange, onDelete, isUpdating }) {
  const isActive = business.status === 'active'
  return <article className={`business-card ${!isActive ? 'business-card--inactive' : ''}`}><button className="business-delete-button" onClick={() => onDelete(business)} aria-label={`Eliminar negocio ${business.name}`} title="Eliminar negocio">×</button><div className="business-card-heading"><BusinessIcon /><div><h2>{business.name}</h2><span>{business.phone || 'Sin teléfono'}</span></div></div><div className="business-actions"><button onClick={() => onEdit(business)} title="Editar negocio" aria-label={`Editar ${business.name}`}>♢ <span>Editar</span></button><button onClick={() => onLogo(business)} title="Cambiar logo" aria-label={`Cambiar logo de ${business.name}`}>▧ <span>Logo</span></button><button onClick={() => onAdmins(business)} title="Administrar accesos" aria-label={`Administrar ${business.name}`}>♙ <span>Admin</span></button><button className={isActive ? 'deactivate-action' : 'activate-action'} onClick={() => onStatusChange(business)} disabled={isUpdating} title={isActive ? 'Desactivar negocio' : 'Activar negocio'} aria-label={`${isActive ? 'Desactivar' : 'Activar'} ${business.name}`}>{isActive ? '×' : '✓'} <span>{isActive ? 'Desactivar' : 'Activar'}</span></button></div></article>
}

function BusinessLogo({ business, onSave, onClose }) {
  const [preview, setPreview] = useState('')
  function handleFile(event) {
    const file = event.target.files?.[0]
    if (file) setPreview(URL.createObjectURL(file))
  }
  return <Modal title="Logo del negocio" onClose={onClose}><div className="logo-upload"><div className="logo-preview">{preview ? <img src={preview} alt="Vista previa del logo" /> : <BusinessIcon />}</div><p>Subí una imagen pequeña para identificar {business.name}.</p><label className="upload-button" htmlFor="business-logo">Elegir imagen</label><input id="business-logo" type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFile} /><div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancelar</button><button type="button" className="primary-action" disabled={!preview} onClick={() => onSave(preview)}>Guardar logo</button></div></div></Modal>
}

function BusinessAdmins({ business, onClose }) {
  const [admins, setAdmins] = useState(business.users || [])
  const [form, setForm] = useState({ email: '', password: '' })
  const [isAdding, setIsAdding] = useState(false)
  const [message, setMessage] = useState('')
  const [adminToDelete, setAdminToDelete] = useState(null)
  const [visiblePasswords, setVisiblePasswords] = useState({})

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function createAdmin(clientId, values) {
    const payload = await apiRequest(`/clients/${clientId}/users`, { method: 'POST', body: JSON.stringify(values) })
    return payload.user
  }

  async function removeAdminRequest(clientId, userId) {
    await apiRequest(`/clients/${clientId}/users/${userId}`, { method: 'DELETE' })
  }

  async function addAdmin(event) {
    event.preventDefault()
    setIsAdding(true)
    setMessage('')
    try {
      const createdUser = await createAdmin(business.id, form)
      setAdmins((current) => [...current, { ...createdUser, password: form.password }])
      setForm({ email: '', password: '' })
      setMessage('Administrador agregado correctamente.')
    } catch (error) {
      setMessage(error.message)
    } finally {
      setIsAdding(false)
    }
  }

  async function removeAdmin() {
    try {
      await removeAdminRequest(business.id, adminToDelete.id)
      setAdmins((current) => current.filter((admin) => admin.id !== adminToDelete.id && admin.email !== adminToDelete.email))
      setAdminToDelete(null)
      setMessage('Administrador eliminado correctamente.')
    } catch (error) {
      setMessage(error.message)
    }
  }

  return <><Modal title="Administrar accesos" onClose={onClose}><p className="modal-context">Usuarios con acceso a <strong>{business.name}</strong>.</p><form className="admin-create-form" onSubmit={addAdmin}><label htmlFor="new-admin-email">Gmail del administrador</label><input id="new-admin-email" type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} placeholder="nombre@gmail.com" required autoFocus /><label htmlFor="new-admin-password">Contraseña</label><input id="new-admin-password" type="password" value={form.password} onChange={(event) => updateField('password', event.target.value)} placeholder="Mínimo 6 caracteres" minLength="6" required /><button type="submit" className="primary-action admin-add-button" disabled={isAdding}>{isAdding ? 'Agregando...' : 'Agregar administrador'}</button></form>{message && <p className="admin-success" role="status">{message}</p>}<div className="admin-list-heading">Administradores actuales</div>{admins.length ? <div className="admin-list">{admins.map((admin) => { const passwordIsVisible = visiblePasswords[admin.id || admin.email]; return <div className="admin-list-item" key={admin.id || admin.email}><span className="admin-avatar">{admin.name?.charAt(0).toUpperCase() || 'A'}</span><div className="admin-identity"><strong>{admin.name}</strong><small>{admin.email}</small><small className="admin-password">Contraseña: {admin.password ? (passwordIsVisible ? admin.password : '••••••••') : 'No disponible'}</small></div>{admin.password && <button className="admin-reveal-button" type="button" onClick={() => setVisiblePasswords((current) => ({ ...current, [admin.id || admin.email]: !passwordIsVisible }))} aria-label={passwordIsVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}>{passwordIsVisible ? '◉' : '◌'}</button>}<button className="admin-delete-button" type="button" onClick={() => setAdminToDelete(admin)} aria-label={`Eliminar administrador ${admin.email}`}>×</button></div> })}</div> : <p className="empty-state">Todavía no hay administradores asignados.</p>}<div className="modal-actions"><button type="button" className="primary-action" onClick={onClose}>Cerrar</button></div></Modal>{adminToDelete && <ConfirmModal title="¿Eliminar administrador?" message={`Se quitará el acceso de ${adminToDelete.email} a este negocio.`} confirmLabel="Eliminar acceso" onConfirm={removeAdmin} onClose={() => setAdminToDelete(null)} />}</>
}

function SuperAdmin({ user, onLogout }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [businesses, setBusinesses] = useState([])
  const [status] = useState('all')
  const [modal, setModal] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [updatingId, setUpdatingId] = useState(null)
  const [error, setError] = useState('')
  const [logoBusiness, setLogoBusiness] = useState(null)
  const [businessToToggle, setBusinessToToggle] = useState(null)
  const [businessToDelete, setBusinessToDelete] = useState(null)

  async function loadBusinesses() {
    setIsLoading(true); setError('')
    try { const payload = await apiRequest(`/clients?status=${status}`); setBusinesses(payload.clients || []) } catch (loadError) { setError(loadError.message) } finally { setIsLoading(false) }
  }

  useEffect(() => { loadBusinesses() }, [status])

  async function createBusiness(form) {
    setIsSaving(true); setError('')
    try { await apiRequest('/clients', { method: 'POST', body: JSON.stringify(form) }); setModal(null); await loadBusinesses() } catch (saveError) { setError(saveError.message) } finally { setIsSaving(false) }
  }

  async function createAdmin(clientId, form) {
    const payload = await apiRequest(`/clients/${clientId}/users`, { method: 'POST', body: JSON.stringify(form) })
    return payload.user
  }

  async function deleteAdmin(clientId, userId) {
    await apiRequest(`/clients/${clientId}/users/${userId}`, { method: 'DELETE' })
  }

  async function changeStatus(business) {
    const nextStatus = business.status === 'active' ? 'inactive' : 'active'
    setUpdatingId(business.id); setError('')
    try { await apiRequest(`/clients/${business.id}/status`, { method: 'PATCH', body: JSON.stringify({ status: nextStatus }) }); await loadBusinesses() } catch (statusError) { setError(statusError.message) } finally { setUpdatingId(null) }
  }

  const activeCount = businesses.filter((business) => business.status === 'active').length

  return <main className="admin-shell admin-dashboard"><Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onLogout={onLogout} user={user} /><section className="dashboard-main"><header className="dashboard-header"><button className="menu-trigger" onClick={() => setIsSidebarOpen(true)} aria-label="Abrir menú">☰</button><div><div className="dashboard-kicker">Panel de gestión</div><h1>Negocios</h1><p>Creá nuevos negocios y administrá sus accesos.</p></div><button className="primary-action" onClick={() => { setError(''); setModal('create') }}><span aria-hidden="true">+</span> Nuevo negocio</button></header><section className="business-section business-section--first"><div className="section-heading"><div><span className="dashboard-kicker">Tu espacio de trabajo</span><h2>Negocios</h2></div><span className="business-count">{activeCount} activos</span></div>{error && <p className="form-error" role="alert">{error}</p>}{isLoading ? <p className="empty-state">Cargando negocios...</p> : businesses.length ? <div className="business-grid">{businesses.map((business) => <BusinessCard key={business.id} business={business} onEdit={(item) => setModal({ type: 'edit', business: item })} onLogo={(item) => setLogoBusiness(item)} onAdmins={(item) => setModal({ type: 'admins', business: item })} onStatusChange={(item) => setBusinessToToggle(item)} onDelete={(item) => setBusinessToDelete(item)} isUpdating={updatingId === business.id} />)}</div> : <p className="empty-state">No hay negocios todavía.</p>}</section></section>{modal === 'create' && <Modal title="Nuevo negocio" onClose={() => setModal(null)}><BusinessForm onSave={createBusiness} onClose={() => setModal(null)} isSaving={isSaving} /></Modal>}{modal?.type === 'edit' && <Modal title="Editar negocio" onClose={() => setModal(null)}><BusinessEditForm business={modal.business} onSave={(updatedBusiness) => { setBusinesses((current) => current.map((item) => item.id === updatedBusiness.id ? updatedBusiness : item)); setModal(null) }} onClose={() => setModal(null)} /></Modal>}{modal?.type === 'admins' && <BusinessAdmins business={modal.business} onClose={() => setModal(null)} />}{logoBusiness && <BusinessLogo business={logoBusiness} onSave={() => setLogoBusiness(null)} onClose={() => setLogoBusiness(null)} />}{businessToToggle && <ConfirmModal title={businessToToggle.status === 'active' ? '¿Desactivar negocio?' : '¿Activar negocio?'} message={`${businessToToggle.status === 'active' ? 'El acceso quedará pausado para sus administradores.' : 'El negocio volverá a estar disponible para sus administradores.'}`} confirmLabel={businessToToggle.status === 'active' ? 'Desactivar' : 'Activar'} onConfirm={() => { const item = businessToToggle; setBusinessToToggle(null); changeStatus(item) }} onClose={() => setBusinessToToggle(null)} />}{businessToDelete && <ConfirmModal title="¿Eliminar negocio?" message={`Se eliminará ${businessToDelete.name} y se quitará su acceso del panel.`} confirmLabel="Eliminar negocio" onConfirm={() => { setBusinesses((current) => current.filter((item) => item.id !== businessToDelete.id)); setBusinessToDelete(null) }} onClose={() => setBusinessToDelete(null)} />}</main>
}

function CustomerAdmin({ user, onLogout }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const business = user.client || { name: user.clientName || 'Mi negocio', status: 'active' }
  return <main className="admin-shell admin-dashboard"><CustomerSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onLogout={onLogout} user={user} /><section className="dashboard-main customer-dashboard"><header className="dashboard-header"><button className="menu-trigger" onClick={() => setIsSidebarOpen(true)} aria-label="Abrir menú">☰</button><div><div className="dashboard-kicker">Panel de gestión</div><h1>{business.name}</h1><p>Administrá la información y el acceso de tu negocio.</p></div><span className="status-badge status-badge--active">Activo</span></header><section className="business-section customer-section"><div className="section-heading"><div><span className="dashboard-kicker">Tu espacio de trabajo</span><h2>Resumen del negocio</h2></div></div><div className="customer-overview"><div className="customer-overview-mark"><BusinessIcon /></div><div><span className="card-kicker">Cuenta administradora</span><h2>{user.name}</h2><p>{user.email}</p></div></div><div className="customer-details"><div><span>Negocio</span><strong>{business.name}</strong></div><div><span>Teléfono</span><strong>{business.phone || 'Sin teléfono registrado'}</strong></div><div><span>Estado de cuenta</span><strong>Activo</strong></div></div></section></section></main> }
function ProtectedRoute({ user, children }) { return user ? children : <Navigate to="/login" replace /> }

export default function App() {
  const [user, setUser] = useState(null)
  const [isRestoring, setIsRestoring] = useState(true)
  useEffect(() => { if (!localStorage.getItem(TOKEN_KEY)) { setIsRestoring(false); return } apiRequest('/auth/me').then((payload) => setUser(payload.user)).catch(() => localStorage.removeItem(TOKEN_KEY)).finally(() => setIsRestoring(false)) }, [])
  function logout() { localStorage.removeItem(TOKEN_KEY); setUser(null) }
  if (isRestoring) return <div className="loading-screen">Cargando sesión...</div>
  return <BrowserRouter><Routes><Route path="/" element={<Landing />} /><Route path="/login" element={<Login onLogin={setUser} />} /><Route path="/superadmin" element={<ProtectedRoute user={user?.role === 'SUPERADMIN' ? user : null}><SuperAdmin user={user} onLogout={logout} /></ProtectedRoute>} /><Route path="/customer" element={<ProtectedRoute user={user?.role === 'CUSTOMER' ? user : null}><CustomerAdmin user={user} onLogout={logout} /></ProtectedRoute>} /><Route path="*" element={<Navigate to={user ? (user.role === 'SUPERADMIN' ? '/superadmin' : '/customer') : '/'} replace />} /></Routes></BrowserRouter>
}
