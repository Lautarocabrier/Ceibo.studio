import { useState } from 'react'

export default function TableQrView({ business, locationInfo }) {
  const qrToken = locationInfo?.qrCodes?.[0]?.token || 'qr_palermo_mesa_1'
  const qrUrl = `${window.location.origin}/qr/${qrToken}`
  const [copied, setCopied] = useState(false)

  function copyToClipboard() {
    navigator.clipboard.writeText(qrUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="manager-view">
      <div className="manager-view-intro">
        <span className="dashboard-kicker">Material para tu local</span>
        <h2>Cartel QR para Mesas</h2>
        <p>Código QR activo para {business.name} — {locationInfo?.name || 'Palermo Soho'}.</p>
      </div>
      <div className="qr-preview-panel">
        <div className="qr-placeholder">▦</div>
        <div style={{ flex: 1 }}>
          <span className="card-kicker">Mesa 1 · Activo</span>
          <h3>{locationInfo?.name || 'Palermo Soho'}</h3>
          <p style={{ margin: '8px 0 14px' }}>
            Enlace directo para escanear en la mesa:<br />
            <code style={{ background: '#eee8dc', padding: '4px 8px', borderRadius: 6, fontSize: 12, wordBreak: 'break-all' }}>
              {qrUrl}
            </code>
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="primary-action" onClick={copyToClipboard}>
              {copied ? '✓ Copiado al portapapeles' : 'Copiar enlace'}
            </button>
            <a href={qrUrl} target="_blank" rel="noopener noreferrer" className="primary-action" style={{ background: '#c54d2d', textDecoration: 'none' }}>
              Abrir encuesta en nueva pestaña ↗
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
