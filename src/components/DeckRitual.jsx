import { AnimatePresence, motion as Motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { cutVariants, dealVariants, shuffleVariants, timings } from '../animations/variants'
import useMotionPreference from '../animations/useMotionPreference'
import { cardBackImage } from '../deck'
import './DeckRitual.css'

export default function DeckRitual({ count, failed = false, reducedMotion, speed = 1 }) {
  const { allowMovement } = useMotionPreference(reducedMotion)
  const [phase, setPhase] = useState('shuffle')
  const duration = allowMovement ? 1 / speed : 0

  useEffect(() => {
    if (failed) {
      setPhase('return')
      return undefined
    }
    setPhase('shuffle')
    const cutTimer = window.setTimeout(() => setPhase('cut'), timings.shuffle * 2 * 1000 * duration)
    const dealTimer = window.setTimeout(
      () => setPhase('deal'),
      (timings.shuffle * 2 + timings.cut) * 1000 * duration,
    )
    return () => {
      clearTimeout(cutTimer)
      clearTimeout(dealTimer)
    }
  }, [count, duration, failed])

  const transition = allowMovement
    ? { duration: timings.shuffle * duration, repeat: Infinity, ease: 'easeInOut' }
    : { duration: timings.reduced }

  return (
    <div className="deck-ritual" aria-label="Barajando y repartiendo las cartas">
      <div className="ritual-deck" aria-hidden="true">
        {[0, 1, 2, 3].map((index) => (
          <Motion.img
            key={index}
            className="ritual-card"
            src={cardBackImage}
            alt=""
            custom={index}
            variants={phase === 'cut' && index > 1 ? cutVariants : shuffleVariants}
            animate={allowMovement ? (phase === 'cut' && index > 1 ? 'cut' : 'shuffle') : 'reduced'}
            transition={
              phase === 'cut'
                ? { duration: timings.cut * duration, ease: 'easeInOut' }
                : { ...transition, delay: index * 0.06 * duration }
            }
            style={{
              willChange: phase === 'shuffle' || phase === 'cut' ? 'transform, opacity' : 'auto',
            }}
          />
        ))}
      </div>
      <div className="ritual-hand">
        <AnimatePresence>
          {(phase === 'deal' || phase === 'return') &&
            Array.from({ length: count }, (_, index) => (
              <Motion.img
                className="ritual-dealt-card"
                src={cardBackImage}
                alt=""
                key={index}
                custom={false}
                variants={dealVariants}
                initial={allowMovement ? 'hidden' : 'reducedHidden'}
                animate={
                  phase === 'return' ? 'return' : allowMovement ? 'visible' : 'reducedVisible'
                }
                transition={{
                  duration: allowMovement ? timings.deal * duration : timings.reduced,
                  delay: index * (allowMovement ? timings.dealStagger * duration : 0.04),
                  ease: 'easeOut',
                }}
              />
            ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
