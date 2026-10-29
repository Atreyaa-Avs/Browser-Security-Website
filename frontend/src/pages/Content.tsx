import { useNavigate } from 'react-router-dom';

export default function Content() {
  const navigate = useNavigate();
  return (
    <section className="content">
      <nav>
        <a href="/" className="logo">Website</a>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <a href="/" className="nav-link">Home</a>
          <a href="/auth" className="nav-link">Log In / Sign Up</a>
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

