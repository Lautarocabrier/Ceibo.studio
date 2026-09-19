import CeiboMark from '../common/CeiboMark'
import BusinessIcon from '../common/BusinessIcon'

export default function Sidebar({ isOpen, onClose, onLogout, user }) {
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
