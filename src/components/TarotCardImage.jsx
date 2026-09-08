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

export default function TarotCardImage({ card = {}, reversed = false, revealed = true }) {
  const image = getCardImage(card)
  const alt = `${card.name || 'Carta de tarot'}${reversed ? ', invertida' : ''}`

  return (
    <div className={`tarot-wrap ${revealed ? 'is-revealed' : ''}`}>
      <div className="tarot-flipper">
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
      </div>
      {revealed && reversed && <span className="reversed-label">Invertida</span>}
    </div>
  )
}
