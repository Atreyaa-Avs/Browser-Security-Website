import { Link, useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  return (
    <section className="home">
      <nav>
        <Link to="/" className="logo">Website</Link>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/auth" className="nav-link">Log In / Sign Up</Link>
          <Link to="/lab" className="nav-link">Security Lab</Link>
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

