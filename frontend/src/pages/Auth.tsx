import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Auth() {
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const navigate = useNavigate();

  return (
    <section className="auth">
      <nav>
        <Link to="/" className="logo">Website</Link>
        <Link to="/" className="nav-link">Home</Link>
      </nav>
      <div className="auth-card">
        <div className="auth-tabs">
          <button
            className={`tab${tab === 'login' ? ' active' : ''}`}
            onClick={() => setTab('login')}
          >
            Log In
          </button>
          <button
            className={`tab${tab === 'signup' ? ' active' : ''}`}
            onClick={() => setTab('signup')}
          >
            Sign Up
          </button>
        </div>

        {tab === 'login' ? (
          <form
            className="auth-form"
            onSubmit={(e) => { e.preventDefault(); alert('Log in submitted (demo only)'); }}
          >
            <h2>Log In</h2>
            <div className="field">
              <label>Email</label>
              <input type="email" name="email" placeholder="you@example.com" required />
            </div>
            <div className="field">
              <label>Password</label>
              <input type="password" name="password" placeholder="••••••••" required />
            </div>
            <button type="submit" className="btn">Log In</button>
          </form>
        ) : (
          <form
            className="auth-form"
            onSubmit={(e) => { e.preventDefault(); alert('Sign up submitted (demo only)'); }}
          >
            <h2>Create Account</h2>
            <div className="field">
              <label>Full Name</label>
              <input type="text" name="name" placeholder="Jane Doe" required />
            </div>
            <div className="field">
              <label>Email</label>
              <input type="email" name="email" placeholder="you@example.com" required />
            </div>
            <div className="field">
              <label>Password</label>
              <input type="password" name="password" placeholder="••••••••" required />
            </div>
            <button type="submit" className="btn">Sign Up</button>
          </form>
        )}

        <p className="switch">
          {tab === 'login' ? (
            <>Don't have an account? <span className="link" onClick={() => setTab('signup')}>Sign up</span></>
          ) : (
            <>Already have an account? <span className="link" onClick={() => setTab('login')}>Log in</span></>
          )}
        </p>
      </div>
    </section>
  );
}

