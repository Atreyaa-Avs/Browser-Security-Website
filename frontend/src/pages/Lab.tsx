import { useRef } from 'react';

const BACKEND_NODE     = 'http://localhost:3000';   // npm run dev  (in-memory, no real SQL)
const BACKEND_WRANGLER = 'http://localhost:8787';   // wrangler dev (real D1 SQL engine)

// In production, VITE_API_URL is set to the Cloudflare Worker URL
const API = import.meta.env.VITE_API_URL ?? BACKEND_WRANGLER;

const vulnRoutes = [
  { path: `${API}/search?q=<script>alert(1)</script>`, label: '1. XSS — /search', vuln: 'Cross-Site Scripting' },
  { path: `${API}/login`, label: '2. SQL Injection — /login', vuln: 'SQL Injection' },
  { path: `${API}/profile/1`, label: '3. IDOR — /profile/1', vuln: 'Broken Access Control' },
  { path: `${API}/profile/2`, label: '   (compare /profile/2)', vuln: 'Broken Access Control' },
  { path: `${API}/headers`, label: '4. Missing Security Headers — /headers', vuln: 'Missing Security Headers' },
  { path: `${API}/session`, label: '5. Insecure Session Cookie — /session', vuln: 'Insecure Cookie' },
];

function escapeHtml(html: string): string {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

export default function Lab() {
  const resultRef = useRef<HTMLDivElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch(`${API}/login`, { method: 'POST', body: fd });
    const text = await res.text();
    if (resultRef.current) {
      resultRef.current.innerHTML = `<h4>Response</h4><pre>${escapeHtml(text)}</pre>`;
    }
  }

  return (
    <section className="lab">
      <nav>
        <a href="/" className="logo">Website</a>
        <a href="/" className="nav-link">Home</a>
      </nav>
      <header className="hero">
        <h1>Security Lab</h1>
        <p>Deliberately vulnerable endpoints served by the Hono backend (localhost:3000).</p>
        <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: API === BACKEND_WRANGLER ? '#16a34a' : '#d97706', fontWeight: 600 }}>
          {API === BACKEND_WRANGLER
            ? '✅ Connected to wrangler dev (real D1 SQL — SQLi works)'
            : '⚠️ Connected to Node.js dev (in-memory JS — SQLi is simulated only)'}
        </p>
      </header>
      <main className="lab-body">
        <ul className="vuln-list">
          {vulnRoutes.map((r) => (
            <li key={r.path + r.label} className="vuln-item">
              <a href={r.path} className="vuln-link" target="_blank" rel="noopener noreferrer">{r.label}</a>
              <span className="vuln-badge">{r.vuln}</span>
            </li>
          ))}
        </ul>
        <div className="sql-demo">
          <h3>SQLi demo (POST /login)</h3>
          <p>Try username: <code>' OR 1=1--</code> with any password. (The <code>--</code> comments out the password check.)</p>
          <form className="sql-form" onSubmit={handleSubmit}>
            <div className="field">
              <label>Username</label>
              <input name="username" defaultValue="' OR 1=1--" />
            </div>
            <div className="field">
              <label>Password</label>
              <input name="password" defaultValue="anything" />
            </div>
            <button type="submit" className="btn">Test Injection</button>
          </form>
          <div id="sqli-result" ref={resultRef} />
        </div>
      </main>
    </section>
  );
}

