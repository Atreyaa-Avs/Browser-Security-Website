import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

// Allow local dev + deployed Vercel frontend
app.use('*', cors({
  origin: (origin) => {
    // Allow any localhost port (local dev) or any *.vercel.app domain
    if (!origin) return origin; // non-browser / curl
    if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) return origin;
    if (origin.endsWith('.vercel.app')) return origin;
    // Add your custom Vercel domain here if you set one:
    // if (origin === 'https://your-app.vercel.app') return origin;
    return null; // block everything else
  },
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type'],
}));

type Env = {
  DB?: D1Db;
};

// Minimal structural shim so `tsc` passes in Node dev.
// On Cloudflare Workers the real `D1Database` is structurally compatible.
interface D1Result {
  results: unknown[];
}
interface D1Stmt {
  bind(...params: unknown[]): D1Stmt;
  all(): Promise<D1Result>;
}
interface D1Db {
  prepare(sql: string): D1Stmt;
}

// ---------- D1 helpers (Cloudflare) ----------
function getDb(c: any): D1Db | null {
  return (c.env as Env)?.DB ?? null;
}

async function dbAll(db: D1Db | null, sql: string, ...params: unknown[]) {
  if (!db) return null;
  const stmt = db.prepare(sql);
  stmt.bind(...params);
  return stmt.all();
}

// ---------- Mock data (fallback when D1 is not bound) ----------
const users = [
  { id: 1, username: 'alice', password: 'password123', email: 'alice@example.com' },
  { id: 2, username: 'bob', password: 'secret456', email: 'bob@example.com' },
];

const profiles = [
  { id: 1, name: 'Alice', role: 'researcher', email: 'alice@example.com' },
  { id: 2, name: 'Bob', role: 'developer', email: 'bob@example.com' },
];

// Health check
app.get('/', (c) => {
  return c.json({ status: 'ok', db: !!getDb(c), routes: ['/search', '/login', '/profile/:id', '/headers', '/session'] });
});

// 1. Cross-Site Scripting (XSS) — GET /search?q=
// Vulnerability: user-controlled `q` is reflected unsafely into HTML
app.get('/search', (c) => {
  const q = c.req.query('q') || '';
  const html = `<!DOCTYPE html><html><body>
    <h2>Search Results</h2>
    <p>Results for: ${q}</p>
    <a href="/">Home</a>
  </body></html>`;
  return c.html(html);
});

// 2. SQL Injection (SQLi) — GET /login (form) + POST /login
// Vulnerability: input concatenated directly into a SQL query string
app.get('/login', (c) => {
  const html = `<!DOCTYPE html><html><body>
    <h2>Login</h2>
    <form method="POST" action="/login">
      <label>Username <input name="username" /></label><br />
      <label>Password <input name="password" type="password" /></label><br />
      <button type="submit">Sign In</button>
    </form>
    <p><a href="/">Home</a></p>
  </body></html>`;
  return c.html(html);
});

app.post('/login', async (c) => {
  const body = await c.req.parseBody();
  const username = String(body.username ?? '');
  const password = String(body.password ?? '');

  const db = getDb(c);
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;

  let user;
  if (db) {
    // UNSAFE: concatenated query executed against D1
    const res = await dbAll(db, query);
    user = (res?.results as any[])?.[0];
  } else {
    user = users.find((u) => u.username === username && u.password === password);
  }

  const html = `<!DOCTYPE html><html><body>
    <h2>Login Result</h2>
    <pre>Query executed: ${query}</pre>
    <p>${user ? 'Login successful' : 'Invalid credentials'}</p>
    <a href="/">Home</a>
  </body></html>`;
  return c.html(html);
});

// 3. Broken Access Control (IDOR) — GET /profile/:id
// Vulnerability: no ownership/authorization check; any ID is returned
app.get('/profile/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  const db = getDb(c);

  let profile;
  if (db) {
    const res = await dbAll(db, 'SELECT * FROM profiles WHERE id = ?', id);
    profile = (res?.results as any[])?.[0];
  } else {
    profile = profiles.find((p) => p.id === id);
  }

  if (!profile) {
    return c.json({ error: 'Profile not found' }, 404);
  }
  return c.json(profile);
});

// 4. Missing Security Headers — GET /headers
// Vulnerability: response omits CSP, X-Frame-Options, etc.
app.get('/headers', (c) => {
  const html = `<!DOCTYPE html><html><body>
    <h2>Security Headers Page</h2>
    <p>This response intentionally omits security headers.</p>
    <a href="/">Home</a>
  </body></html>`;
  return c.html(html);
});

// 5. Insecure Session Cookie — GET /session
// Vulnerability: Set-Cookie without HttpOnly, Secure, or SameSite
app.get('/session', (c) => {
  c.header('Set-Cookie', 'sessionid=insecure-test-token-123; Path=/');
  const html = `<!DOCTYPE html><html><body>
    <h2>Session Set</h2>
    <p>A session cookie was issued without HttpOnly, Secure, or SameSite.</p>
    <a href="/">Home</a>
  </body></html>`;
  return c.html(html);
});

// Default export for Cloudflare Workers (wrangler uses this)
export default app;

// Native Node.js HTTP server for local development (no extra package needed)
// Only runs when executed directly (tsx src/index.ts), not under wrangler
if (typeof process !== 'undefined' && process.versions?.node) {
  (async () => {
    const http = await import('node:http');
    const port = Number(process.env.PORT) || 3000;
    http
      .createServer(async (req, res) => {
        const url = new URL(req.url ?? '/', 'http://localhost');
        const headers: Record<string, string> = {};
        if (req.headers.cookie) headers.cookie = req.headers.cookie;
        if (req.headers['content-type']) headers['content-type'] = req.headers['content-type'];

        let body: string | undefined;
        if (req.method === 'POST') {
          body = await new Promise<string>((resolve, reject) => {
            const chunks: Buffer[] = [];
            req.on('data', (chunk: Buffer) => chunks.push(chunk));
            req.on('end', () => resolve(Buffer.concat(chunks).toString()));
            req.on('error', reject);
          });
        }

        const request = new Request(`http://localhost:${port}${url.pathname}${url.search}`, {
          method: req.method ?? 'GET',
          headers,
          body,
        });

        try {
          const response = await app.fetch(request);
          res.writeHead(response.status, Object.fromEntries(response.headers.entries()));
          const text = await response.text();
          res.end(text);
        } catch {
          res.writeHead(500);
          res.end('Internal Server Error');
        }
      })
      .listen(port, () => { 
        console.log(`\n Backend running at http://localhost:${port}`);
        console.log(`   Port : ${port}`);
        console.log(`   DB   : ${getDb({} as any) ? 'D1 bound' : 'in-memory fallback'}\n`);
      });
  })();
}
