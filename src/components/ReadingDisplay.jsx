import TarotCardImage from './TarotCardImage'
import './ReadingDisplay.css'
export default function ReadingDisplay({ reading, revealedCount = Infinity }) {
  const cards = reading.cards_detail || []
  const text = reading.ai_response
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
      <article className="reading-copy">
        <span className="eyebrow">Tu lectura</span>
        <div>{text || 'La interpretación todavía no está disponible.'}</div>
      </article>
    </div>
  )
}
