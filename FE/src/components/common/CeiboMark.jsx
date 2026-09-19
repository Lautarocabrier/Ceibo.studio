import ceiboLogo from '../../marca/logo  transparente.png'

export default function CeiboMark({ light = false, small = false, className = '' }) {
  return (
    <img
      src={ceiboLogo}
      alt="Ceibo"
      className={`brand-mark ${small ? 'brand-mark--small' : ''} ${light ? 'brand-mark--light' : ''} ${className}`.trim()}
    />
  )
}
