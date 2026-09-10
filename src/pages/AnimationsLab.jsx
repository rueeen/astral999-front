import { useState } from 'react'
import DeckRitual from '../components/DeckRitual'
import TarotCardImage from '../components/TarotCardImage'
import { majorArcanaImages } from '../deck'
import './AnimationsLab.css'

const sample = { name: 'La Estrella', number: 17, arcana: 'MAJOR', image: majorArcanaImages[17] }

export default function AnimationsLab() {
  const [speed, setSpeed] = useState(1)
  const [reduced, setReduced] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [failed, setFailed] = useState(false)

  return (
    <main className="page container animations-lab">
      <span className="eyebrow">Solo desarrollo</span>
      <h1 className="page-title">Laboratorio de animaciones</h1>
      <div className="panel lab-controls">
        <label>
          Velocidad
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.25"
            value={speed}
            onChange={(event) => setSpeed(Number(event.target.value))}
          />
          <output>{speed}×</output>
        </label>
        <label>
          <input
            type="checkbox"
            checked={reduced}
            onChange={(event) => setReduced(event.target.checked)}
          />{' '}
          Movimiento reducido
        </label>
      </div>
      <section className="panel lab-section">
        <h2>Barajado, corte y reparto</h2>
        <DeckRitual
          key={`${speed}-${reduced}-${failed}`}
          count={10}
          speed={speed}
          reducedMotion={reduced}
          failed={failed}
        />
        <button
          className="button secondary"
          type="button"
          onClick={() => setFailed((value) => !value)}
        >
          {failed ? 'Reiniciar ritual' : 'Simular fallo'}
        </button>
      </section>
      <section className="panel lab-section">
        <h2>Volteo e interacción directa</h2>
        <div className="lab-card">
          <TarotCardImage
            card={sample}
            reversed
            revealed={revealed}
            speed={speed}
            reducedMotion={reduced}
          />
        </div>
        <button className="button" type="button" onClick={() => setRevealed((value) => !value)}>
          {revealed ? 'Ocultar' : 'Revelar'}
        </button>
      </section>
    </main>
  )
}
