import { useState } from 'react'

export default function BusinessEditForm({ business, onSave, onClose, isSaving }) {
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
