export default function CeiboMark({ light = false, small = false }) {
  return (
    <span className={`brand-mark ${small ? 'brand-mark--small' : ''} ${light ? 'brand-mark--light' : ''}`} aria-hidden="true">
      <i /><i /><i /><i />
    </span>
  )
}
