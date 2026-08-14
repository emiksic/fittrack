# FitTrack

A fitness tracking dashboard implemented from the `Fitness Dashboard EN.dc.html`
Claude Design export in the repo root (`project/`, `chats/`, `README.md` there
document the original design handoff).

Stack: Next.js (App Router) + TypeScript, PostgreSQL (`pg`) for persistence,
real Hevy and Strava API integrations with automatic fallback to the original
prototype's mock/seeded data.

## Screens

- **Dashboard** — today's calorie ring + macro bars, quick stats, today's
  meals, last workout, last run.
- **Food** — all meals grouped by date, quick add-meal form.
- **Workouts** — Hevy workout history, expandable to sets/reps/weight.
- **Runs** — Strava run history with pace/calorie estimates.
- **Statistics** — 7/30-day calorie chart, average macros, weight trend.
- **Settings** — profile inputs driving a Mifflin-St Jeor TDEE calculation,
  weight logging, and connected-app status for Hevy/Strava.

## Running it

Requires a PostgreSQL server reachable via `DATABASE_URL` (defaults to
`postgresql://fitness:fitness_dev_pw@localhost:5432/fitness_dashboard` if
unset). For local development:

```bash
# one-time setup, as a user that can create roles/databases
sudo -u postgres psql -c "CREATE ROLE fitness WITH LOGIN PASSWORD 'fitness_dev_pw';"
sudo -u postgres psql -c "CREATE DATABASE fitness_dashboard OWNER fitness;"

npm install
npm run dev
```

Tables and seed data (meals, weight log, default settings) are created
automatically on first request — no separate migration step. Open
http://localhost:3000. With no other environment variables set, workouts and
runs use the same seeded mock data as the original prototype (Hevy-style
workouts, Strava-style runs).

## Connecting real data

Copy `.env.example` to `.env.local` and fill in what you have — each
integration is independent and optional:

- **Hevy**: set `HEVY_API_KEY` (requires Hevy Pro; generate a key at
  https://hevy.com/settings?developer). Once set, the Workouts screen and the
  dashboard's "last workout" card pull live from
  `GET https://api.hevyapp.com/v1/workouts`. The response mapping in
  `src/lib/hevy.ts` is written from Hevy's published API shape but hasn't
  been exercised against a live account — if the real response shape differs,
  adjust `mapWorkout()` there.
- **Strava**: create an API application at
  https://www.strava.com/settings/api, then set `STRAVA_CLIENT_ID`,
  `STRAVA_CLIENT_SECRET`, and `STRAVA_REDIRECT_URI` (defaults to
  `http://localhost:3000/api/strava/callback` — must match what you register
  with Strava). Go to Settings in the app and click "Connect Strava" to run
  the OAuth flow; tokens are stored server-side in Postgres and refreshed
  automatically. Strava's activity list doesn't reliably return calories, so
  run calories are estimated the same way the original prototype did
  (`distanceKm * 62`).

Restart the dev server after changing `.env.local`.

## Notes

- All persistence (meals, weight log, settings, Strava tokens) lives in the
  `fitness_dashboard` Postgres database. Drop and recreate it (or truncate the
  tables) to reset to the seeded mock data — schema + seed rows are
  recreated automatically on the next request.
- Workouts/runs are not cached in the database — they're fetched live from
  Hevy/Strava on each request (or generated fresh from the seed functions in
  `src/lib/seed.ts`) when not connected.
- There's no multi-user auth; one Postgres database backs one user, matching
  the original single-user prototype.
