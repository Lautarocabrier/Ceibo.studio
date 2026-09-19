import { Link } from 'react-router-dom'

export default function CustomerDashboardView({ business, user, locationInfo, isLoading }) {
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
