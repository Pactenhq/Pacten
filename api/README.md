# Pacten API — Phase 1 backend

NestJS + PostgreSQL API for the Pacten marketplace MVP (Phase 1: auth + profiles).
The frontend expects this API at `http://localhost:4000/api/v1` by default.

## What is implemented

- **Auth** — `POST /api/v1/auth/signup`, `GET /api/v1/auth/verify?token=...`, `POST /api/v1/auth/login`
  (signup auto-creates the brand/creator/professional profile for the role; JWT is valid 7 days)
- **Profiles** — `GET /api/v1/profiles/me`, `PATCH /api/v1/profiles/me`,
  public `GET /api/v1/profiles/creators` and `/api/v1/profiles/professionals` (with search/filter params)
- **Users** — `GET /api/v1/users/me`

Tables are created automatically on first boot (TypeORM synchronize, development only).

## Run locally

1. Install PostgreSQL 16 and create the database:

   ```bash
   sudo -u postgres psql -c "CREATE USER pacten WITH PASSWORD 'choose-a-password';"
   sudo -u postgres psql -c "CREATE DATABASE pacten OWNER pacten;"
   ```

2. Configure:

   ```bash
   cp .env.example .env
   # then edit .env — at minimum set DB_PASSWORD and JWT_SECRET
   ```

3. Install and start:

   ```bash
   npm install
   npm run build
   npm start
   ```

   The API listens on `http://localhost:4000/api/v1`.

## Connect the frontend

The frontend (`pacten-frontend-latest.zip`) already points at
`http://localhost:4000/api/v1` by default. With both running, signup, login,
profile editing, and the marketplace lists use real data; when the API is not
running, the frontend falls back to its mock cards.

To use a different API address, create a `.env.local` in the frontend folder:

```
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

then restart `npm run dev` (the value is baked in at build time).

## Quick smoke test

```bash
# 1. Sign up (returns a verificationToken because emails are not sent yet — Phase 4)
curl -X POST http://localhost:4000/api/v1/auth/signup \
  -H 'Content-Type: application/json' \
  -d '{"email":"you@example.com","password":"TestPass123","role":"creator","firstName":"Test","lastName":"Creator"}'

# 2. Verify the email with the token from step 1
curl "http://localhost:4000/api/v1/auth/verify?token=PASTE_TOKEN_HERE"

# 3. Log in and save the accessToken
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"you@example.com","password":"TestPass123"}'

# 4. Read / update your profile
curl -H "Authorization: Bearer PASTE_TOKEN_HERE" http://localhost:4000/api/v1/profiles/me
curl -X PATCH -H "Authorization: Bearer PASTE_TOKEN_HERE" -H 'Content-Type: application/json' \
  -d '{"bio":"Hello world"}' http://localhost:4000/api/v1/profiles/me
```

## Notes

- Passwords need at least 8 characters. Signup roles: `brand`, `creator`, `professional`.
- CORS allows `FRONTEND_URL` from `.env` plus the production Vercel alias.
- The marketplace lists (`/profiles/creators`, `/profiles/professionals`) are public —
  create accounts through the signup pages to see real data instead of mock cards.
