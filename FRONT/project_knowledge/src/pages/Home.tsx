import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div style={{ padding: '40px 20px', textAlign: 'center' }}>
      <h1>Welcome</h1>
      <p>Your application is ready</p>
      <nav style={{ marginTop: '40px', display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link to="/upload" style={{ fontSize: '18px', padding: '10px 20px', border: '1px solid var(--accent)', borderRadius: '6px' }}>
          Upload des fichiers
        </Link>
        <Link to="/library" style={{ fontSize: '18px', padding: '10px 20px', border: '1px solid var(--accent)', borderRadius: '6px' }}>
          Bibliothèque
        </Link>
      </nav>
    </div>
  )
}
