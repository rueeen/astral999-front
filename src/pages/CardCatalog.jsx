import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import TarotCardImage from '../components/TarotCardImage'
import { getErrorMessage, unwrapList } from '../utils'
export default function CardCatalog() {
  const [page, setPage] = useState(1),
    [data, setData] = useState(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState('')
  useEffect(() => {
    let live = true
    setLoading(true)
    api
      .get('/api/cards/', { params: { page } })
      .then((r) => live && setData(r.data))
      .catch((e) => live && setError(getErrorMessage(e)))
      .finally(() => live && setLoading(false))
    return () => {
      live = false
    }
  }, [page])
  const cards = unwrapList(data)
  return (
    <main className="page container">
      <span className="eyebrow">Los arcanos</span>
      <h1 className="page-title">Catálogo de cartas</h1>
      <p className="lead">Explora sus símbolos, luces y sombras.</p>
      {loading && (
        <div className="loading">
          <div>
            <div className="loading-orbit" />
            <p>Reuniendo los arcanos…</p>
          </div>
        </div>
      )}
      {error && <div className="error">{error}</div>}
      {!loading && !error && !cards.length && (
        <div className="empty">No hay cartas disponibles en el catálogo.</div>
      )}
      <div className="grid cards-grid">
        {cards.map((card) => (
          <Link to={`/cartas/${card.slug}`} key={card.slug} className="catalog-card">
            <TarotCardImage card={card} />
            <h2>{card.name}</h2>
            <span className="eyebrow">Ver significado</span>
          </Link>
        ))}
      </div>
      {data && (data.next || data.previous) && (
        <div className="pagination">
          <button
            className="button secondary"
            disabled={!data.previous}
            onClick={() => setPage((p) => p - 1)}
          >
            Anterior
          </button>
          <span>Página {page}</span>
          <button
            className="button secondary"
            disabled={!data.next}
            onClick={() => setPage((p) => p + 1)}
          >
            Siguiente
          </button>
        </div>
      )}
    </main>
  )
}
