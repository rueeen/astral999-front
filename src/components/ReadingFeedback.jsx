import { useState } from 'react'
import api from '../api'
import { getErrorMessage, getFieldErrors } from '../utils'
import './ReadingFeedback.css'

const voteFromValue = (value) => {
  if (value === 1) return 'like'
  if (value === -1) return 'dislike'
  return ''
}

const valueFromVote = (vote) => {
  if (vote === 'like') return 1
  if (vote === 'dislike') return -1
  return null
}

export default function ReadingFeedback({ readingId, reading }) {
  const initial = reading.feedback
  const [vote, setVote] = useState(voteFromValue(initial?.value))
  const [comment, setComment] = useState(initial?.comment || '')
  const [savedComment, setSavedComment] = useState(initial?.comment || '')
  const [hasFeedback, setHasFeedback] = useState(Boolean(initial))
  const [status, setStatus] = useState('idle')
  const [statusMessage, setStatusMessage] = useState('')
  const [errors, setErrors] = useState({})

  const save = async ({ selectedVote = vote, commentOnly = false } = {}) => {
    const value = valueFromVote(selectedVote)

    if (!hasFeedback && value === null) {
      setStatus('error')
      setStatusMessage('')
      setErrors({ value: 'Elige primero si te gustó la lectura.' })
      return
    }

    setVote(selectedVote)
    setStatus('saving')
    setStatusMessage('')
    setErrors({})
    try {
      const method = hasFeedback ? 'patch' : 'post'
      const savedValue = comment.trim()
      const payload =
        commentOnly && hasFeedback ? { comment: savedValue } : { value, comment: savedValue }
      await api[method](`/api/readings/${readingId}/feedback/`, payload)
      setHasFeedback(true)
      setComment(savedValue)
      setSavedComment(savedValue)
      setStatus('success')
      setStatusMessage(
        commentOnly
          ? 'Comentario guardado.'
          : hasFeedback
            ? 'Actualizamos tu feedback.'
            : '¡Gracias por tu feedback!',
      )
    } catch (requestError) {
      setStatus('error')
      setErrors(getFieldErrors(requestError))
      setStatusMessage(getErrorMessage(requestError))
    }
  }

  const saving = status === 'saving'
  const commentChanged = comment !== savedComment
  const valueErrorId = `feedback-value-error-${readingId}`
  const commentErrorId = `feedback-comment-error-${readingId}`
  return (
    <section className="reading-feedback panel" aria-labelledby="feedback-title">
      <span className="feedback-sparkle" aria-hidden="true">
        ✦
      </span>
      <h2 id="feedback-title">¿Cómo sentiste esta lectura?</h2>
      <p>Tu feedback nos ayuda a mejorar las próximas lecturas de la IA.</p>
      <div
        className="feedback-votes"
        role="group"
        aria-label="Valorar lectura"
        aria-describedby={errors.value ? valueErrorId : undefined}
      >
        <button
          type="button"
          className={`feedback-vote ${vote === 'like' ? 'selected' : ''}`}
          aria-pressed={vote === 'like'}
          disabled={saving}
          onClick={() => save({ selectedVote: 'like' })}
        >
          <span aria-hidden="true">👍</span> Me gustó
        </button>
        <button
          type="button"
          className={`feedback-vote dislike ${vote === 'dislike' ? 'selected' : ''}`}
          aria-pressed={vote === 'dislike'}
          disabled={saving}
          onClick={() => save({ selectedVote: 'dislike' })}
        >
          <span aria-hidden="true">👎</span> No me gustó
        </button>
      </div>
      {errors.value && (
        <span id={valueErrorId} className="form-error feedback-field-error">
          {errors.value}
        </span>
      )}
      <label htmlFor={`feedback-comment-${readingId}`}>Comentario opcional</label>
      <textarea
        id={`feedback-comment-${readingId}`}
        aria-describedby={errors.comment ? commentErrorId : undefined}
        aria-invalid={Boolean(errors.comment)}
        value={comment}
        maxLength="1000"
        disabled={saving}
        placeholder="Cuéntanos qué te resultó útil o qué podríamos mejorar…"
        onChange={(event) => {
          setComment(event.target.value)
          setErrors((current) => ({ ...current, comment: undefined }))
          if (status === 'success') setStatus('idle')
        }}
      />
      {errors.comment && (
        <span id={commentErrorId} className="form-error feedback-field-error">
          {errors.comment}
        </span>
      )}
      {(hasFeedback || vote || commentChanged) && (
        <button
          type="button"
          className="feedback-save-comment"
          disabled={saving || !commentChanged}
          onClick={() => save({ commentOnly: true })}
        >
          Guardar comentario
        </button>
      )}
      <div className="feedback-status" aria-live="polite">
        {saving && 'Guardando tu feedback…'}
        {status === 'success' && statusMessage}
        {status === 'error' && (
          <span className="form-error">
            {errors.detail ||
              (!errors.value && !errors.comment
                ? statusMessage || 'No pudimos guardar tu feedback.'
                : '')}
          </span>
        )}
      </div>
    </section>
  )
}
