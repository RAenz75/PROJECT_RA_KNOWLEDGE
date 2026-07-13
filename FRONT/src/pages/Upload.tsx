import { useState } from 'react'
import { Link } from 'react-router-dom'
import '../styles/Upload.css'

export default function Upload() {
  const [files, setFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (file) => file.type === 'text/markdown' || file.name.endsWith('.md')
    )

    if (droppedFiles.length === 0) {
      setStatus('error')
      setMessage('Veuillez déposer des fichiers .md uniquement')
      return
    }

    setFiles((prev) => [...prev, ...droppedFiles])
    setStatus('idle')
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.currentTarget.files || [])
    if (selectedFiles.length > 0) {
      setFiles((prev) => [...prev, ...selectedFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (files.length === 0) {
      setStatus('error')
      setMessage('Aucun fichier sélectionné')
      return
    }

    setUploading(true)
    setStatus('idle')

    const formData = new FormData()
    files.forEach((file) => {
      formData.append('files', file)
    })

    try {
      const response = await fetch('http://localhost:3000/api/fichiers/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`)
      }

      const data = await response.json()
      setStatus('success')
      setMessage('Fichiers uploadés avec succès !')
      setFiles([])
      console.log('Réponse API:', data)
    } catch (error) {
      setStatus('error')
      setMessage(
        error instanceof Error ? error.message : 'Erreur lors de l\'upload'
      )
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="upload-container">
      <div className="upload-header">
        <h1>Upload des fichiers Markdown</h1>
        <Link to="/library" className="library-btn">
          📚 Bibliothèque
        </Link>
      </div>

      <div
        className={`dropzone ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2v11m0 0l-3-3m3 3l3-3M5 21h14"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <h2>Déposez vos fichiers .md ici</h2>
        <p>ou</p>
        <label className="file-input-label">
          Parcourir
          <input
            type="file"
            multiple
            accept=".md"
            onChange={handleFileInput}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      {files.length > 0 && (
        <div className="files-section">
          <h3>Fichiers à uploader ({files.length})</h3>
          <ul className="files-list">
            {files.map((file, index) => (
              <li key={index} className="file-item">
                <span>{file.name}</span>
                <button
                  className="remove-btn"
                  onClick={() => removeFile(index)}
                  type="button"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>

          <button
            className="upload-btn"
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? 'Upload en cours...' : 'Uploader'}
          </button>
        </div>
      )}

      {status !== 'idle' && (
        <div className={`status-message ${status}`}>
          {message}
        </div>
      )}
    </div>
  )
}
