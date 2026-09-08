import { useEffect, useState } from 'react'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage, getFieldErrors } from '../utils'
export default function Profile() {
  const { user, setUser, plan, setPlan } = useAuth()
  const [form, setForm] = useState({}),
    [loading, setLoading] = useState(!user),
    [busy, setBusy] = useState(false),
    [errors, setErrors] = useState({}),
    [saved, setSaved] = useState(false)
  useEffect(() => {
    if (user) {
      setForm(user)
      setLoading(false)
      return
    }
    api
      .get('/api/users/me/')
      .then((r) => {
        setUser(r.data)
        setForm(r.data)
      })
      .catch((e) => setErrors({ detail: getErrorMessage(e) }))
      .finally(() => setLoading(false))
  }, [user, setUser])
  useEffect(() => {
    if (!plan)
      api
        .get('/api/users/me/quota/')
        .then((r) => setPlan(r.data))
        .catch(() => {})
  }, [plan, setPlan])
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setSaved(false)
    setErrors({})
    try {
      const { data } = await api.put('/api/users/me/', form)
      setUser(data)
      setForm(data)
      setSaved(true)
    } catch (e) {
      setErrors(getFieldErrors(e))
    } finally {
      setBusy(false)
    }
  }
  if (loading)
    return (
      <main className="page container loading">
        <div>
          <div className="loading-orbit" />
          <p>Consultando tu carta astral…</p>
        </div>
      </main>
    )
  return (
    <main className="page container">
      <span className="eyebrow">Tu espacio</span>
      <h1 className="page-title">Perfil</h1>
      {errors.detail && <div className="error">{errors.detail}</div>}
      <div className="grid two-col">
        <form className="panel" onSubmit={submit}>
          <h2>Datos personales</h2>
          {[
            ['username', 'Usuario', 'text'],
            ['email', 'Correo electrónico', 'email'],
            ['first_name', 'Nombre', 'text'],
            ['birth_date', 'Fecha de nacimiento', 'date'],
            ['birth_time', 'Hora de nacimiento', 'time'],
            ['birth_place', 'Lugar de nacimiento', 'text'],
          ].map(([name, label, type]) => (
            <div className="field" key={name}>
              <label htmlFor={name}>{label}</label>
              <input id={name} name={name} type={type} value={form[name] || ''} onChange={change} />
              {errors[name] && <p className="form-error">{errors[name]}</p>}
            </div>
          ))}
          <button className="button" disabled={busy}>
            {busy ? 'Guardando…' : 'Guardar cambios'}
          </button>
          {saved && (
            <p role="status" style={{ color: 'var(--gold)' }}>
              Cambios guardados.
            </p>
          )}
        </form>
        <aside>
          <div className="panel">
            <span className="eyebrow">Signo solar</span>
            <h2 style={{ font: '2.5rem var(--serif)' }}>{form.zodiac_sign || 'Por descubrir'}</h2>
            {!form.zodiac_sign && (
              <p className="notice">Añade tu fecha de nacimiento para calcularlo.</p>
            )}
          </div>
          <div className="panel" style={{ marginTop: '1rem' }}>
            <span className="eyebrow">Plan actual</span>
            <h2 style={{ textTransform: 'capitalize' }}>{plan?.plan || '—'}</h2>
            {plan ? (
              <p>
                <strong>
                  {plan.limit === null ? 'Ilimitadas' : Math.max(0, plan.limit - plan.used)}
                </strong>{' '}
                lecturas restantes este mes.
              </p>
            ) : (
              <p className="notice">No se pudo cargar el estado del plan.</p>
            )}
          </div>
        </aside>
      </div>
    </main>
  )
}
