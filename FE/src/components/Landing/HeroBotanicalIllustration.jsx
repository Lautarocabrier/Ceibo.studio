import compWebp from '../../assets/home-flowe-girl/flower-girl-composition.webp'
import compPng from '../../assets/home-flowe-girl/flower-girl-composition.png'

export default function HeroBotanicalIllustration() {
  return (
    <div className="hero-botanical-art" aria-hidden="true">
      <picture>
        <source srcSet={compWebp} type="image/webp" />
        <img
          src={compPng}
          alt="Composición botánica decorativa"
          className="hero-botanical-img"
          loading="eager"
        />
      </picture>
    </div>
  )
}
