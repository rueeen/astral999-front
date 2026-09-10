import { useState } from 'react'
import api from '../api'
import { getErrorMessage } from '../utils'
import './ReadingFeedback.css'

const getInitialFeedback = (reading) => reading.feedback || reading.user_feedback || null

export default function ReadingFeedback({ readingId, reading }) {
  const initial = getInitialFeedback(reading)
  const [vote, setVote] = useState(initial?.vote || initial?.rating || '')
  const [comment, setComment] = useState(initial?.comment || '')
  const [status, setStatus] = useState(initial ? 'success' : 'idle')
  const [error, setError] = useState('')

  const submit = async (selectedVote) => {
    setVote(selectedVote)
    setStatus('saving')
    setError('')
    try {
      await api.post(`/api/readings/${readingId}/feedback/`, {
        vote: selectedVote,
        comment: comment.trim(),
      })
      setStatus('success')
    } catch (requestError) {
      setStatus('error')
      setError(getErrorMessage(requestError))
    }
  }

  const saving = status === 'saving'
  return (
    <section className="reading-feedback panel" aria-labelledby="feedback-title">
      <span className="feedback-sparkle" aria-hidden="true">
        ✦
      </span>
      <h2 id="feedback-title">¿Cómo sentiste esta lectura?</h2>
      <p>Tu feedback nos ayuda a mejorar las próximas lecturas de la IA.</p>
      <div className="feedback-votes" role="group" aria-label="Valorar lectura">
        <button
          type="button"
          className={`feedback-vote ${vote === 'like' ? 'selected' : ''}`}
          aria-pressed={vote === 'like'}
          disabled={saving}
          onClick={() => submit('like')}
        >
          <span aria-hidden="true">👍</span> Me gustó
        </button>
        <button
          type="button"
          className={`feedback-vote dislike ${vote === 'dislike' ? 'selected' : ''}`}
          aria-pressed={vote === 'dislike'}
          disabled={saving}
          onClick={() => submit('dislike')}
        >
          <span aria-hidden="true">👎</span> No me gustó
        </button>
      </div>
      <label htmlFor={`feedback-comment-${readingId}`}>Comentario opcional</label>
      <textarea
        id={`feedback-comment-${readingId}`}
        value={comment}
        maxLength="1000"
        disabled={saving}
        placeholder="Cuéntanos qué te resultó útil o qué podríamos mejorar…"
        onChange={(event) => {
          setComment(event.target.value)
          if (status === 'success') setStatus('idle')
        }}
      />
      <div className="feedback-status" aria-live="polite">
        {saving && 'Guardando tu feedback…'}
        {status === 'success' && '¡Gracias por tu feedback!'}
        {status === 'error' && (
          <span className="form-error">{error || 'No pudimos guardar tu feedback.'}</span>
        )}
      </div>
    </section>
  )
}
