import { useState } from 'react'
import Modal from '../common/Modal'
import ConfirmModal from '../common/ConfirmModal'
import { apiRequest } from '../../services/api'

export default function BusinessAdmins({ business, onClose }) {
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
