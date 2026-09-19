import { useState, useEffect } from 'react'
import { apiRequest } from '../../services/api'

export default function CrmCustomersView() {
  const [customers, setCustomers] = useState([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [total, setTotal] = useState(0)

  async function loadCustomers(searchQuery = '') {
    setIsLoading(true)
    try {
      const res = await apiRequest(`/employees/crm/customers?search=${encodeURIComponent(searchQuery)}&limit=30`)
      setCustomers(res.customers || [])
      setTotal(res.total || 0)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadCustomers(search) }, [])

  return (
    <section className="manager-view">
      <div className="manager-view-intro">
        <span className="dashboard-kicker">Captación de Leads Comensales</span>
        <h2>Base de Clientes (CRM)</h2>
        <p>Comensales que dejaron sus datos de contacto y opt-in de marketing al calificar en la mesa.</p>
      </div>

      <div className="table-search-bar">
        <input
          type="search"
          placeholder="Buscar por nombre, email o teléfono..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && loadCustomers(search)}
        />
        <button className="primary-action" onClick={() => loadCustomers(search)}>Buscar</button>
      </div>

      <p style={{ fontSize: 12, color: '#7c827b', marginBottom: 10 }}>Total de comensales captados: {total}</p>

      {isLoading ? (
        <p className="empty-state">Cargando base de comensales...</p>
      ) : customers.length ? (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Comensal</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Consentimiento</th>
                <th>Calificaciones</th>
                <th>Registrado</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td><strong>{c.name || 'Anónimo'}</strong></td>
                  <td>{c.email || '—'}</td>
                  <td>{c.phone || '—'}</td>
                  <td>
                    {c.marketingOptIn ? (
                      <span className="badge badge--optin">✓ Marketing Sí</span>
                    ) : (
                      <span className="badge badge--rejected">Opt-Out</span>
                    )}
                  </td>
                  <td>{c.feedbacksCount || 1} veces</td>
                  <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="manager-empty-state">
          <span>👥</span>
          <strong>Sin comensales captados aún</strong>
          <p>Aparecerán aquí a medida que los comensales completen el formulario QR.</p>
        </div>
      )}
    </section>
  )
}
