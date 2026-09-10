import { motion, useMotionValue, useSpring } from 'motion/react'
import { flipVariants, timings, ease } from '../animations/variants'
import useMotionPreference from '../animations/useMotionPreference'
import { cardBackImage, majorArcanaImages } from '../deck'
import './TarotCardImage.css'

const roman = (value) => {
  const n = Number(value)
  if (!Number.isFinite(n)) return value || '✦'
  if (n === 0) return '0'
  const map = [
    ['M', 1000],
    ['CM', 900],
    ['D', 500],
    ['CD', 400],
    ['C', 100],
    ['XC', 90],
    ['L', 50],
    ['XL', 40],
    ['X', 10],
    ['IX', 9],
    ['V', 5],
    ['IV', 4],
    ['I', 1],
  ]
  let x = n
  let out = ''
  map.forEach(([r, v]) => {
    while (x >= v) {
      out += r
      x -= v
    }
  })
  return out
}

export function getCardImage(card = {}) {
  return card.image || (card.arcana === 'MAJOR' ? majorArcanaImages[card.number] : null)
}

export default function TarotCardImage({
  card = {},
  reversed = false,
  revealed = true,
  layoutId,
  reducedMotion,
  speed = 1,
}) {
  const image = getCardImage(card)
  const alt = `${card.name || 'Carta de tarot'}${reversed ? ', invertida' : ''}`
  const { allowMovement } = useMotionPreference(reducedMotion)
  const rotateX = useSpring(useMotionValue(0), { stiffness: 220, damping: 24 })
  const rotateY = useSpring(useMotionValue(0), { stiffness: 220, damping: 24 })
  const tilt = (event) => {
    if (!allowMovement) return
    const bounds = event.currentTarget.getBoundingClientRect()
    rotateX.set(((event.clientY - bounds.top) / bounds.height - 0.5) * -16)
    rotateY.set(((event.clientX - bounds.left) / bounds.width - 0.5) * 16)
  }
  const resetTilt = () => {
    rotateX.set(0)
    rotateY.set(0)
  }

  return (
    <motion.div
      className={`tarot-wrap ${!allowMovement && revealed ? 'reduced-revealed' : ''}`}
      layoutId={layoutId}
      onPointerMove={tilt}
      onPointerLeave={resetTilt}
      whileHover={allowMovement ? { y: -6, scale: 1.025 } : undefined}
      whileTap={allowMovement ? { scale: 1.015 } : undefined}
      style={{ rotateX, rotateY }}
    >
      <motion.div
        className="tarot-flipper"
        variants={flipVariants}
        initial={allowMovement ? 'hidden' : 'reducedHidden'}
        animate={
          revealed
            ? allowMovement
              ? 'visible'
              : 'reducedVisible'
            : allowMovement
              ? 'hidden'
              : 'reducedHidden'
        }
        transition={{ duration: allowMovement ? timings.flip / speed : timings.reduced, ease }}
      >
        <div className="tarot-face tarot-back">
          <img src={cardBackImage} alt="Reverso de una carta de tarot" />
        </div>
        <div className={`tarot-face tarot-front ${reversed ? 'is-reversed' : ''}`}>
          {image ? (
            <img src={image} alt={alt} />
          ) : (
            <div className="tarot-placeholder" role="img" aria-label={alt}>
              <span>{roman(card.number)}</span>
              <i>✦</i>
              <strong>{card.name || 'Arcano'}</strong>
            </div>
          )}
        </div>
      </motion.div>
      {revealed && reversed && <span className="reversed-label">Invertida</span>}
    </motion.div>
  )
}
