import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import '../styles/Library.css'

interface FileItem {
  id: string
  name: string
  createdAt: string
  size?: number
  url?: string
}

export default function Library() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        setLoading(true)
        setError('')
        const response = await fetch('http://localhost:3000/api/fichiers', {
          method: 'GET',
        })

        if (!response.ok) {
          throw new Error(`Erreur ${response.status}`)
        }

        const data = await response.json()
        setFiles(Array.isArray(data) ? data : data.files || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement')
      } finally {
        setLoading(false)
      }
    }

    fetchFiles()
  }, [])

  const handleRefresh = () => {
    window.location.reload()
  }

  if (loading) {
    return (
      <div className="library-container">
        <div className="loading">Chargement des fichiers...</div>
      </div>
    )
  }

  return (
    <div className="library-container">
      <div className="library-header">
        <h1>Bibliothèque des fichiers</h1>
        <div className="header-actions">
          <button className="refresh-btn" onClick={handleRefresh}>
            ↻ Actualiser
          </button>
          <Link to="/" className="back-btn">
            ⬅ Retour
          </Link>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {files.length === 0 ? (
        <div className="empty-state">
          <p>Aucun fichier trouvé</p>
        </div>
      ) : (
        <div className="files-table-wrapper">
          <table className="files-table">
            <thead>
              <tr>
                <th>Nom du fichier</th>
                <th>Date</th>
                {files.some((f) => f.size) && <th>Taille</th>}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file.id}>
                  <td className="file-name">{file.name}</td>
                  <td className="file-date">
                    {new Date(file.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  {files.some((f) => f.size) && (
                    <td className="file-size">
                      {file.size
                        ? `${(file.size / 1024).toFixed(2)} KB`
                        : '-'}
                    </td>
                  )}
                  <td className="file-actions">
                    {file.url && (
                      <a href={file.url} download className="action-btn download">
                        Télécharger
                      </a>
                    )}
                    <button className="action-btn view">Voir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="file-count">
        {files.length} fichier{files.length !== 1 ? 's' : ''}
      </div>
    </div>
  )
}
