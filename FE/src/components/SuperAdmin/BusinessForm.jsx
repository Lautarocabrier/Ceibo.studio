import { useState } from 'react'

export default function BusinessForm({ onSave, onClose, isSaving }) {
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
