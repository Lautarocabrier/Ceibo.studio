import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useNavigate, useParams, Link } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || '/api'
const TOKEN_KEY = 'ceibo_token'
const FINGERPRINT_KEY = 'ceibo_client_fp'

function getClientFingerprint() {
  let fp = localStorage.getItem(FINGERPRINT_KEY)
  if (!fp) {
    fp = `fp_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`
    localStorage.setItem(FINGERPRINT_KEY, fp)
  }
  return fp
}

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

function CeiboMark({ light = false, small = false }) {
  return (
    <span className={`brand-mark ${small ? 'brand-mark--small' : ''} ${light ? 'brand-mark--light' : ''}`} aria-hidden="true">
      <i /><i /><i /><i />
    </span>
  )
}

function Brand({ light = false }) {
  return (
    <div className={`brand ${light ? 'brand--light' : ''}`}>
      <CeiboMark light={light} />
      <span>ceibo</span>
    </div>
  )
}

function Landing() {
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

function Login({ onLogin }) {
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

function BusinessIcon() { return <span className="business-icon" aria-hidden="true">▥</span> }

function Sidebar({ isOpen, onClose, onLogout, user }) {
  return (
    <>
      <div className={`sidebar-backdrop ${isOpen ? 'is-visible' : ''}`} onClick={onClose} />
      <aside className={`admin-sidebar ${isOpen ? 'is-open' : ''}`}>
        <div className="sidebar-top">
          <div className="sidebar-brand">
            <span className="sidebar-brand-mark"><CeiboMark small light /></span>
            <div>
              <strong>Panel Super Admin</strong>
              <small>Gestión de negocios</small>
            </div>
          </div>
          <button className="sidebar-close" onClick={onClose} aria-label="Cerrar menú">×</button>
          <nav aria-label="Navegación principal">
            <span className="nav-item nav-item--active"><BusinessIcon />Negocios</span>
          </nav>
        </div>
        <div className="sidebar-profile">
          <strong>{user.name}</strong>
          <span>{user.email}</span>
          <button className="sidebar-logout" onClick={onLogout}>
            <span aria-hidden="true">↪</span> Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  )
}

const managerViews = [
  { id: 'dashboard', label: 'Dashboard Manager', icon: '▦' },
  { id: 'collaborators', label: 'Perfil colaborador', icon: '♙' },
  { id: 'audit', label: 'Auditoría Feedbacks', icon: '⚐' },
  { id: 'crm', label: 'Clientes CRM', icon: '👥' },
  { id: 'tableQr', label: 'Cartel QR para Mesas', icon: '▣' },
  { id: 'clientQr', label: 'QR Cliente', icon: '⌗' },
]

function CustomerSidebar({ isOpen, onClose, onLogout, user, activeView, onNavigate }) {
  return (
    <>
      <div className={`sidebar-backdrop ${isOpen ? 'is-visible' : ''}`} onClick={onClose} />
      <aside className={`admin-sidebar customer-sidebar ${isOpen ? 'is-open' : ''}`}>
        <div className="sidebar-top">
          <div className="sidebar-brand">
            <span className="sidebar-brand-mark"><CeiboMark small light /></span>
            <div>
              <strong>Panel de negocio</strong>
              <small>{user.client?.name || user.clientName || 'Mi organización'}</small>
            </div>
          </div>
          <button className="sidebar-close" onClick={onClose} aria-label="Cerrar menú">×</button>
          <nav className="manager-nav" aria-label="Navegación del manager">
            {managerViews.map((view) => (
              <button
                className={`nav-item ${activeView === view.id ? 'nav-item--active' : ''}`}
                key={view.id}
                onClick={() => { onNavigate(view.id); onClose() }}
              >
                <span className="manager-nav-icon" aria-hidden="true">{view.icon}</span>
                {view.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="sidebar-profile">
          <strong>{user.name}</strong>
          <span>{user.email}</span>
          <button className="sidebar-logout" onClick={onLogout}>
            <span aria-hidden="true">↪</span> Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  )
}

function Modal({ title, children, onClose, className = '' }) {
  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className={`modal ${className}`} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <header className="modal-header">
          <div>
            <span className="eyebrow">Ceibo Studio</span>
            <h2 id="modal-title">{title}</h2>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Cerrar">×</button>
        </header>
        {children}
      </section>
    </div>
  )
}

function BusinessForm({ onSave, onClose, isSaving }) {
  const [form, setForm] = useState({ name: '', phone: '', contactName: '', email: '', password: '' })
  const setField = (field, value) => setForm((current) => ({ ...current, [field]: value }))
  return (
    <form className="modal-form" onSubmit={(event) => { event.preventDefault(); onSave(form) }}>
      <p className="modal-context">Completá los datos del negocio y sus credenciales de acceso inicial.</p>
      <label htmlFor="business-name">Nombre del negocio</label>
      <input id="business-name" value={form.name} onChange={(event) => setField('name', event.target.value)} placeholder="Ej. Café Martínez Palermo" required autoFocus />
      <label htmlFor="business-contact">Nombre del Encargado</label>
      <input id="business-contact" value={form.contactName} onChange={(event) => setField('contactName', event.target.value)} placeholder="Ej. Lucía Fernández" required />
      <label htmlFor="business-email">Email de acceso</label>
      <input id="business-email" type="email" value={form.email} onChange={(event) => setField('email', event.target.value)} placeholder="manager@cafemartinez.com" required />
      <label htmlFor="business-password">Contraseña asignada</label>
      <input id="business-password" type="password" value={form.password} onChange={(event) => setField('password', event.target.value)} placeholder="Mínimo 6 caracteres" minLength="6" required />
      <label htmlFor="business-phone">Teléfono <span className="optional-label">Opcional</span></label>
      <input id="business-phone" value={form.phone} onChange={(event) => setField('phone', event.target.value)} placeholder="Ej. +54 11 4777-8899" />
      <div className="modal-actions">
        <button type="button" className="secondary-button" onClick={onClose}>Cancelar</button>
        <button type="submit" className="primary-action" disabled={isSaving}>{isSaving ? 'Creando...' : 'Crear negocio'}</button>
      </div>
    </form>
  )
}

function BusinessEditForm({ business, onSave, onClose, isSaving }) {
  const [form, setForm] = useState({ name: business.name || '', phone: business.phone || '', contactName: business.contactName || '' })
  const setField = (field, value) => setForm((current) => ({ ...current, [field]: value }))
  return (
    <form className="modal-form" onSubmit={(event) => { event.preventDefault(); onSave(business.id, form) }}>
      <label htmlFor="edit-business-name">Nombre del negocio</label>
      <input id="edit-business-name" value={form.name} onChange={(event) => setField('name', event.target.value)} required autoFocus />
      <label htmlFor="edit-business-contact">Encargado de contacto</label>
      <input id="edit-business-contact" value={form.contactName} onChange={(event) => setField('contactName', event.target.value)} placeholder="Nombre del encargado" />
      <label htmlFor="edit-business-phone">Teléfono</label>
      <input id="edit-business-phone" value={form.phone} onChange={(event) => setField('phone', event.target.value)} placeholder="Ej. +54 11 4777-8899" />
      <div className="modal-actions">
        <button type="button" className="secondary-button" onClick={onClose}>Cancelar</button>
        <button type="submit" className="primary-action" disabled={isSaving}>{isSaving ? 'Guardando...' : 'Guardar cambios'}</button>
      </div>
    </form>
  )
}

function ConfirmModal({ title, message, confirmLabel, onConfirm, onClose, isProcessing = false }) {
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

function BusinessCard({ business, onEdit, onLogo, onAdmins, onStatusChange, onDelete, isUpdating }) {
  const isActive = business.status === 'active'
  return (
    <article className={`business-card ${!isActive ? 'business-card--inactive' : ''}`}>
      <button className="business-delete-button" onClick={() => onDelete(business)} aria-label={`Eliminar negocio ${business.name}`} title="Eliminar negocio">×</button>
      <div className="business-card-heading">
        <BusinessIcon />
        <div>
          <h2>{business.name}</h2>
          <span>{business.phone || business.email || 'Sin contacto'}</span>
        </div>
      </div>
      <div className="business-actions">
        <button onClick={() => onEdit(business)} title="Editar negocio" aria-label={`Editar ${business.name}`}>♢ <span>Editar</span></button>
        <button onClick={() => onLogo(business)} title="Logo del negocio" aria-label={`Logo de ${business.name}`}>▧ <span>Logo</span></button>
        <button onClick={() => onAdmins(business)} title="Administrar accesos" aria-label={`Administrar ${business.name}`}>♙ <span>Admin</span></button>
        <button className={isActive ? 'deactivate-action' : 'activate-action'} onClick={() => onStatusChange(business)} disabled={isUpdating} title={isActive ? 'Desactivar negocio' : 'Activar negocio'}>
          {isActive ? '×' : '✓'} <span>{isActive ? 'Desactivar' : 'Activar'}</span>
        </button>
      </div>
    </article>
  )
}

function BusinessAdmins({ business, onClose }) {
  const [admins, setAdmins] = useState(business.users || [])
  const [form, setForm] = useState({ email: '', password: '', name: '' })
  const [isAdding, setIsAdding] = useState(false)
  const [message, setMessage] = useState('')
  const [adminToDelete, setAdminToDelete] = useState(null)
  const [visiblePasswords, setVisiblePasswords] = useState({})

  function updateField(field, value) { setForm((current) => ({ ...current, [field]: value })) }

  async function addAdmin(event) {
    event.preventDefault()
    setIsAdding(true); setMessage('')
    try {
      const payload = await apiRequest(`/clients/${business.id}/users`, { method: 'POST', body: JSON.stringify(form) })
      setAdmins((current) => [...current, { ...payload.user, password: form.password }])
      setForm({ email: '', password: '', name: '' })
      setMessage('Administrador agregado correctamente.')
    } catch (error) {
      setMessage(error.message)
    } finally {
      setIsAdding(false)
    }
  }

  async function removeAdmin() {
    try {
      await apiRequest(`/clients/${business.id}/users/${adminToDelete.id}`, { method: 'DELETE' })
      setAdmins((current) => current.filter((admin) => admin.id !== adminToDelete.id))
      setAdminToDelete(null)
      setMessage('Administrador eliminado correctamente.')
    } catch (error) {
      setMessage(error.message)
    }
  }

  return (
    <>
      <Modal title="Administrar accesos" onClose={onClose}>
        <p className="modal-context">Usuarios con acceso a <strong>{business.name}</strong>.</p>
        <form className="admin-create-form" onSubmit={addAdmin}>
          <label htmlFor="new-admin-email">Email del administrador</label>
          <input id="new-admin-email" type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} placeholder="nombre@gmail.com" required autoFocus />
          <label htmlFor="new-admin-password">Contraseña</label>
          <input id="new-admin-password" type="password" value={form.password} onChange={(event) => updateField('password', event.target.value)} placeholder="Mínimo 6 caracteres" minLength="6" required />
          <label htmlFor="new-admin-name">Nombre / Cargo <span className="optional-label">Opcional</span></label>
          <input id="new-admin-name" type="text" value={form.name} onChange={(event) => updateField('name', event.target.value)} placeholder="Ej. Encargado de Turno" />
          <button type="submit" className="primary-action admin-add-button" disabled={isAdding}>
            {isAdding ? 'Agregando...' : 'Agregar administrador'}
          </button>
        </form>
        {message && <p className="admin-success" role="status">{message}</p>}
        <div className="admin-list-heading">Administradores actuales ({admins.length})</div>
        {admins.length ? (
          <div className="admin-list">
            {admins.map((admin) => {
              const passwordIsVisible = visiblePasswords[admin.id || admin.email]
              return (
                <div className="admin-list-item" key={admin.id || admin.email}>
                  <span className="admin-avatar">{admin.name?.charAt(0).toUpperCase() || 'A'}</span>
                  <div className="admin-identity">
                    <strong>{admin.name || admin.email}</strong>
                    <small>{admin.email}</small>
                    <small className="admin-password">Contraseña: {admin.password ? (passwordIsVisible ? admin.password : '••••••••') : 'Encriptada'}</small>
                  </div>
                  {admin.password && (
                    <button className="admin-reveal-button" type="button" onClick={() => setVisiblePasswords((current) => ({ ...current, [admin.id || admin.email]: !passwordIsVisible }))}>
                      {passwordIsVisible ? '◉' : '◌'}
                    </button>
                  )}
                  <button className="admin-delete-button" type="button" onClick={() => setAdminToDelete(admin)} aria-label={`Eliminar administrador ${admin.email}`}>×</button>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="empty-state">Todavía no hay administradores asignados.</p>
        )}
        <div className="modal-actions">
          <button type="button" className="primary-action" onClick={onClose}>Cerrar</button>
        </div>
      </Modal>
      {adminToDelete && (
        <ConfirmModal
          title="¿Eliminar administrador?"
          message={`Se quitará el acceso de ${adminToDelete.email} a este negocio.`}
          confirmLabel="Eliminar acceso"
          onConfirm={removeAdmin}
          onClose={() => setAdminToDelete(null)}
        />
      )}
    </>
  )
}

function SuperAdmin({ user, onLogout }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [businesses, setBusinesses] = useState([])
  const [modal, setModal] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [updatingId, setUpdatingId] = useState(null)
  const [error, setError] = useState('')
  const [businessToToggle, setBusinessToToggle] = useState(null)
  const [businessToDelete, setBusinessToDelete] = useState(null)

  async function loadBusinesses() {
    setIsLoading(true); setError('')
    try {
      const payload = await apiRequest('/clients?status=all')
      setBusinesses(payload.clients || [])
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadBusinesses() }, [])

  async function createBusiness(form) {
    setIsSaving(true); setError('')
    try {
      await apiRequest('/clients', { method: 'POST', body: JSON.stringify(form) })
      setModal(null)
      await loadBusinesses()
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setIsSaving(false)
    }
  }

  async function editBusiness(id, form) {
    setIsSaving(true); setError('')
    try {
      await apiRequest(`/clients/${id}`, { method: 'PATCH', body: JSON.stringify(form) })
      setModal(null)
      await loadBusinesses()
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setIsSaving(false)
    }
  }

  async function deleteBusiness(id) {
    setIsSaving(true); setError('')
    try {
      await apiRequest(`/clients/${id}`, { method: 'DELETE' })
      setBusinessToDelete(null)
      await loadBusinesses()
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  async function changeStatus(business) {
    const nextStatus = business.status === 'active' ? 'inactive' : 'active'
    setUpdatingId(business.id); setError('')
    try {
      await apiRequest(`/clients/${business.id}/status`, { method: 'PATCH', body: JSON.stringify({ status: nextStatus }) })
      await loadBusinesses()
    } catch (statusError) {
      setError(statusError.message)
    } finally {
      setUpdatingId(null)
    }
  }

  const activeCount = businesses.filter((business) => business.status === 'active').length

  return (
    <main className="admin-shell admin-dashboard">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onLogout={onLogout} user={user} />
      <section className="dashboard-main">
        <header className="dashboard-header">
          <button className="menu-trigger" onClick={() => setIsSidebarOpen(true)} aria-label="Abrir menú">☰</button>
          <div>
            <div className="dashboard-kicker">Panel de gestión</div>
            <h1>Negocios</h1>
            <p>Creá nuevos negocios y administrá sus accesos.</p>
          </div>
          <button className="primary-action" onClick={() => { setError(''); setModal('create') }}>
            <span aria-hidden="true">+</span> Nuevo negocio
          </button>
        </header>
        <section className="business-section business-section--first">
          <div className="section-heading">
            <div>
              <span className="dashboard-kicker">Tu espacio de trabajo</span>
              <h2>Negocios</h2>
            </div>
            <span className="business-count">{activeCount} activos</span>
          </div>
          {error && <p className="form-error" role="alert">{error}</p>}
          {isLoading ? (
            <p className="empty-state">Cargando negocios...</p>
          ) : businesses.length ? (
            <div className="business-grid">
              {businesses.map((business) => (
                <BusinessCard
                  key={business.id}
                  business={business}
                  onEdit={(item) => setModal({ type: 'edit', business: item })}
                  onLogo={() => alert(`Logo de ${business.name}: Función visual activa`)}
                  onAdmins={(item) => setModal({ type: 'admins', business: item })}
                  onStatusChange={(item) => setBusinessToToggle(item)}
                  onDelete={(item) => setBusinessToDelete(item)}
                  isUpdating={updatingId === business.id}
                />
              ))}
            </div>
          ) : (
            <p className="empty-state">No hay negocios todavía.</p>
          )}
        </section>
      </section>

      {modal === 'create' && (
        <Modal title="Nuevo negocio" onClose={() => setModal(null)}>
          <BusinessForm onSave={createBusiness} onClose={() => setModal(null)} isSaving={isSaving} />
        </Modal>
      )}

      {modal?.type === 'edit' && (
        <Modal title="Editar negocio" onClose={() => setModal(null)}>
          <BusinessEditForm business={modal.business} onSave={editBusiness} onClose={() => setModal(null)} isSaving={isSaving} />
        </Modal>
      )}

      {modal?.type === 'admins' && (
        <BusinessAdmins business={modal.business} onClose={() => setModal(null)} />
      )}

      {businessToToggle && (
        <ConfirmModal
          title={businessToToggle.status === 'active' ? '¿Desactivar negocio?' : '¿Activar negocio?'}
          message={businessToToggle.status === 'active' ? 'El acceso quedará pausado para sus administradores.' : 'El negocio volverá a estar disponible para sus administradores.'}
          confirmLabel={businessToToggle.status === 'active' ? 'Desactivar' : 'Activar'}
          onConfirm={() => {
            const item = businessToToggle
            setBusinessToToggle(null)
            changeStatus(item)
          }}
          onClose={() => setBusinessToToggle(null)}
        />
      )}

      {businessToDelete && (
        <ConfirmModal
          title="¿Eliminar negocio permanentemente?"
          message={`Se eliminará ${businessToDelete.name} de la base de datos con todas sus sucursales y datos asociados.`}
          confirmLabel="Eliminar negocio"
          isProcessing={isSaving}
          onConfirm={() => deleteBusiness(businessToDelete.id)}
          onClose={() => setBusinessToDelete(null)}
        />
      )}
    </main>
  )
}

function CustomerAdmin({ user, onLogout }) {
  const navigate = useNavigate()
  const { view } = useParams()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [employees, setEmployees] = useState([])
  const [locationInfo, setLocationInfo] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedProfileEmployee, setSelectedProfileEmployee] = useState(null)
  const [viewEmployeeId, setViewEmployeeId] = useState('')

  const activeView = managerViews.some((item) => item.id === view) ? view : 'dashboard'
  const business = user.client || { name: user.clientName || 'Café Martínez Palermo', status: 'active' }
  const activeViewData = managerViews.find((v) => v.id === activeView)

  async function loadData() {
    setIsLoading(true); setError('')
    try {
      const res = await apiRequest('/employees')
      setEmployees(res.employees || [])
      if (res.location) setLocationInfo(res.location)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  async function handleAddEmployee(employeeData) {
    try {
      await apiRequest('/employees', {
        method: 'POST',
        body: JSON.stringify({
          ...employeeData,
          locationId: locationInfo?.id || undefined,
        }),
      })
      await loadData()
    } catch (err) {
      alert(`Error al agregar colaborador: ${err.message}`)
    }
  }

  async function handleSelectEmployee(employeeId) {
    try {
      const res = await apiRequest(`/employees/${employeeId}/profile`)
      setSelectedProfileEmployee(res.employee)
    } catch (err) {
      alert(`Error al consultar perfil: ${err.message}`)
    }
  }

  return (
    <main className="admin-shell admin-dashboard">
      <CustomerSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={onLogout}
        user={user}
        activeView={activeView}
        onNavigate={(nextView) => navigate(`/customer/${nextView}`)}
      />
      <section className="dashboard-main customer-dashboard">
        <header className="dashboard-header">
          <button className="menu-trigger" onClick={() => setIsSidebarOpen(true)} aria-label="Abrir menú">☰</button>
          <div>
            <div className="dashboard-kicker">Panel de negocio</div>
            <h1>{activeViewData.label}</h1>
            <p>{business.name} · {locationInfo?.name || 'Sucursal Principal'} · {user.email}</p>
          </div>
          <div className="manager-header-actions">
            <label htmlFor="view-employee">Ver como</label>
            <select id="view-employee" value={viewEmployeeId} onChange={(e) => setViewEmployeeId(e.target.value)}>
              <option value="">Manager</option>
              {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
            </select>
            <span className="status-badge status-badge--active">Activo</span>
          </div>
        </header>

        {error && <p className="form-error" style={{ marginTop: 20 }}>{error}</p>}

        {activeView === 'dashboard' && (
          <CustomerDashboardView
            business={{ ...business, employees }}
            user={user}
            locationInfo={locationInfo}
            isLoading={isLoading}
          />
        )}

        {activeView === 'collaborators' && (
          <CollaboratorView
            business={business}
            employees={employees}
            onAdd={handleAddEmployee}
            onSelect={handleSelectEmployee}
            isLoading={isLoading}
          />
        )}

        {activeView === 'audit' && (
          <AuditFeedbacksView organizationId={user.organizationId || user.clientId} />
        )}

        {activeView === 'crm' && (
          <CrmCustomersView organizationId={user.organizationId || user.clientId} />
        )}

        {activeView === 'tableQr' && (
          <TableQrView business={business} locationInfo={locationInfo} />
        )}

        {activeView === 'clientQr' && (
          <ClientQrView business={business} locationInfo={locationInfo} />
        )}
      </section>

      {selectedProfileEmployee && (
        <EmployeeProfileModal
          employee={selectedProfileEmployee}
          onClose={() => setSelectedProfileEmployee(null)}
        />
      )}
    </main>
  )
}

function EmployeeProfileModal({ employee, onClose }) {
  return (
    <Modal title={`Perfil: ${employee.name}`} onClose={onClose} className="emp-profile-modal">
      <div style={{ textAlign: 'center', marginBottom: 15 }}>
        <span className="employee-avatar" style={{ width: 60, height: 60, fontSize: 24, margin: '0 auto 10px' }}>
          {employee.avatarUrl ? <img src={employee.avatarUrl} alt="" /> : employee.name?.charAt(0).toUpperCase()}
        </span>
        <h3 style={{ margin: 0 }}>{employee.name}</h3>
        <p style={{ color: '#7c827b', fontSize: 13, margin: '4px 0' }}>{employee.position} · {employee.location?.name}</p>
        <span className="badge badge--approved" style={{ marginTop: 4 }}>{employee.status}</span>
      </div>

      <div className="profile-stats-grid">
        <div className="profile-stat-box">
          <span>Puntos Confirmados</span>
          <strong style={{ color: '#2e7d32' }}>{employee.points?.confirmed || 0} pts</strong>
        </div>
        <div className="profile-stat-box">
          <span>Puntos Pendientes</span>
          <strong style={{ color: '#e65100' }}>{employee.points?.pending || 0} pts</strong>
        </div>
      </div>

      <div className="admin-list-heading">Reconocimientos recientes ({employee.recentRecognitions?.length || 0})</div>
      {employee.recentRecognitions?.length ? (
        <div className="recognitions-list">
          {employee.recentRecognitions.map((rec) => (
            <div className="recognition-row" key={rec.id}>
              <div>
                <strong>★ {rec.category}</strong>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: '#59615b' }}>{rec.message}</p>
              </div>
              <small>{new Date(rec.createdAt).toLocaleDateString()}</small>
            </div>
          ))}
        </div>
      ) : (
        <p className="empty-state" style={{ padding: '15px 0' }}>Sin reconocimientos aún.</p>
      )}

      <div className="modal-actions" style={{ marginTop: 20 }}>
        <button type="button" className="primary-action" onClick={onClose}>Cerrar</button>
      </div>
    </Modal>
  )
}

function CustomerDashboardView({ business, user, locationInfo, isLoading }) {
  const employees = business.employees || []
  const activeEmployees = employees.filter((emp) => emp.status !== 'inactive').length
  const totalPoints = employees.reduce((acc, curr) => acc + (curr.totalPoints || 0), 0)
  const totalRecognitions = employees.reduce((acc, curr) => acc + (curr.recognitionCount || 0), 0)
  const totalFeedbacks = employees.reduce((acc, curr) => acc + (curr.feedbackCount || 0), 0)

  return (
    <section className="manager-dashboard-content">
      <div className="manager-greeting">
        <div>
          <span className="dashboard-kicker">{business.name}</span>
          <h2>Tu equipo está haciendo la diferencia.</h2>
          <p>Mirá la evidencia de desempeño, reconocé el trabajo y acompañá su crecimiento.</p>
        </div>
      </div>
      <div className="manager-metrics">
        <article>
          <span>Puntos Acumulados</span>
          <strong>{totalPoints}<small>pts</small></strong>
          <p>Acreditados por calificaciones verificadas.</p>
        </article>
        <article>
          <span>Reconocimientos</span>
          <strong>{totalRecognitions}<small>otorgados</small></strong>
          <p>Insignias "Customer Hero" ganadas.</p>
        </article>
        <article>
          <span>Equipo en servicio</span>
          <strong>{activeEmployees}<small>{activeEmployees === 1 ? ' colaborador' : ' colaboradores'}</small></strong>
          <p>Activos en {locationInfo?.name || 'la sucursal'}.</p>
        </article>
        <article>
          <span>Feedbacks recibidos</span>
          <strong>{totalFeedbacks}<small>respuestas</small></strong>
          <p>Calificaciones registradas por QR.</p>
        </article>
      </div>

      <div className="manager-insight">
        <span className="manager-insight-icon">♧</span>
        <div>
          <strong>Información de Desempeño</strong>
          <p>Los comensales reconocen consistentemente la Amabilidad y Rapidez del salón en esta sucursal.</p>
        </div>
      </div>

      <div className="manager-dashboard-grid">
        <section className="employees-panel">
          <div className="manager-panel-heading">
            <div>
              <h3>Colaboradores destacados</h3>
              <p>Métricas consolidadas en tiempo real.</p>
            </div>
            <span>{employees.length}</span>
          </div>
          {isLoading ? (
            <p className="empty-state">Cargando equipo...</p>
          ) : employees.length ? (
            <div className="employee-list">
              {employees.map((employee, index) => (
                <article className="employee-row" key={employee.id}>
                  <span className="employee-rank">#{index + 1}</span>
                  <span className="employee-avatar">
                    {employee.avatarUrl ? <img src={employee.avatarUrl} alt="" /> : employee.name?.charAt(0).toUpperCase()}
                  </span>
                  <div className="employee-main">
                    <strong>{employee.name}</strong>
                    <small>{employee.position || 'Colaborador'}</small>
                  </div>
                  <div className="employee-score">
                    <strong>{employee.totalPoints || 0}<small> pts</small></strong>
                    <span>{employee.recognitionCount || 0} reconocimientos</span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="manager-empty-state">
              <span>♙</span>
              <strong>Todavía no hay colaboradores</strong>
              <p>Cargá colaboradores desde "Perfil colaborador" para comenzar.</p>
            </div>
          )}
        </section>

        <section className="evidence-panel">
          <div className="manager-panel-heading">
            <div>
              <h3>Acceso Rápido al Salón</h3>
              <p>Código QR público activo.</p>
            </div>
          </div>
          <div className="evidence-item" style={{ textAlign: 'center', padding: 25 }}>
            <span style={{ fontSize: 36 }}>▣</span>
            <h4 style={{ margin: '12px 0 6px' }}>{locationInfo?.qrCodes?.[0]?.label || 'Mesa 1'}</h4>
            <p style={{ fontSize: 13, color: '#69706b', margin: '0 0 15px' }}>
              Token: <code>{locationInfo?.qrCodes?.[0]?.token || 'qr_palermo_mesa_1'}</code>
            </p>
            <Link
              to={`/qr/${locationInfo?.qrCodes?.[0]?.token || 'qr_palermo_mesa_1'}`}
              className="primary-action"
              style={{ display: 'inline-flex', justifyContent: 'center' }}
            >
              Probar encuesta pública <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      </div>
    </section>
  )
}

function CollaboratorView({ business, employees, onAdd, onSelect, isLoading }) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [form, setForm] = useState({ name: '', position: '', email: '', phone: '' })
  const setField = (field, value) => setForm((current) => ({ ...current, [field]: value }))

  async function handleSubmit(event) {
    event.preventDefault()
    await onAdd(form)
    setForm({ name: '', position: '', email: '', phone: '' })
    setIsFormOpen(false)
  }

  return (
    <section className="manager-view collaborator-view">
      <div className="manager-view-intro collaborator-heading">
        <div>
          <span className="dashboard-kicker">Equipo del negocio</span>
          <h2>Perfil colaborador</h2>
          <p>Cargá las personas de {business.name} y hacé clic sobre cualquiera para auditar su perfil y puntos.</p>
        </div>
        <button className="primary-action" onClick={() => setIsFormOpen((current) => !current)}>
          <span aria-hidden="true">+</span> Agregar persona
        </button>
      </div>

      {isFormOpen && (
        <form className="employee-form" onSubmit={handleSubmit}>
          <div className="employee-photo-field">
            <div className="employee-photo-preview">
              <span>♙</span>
            </div>
          </div>
          <div className="employee-form-fields">
            <label htmlFor="employee-name">Nombre completo</label>
            <input id="employee-name" value={form.name} onChange={(e) => setField('name', e.target.value)} placeholder="Ej. Camila Torres" required autoFocus />
            <label htmlFor="employee-position">Puesto</label>
            <input id="employee-position" value={form.position} onChange={(e) => setField('position', e.target.value)} placeholder="Ej. Barista" required />
            <label htmlFor="employee-email">Email <span className="optional-label">Opcional</span></label>
            <input id="employee-email" type="email" value={form.email} onChange={(e) => setField('email', e.target.value)} placeholder="camila@cafemartinez.com" />
            <label htmlFor="employee-phone">Teléfono <span className="optional-label">Opcional</span></label>
            <input id="employee-phone" value={form.phone} onChange={(e) => setField('phone', e.target.value)} placeholder="Ej. +54 11 5555-6666" />
            <div className="modal-actions">
              <button type="button" className="secondary-button" onClick={() => setIsFormOpen(false)}>Cancelar</button>
              <button type="submit" className="primary-action">Guardar persona</button>
            </div>
          </div>
        </form>
      )}

      <div className="collaborator-list-heading">
        <div>
          <h3>Personas cargadas</h3>
          <p>{employees.length} colaboradores activos en esta sucursal. <strong>Clic para ver perfil completo y puntos.</strong></p>
        </div>
      </div>

      {isLoading ? (
        <p className="empty-state">Cargando colaboradores...</p>
      ) : employees.length ? (
        <div className="collaborator-list">
          {employees.map((employee) => (
            <button className="collaborator-row" key={employee.id} onClick={() => onSelect(employee.id)}>
              <span className="employee-avatar">
                {employee.avatarUrl ? <img src={employee.avatarUrl} alt="" /> : employee.name?.charAt(0).toUpperCase()}
              </span>
              <span className="collaborator-identity">
                <strong>{employee.name}</strong>
                <small>{employee.position} · {employee.totalPoints || 0} pts acumulados</small>
              </span>
              <div className="points-badge-wrap">
                <span className="points-pill points-pill--confirmed">{employee.totalPoints || 0} pts</span>
                <span className="employee-arrow">›</span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="manager-empty-state">
          <span>♙</span>
          <strong>Todavía no hay colaboradores</strong>
          <p>Agregá el primer colaborador para empezar a registrar desempeño.</p>
        </div>
      )}
    </section>
  )
}

function AuditFeedbacksView({ organizationId }) {
  const [feedbacks, setFeedbacks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('flagged')
  const [processingId, setProcessingId] = useState(null)
  const [message, setMessage] = useState('')

  async function loadFeedbacks() {
    setIsLoading(true); setMessage('')
    try {
      const res = await apiRequest(`/employees/audit/feedbacks?status=${filter}&limit=20`)
      setFeedbacks(res.feedbacks || [])
    } catch (err) {
      setMessage(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadFeedbacks() }, [filter])

  async function handleReview(feedbackId, action) {
    setProcessingId(feedbackId)
    try {
      await apiRequest(`/employees/audit/feedbacks/${feedbackId}/review`, {
        method: 'POST',
        body: JSON.stringify({ action }),
      })
      await loadFeedbacks()
    } catch (err) {
      alert(`Error al auditar feedback: ${err.message}`)
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <section className="manager-view">
      <div className="manager-view-intro">
        <span className="dashboard-kicker">Control de Integridad y Anti-Abuso</span>
        <h2>Bandeja de Auditoría de Feedbacks</h2>
        <p>Revisá las calificaciones marcadas por ráfagas de tiempo o correos temporales para confirmar o revocar puntos y reconocimientos.</p>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 15 }}>
        <button
          className={`secondary-button ${filter === 'flagged' ? 'primary-action' : ''}`}
          style={{ height: 34, padding: '0 15px' }}
          onClick={() => setFilter('flagged')}
        >
          Marcados para revisión
        </button>
        <button
          className={`secondary-button ${filter === 'approved' ? 'primary-action' : ''}`}
          style={{ height: 34, padding: '0 15px' }}
          onClick={() => setFilter('approved')}
        >
          Aprobados
        </button>
        <button
          className={`secondary-button ${filter === 'rejected' ? 'primary-action' : ''}`}
          style={{ height: 34, padding: '0 15px' }}
          onClick={() => setFilter('rejected')}
        >
          Rechazados
        </button>
      </div>

      {message && <p className="form-error">{message}</p>}

      {isLoading ? (
        <p className="empty-state">Cargando bandeja de auditoría...</p>
      ) : feedbacks.length ? (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Colaborador</th>
                <th>Rating</th>
                <th>Comentario</th>
                <th>Alerta Anti-Abuso</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {feedbacks.map((fb) => (
                <tr key={fb.id}>
                  <td>{new Date(fb.createdAt).toLocaleString()}</td>
                  <td><strong>{fb.employee?.name || 'General / Local'}</strong></td>
                  <td>{'★'.repeat(fb.rating)} ({fb.rating}/5)</td>
                  <td>{fb.comment || '—'}</td>
                  <td>
                    {fb.flagReason ? (
                      <span className="badge badge--flagged">{fb.flagReason}</span>
                    ) : (
                      <span className="badge badge--approved">Limpio</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge badge--${fb.status}`}>{fb.status}</span>
                  </td>
                  <td>
                    {fb.status === 'flagged' ? (
                      <div className="audit-actions">
                        <button
                          className="approve-btn"
                          disabled={processingId === fb.id}
                          onClick={() => handleReview(fb.id, 'approve')}
                        >
                          Aprobar
                        </button>
                        <button
                          className="reject-btn"
                          disabled={processingId === fb.id}
                          onClick={() => handleReview(fb.id, 'reject')}
                        >
                          Rechazar
                        </button>
                      </div>
                    ) : (
                      <small style={{ color: '#7c827b' }}>Auditado</small>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="manager-empty-state">
          <span>✓</span>
          <strong>No hay feedbacks en esta bandeja</strong>
          <p>No se registran calificaciones con estado "{filter}".</p>
        </div>
      )}
    </section>
  )
}

function CrmCustomersView() {
  const [customers, setCustomers] = useState([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [total, setTotal] = useState(0)

  async function loadCustomers(searchQuery = '') {
    setIsLoading(true)
    try {
      const res = await apiRequest(`/employees/crm/customers?search=${encodeURIComponent(searchQuery)}&limit=30`)
      setCustomers(res.customers || [])
      setTotal(res.total || 0)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadCustomers(search) }, [])

  return (
    <section className="manager-view">
      <div className="manager-view-intro">
        <span className="dashboard-kicker">Captación de Leads Comensales</span>
        <h2>Base de Clientes (CRM)</h2>
        <p>Comensales que dejaron sus datos de contacto y opt-in de marketing al calificar en la mesa.</p>
      </div>

      <div className="table-search-bar">
        <input
          type="search"
          placeholder="Buscar por nombre, email o teléfono..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && loadCustomers(search)}
        />
        <button className="primary-action" onClick={() => loadCustomers(search)}>Buscar</button>
      </div>

      <p style={{ fontSize: 12, color: '#7c827b', marginBottom: 10 }}>Total de comensales captados: {total}</p>

      {isLoading ? (
        <p className="empty-state">Cargando base de comensales...</p>
      ) : customers.length ? (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Comensal</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Consentimiento</th>
                <th>Calificaciones</th>
                <th>Registrado</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td><strong>{c.name || 'Anónimo'}</strong></td>
                  <td>{c.email || '—'}</td>
                  <td>{c.phone || '—'}</td>
                  <td>
                    {c.marketingOptIn ? (
                      <span className="badge badge--optin">✓ Marketing Sí</span>
                    ) : (
                      <span className="badge badge--rejected">Opt-Out</span>
                    )}
                  </td>
                  <td>{c.feedbacksCount || 1} veces</td>
                  <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="manager-empty-state">
          <span>👥</span>
          <strong>Sin comensales captados aún</strong>
          <p>Aparecerán aquí a medida que los comensales completen el formulario QR.</p>
        </div>
      )}
    </section>
  )
}

function TableQrView({ business, locationInfo }) {
  const qrToken = locationInfo?.qrCodes?.[0]?.token || 'qr_palermo_mesa_1'
  const qrUrl = `${window.location.origin}/qr/${qrToken}`
  const [copied, setCopied] = useState(false)

  function copyToClipboard() {
    navigator.clipboard.writeText(qrUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="manager-view">
      <div className="manager-view-intro">
        <span className="dashboard-kicker">Material para tu local</span>
        <h2>Cartel QR para Mesas</h2>
        <p>Código QR activo para {business.name} — {locationInfo?.name || 'Palermo Soho'}.</p>
      </div>
      <div className="qr-preview-panel">
        <div className="qr-placeholder">▦</div>
        <div style={{ flex: 1 }}>
          <span className="card-kicker">Mesa 1 · Activo</span>
          <h3>{locationInfo?.name || 'Palermo Soho'}</h3>
          <p style={{ margin: '8px 0 14px' }}>
            Enlace directo para escanear en la mesa:<br />
            <code style={{ background: '#eee8dc', padding: '4px 8px', borderRadius: 6, fontSize: 12, wordBreak: 'break-all' }}>
              {qrUrl}
            </code>
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="primary-action" onClick={copyToClipboard}>
              {copied ? '✓ Copiado al portapapeles' : 'Copiar enlace'}
            </button>
            <a href={qrUrl} target="_blank" rel="noopener noreferrer" className="primary-action" style={{ background: '#c54d2d', textDecoration: 'none' }}>
              Abrir encuesta en nueva pestaña ↗
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

function ClientQrView({ business, locationInfo }) {
  const qrToken = locationInfo?.qrCodes?.[0]?.token || 'qr_palermo_mesa_1'
  const qrUrl = `${window.location.origin}/qr/${qrToken}`

  return (
    <section className="manager-view">
      <div className="manager-view-intro">
        <span className="dashboard-kicker">Experiencia del cliente</span>
        <h2>QR Cliente</h2>
        <p>Punto de acceso para que tus clientes califiquen y reconozcan a tus colaboradores.</p>
      </div>
      <div className="qr-preview-panel qr-preview-panel--client">
        <div className="qr-placeholder">⌗</div>
        <div>
          <span className="card-kicker">Identificador QR</span>
          <h3>{business.name}</h3>
          <p>Token de enlace público: <code>{qrToken}</code></p>
          <a href={qrUrl} target="_blank" rel="noopener noreferrer" className="primary-action" style={{ marginTop: 12, textDecoration: 'none', display: 'inline-flex' }}>
            Ver pantalla del comensal ↗
          </a>
        </div>
      </div>
    </section>
  )
}

// ----------------------------------------------------
// VISTA PÚBLICA DEL COMENSAL (ESCANEO DE QR EN LA MESA)
// ----------------------------------------------------
function PublicFeedbackView() {
  const { token } = useParams()
  const [qrData, setQrData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [rating, setRating] = useState(5)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('')
  const [selectedDimensions, setSelectedDimensions] = useState([])
  const [comment, setComment] = useState('')
  const [customer, setCustomer] = useState({ name: '', email: '', phone: '', marketingOptIn: true })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedResult, setSubmittedResult] = useState(null)

  useEffect(() => {
    async function loadQr() {
      setIsLoading(true); setError('')
      try {
        const payload = await apiRequest(`/public/qr/${token}`)
        setQrData(payload)
        // Por defecto, seleccionar el primer colaborador si hay
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
      <div className="feedback-shell">
        <div className="feedback-card feedback-success-card">
          <span className="success-icon">✓</span>
          <h2>¡Muchas gracias por tu opinión!</h2>
          <p style={{ color: '#59615b', margin: '12px 0 20px' }}>
            {submittedResult.message || 'Tu feedback ayuda a reconocer el talento y dedicación de nuestro equipo.'}
          </p>
          {submittedResult.pointsAwarded > 0 && (
            <div style={{ background: '#f5e2d9', borderRadius: 10, padding: 12, marginBottom: 20 }}>
              <strong style={{ color: '#c54d2d', fontSize: 14 }}>
                + {submittedResult.pointsAwarded} puntos acreditados a tu colaborador
              </strong>
            </div>
          )}
          <button className="primary-action" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setSubmittedResult(null)}>
            Enviar otra opinión
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="feedback-shell">
      <div className="feedback-card">
        <div className="feedback-header">
          <Brand />
          <span className="eyebrow" style={{ marginTop: 12, display: 'block' }}>
            {qrData.organization?.name} · {qrData.location?.name}
          </span>
          <h1>¿Cómo fue tu experiencia?</h1>
          <p>{qrData.qr?.label || 'Mesa'} · Tu opinión premia a quienes te atienden</p>
        </div>

        {error && <p className="form-error" style={{ textAlign: 'center' }}>{error}</p>}

        <form onSubmit={handleSubmit}>
          {/* Estrellas */}
          <div className="stars-selector">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                className={`star-btn ${star <= rating ? 'is-active' : ''}`}
                onClick={() => setRating(star)}
              >
                ★
              </button>
            ))}
          </div>
          <p style={{ textAlign: 'center', fontSize: 12, color: '#c54d2d', fontWeight: 600, margin: '-10px 0 20px' }}>
            {rating === 5 ? '¡Excelente servicio!' : rating === 4 ? 'Muy buena atención' : rating === 3 ? 'Regular' : 'A mejorar'}
          </p>

          {/* Selector de colaborador */}
          <label style={{ marginBottom: 8 }}>¿Quién te atendió?</label>
          <div className="collaborator-chips">
            {qrData.employees?.map((emp) => (
              <button
                type="button"
                key={emp.id}
                className={`collab-chip ${selectedEmployeeId === emp.id ? 'is-selected' : ''}`}
                onClick={() => setSelectedEmployeeId(emp.id)}
              >
                👤 {emp.name} ({emp.position})
              </button>
            ))}
            <button
              type="button"
              className={`collab-chip ${selectedEmployeeId === '' ? 'is-selected' : ''}`}
              onClick={() => setSelectedEmployeeId('')}
            >
              No recuerdo / Todo el equipo
            </button>
          </div>

          {/* Dimensiones */}
          {qrData.dimensions?.length > 0 && (
            <>
              <label style={{ marginBottom: 8 }}>¿Qué destacarías?</label>
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
            </>
          )}

          {/* Comentario */}
          <label htmlFor="feedback-comment">Comentario o felicitación</label>
          <textarea
            id="feedback-comment"
            className="feedback-textarea"
            placeholder="Escribí unas palabras para tu camarero o el local..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          {/* Club de beneficios (Lead Capture) */}
          <div className="lead-box">
            <h4>Club de Comensales · Beneficios</h4>
            <p>Dejá tu contacto para recibir promociones y regalos en tu próxima visita.</p>
            <input
              type="text"
              placeholder="Tu nombre (opcional)"
              value={customer.name}
              onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
            />
            <input
              type="email"
              placeholder="Tu email (opcional)"
              value={customer.email}
              onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
            />
            <input
              type="tel"
              placeholder="Tu teléfono (opcional)"
              value={customer.phone}
              onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
            />
            <label className="optin">
              <input
                type="checkbox"
                checked={customer.marketingOptIn}
                onChange={(e) => setCustomer({ ...customer, marketingOptIn: e.target.checked })}
              />
              Acepto recibir novedades y beneficios de {qrData.organization?.name}
            </label>
          </div>

          <button type="submit" className="submit-button" disabled={isSubmitting}>
            {isSubmitting ? 'Enviando...' : 'Enviar calificación'} <span aria-hidden="true">→</span>
          </button>
        </form>
      </div>
    </div>
  )
}

function ProtectedRoute({ user, children }) {
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  const [user, setUser] = useState(null)
  const [isRestoring, setIsRestoring] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      setIsRestoring(false)
      return
    }
    apiRequest('/auth/me')
      .then((payload) => setUser(payload.user))
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setIsRestoring(false))
  }, [])

  function logout() {
    localStorage.removeItem(TOKEN_KEY)
    setUser(null)
  }

  if (isRestoring) return <div className="loading-screen">Cargando sesión...</div>

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login onLogin={setUser} />} />
        <Route
          path="/superadmin"
          element={
            <ProtectedRoute user={user?.role === 'SUPERADMIN' ? user : null}>
              <SuperAdmin user={user} onLogout={logout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer"
          element={
            <ProtectedRoute user={user?.role === 'CUSTOMER' ? user : null}>
              <CustomerAdmin user={user} onLogout={logout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/:view"
          element={
            <ProtectedRoute user={user?.role === 'CUSTOMER' ? user : null}>
              <CustomerAdmin user={user} onLogout={logout} />
            </ProtectedRoute>
          }
        />
        <Route path="/qr/:token" element={<PublicFeedbackView />} />
        <Route
          path="*"
          element={<Navigate to={user ? (user.role === 'SUPERADMIN' ? '/superadmin' : '/customer') : '/'} replace />}
        />
      </Routes>
    </BrowserRouter>
  )
}
