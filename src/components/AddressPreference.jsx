import { useState } from 'react'
import api from '../api'
import { getErrorMessage } from '../utils'
import './AddressPreference.css'

const choices = [
  ['masculine', 'En masculino', '“te sientes preparado”'],
  ['feminine', 'En femenino', '“te sientes preparada”'],
  ['neutral', 'Sin marcar', '“sientes que estás en tu momento”'],
]

export default function AddressPreference({ value, onChange, compact = false, onSaved }) {
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const save = async (addressAs) => {
    onChange(addressAs)
    setSaving(true)
    setMessage('')
    try {
      const { data } = await api.patch('/api/users/me/', { address_as: addressAs })
      onChange(data.address_as ?? addressAs)
      setMessage('Preferencia guardada.')
      onSaved?.(data)
    } catch (error) {
      setMessage(getErrorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  return (
    <fieldset className={`address-preference ${compact ? 'compact' : ''}`}>
      <legend>¿Cómo prefieres que te hablemos en las lecturas?</legend>
      <div className="address-options">
        {choices.map(([choice, label, example]) => (
          <label className="address-option" key={choice}>
            <input
              type="radio"
              name={compact ? 'reading_address_as' : 'address_as'}
              value={choice}
              checked={value === choice}
              onChange={() => save(choice)}
            />
            <span>
              <strong>{label}</strong>
              <small>{example}</small>
            </span>
          </label>
        ))}
      </div>
      <span className="address-status" role="status">
        {saving ? 'Guardando…' : message}
      </span>
    </fieldset>
  )
}
