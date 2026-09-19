import CeiboMark from '../common/CeiboMark'

export const managerViews = [
  { id: 'dashboard', label: 'Dashboard Manager', icon: '▦' },
  { id: 'collaborators', label: 'Perfil colaborador', icon: '♙' },
  { id: 'audit', label: 'Auditoría Feedbacks', icon: '⚐' },
  { id: 'crm', label: 'Clientes CRM', icon: '👥' },
  { id: 'tableQr', label: 'Cartel QR para Mesas', icon: '▣' },
  { id: 'clientQr', label: 'QR Cliente', icon: '⌗' },
]

export default function CustomerSidebar({ isOpen, onClose, onLogout, user, activeView, onNavigate }) {
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
