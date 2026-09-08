import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import PaywallModal from '../components/PaywallModal'
import TarotCardImage from '../components/TarotCardImage'
import { cardBackImage } from '../deck'
import { getErrorMessage } from '../utils'
import './Home.css'
const spreadSizes = { one_card: 1, three_cards: 3, celtic_cross: 10 }
const spreads = [
  ['one_card', 'Una carta', 'Una respuesta clara'],
  ['three_cards', 'Tres cartas', 'Pasado, presente y futuro'],
  ['celtic_cross', 'Cruz celta', 'Una mirada profunda · Premium'],
]
export default function Home() {
  const navigate = useNavigate()
  const [quota, setQuota] = useState(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(''),
    [form, setForm] = useState({ question: '', spread: 'one_card', mode: 'classic' }),
    [creating, setCreating] = useState(false),
    [paywall, setPaywall] = useState(null)
  useEffect(() => {
    let live = true
    api
      .get('/api/users/me/quota/')
      .then(({ data }) => live && setQuota(data))
      .catch((e) => live && setError(getErrorMessage(e)))
      .finally(() => live && setLoading(false))
    return () => {
      live = false
    }
  }, [])
  const unavailable = (id) =>
    (id === 'celtic_cross' && quota && quota.plan !== 'premium') ||
    (quota?.available_spreads && !quota.available_spreads.includes(id))
  const submit = async (e) => {
    e.preventDefault()
    setCreating(true)
    setError('')
    try {
      const { data } = await api.post('/api/readings/', form)
      sessionStorage.setItem(`reading-mode:${data.id}`, form.mode)
      navigate(`/lecturas/${data.id}`, { state: { reading: data, mode: form.mode } })
    } catch (err) {
      const data = err.response?.data
      if (
        err.response?.status === 403 &&
        ['quota_exceeded', 'spread_not_available'].includes(data?.code)
      )
        setPaywall(data)
      else if (err.response?.status === 503)
        setError(
          'La lectura no pudo generarse porque el servicio de interpretación no está disponible. Inténtalo de nuevo.',
        )
      else setError(getErrorMessage(err))
    } finally {
      setCreating(false)
    }
  }
  if (loading)
    return (
      <main className="page container loading">
        <div>
          <img
            className="deck-loading-back"
            src={cardBackImage}
            alt="Reverso de una carta de tarot"
          />
          <p>Consultando tus ciclos y lecturas disponibles…</p>
        </div>
      </main>
    )
  return (
    <main className="page container home">
      <span className="eyebrow">Nueva lectura</span>
      <h1 className="page-title">¿Qué quieres iluminar?</h1>
      <p className="lead">
        Formula una pregunta abierta. Las cartas ofrecen perspectiva, no certezas.
      </p>
      {error && (
        <div className="error">
          {error}
          {!creating && (
            <button type="button" className="button secondary retry-button" onClick={submit}>
              Reintentar
            </button>
          )}
        </div>
      )}
      {!quota && !error && (
        <div className="empty">No pudimos encontrar la información de tu plan.</div>
      )}
      {quota && (
        <>
          <div className="quota">
            <span className="badge">Plan {quota.plan || 'actual'}</span>
            <span>
              {quota.remaining ??
                quota.readings_remaining ??
                Math.max(0, (quota.limit || 0) - (quota.used || 0))}{' '}
              lecturas disponibles
            </span>
          </div>
          <form className="panel reading-form" onSubmit={submit}>
            <div className="field">
              <label htmlFor="question">Tu pregunta</label>
              <textarea
                id="question"
                required
                maxLength="500"
                placeholder="¿Qué necesito comprender sobre…?"
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
              />
            </div>
            <fieldset>
              <legend>Elige una tirada</legend>
              <div className="choice-grid">
                {spreads.map(([id, title, copy]) => (
                  <label className={`choice ${unavailable(id) ? 'disabled' : ''}`} key={id}>
                    <input
                      type="radio"
                      name="spread"
                      value={id}
                      checked={form.spread === id}
                      disabled={unavailable(id)}
                      onChange={(e) => setForm({ ...form, spread: e.target.value })}
                    />
                    <strong>{title}</strong>
                    <small>{copy}</small>
                    {unavailable(id) && <span className="badge">No disponible</span>}
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend>Elige el tono</legend>
              <div className="mode-row">
                <label>
                  <input
                    type="radio"
                    name="mode"
                    value="classic"
                    checked={form.mode === 'classic'}
                    onChange={(e) => setForm({ ...form, mode: e.target.value })}
                  />{' '}
                  Clásico
                </label>
                <label>
                  <input
                    type="radio"
                    name="mode"
                    value="negative"
                    checked={form.mode === 'negative'}
                    onChange={(e) => setForm({ ...form, mode: e.target.value })}
                  />{' '}
                  Negativo
                </label>
              </div>
            </fieldset>
            <button className="button" disabled={creating}>
              {creating ? 'Las cartas están hablando…' : 'Tirar las cartas ✦'}
            </button>
            {creating && (
              <div className="creating">
                <div className={`spread spread-${form.spread} creating-spread`}>
                  {Array.from({ length: spreadSizes[form.spread] }, (_, index) => (
                    <div className="drawn-card" key={index}>
                      <TarotCardImage revealed={false} />
                    </div>
                  ))}
                </div>
                <h3>Tejiendo tu lectura</h3>
                <p>
                  La interpretación puede tardar entre 5 y 15 segundos. Respira; estamos conectando
                  los símbolos con tu pregunta.
                </p>
              </div>
            )}
          </form>
        </>
      )}
      <PaywallModal data={paywall} onClose={() => setPaywall(null)} />
    </main>
  )
}
