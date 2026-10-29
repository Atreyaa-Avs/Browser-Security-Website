# Backend Security Report — Vulnerable Hono API

**Path:** `backend/src/index.ts`  
**Framework:** Hono (Cloudflare Workers / D1)  
**Purpose:** Deliberately vulnerable backend for browser AI agent research  
**Local dev:** `npm run dev` (Node, in-memory fallback)  
**Cloudflare deploy:** `wrangler deploy` (requires D1 DB bound)

## Deployment

```bash
# Install deps
npm install

# Local D1 (optional)
wrangler d1 execute vulnerable-backend --local --file=schema.sql

# Local dev (Node, in-memory fallback)
npm run dev

# Cloudflare Workers deploy
wrangler deploy
```

## Vulnerabilities (10)

| # | Vulnerability | Endpoint | Severity | Description |
|---|---------------|----------|----------|-------------|
| 1 | Reflected Cross-Site Scripting (XSS) | `GET /search?q=` | High | User-controlled `q` is reflected unsafely into HTML response without escaping. |
| 2 | SQL Injection (SQLi) / Auth Bypass | `POST /login` | Critical | `username` and `password` are concatenated directly into a SQL query string (`src/index.ts:87`). |
| 3 | Broken Access Control (IDOR) | `GET /profile/:id` | High | No ownership/authorization check; any profile ID is returned to any requester. |
| 4 | Missing Security Headers | `GET /headers` | Medium | Response omits CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, etc. |
| 5 | Insecure Session Cookie | `GET /session` | Medium | `Set-Cookie` issued without `HttpOnly`, `Secure`, or `SameSite` attributes. |
| 6 | Plaintext Password Storage | `schema.sql` / `users` table | High | Seed data stores passwords in plaintext (`password123`, `secret456`). No hashing. |
| 7 | Sensitive Data Exposure (Query Echo) | `POST /login` | High | Login result HTML echoes back the full executed SQL query, leaking credentials and schema. |
| 8 | Overly Permissive CORS | Global (`app.use('*', cors())`) | Medium | CORS allows all origins, enabling cross-origin requests from attacker-controlled sites. |
| 9 | Information Disclosure (Route Enumeration) | `GET /` | Low | Root health endpoint lists all available routes (`/search`, `/login`, `/profile/:id`, `/headers`, `/session`). |
| 10 | Weak Default / Seed Credentials | `schema.sql` / mock `users` | Medium | Seed accounts use guessable weak passwords; no password complexity or lockout policy. |

## Remediation Notes

- Use parameterized queries / D1 `bind` for all SQL (fixes #2).
- Escape user input before rendering into HTML, or use a templating system with auto-escaping (fixes #1).
- Add authorization/ownership checks on `/profile/:id` (fixes #3).
- Set security headers: CSP, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer` (fixes #4).
- Set `HttpOnly; Secure; SameSite=Strict` on session cookies (fixes #5).
- Hash passwords with bcrypt/argon2; never store plaintext (fixes #6).
- Do not echo raw SQL or credentials in responses (fixes #7).
- Restrict CORS to specific trusted origins (fixes #8).
- Remove route enumeration from public health endpoint (fixes #9).
- Enforce strong passwords and remove/rotate seed credentials (fixes #10).
