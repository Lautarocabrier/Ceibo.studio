export default function ClientQrView({ business, locationInfo }) {
  const qrToken = locationInfo?.qrCodes?.[0]?.token || 'qr_palermo_mesa_1'
  const qrUrl = `${window.location.origin}/qr/${qrToken}`

  return (
    <section className="manager-view">
      <div className="manager-view-intro">
        <span className="dashboard-kicker">Experiencia del cliente</span>
        <h2>QR Cliente</h2>
        <p>Punto de acceso para que tus clientes califiquen y reconozcan a tus colaboradores.</p>
      </div>
      <div className="qr-preview-panel qr-preview-panel--client">
        <div className="qr-placeholder">⌗</div>
        <div>
          <span className="card-kicker">Identificador QR</span>
          <h3>{business.name}</h3>
          <p>Token de enlace público: <code>{qrToken}</code></p>
          <a href={qrUrl} target="_blank" rel="noopener noreferrer" className="primary-action" style={{ marginTop: 12, textDecoration: 'none', display: 'inline-flex' }}>
            Ver pantalla del comensal ↗
          </a>
        </div>
      </div>
    </section>
  )
}
