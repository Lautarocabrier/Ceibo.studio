export default function StepEmployee({
  qrData,
  filteredEmployees,
  selectedEmployeeId,
  setSelectedEmployeeId,
  searchQuery,
  setSearchQuery,
  onBack,
  onNext,
}) {
  return (
    <div>
      <div className="feedback-header" style={{ marginBottom: 14 }}>
        <h1>¿Quién te atendió?</h1>
        <p>Elegí al colaborador de tu mesa para reconocer su labor</p>
      </div>

      {/* Buscador reactivo si hay más de 3 empleados */}
      {qrData.employees?.length > 3 && (
        <div className="collab-search-wrap">
          <input
            type="text"
            placeholder="Buscar por nombre o puesto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="collab-search-input"
          />
        </div>
      )}

      {/* Lista vertical con deslizador */}
      <div className="collab-vertical-list">
        {/* Opción atención general */}
        <button
          type="button"
          className={`collab-card-row ${selectedEmployeeId === '' ? 'is-selected' : ''}`}
          onClick={() => setSelectedEmployeeId('')}
        >
          <div className="collab-avatar-fallback" style={{ background: '#e4f0e6', color: '#3f7650' }}>
            👥
          </div>
          <div className="collab-info">
            <strong>Atención general</strong>
            <small>Todo el equipo / No recuerdo la persona</small>
          </div>
          <div className="collab-radio">
            <div className="collab-radio-dot" />
          </div>
        </button>

        {filteredEmployees.map((emp) => (
          <button
            type="button"
            key={emp.id}
            className={`collab-card-row ${selectedEmployeeId === emp.id ? 'is-selected' : ''}`}
            onClick={() => setSelectedEmployeeId(emp.id)}
          >
            {emp.avatarUrl ? (
              <>
                <img
                  src={emp.avatarUrl}
                  alt={emp.name}
                  className="collab-avatar"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    if (e.target.nextElementSibling) {
                      e.target.nextElementSibling.style.display = 'flex'
                    }
                  }}
                />
                <div className="collab-avatar-fallback" style={{ display: 'none' }}>
                  {emp.name.charAt(0).toUpperCase()}
                </div>
              </>
            ) : (
              <div className="collab-avatar-fallback">
                {emp.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="collab-info">
              <strong>{emp.name}</strong>
              <small>{emp.position || 'Colaborador'}</small>
            </div>
            <div className="collab-radio">
              <div className="collab-radio-dot" />
            </div>
          </button>
        ))}

        {filteredEmployees.length === 0 && (
          <p style={{ textAlign: 'center', color: '#79807a', fontSize: 12, padding: 12 }}>
            No se encontraron colaboradores con esa búsqueda.
          </p>
        )}
      </div>

      <div className="step-actions">
        <button
          type="button"
          className="ghost-back-btn"
          onClick={onBack}
        >
          ← Volver
        </button>
        <button
          type="button"
          className="submit-button"
          onClick={onNext}
        >
          Siguiente <span>→</span>
        </button>
      </div>
    </div>
  )
}
