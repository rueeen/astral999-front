import { useEffect, useRef, useState } from 'react'
import api from '../api'
import { getErrorMessage } from '../utils'
import './ShareSheet.css'

const formats = [
  ['story', 'Historia'],
  ['post', 'Publicación'],
  ['og', 'Enlace'],
]

export default function ShareSheet({ reading, token: initialToken, onClose, onPublished }) {
  const dialogRef = useRef(null)
  const [format, setFormat] = useState('story')
  const [token, setToken] = useState(initialToken || reading?.share_token || reading?.shared_token)
  const [publishing, setPublishing] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    dialogRef.current?.focus()
  }, [])

  const imageUrl = token
    ? `${api.defaults.baseURL}/api/readings/shared/${token}/image/?format=${format}`
    : ''
  const publicUrl = token ? `${window.location.origin}/s/${token}` : ''

  const publish = async () => {
    if (token) return token
    setPublishing(true)
    setError('')
    try {
      const { data } = await api.post(`/api/readings/${reading.id}/share/`)
      const nextToken = data.share_token || data.shared_token || data.token
      if (!nextToken) throw new Error('No se recibió el enlace público.')
      setToken(nextToken)
      setImageLoading(true)
      onPublished?.({ ...reading, ...data, share_token: nextToken })
      return nextToken
    } catch (requestError) {
      setError(getErrorMessage(requestError))
      return null
    } finally {
      setPublishing(false)
    }
  }

  const getImageFile = async () => {
    let activeToken = token
    if (!activeToken) activeToken = await publish()
    if (!activeToken) return null
    const url = `${api.defaults.baseURL}/api/readings/shared/${activeToken}/image/?format=${format}`
    const response = await fetch(url)
    if (!response.ok) throw new Error('No se pudo generar la imagen. Inténtalo de nuevo.')
    const blob = await response.blob()
    return new File([blob], 'lectura.png', { type: 'image/png' })
  }

  const shareImage = async () => {
    setError('')
    setNotice('Preparando imagen…')
    try {
      const file = await getImageFile()
      if (!file) return
      if (!navigator.canShare?.({ files: [file] })) {
        setNotice('Tu navegador no permite compartir archivos. Puedes descargar la imagen.')
        return
      }
      await navigator.share({ files: [file] })
      setNotice('Imagen lista para compartir.')
    } catch (shareError) {
      if (shareError.name !== 'AbortError') setError(shareError.message || getErrorMessage(shareError))
      setNotice('')
    }
  }

  const download = async () => {
    setError('')
    try {
      const file = await getImageFile()
      if (!file) return
      const href = URL.createObjectURL(file)
      const anchor = document.createElement('a')
      anchor.href = href
      anchor.download = file.name
      anchor.click()
      URL.revokeObjectURL(href)
      setNotice('Imagen descargada.')
    } catch (downloadError) {
      setError(downloadError.message || getErrorMessage(downloadError))
    }
  }

  const copyLink = async () => {
    const activeToken = token || (await publish())
    if (!activeToken) return
    const url = `${window.location.origin}/s/${activeToken}`
    try {
      await navigator.clipboard.writeText(url)
      setNotice('Enlace copiado.')
    } catch {
      setNotice(url)
    }
  }

  return (
    <div className="share-backdrop" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <section className="share-sheet" role="dialog" aria-modal="true" aria-labelledby="share-title" tabIndex="-1" ref={dialogRef}>
        <div className="share-heading">
          <div>
            <span className="eyebrow">Compartir</span>
            <h2 id="share-title">Tu lectura como imagen</h2>
          </div>
          <button className="share-close" type="button" aria-label="Cerrar" onClick={onClose}>×</button>
        </div>
        <div className={`share-preview preview-${format}`}>
          {!token ? (
            <div className="share-placeholder">La previsualización aparecerá al publicar la lectura.</div>
          ) : (
            <>
              {imageLoading && <div className="share-image-loading">Generando imagen…</div>}
              <img
                src={imageUrl}
                alt="Previsualización de la lectura para compartir"
                onLoad={() => setImageLoading(false)}
                onError={() => { setImageLoading(false); setError('No se pudo cargar la imagen.') }}
              />
            </>
          )}
        </div>
        <fieldset className="share-formats">
          <legend>Formato</legend>
          {formats.map(([value, label]) => (
            <label key={value}>
              <input type="radio" name="share-format" value={value} checked={format === value} onChange={() => { setFormat(value); setImageLoading(true); setError('') }} />
              <span>{label}</span>
            </label>
          ))}
        </fieldset>
        {!token && <p className="share-privacy">Al continuar, la lectura quedará visible para quien tenga el enlace. La imagen mostrará las cartas y la frase final, pero no tu pregunta. Podrás revocarlo después.</p>}
        {error && <div className="error" role="alert">{error}</div>}
        {notice && <p className="notice" role="status">{notice}</p>}
        <div className="share-actions">
          <button className="button" type="button" disabled={publishing} onClick={shareImage}>{publishing ? 'Publicando…' : 'Compartir imagen'}</button>
          <button className="button secondary" type="button" disabled={publishing} onClick={download}>Descargar PNG</button>
          <button className="button secondary" type="button" disabled={publishing} onClick={copyLink}>Copiar enlace</button>
        </div>
        {publicUrl && <span className="sr-only">{publicUrl}</span>}
      </section>
    </div>
  )
}
