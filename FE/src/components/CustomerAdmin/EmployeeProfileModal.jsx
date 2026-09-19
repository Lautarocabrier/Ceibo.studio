import Modal from '../common/Modal'

export default function EmployeeProfileModal({ employee, onClose }) {
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
