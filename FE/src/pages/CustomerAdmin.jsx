import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { apiRequest } from '../services/api'
import CustomerSidebar, { managerViews } from '../components/CustomerAdmin/CustomerSidebar'
import CustomerDashboardView from '../components/CustomerAdmin/CustomerDashboardView'
import CollaboratorView from '../components/CustomerAdmin/CollaboratorView'
import EmployeeProfileModal from '../components/CustomerAdmin/EmployeeProfileModal'
import AuditFeedbacksView from '../components/CustomerAdmin/AuditFeedbacksView'
import CrmCustomersView from '../components/CustomerAdmin/CrmCustomersView'
import TableQrView from '../components/CustomerAdmin/TableQrView'
import ClientQrView from '../components/CustomerAdmin/ClientQrView'

export default function CustomerAdmin({ user, onLogout }) {
  const navigate = useNavigate()
  const { view } = useParams()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [employees, setEmployees] = useState([])
  const [locationInfo, setLocationInfo] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedProfileEmployee, setSelectedProfileEmployee] = useState(null)
  const [viewEmployeeId, setViewEmployeeId] = useState('')

  const activeView = managerViews.some((item) => item.id === view) ? view : 'dashboard'
  const business = user.client || { name: user.clientName || 'Café Martínez Palermo', status: 'active' }
  const activeViewData = managerViews.find((v) => v.id === activeView)

  async function loadData() {
    setIsLoading(true); setError('')
    try {
      const res = await apiRequest('/employees')
      setEmployees(res.employees || [])
      if (res.location) setLocationInfo(res.location)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  async function handleAddEmployee(employeeData) {
    try {
      await apiRequest('/employees', {
        method: 'POST',
        body: JSON.stringify({
          ...employeeData,
          locationId: locationInfo?.id || undefined,
        }),
      })
      await loadData()
    } catch (err) {
      alert(`Error al agregar colaborador: ${err.message}`)
    }
  }

  async function handleSelectEmployee(employeeId) {
    try {
      const res = await apiRequest(`/employees/${employeeId}/profile`)
      setSelectedProfileEmployee(res.employee)
    } catch (err) {
      alert(`Error al consultar perfil: ${err.message}`)
    }
  }

  return (
    <main className="admin-shell admin-dashboard">
      <CustomerSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={onLogout}
        user={user}
        activeView={activeView}
        onNavigate={(nextView) => navigate(`/customer/${nextView}`)}
      />
      <section className="dashboard-main customer-dashboard">
        <header className="dashboard-header">
          <button className="menu-trigger" onClick={() => setIsSidebarOpen(true)} aria-label="Abrir menú">☰</button>
          <div>
            <div className="dashboard-kicker">Panel de negocio</div>
            <h1>{activeViewData.label}</h1>
            <p>{business.name} · {locationInfo?.name || 'Sucursal Principal'} · {user.email}</p>
          </div>
          <div className="manager-header-actions">
            <label htmlFor="view-employee">Ver como</label>
            <select id="view-employee" value={viewEmployeeId} onChange={(e) => setViewEmployeeId(e.target.value)}>
              <option value="">Manager</option>
              {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
            </select>
            <span className="status-badge status-badge--active">Activo</span>
          </div>
        </header>

        {error && <p className="form-error" style={{ marginTop: 20 }}>{error}</p>}

        {activeView === 'dashboard' && (
          <CustomerDashboardView
            business={{ ...business, employees }}
            user={user}
            locationInfo={locationInfo}
            isLoading={isLoading}
          />
        )}

        {activeView === 'collaborators' && (
          <CollaboratorView
            business={business}
            employees={employees}
            onAdd={handleAddEmployee}
            onSelect={handleSelectEmployee}
            isLoading={isLoading}
          />
        )}

        {activeView === 'audit' && (
          <AuditFeedbacksView organizationId={user.organizationId || user.clientId} />
        )}

        {activeView === 'crm' && (
          <CrmCustomersView organizationId={user.organizationId || user.clientId} />
        )}

        {activeView === 'tableQr' && (
          <TableQrView business={business} locationInfo={locationInfo} />
        )}

        {activeView === 'clientQr' && (
          <ClientQrView business={business} locationInfo={locationInfo} />
        )}
      </section>

      {selectedProfileEmployee && (
        <EmployeeProfileModal
          employee={selectedProfileEmployee}
          onClose={() => setSelectedProfileEmployee(null)}
        />
      )}
    </main>
  )
}
