import { useState, useEffect } from 'react'
import { apiRequest } from '../services/api'
import Modal from '../components/common/Modal'
import ConfirmModal from '../components/common/ConfirmModal'
import Sidebar from '../components/SuperAdmin/Sidebar'
import BusinessCard from '../components/SuperAdmin/BusinessCard'
import BusinessForm from '../components/SuperAdmin/BusinessForm'
import BusinessEditForm from '../components/SuperAdmin/BusinessEditForm'
import BusinessAdmins from '../components/SuperAdmin/BusinessAdmins'

export default function SuperAdmin({ user, onLogout }) {
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
