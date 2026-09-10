import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import api from '../api'
import ReadingDisplay from '../components/ReadingDisplay'
import { getCardImage } from '../components/TarotCardImage'
import { getErrorMessage } from '../utils'
import ShareSheet from '../components/ShareSheet'
import AddressPreference from '../components/AddressPreference'
import { useAuth } from '../context/AuthContext'
export default function ReadingResult() {
  const { id } = useParams(),
    location = useLocation()
  const [reading, setReading] = useState(location.state?.reading || null),
    [loading, setLoading] = useState(!reading),
    [error, setError] = useState(''),
    [shareOpen, setShareOpen] = useState(false),
    [showPreference, setShowPreference] = useState(false),
    [revealedCount, setRevealedCount] = useState(location.state?.reading ? 0 : Infinity)
  const { user, setUser } = useAuth()
  useEffect(() => {
    if (reading) return
    api
      .get(`/api/readings/${id}/`)
      .then((r) => setReading(r.data))
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false))
  }, [id, reading])
  useEffect(() => {
    if (!reading || revealedCount === Infinity) return
    const urls = reading.cards_detail.map((item) => getCardImage(item.card)).filter(Boolean)
    Promise.all(
      urls.map(
        (url) =>
          new Promise((resolve) => {
            const image = new Image()
            image.onload = resolve
            image.onerror = resolve
            image.src = url
          }),
      ),
    ).then(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setRevealedCount(Infinity)
        return
      }
      reading.cards_detail.forEach((_, index) =>
        setTimeout(() => setRevealedCount(index + 1), index * 150),
      )
    })
  }, [reading])
  useEffect(() => {
    if (!reading) return
    const key = `address-preference-offered:${user?.id || 'user'}`
    if (!localStorage.getItem(key)) {
      setShowPreference(true)
      localStorage.setItem(key, 'true')
    }
  }, [reading, user?.id])
  const favorite = async () => {
    try {
      const { data } = await api.patch(`/api/readings/${id}/favorite/`, {
        is_favorite: !reading.is_favorite,
      })
      setReading({ ...reading, ...data, is_favorite: data.is_favorite ?? !reading.is_favorite })
    } catch (e) {
      setError(getErrorMessage(e))
    }
  }
  if (loading)
    return (
      <main className="page container loading">
        <div>
          <div className="loading-orbit" />
          <p>Recuperando tu lectura…</p>
        </div>
      </main>
    )
  if (error && !reading)
    return (
      <main className="page container">
        <div className="error">{error}</div>
      </main>
    )
  if (reading?.status === 'failed')
    return (
      <main className="page container">
        <div className="error">
          <h1>La lectura no pudo generarse</h1>
          <p>El servicio de interpretación falló antes de completar tu lectura.</p>
          <Link className="button secondary" to="/">
            Reintentar
          </Link>
        </div>
      </main>
    )
  const mode = reading.mode
  return (
    <main className="page container">
      <span className="eyebrow">Resultado</span>
      <h1 className="page-title">{reading.question || 'Tu lectura'}</h1>
      <span className="badge">Modo {mode === 'negative' ? 'negativo' : 'clásico'}</span>
      {error && <div className="error">{error}</div>}
      <div className="actions">
        <button className="button secondary" onClick={favorite}>
          {reading.is_favorite ? '★ En favoritos' : '☆ Marcar favorita'}
        </button>
        <button className="button secondary" onClick={() => setShareOpen(true)}>
          Compartir
        </button>
      </div>
      {showPreference && (
        <section className="panel" style={{ marginTop: '1rem' }}>
          <button className="share-close" type="button" aria-label="Descartar" style={{ float: 'right' }} onClick={() => setShowPreference(false)}>×</button>
          <AddressPreference compact value={user?.address_as ?? 'neutral'} onChange={(address_as) => setUser((current) => ({ ...current, address_as }))} onSaved={() => setShowPreference(false)} />
        </section>
      )}
      {revealedCount < (reading.cards_detail?.length || 0) && (
        <button
          className="button reveal-all"
          type="button"
          onClick={() => setRevealedCount(Infinity)}
        >
          Revelar todo
        </button>
      )}
      <ReadingDisplay reading={reading} revealedCount={revealedCount} />
      {shareOpen && <ShareSheet reading={reading} onClose={() => setShareOpen(false)} onPublished={setReading} />}
    </main>
  )
}
