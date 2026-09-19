import { useState } from 'react'

export default function CollaboratorView({ business, employees, onAdd, onSelect, isLoading }) {
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
