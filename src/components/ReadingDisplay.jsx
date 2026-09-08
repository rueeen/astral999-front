import { useState } from 'react'
import TarotCardImage from './TarotCardImage'
import './ReadingDisplay.css'
export default function ReadingDisplay({ reading, revealedCount = Infinity }) {
  const cards = reading.cards_detail || []
  const [copyNotice, setCopyNotice] = useState('')
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
  return (
    <div className="reading-display">
      <div className={`spread spread-${reading.spread}`}>
        {cards.map((item, index) => {
          const card = item.card
          const reversed = item.reversed
          return (
            <article className="drawn-card" key={`${card.slug}-${item.position}`}>
              <span className="position">Posición {item.position}</span>
              <TarotCardImage card={card} reversed={reversed} revealed={index < revealedCount} />
              <h3>{card.name}</h3>
              {reversed && <small>Significado invertido</small>}
            </article>
          )
        })}
      </div>
      {!cards.length && <div className="empty">Esta lectura no contiene cartas para mostrar.</div>}
      <article className="reading-copy" aria-live="polite">
        <span className="eyebrow">Tu lectura</span>
        {paragraphs.length ? (
          paragraphs.map((paragraph, index) =>
            isVerdict && index === paragraphs.length - 1 ? (
              <div className="verdict" key={paragraph}>
                <p>{paragraph}</p>
                <button className="copy-verdict" type="button" onClick={copyVerdict}>
                  Copiar veredicto
                </button>
              </div>
            ) : (
              <p key={`${index}-${paragraph}`}>{paragraph}</p>
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
      </article>
    </div>
  )
}
