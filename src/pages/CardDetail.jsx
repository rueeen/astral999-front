import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../api'
import TarotCardImage from '../components/TarotCardImage'
import { getErrorMessage } from '../utils'
import './CardDetail.css'
export default function CardDetail() {
  const { slug } = useParams(),
    [card, setCard] = useState(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState('')
  useEffect(() => {
    api
      .get(`/api/cards/${slug}/`)
      .then((r) => setCard(r.data))
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false))
  }, [slug])
  if (loading)
    return (
      <main className="page container loading">
        <div>
          <div className="loading-orbit" />
          <p>Revelando la carta…</p>
        </div>
      </main>
    )
  if (error)
    return (
      <main className="page container">
        <div className="error">{error}</div>
      </main>
    )
  if (!card) return <main className="page container empty">No encontramos esta carta.</main>
  const keywords = card.keywords || []
  return (
    <main className="page container">
      <Link to="/cartas" className="eyebrow">
        ← Volver al catálogo
      </Link>
      <div className="card-detail">
        <div>
          <TarotCardImage card={card} />
        </div>
        <article>
          <span className="eyebrow">Arcano {card.number}</span>
          <h1 className="page-title">{card.name}</h1>
          <div className="keywords">
            {(Array.isArray(keywords) ? keywords : String(keywords).split(',')).map((k) => (
              <span className="badge" key={k}>
                {k}
              </span>
            ))}
          </div>
          <section>
            <h2>Al derecho</h2>
            <p>{card.meaning_up || 'Significado no disponible.'}</p>
          </section>
          <section>
            <h2>Invertida</h2>
            <p>{card.meaning_rev || 'Significado no disponible.'}</p>
          </section>
        </article>
      </div>
    </main>
  )
}
