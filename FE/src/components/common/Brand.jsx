import CeiboMark from './CeiboMark'

export default function Brand({ light = false }) {
  return (
    <div className={`brand ${light ? 'brand--light' : ''}`}>
      <CeiboMark light={light} />
      <span>ceibo</span>
    </div>
  )
}
