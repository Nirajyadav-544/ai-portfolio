# Niraj Yadav: AI-Powered Full-Stack Portfolio

React + TypeScript + Vite + Tailwind frontend, Spring Boot 3 (Java 21) backend, PostgreSQL, JWT admin area and a
Gemini-powered assistant that is restricted to the portfolio's own data.

> Nothing in this project is fabricated. Development seed data is flagged **sample** and shown with badges.
> No certificates, education or employment are seeded. Add real data from the admin dashboard.

## Prerequisites
Node.js 20+ (npm), JDK 21, Maven 3.9+, Docker Desktop (for local PostgreSQL).

## 1. Configure
```powershell
Copy-Item .env.example .env                       # set POSTGRES_PASSWORD
Copy-Item backend\.env.example backend\.env       # set DB_PASSWORD (same value), JWT_SECRET, admin bootstrap
Copy-Item frontend\.env.example frontend\.env
```
Generate a JWT secret (32+ chars), for example in PowerShell:
```powershell
[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])
```
Set `ADMIN_BOOTSTRAP_EMAIL` and `ADMIN_BOOTSTRAP_PASSWORD` (12+ chars). The admin is created once, on first start when
no user exists. Remove both variables afterwards. There is no default account.

## 2. Run
```powershell
docker compose up -d                              # PostgreSQL
cd backend
mvn spring-boot:run "-Dspring-boot.run.profiles=dev"   # dev profile adds clearly marked sample data
# new terminal
cd frontend
npm install
npm run dev                                       # http://localhost:5173
```
Admin: http://localhost:5173/admin/login · API docs: http://localhost:8080/swagger-ui.html · Health: http://localhost:8080/actuator/health

## 3. Test and build
```powershell
cd backend;  mvn test; mvn -DskipTests package   # target\portfolio-api-1.0.0.jar
cd frontend; npm run typecheck; npm run lint; npm test; npm run build
```

## Environment variables (backend)
See `backend/.env.example`. Key ones: `DB_*`, `JWT_SECRET` (required), `CORS_ALLOWED_ORIGINS`, `COOKIE_SECURE`,
`GEMINI_API_KEY`/`GEMINI_MODEL`, `GITHUB_USERNAME`, `CONTACT_NOTIFY_*` (+ `SPRING_MAIL_*`), `ANALYTICS_RETENTION_DAYS`.
Frontend: `VITE_API_URL`, `VITE_SITE_URL`.

## Architecture notes
- **Auth:** BCrypt (strength 12); 15-minute JWT access token held in memory; rotating refresh token in an HttpOnly,
  SameSite cookie (only its SHA-256 hash is stored); replayed refresh tokens revoke all sessions; login is rate limited.
  Refresh/logout require an `X-Requested-With` header (CSRF defence). All `/api/admin/**` routes are authorised on the server.
- **AI:** `AiProvider` interface with a `GeminiProvider`. The system prompt is built from the database and tells the model
  to answer only from that data, label samples, and refuse off-topic requests. Key stays on the server; per-IP limits,
  timeout and output cap are configurable. Conversations are never stored (only an anonymous usage counter).
- **GitHub:** public API, cached (default 30 min), stale-cache fallback, then repo links saved on projects. Stars/forks are
  shown only when GitHub returns them.
- **Analytics:** anonymous event counts only (no IP, user agent or content), retention purge job (default 90 days).
- **Schema:** Flyway migrations in `backend/src/main/resources/db/migration`; Hibernate never alters the schema.
  Dev-only sample data lives in `db/seed` and loads only with the `dev` profile.

## Deployment
**Frontend (Vercel):** import the repo, root directory `frontend`, build `npm run build`, output `dist`; set `VITE_API_URL`
and `VITE_SITE_URL`. `vercel.json` rewrites routes to the SPA. Update `public/robots.txt` and `public/sitemap.xml` with your domain.

**Backend (Render, Railway, Fly.io or any Java host):** build `mvn -DskipTests package`, run `java -jar target/portfolio-api-1.0.0.jar`.
Use a managed PostgreSQL and set `DB_URL` (JDBC URL, `sslmode=require` where needed), `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`,
`CORS_ALLOWED_ORIGINS=https://your-frontend-domain`, `COOKIE_SECURE=true`, `TRUST_PROXY_HEADERS=true` (only behind a trusted proxy).
Do not use the `dev` profile in production. Health check path: `/actuator/health`.

**Cookies across domains:** if frontend and API are on different registrable domains, set `COOKIE_SAMESITE=None` with
`COOKIE_SECURE=true` (HTTPS required). Same site (e.g. `app.example.com` + `api.example.com`) works with `Lax`.

See `TROUBLESHOOTING.md` for common problems.
