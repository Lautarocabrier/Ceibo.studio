import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import './GlobalTalentSequence.css'

const COUNTRY_NAMES = {
  argentina: 'Argentina',
  egipt: 'Egipto',
  francia: 'Francia',
  indian: 'India',
  japan: 'Japón',
  newyork: 'Nueva York',
}

/**
 * Dynamic resolution of all programmer concept illustrations.
 * Zero hardcoding: resolves any compatible illustration (*-programer.jpg/png/webp)
 * and filters out auxiliary files like 'explicación-procedimiento.png'.
 */
function resolveDynamicProgramerImages() {
  const rawModules = import.meta.glob(
    '../../assets/global-programers-concept/*',
    { eager: true, import: 'default' }
  )

  const items = Object.entries(rawModules)
    .filter(([filePath]) => {
      const fileName = filePath.split('/').pop() || ''
      const isSequenceIllustration = /-programer\.(jpe?g|webp|png)$/i.test(fileName)
      const isAuxiliaryFile = /explicaci/i.test(fileName)
      return isSequenceIllustration && !isAuxiliaryFile
    })
    .map(([filePath, assetUrl]) => {
      const fileName = filePath.split('/').pop() || ''
      const rawSlug = fileName.replace(/-programer\.[^.]+$/i, '').trim().toLowerCase()
      
      const country = COUNTRY_NAMES[rawSlug] || (
        rawSlug.charAt(0).toUpperCase() + rawSlug.slice(1).replace(/-/g, ' ')
      )

      return {
        id: rawSlug,
        fileName,
        src: assetUrl,
        country,
      }
    })

  return items
}

const TEXT_LEFT_1 = 'somos una'
const TEXT_LEFT_2 = 'empresa'
const TEXT_RIGHT_1 = 'de talento'
const TEXT_RIGHT_2 = 'global'

/**
 * Typewriter string renderer that reserves 100% of space in advance.
 * Every character is present in the DOM from frame 0, ensuring zero layout shift
 * and zero subpixel movement of the central visor.
 */
function TypewriterBlock({ text, currentCount, isActive, isDone, className = '' }) {
  const chars = useMemo(() => text.split(''), [text])

  return (
    <span className={`typewriter-block ${className}`}>
      {/* If active at count 0, show caret at the very beginning of the line */}
      {isActive && currentCount === 0 && (
        <span className="typewriter-floating-caret caret-start" aria-hidden="true">
          |
        </span>
      )}

      {chars.map((char, idx) => {
        const isVisible = idx < currentCount
        const isCaretHere = isActive && idx === currentCount - 1
        const isEndCaret = isDone && idx === chars.length - 1

        return (
          <span key={idx} className="typewriter-char-unit">
            <span className={`typewriter-char ${isVisible ? 'is-visible' : 'is-hidden'}`}>
              {char}
            </span>
            {(isCaretHere || isEndCaret) && (
              <span
                className={`typewriter-floating-caret ${isEndCaret ? 'caret-done' : ''}`}
                aria-hidden="true"
              >
                |
              </span>
            )}
          </span>
        )
      })}
    </span>
  )
}

export default function GlobalTalentSequence() {
  const sectionRef = useRef(null)
  const images = useMemo(() => resolveDynamicProgramerImages(), [])

  // Navigation & animation states
  const [currentIndex, setCurrentIndex] = useState(0)
  const [phase, setPhase] = useState('resting') // 'resting' | 'closing' | 'blackout' | 'opening'
  const [isPreloaded, setIsPreloaded] = useState(false)

  // Typewriter effect states
  const [hasArrived, setHasArrived] = useState(false)
  const [typedCounts, setTypedCounts] = useState({
    left1: 0,
    left2: 0,
    right1: 0,
    right2: 0,
  })
  const [activeTypingField, setActiveTypingField] = useState('none') // 'none' | 'left1' | 'left2' | 'right1' | 'right2' | 'done'

  const targetIndexRef = useRef(null)
  const phaseRef = useRef(phase)
  phaseRef.current = phase
  const timerRef = useRef(null)
  const autoplayTimerRef = useRef(null)

  // Detect when user arrives at this section (viewport entry)
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const rect = el.getBoundingClientRect()
    // If already in viewport (e.g. loaded directly), trigger immediately
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setHasArrived(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasArrived(true)
          observer.disconnect()
        }
      },
      { threshold: 0.25 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Sequential typewriter animation when user arrives
  useEffect(() => {
    if (!hasArrived) return

    // Accessibility check: skip animation if user prefers reduced motion
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTypedCounts({
        left1: TEXT_LEFT_1.length,
        left2: TEXT_LEFT_2.length,
        right1: TEXT_RIGHT_1.length,
        right2: TEXT_RIGHT_2.length,
      })
      setActiveTypingField('done')
      return
    }

    let isCancelled = false
    const timeouts = []
    const wait = (ms) => new Promise((res) => {
      const t = setTimeout(res, ms)
      timeouts.push(t)
    })

    async function runTypewriter() {
      // 1. Initial breathing pause
      await wait(300)
      if (isCancelled) return

      // 2. Type Left Line 1 ("somos una")
      setActiveTypingField('left1')
      for (let i = 1; i <= TEXT_LEFT_1.length; i++) {
        if (isCancelled) return
        setTypedCounts((prev) => ({ ...prev, left1: i }))
        await wait(45 + Math.random() * 20)
      }

      // Short line-break pause
      await wait(180)
      if (isCancelled) return

      // 3. Type Left Line 2 ("empresa")
      setActiveTypingField('left2')
      for (let i = 1; i <= TEXT_LEFT_2.length; i++) {
        if (isCancelled) return
        setTypedCounts((prev) => ({ ...prev, left2: i }))
        await wait(55 + Math.random() * 25)
      }

      // Inter-column pause (cursor moves across portal)
      await wait(260)
      if (isCancelled) return

      // 4. Type Right Line 1 ("de talento")
      setActiveTypingField('right1')
      for (let i = 1; i <= TEXT_RIGHT_1.length; i++) {
        if (isCancelled) return
        setTypedCounts((prev) => ({ ...prev, right1: i }))
        await wait(45 + Math.random() * 20)
      }

      // Short line-break pause
      await wait(180)
      if (isCancelled) return

      // 5. Type Right Line 2 ("global")
      setActiveTypingField('right2')
      for (let i = 1; i <= TEXT_RIGHT_2.length; i++) {
        if (isCancelled) return
        setTypedCounts((prev) => ({ ...prev, right2: i }))
        await wait(55 + Math.random() * 25)
      }

      // Completed!
      setActiveTypingField('done')
    }

    runTypewriter()

    return () => {
      isCancelled = true
      timeouts.forEach(clearTimeout)
    }
  }, [hasArrived])

  // Preload and pre-cache all resolved images into GPU/bitmap memory
  useEffect(() => {
    if (!images.length) {
      setIsPreloaded(true)
      return
    }

    let isCancelled = false

    const promises = images.map((item) => {
      return new Promise((resolve) => {
        const img = new Image()
        img.src = item.src

        const onDone = async () => {
          if (img.decode) {
            try {
              await img.decode()
            } catch {
              // Ignore decode errors
            }
          }
          resolve(item.src)
        }

        if (img.complete) {
          onDone()
        } else {
          img.onload = onDone
          img.onerror = onDone
        }
      })
    })

    Promise.all(promises).then(() => {
      if (!isCancelled) {
        setIsPreloaded(true)
      }
    })

    return () => {
      isCancelled = true
    }
  }, [images])

  // Execute eye-blink sequence to a target index
  const triggerBlinkTo = useCallback((nextIdx) => {
    if (phaseRef.current !== 'resting') return
    if (nextIdx === currentIndex) return

    targetIndexRef.current = nextIdx
    setPhase('closing')

    // Step 1: Closing eyelids (~250ms)
    timerRef.current = setTimeout(() => {
      // Step 2: Swap in black (zero crossfade)
      setPhase('blackout')
      setCurrentIndex(targetIndexRef.current)

      // Hold in black (~60ms) to ensure paint before opening
      timerRef.current = setTimeout(() => {
        // Step 3: Opening eyelids (~350ms)
        setPhase('opening')

        timerRef.current = setTimeout(() => {
          // Step 4: Back to resting state
          setPhase('resting')
          targetIndexRef.current = null
        }, 350)
      }, 60)
    }, 250)
  }, [currentIndex])

  // Click on visor to advance to next country
  const handlePortalClick = useCallback(() => {
    if (!images.length || phaseRef.current !== 'resting') return
    const next = (currentIndex + 1) % images.length
    triggerBlinkTo(next)
  }, [currentIndex, images.length, triggerBlinkTo])

  // Autoplay cycle while in 'resting' state
  useEffect(() => {
    if (!isPreloaded || phase !== 'resting' || images.length <= 1) {
      return
    }

    autoplayTimerRef.current = setTimeout(() => {
      const next = (currentIndex + 1) % images.length
      triggerBlinkTo(next)
    }, 3600)

    return () => {
      if (autoplayTimerRef.current) clearTimeout(autoplayTimerRef.current)
    }
  }, [isPreloaded, phase, currentIndex, images.length, triggerBlinkTo])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (autoplayTimerRef.current) clearTimeout(autoplayTimerRef.current)
    }
  }, [])

  const currentItem = images[currentIndex] || {
    country: 'Global',
    src: '',
  }

  return (
    <section
      ref={sectionRef}
      className="global-talent-section"
      id="talento-global"
      aria-label="Somos una empresa de talento global"
    >
      <div className="global-talent-bg" aria-hidden="true" />

      {/* Main Minimal Stage: Left text | Interactive Center Visor | Right text */}
      <div className="global-talent-stage">
        {/* Left Side Fixed Typography (Space 100% Reserved in Advance) */}
        <div className="global-talent-col global-talent-col--left">
          <span className={`global-talent-col-label ${hasArrived ? 'is-visible' : ''}`}>
            Nuestra Cultura
          </span>
          <h2 className="global-talent-phrase">
            <TypewriterBlock
              text={TEXT_LEFT_1}
              currentCount={typedCounts.left1}
              isActive={activeTypingField === 'left1'}
              isDone={false}
            />
            <br />
            <TypewriterBlock
              text={TEXT_LEFT_2}
              currentCount={typedCounts.left2}
              isActive={activeTypingField === 'left2'}
              isDone={false}
              className="global-talent-emphasis"
            />
          </h2>
        </div>

        {/* Central Visor with Eye-Blink Animation and Pointer Click Hand */}
        <div
          className="global-talent-portal-wrap"
          onClick={handlePortalClick}
          role="button"
          tabIndex={0}
          aria-label={`Cambiar país (actual: ${currentItem.country}). Haz clic para teletransportar.`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handlePortalClick()
            }
          }}
          title="Haz clic para viajar al siguiente país"
        >
          <div className="global-talent-portal-halo">
            <div className={`global-talent-viewport phase-${phase}`}>
              {currentItem.src && (
                <img
                  src={currentItem.src}
                  alt={`Programador en ${currentItem.country}`}
                  className="global-talent-image"
                  draggable={false}
                />
              )}
              <div className="global-talent-optic-overlay" aria-hidden="true" />
            </div>
          </div>
        </div>

        {/* Right Side Fixed Typography (Space 100% Reserved in Advance) */}
        <div className="global-talent-col global-talent-col--right">
          <span className={`global-talent-col-label ${typedCounts.right1 > 0 ? 'is-visible' : ''}`}>
            Presencia Mundial
          </span>
          <h2 className="global-talent-phrase">
            <TypewriterBlock
              text={TEXT_RIGHT_1}
              currentCount={typedCounts.right1}
              isActive={activeTypingField === 'right1'}
              isDone={false}
            />
            <br />
            <TypewriterBlock
              text={TEXT_RIGHT_2}
              currentCount={typedCounts.right2}
              isActive={activeTypingField === 'right2'}
              isDone={activeTypingField === 'done'}
              className="global-talent-emphasis"
            />
          </h2>
        </div>
      </div>
    </section>
  )
}
