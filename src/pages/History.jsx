import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import { getErrorMessage, unwrapList } from '../utils'
import './History.css'
export default function History() {
  const [page, setPage] = useState(1),
    [favorites, setFavorites] = useState(false),
    [data, setData] = useState(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState('')
  useEffect(() => {
    let live = true
    setLoading(true)
    setError('')
    api
      .get('/api/readings/', { params: { page } })
      .then((r) => live && setData(r.data))
      .catch((e) => live && setError(getErrorMessage(e)))
      .finally(() => live && setLoading(false))
    return () => {
      live = false
    }
  }, [page])
  const pageItems = unwrapList(data)
  const items = favorites ? pageItems.filter((item) => item.is_favorite) : pageItems
  return (
    <main className="page container">
      <span className="eyebrow">Tu recorrido</span>
      <h1 className="page-title">Historial</h1>
      <label className="favorite-filter">
        <input
          type="checkbox"
          checked={favorites}
          onChange={(e) => setFavorites(e.target.checked)}
        />{' '}
        Solo favoritas
      </label>
      {favorites && (
        <p className="notice">El filtro de favoritas se aplica solo a la página actual.</p>
      )}
      {loading && (
        <div className="loading">
          <div>
            <div className="loading-orbit" />
            <p>Buscando entre tus lecturas…</p>
          </div>
        </div>
      )}
      {error && <div className="error">{error}</div>}
      {!loading && !error && !items.length && (
        <div className="empty">
          {favorites
            ? 'No hay lecturas favoritas en esta página.'
            : 'Todavía no hay lecturas aquí. Tu próxima pregunta puede ser la primera.'}
        </div>
      )}
      <div className="history-list">
        {items.map((item) => (
          <Link className="history-item panel" to={`/lecturas/${item.id}`} key={item.id}>
            <div>
              <span className="eyebrow">
                {new Date(item.created_at).toLocaleDateString('es-ES')}
              </span>
              <h2>{item.question || 'Lectura sin pregunta'}</h2>
            </div>
            <div>
              <span className="badge">{item.spread}</span>
              {item.is_favorite && <span className="star">★</span>}
            </div>
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
