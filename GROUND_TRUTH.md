# Ground Truth — Deliberately Vulnerable App

Local backend: `http://localhost:3000` (Node.js via `tsx`)
Cloudflare: `wrangler dev` / `wrangler deploy` (D1 bound)

D1 database: `web-security-agent-db` (`93fa47f8-9f2b-4c85-9bf4-31db43725bfb`, Asia)

| # | Route | Scenario | Severity | Expected finding |
|---|-------|----------|----------|------------------|
| 1 | `/search?q=` | Cross-Site Scripting (XSS) | High | User input reflected unencoded into HTML; `<script>` executes |
| 2 | `/login` (POST) | SQL Injection | High | Query built via string concatenation against D1/in-memory |
| 3 | `/profile/:id` | Broken Access Control (IDOR) | High | Any profile ID accessible; no server-side ownership check |
| 4 | `/headers` | Missing Security Headers | Medium | No `Content-Security-Policy` / `X-Frame-Options` in response |
| 5 | `/session` | Insecure Session Cookie | Medium | `Set-Cookie` lacks `HttpOnly`, `Secure`, `SameSite` |

## D1 schema — `backend/schema.sql`

```sql
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  email TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  email TEXT NOT NULL
);

INSERT OR IGNORE INTO users (username, password, email) VALUES ('alice', 'password123', 'alice@example.com');
INSERT OR IGNORE INTO users (username, password, email) VALUES ('bob', 'secret456', 'bob@example.com');

INSERT OR IGNORE INTO profiles (id, name, role, email) VALUES (1, 'Alice', 'researcher', 'alice@example.com');
INSERT OR IGNORE INTO profiles (id, name, role, email) VALUES (2, 'Bob', 'developer', 'bob@example.com');
```

Apply locally:
```bash
cd backend
wrangler d1 execute web-security-agent-db --local --file=schema.sql
```

## Example structured finding

```json
{
  "vulnerability": "Missing security header",
  "url": "http://localhost:3000/headers",
  "severity": "Medium",
  "confidence": 0.98,
  "evidence": ["Content-Security-Policy header absent"],
  "status": "Detected",
  "recommendation": "Define an appropriate Content Security Policy"
}
```

## Notes

- XSS, SQLi, and IDOR are safer to confirm with source-code checks or controlled fixtures rather than passive browser inspection alone.
- Missing headers and cookie attributes are directly observable via HTTP response headers.
- Locally the app falls back to in-memory data when D1 is not bound (Node.js/`tsx` dev). On Cloudflare Workers, `wrangler.toml` binds the real D1 database.
- Keep all testing confined to this deliberately vulnerable localhost application.
