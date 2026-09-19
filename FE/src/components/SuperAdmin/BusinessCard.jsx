import BusinessIcon from '../common/BusinessIcon'

export default function BusinessCard({ business, onEdit, onLogo, onAdmins, onStatusChange, onDelete, isUpdating }) {
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
