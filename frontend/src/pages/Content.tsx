import { Link, useNavigate } from 'react-router-dom';

export default function Content() {
  const navigate = useNavigate();
  return (
    <section className="content">
      <nav>
        <Link to="/" className="logo">Website</Link>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/auth" className="nav-link">Log In / Sign Up</Link>
        </div>
      </nav>
      <main className="content-body">
        <h2>Content Page</h2>
        <p>This is the destination page reached from the CTA buttons on the landing page.</p>
        <p>You can add your own articles, features, or information here.</p>
        <ul className="features">
          <li>Feature one: Fast performance with Vite</li>
          <li>Feature two: Client-side routing with React Router</li>
          <li>Feature three: Clean, responsive layout</li>
        </ul>
        <button className="cta back" onClick={() => navigate('/')}>Back to Home</button>
      </main>
    </section>
  );
}

