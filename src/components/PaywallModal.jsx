import { useEffect, useRef, useState } from 'react'
import './PaywallModal.css'

export default function PaywallModal({ data, onClose }) {
  const modalRef = useRef(null)
  const returnFocusRef = useRef(null)
  const [upgradeNotice, setUpgradeNotice] = useState('')

  useEffect(() => {
    if (!data) return undefined
    returnFocusRef.current = document.activeElement
    const modal = modalRef.current
    const focusable = () => [
      ...modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ),
    ]
    focusable()[0]?.focus()
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
      if (event.key !== 'Tab') return
      const elements = focusable()
      if (!elements.length) return
      const first = elements[0]
      const last = elements[elements.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      returnFocusRef.current?.focus()
    }
  }, [data, onClose])

  if (!data) return null
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        className="panel modal"
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="paywall-title"
      >
        <button className="modal-close" onClick={onClose} aria-label="Cerrar">
          ×
        </button>
        <span className="eyebrow">Límite del cosmos</span>
        <h2 id="paywall-title">
          {data.code === 'spread_not_available'
            ? 'Esta tirada requiere Premium'
            : 'Agotaste tus lecturas'}
        </h2>
        {data.used != null && (
          <p>
            Has usado <strong>{data.used}</strong> de <strong>{data.limit}</strong> lecturas.
          </p>
        )}
        {data.resets_at && (
          <p>Tu cupo se renueva el {new Date(data.resets_at).toLocaleDateString('es-ES')}.</p>
        )}
        <button
          className="button"
          onClick={() => setUpgradeNotice('Las mejoras de plan estarán disponibles próximamente.')}
        >
          Mejorar mi plan
        </button>
        {upgradeNotice && (
          <p className="notice" role="status">
            {upgradeNotice}
          </p>
        )}
      </div>
    </div>
  )
}
