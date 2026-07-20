import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import '../styles/Element.css'

interface FileItem {
  id: string
  name: string
  createdAt: string
  content: string
}

export default function Element() {
  const { id } = useParams()
  const [file, setFile] = useState<FileItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchFile = async () => {
      try {
        setLoading(true)
        setError('')
        const response = await fetch(`http://localhost:3000/api/fichiers/${id}`, {
          method: 'GET',
        })

        if (!response.ok) {
          throw new Error(`Erreur ${response.status}`)
        }

        const data = await response.json()
        setFile(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement')
      } finally {
        setLoading(false)
      }
    }

    fetchFile()
  }, [id])

  if (loading) {
    return (
      <div className="element-container">
        <div className="loading">Chargement du fichier...</div>
      </div>
    )
  }

  return (
    <div className="element-container">
      <div className="element-header">
        <h1>{file?.name ?? 'Fichier'}</h1>
        <Link to="/library" className="back-btn">
          ⬅ Retour
        </Link>
      </div>

      {error && <div className="error-message">{error}</div>}

      {file && (
        <>
          <div className="element-date">
            {new Date(file.createdAt).toLocaleDateString('fr-FR')}
          </div>
          <pre className="element-raw">{file.content}</pre>
        </>
      )}
    </div>
  )
}
