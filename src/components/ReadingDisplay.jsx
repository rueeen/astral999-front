import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { copyVariants, timings } from '../animations/variants'
import useMotionPreference from '../animations/useMotionPreference'
import TarotCardImage from './TarotCardImage'
import './ReadingDisplay.css'

const celticPositions = {
  1: ['El presente', 'central'],
  2: ['El desafío', 'central'],
  3: ['La base', 'entorno'],
  4: ['El pasado', 'entorno'],
  5: ['La posibilidad', 'entorno'],
  6: ['El futuro próximo', 'entorno'],
  7: ['Tu actitud', 'baston'],
  8: ['El entorno', 'baston'],
  9: ['Esperanzas y temores', 'baston'],
  10: ['El desenlace', 'baston'],
}

const positionNumber = (position, fallback) => {
  const match = String(position ?? '').match(/\d+/)
  return match ? Number(match[0]) : fallback
}

export default function ReadingDisplay({ reading, revealedCount = Infinity }) {
  const cards = reading.cards_detail || []
  const [copyNotice, setCopyNotice] = useState('')
  const [focusedCard, setFocusedCard] = useState(null)
  const [overflow, setOverflow] = useState({ start: false, end: false })
  const spreadRef = useRef(null)
  const { allowMovement } = useMotionPreference()
  const paragraphs = (reading.ai_response || '')
    .trim()
    .split(/\r?\n\s*\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
  const lastParagraph = paragraphs.at(-1) || ''
  const isVerdict =
    reading.mode === 'negative' && lastParagraph.split(/\s+/).filter(Boolean).length < 20
  const copyVerdict = async () => {
    try {
      await navigator.clipboard.writeText(lastParagraph)
      setCopyNotice('Veredicto copiado.')
    } catch {
      setCopyNotice('No se pudo copiar el veredicto.')
    }
  }
  const allRevealed = revealedCount >= cards.length
  const isCelticCross = reading.spread === 'celtic_cross'
  const displayedCards = isCelticCross
    ? cards
        .map((item, index) => ({ item, order: positionNumber(item.position, index + 1) }))
        .sort((a, b) => a.order - b.order)
    : cards.map((item, index) => ({ item, order: index + 1 }))

  useEffect(() => {
    const spread = spreadRef.current
    if (!spread) return undefined
    const updateOverflow = () => {
      const hidden = spread.scrollWidth > spread.clientWidth + 1
      setOverflow({
        start: hidden && spread.scrollLeft > 1,
        end: hidden && spread.scrollLeft + spread.clientWidth < spread.scrollWidth - 1,
      })
    }
    updateOverflow()
    spread.addEventListener('scroll', updateOverflow, { passive: true })
    const observer = new ResizeObserver(updateOverflow)
    observer.observe(spread)
    return () => {
      spread.removeEventListener('scroll', updateOverflow)
      observer.disconnect()
    }
  }, [cards.length, reading.spread])

  return (
    <div className="reading-display">
      <div
        className={`spread-shell ${overflow.start ? 'has-overflow-start' : ''} ${overflow.end ? 'has-overflow-end' : ''}`}
      >
        <div className={`spread spread-${reading.spread}`} ref={spreadRef}>
          {displayedCards.map(({ item, order }, index) => {
            const card = item.card
            const reversed = item.reversed
            const [positionLabel, group] = celticPositions[order] || [
              `Posición ${item.position}`,
              'entorno',
            ]
            return (
              <motion.article
                className={`drawn-card ${isCelticCross ? `celtic-position-${order}` : ''}`}
                data-group={isCelticCross ? group : undefined}
                key={`${card.slug}-${item.position}`}
                animate={{ opacity: focusedCard && focusedCard.card.slug !== card.slug ? 0.35 : 1 }}
                transition={{ duration: allowMovement ? 0.25 : timings.reduced }}
              >
                <span className="position">
                  {isCelticCross ? `${order}. ${positionLabel}` : `Posición ${item.position}`}
                </span>
                <button
                  className="card-focus-button"
                  type="button"
                  onClick={() => setFocusedCard(item)}
                  aria-label={`Ampliar ${card.name}`}
                >
                  <TarotCardImage
                    card={card}
                    reversed={reversed}
                    revealed={index < revealedCount}
                    layoutId={`card-${card.slug}`}
                    deck={reading.deck}
                  />
                </button>
                <h3>{card.name}</h3>
                {reversed && <small>Significado invertido</small>}
              </motion.article>
            )
          })}
        </div>
      </div>
      {!cards.length && <div className="empty">Esta lectura no contiene cartas para mostrar.</div>}
      <div className="sr-only" aria-live="polite">
        {cards
          .slice(0, Math.min(revealedCount, cards.length))
          .map(({ card, reversed }) => `${card.name}, ${reversed ? 'invertida' : 'al derecho'}`)
          .join('. ')}
      </div>
      <motion.article className="reading-copy" aria-live="polite">
        <span className="eyebrow">Tu lectura</span>
        {paragraphs.length ? (
          paragraphs.map((paragraph, index) =>
            isVerdict && index === paragraphs.length - 1 ? (
              <motion.div
                className="verdict"
                key={paragraph}
                variants={copyVariants}
                initial={allowMovement ? 'hidden' : 'reducedHidden'}
                animate={
                  allRevealed
                    ? allowMovement
                      ? 'visible'
                      : 'reducedVisible'
                    : allowMovement
                      ? 'hidden'
                      : 'reducedHidden'
                }
                transition={{
                  duration: allowMovement ? timings.verdict : timings.reduced,
                  delay: allRevealed
                    ? index * (allowMovement ? timings.paragraphStagger : 0.02) + 0.3
                    : 0,
                }}
              >
                <p>{paragraph}</p>
                <button className="copy-verdict" type="button" onClick={copyVerdict}>
                  Copiar veredicto
                </button>
              </motion.div>
            ) : (
              <motion.p
                key={`${index}-${paragraph}`}
                variants={copyVariants}
                initial={allowMovement ? 'hidden' : 'reducedHidden'}
                animate={
                  allRevealed
                    ? allowMovement
                      ? 'visible'
                      : 'reducedVisible'
                    : allowMovement
                      ? 'hidden'
                      : 'reducedHidden'
                }
                transition={{
                  duration: allowMovement ? timings.paragraph : timings.reduced,
                  delay: allRevealed
                    ? timings.flip + index * (allowMovement ? timings.paragraphStagger : 0.02)
                    : 0,
                }}
              >
                {paragraph}
              </motion.p>
            ),
          )
        ) : (
          <p>La interpretación todavía no está disponible.</p>
        )}
        {copyNotice && (
          <small className="copy-notice" role="status">
            {copyNotice}
          </small>
        )}
        {(reading.disclaimer || reading.legal_disclaimer) && (
          <p className="reading-disclaimer">{reading.disclaimer || reading.legal_disclaimer}</p>
        )}
      </motion.article>
      <AnimatePresence>
        {focusedCard && (
          <motion.div
            className="card-focus-overlay"
            role="dialog"
            aria-modal="true"
            aria-label={`Detalle de ${focusedCard.card.name}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: allowMovement ? 0.25 : timings.reduced }}
            onClick={() => setFocusedCard(null)}
          >
            <motion.div className="card-focus-content" onClick={(event) => event.stopPropagation()}>
              <TarotCardImage
                card={focusedCard.card}
                reversed={focusedCard.reversed}
                layoutId={`card-${focusedCard.card.slug}`}
                deck={reading.deck}
              />
              <h2>{focusedCard.card.name}</h2>
              <Link className="button" to={`/cartas/${focusedCard.card.slug}`}>
                Ver en el catálogo
              </Link>
              <button
                className="button secondary"
                type="button"
                onClick={() => setFocusedCard(null)}
              >
                Cerrar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
