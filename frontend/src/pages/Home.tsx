import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  return (
    <section className="home">
      <nav>
        <a href="/" className="logo">Website</a>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <a href="/auth" className="nav-link">Log In / Sign Up</a>
          <a href="/lab" className="nav-link">Security Lab</a>
        </div>
      </nav>
      <header className="hero">
        <h1>Welcome to Website 1</h1>
        <p>Build something great with a modern Vite-powered site.</p>
        <div className="cta-group">
          <button className="cta primary" onClick={() => navigate('/content')}>Explore Content</button>
          <button className="cta secondary" onClick={() => navigate('/auth')}>Create Account</button>
        </div>
      </header>
    </section>
  );
}

