# Troubleshooting

| Symptom | Fix |
|---|---|
| Backend exits with "JWT_SECRET is missing or too short" | Set `JWT_SECRET` (32+ chars) in `backend/.env`. |
| `Connection refused` / Flyway cannot connect | Run `docker compose up -d`; check `DB_URL`, and that `DB_PASSWORD` equals `POSTGRES_PASSWORD`. |
| Password auth failed after changing the password | The DB volume keeps the old one: `docker compose down -v` (deletes local data), then up again. |
| Cannot sign in / "No admin user exists" log | Set `ADMIN_BOOTSTRAP_EMAIL` and `ADMIN_BOOTSTRAP_PASSWORD` (12+ chars) and restart once. |
| Login works but admin page logs out on refresh | Cookie not sent: use `COOKIE_SECURE=false` on http://localhost, or HTTPS in production; check `CORS_ALLOWED_ORIGINS` matches the frontend origin exactly. |
| CORS error in the browser | Add the exact frontend origin (scheme + host + port, no trailing slash) to `CORS_ALLOWED_ORIGINS`. |
| AI chat says "not configured" | Set `GEMINI_API_KEY` in `backend/.env` and restart. |
| AI chat 429 | Per-IP limit reached; adjust `AI_RATE_LIMIT_*`. |
| GitHub section shows fallback/rate-limited | Set `GITHUB_USERNAME` (and optionally `GITHUB_TOKEN`); results are cached. |
| `mvn` / `node` not found | Install JDK 21, Maven, Node 20+ and reopen PowerShell. |
| Port 8080 or 5173 busy | Set `PORT` for the backend; `npm run dev -- --port 5174` for the frontend (update CORS). |
| Sample data missing | Start the backend with `-Dspring-boot.run.profiles=dev` on a fresh database. |
