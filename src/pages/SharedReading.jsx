import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../api'
import ReadingDisplay from '../components/ReadingDisplay'
import { getErrorMessage } from '../utils'
import ShareSheet from '../components/ShareSheet'
export default function SharedReading() {
  const { token } = useParams(),
    [reading, setReading] = useState(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(''),
    [shareOpen, setShareOpen] = useState(false)
  useEffect(() => {
    api
      .get(`/api/readings/shared/${token}/`)
      .then((r) => setReading(r.data))
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false))
  }, [token])
  if (loading)
    return (
      <main className="page container loading">
        <div>
          <div className="loading-orbit" />
          <p>Una lectura compartida está cruzando el umbral…</p>
        </div>
      </main>
    )
  if (error)
    return (
      <main className="page container">
        <div className="error">{error}</div>
      </main>
    )
  if (!reading)
    return <main className="page container empty">Esta lectura ya no está disponible.</main>
  return (
    <main className="page container">
      <div style={{ textAlign: 'center' }}>
        <span className="eyebrow">Lectura compartida</span>
        <h1 className="page-title">{reading.question || 'Un mensaje de las cartas'}</h1>
      </div>
      <ReadingDisplay reading={reading} />
      <div className="actions" style={{ justifyContent: 'center', marginTop: '1.5rem' }}>
        <button className="button secondary" type="button" onClick={() => setShareOpen(true)}>Compartir</button>
      </div>
      <aside className="panel" style={{ textAlign: 'center', maxWidth: 650, margin: '3rem auto' }}>
        <span className="eyebrow">Tu propia pregunta</span>
        <h2 style={{ fontFamily: 'var(--serif)' }}>Descubre lo que las cartas tienen para ti</h2>
        <p className="notice">Crea una cuenta y comienza tu recorrido personal.</p>
        <Link className="button" to="/registro">
          Registrarme gratis
        </Link>
      </aside>
      {shareOpen && <ShareSheet reading={reading} token={token} onClose={() => setShareOpen(false)} />}
    </main>
  )
}
