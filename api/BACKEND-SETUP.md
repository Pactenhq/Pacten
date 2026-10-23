# Pacten Backend Setup (M1 + M2)

NestJS + PostgreSQL API. Frontend expects it at `http://localhost:4000/api/v1`.

## 1. PostgreSQL

Install PostgreSQL 16. Create user + database:

```sql
CREATE USER pacten_dev WITH PASSWORD 'choose-a-password';
CREATE DATABASE pacten_dev OWNER pacten_dev;
```

## 2. Environment file

```bash
cd api
cp .env.example .env
```

Edit `.env` — set your real values:

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=pacten_dev
DB_PASSWORD=choose-a-password
DB_NAME=pacten_dev
JWT_SECRET=any-long-random-string
PORT=4000
```

> Never commit the real `.env` to GitHub. Only `.env.example` goes in the repo.

## 3. Install + build + run

```bash
cd api
npm install
npm run build
node dist/main.js
```

You should see: `Nest application successfully started`

API is live at `http://localhost:4000/api/v1`

## 4. Frontend (separate terminal)

```bash
cd web
npm install
npx next dev --webpack
```

Frontend at `http://localhost:3000`

## 5. Quick test

```bash
cd api
node m1-test.js   # 17 tests — auth + profiles
node m2-test.js   # 27 tests — campaigns + applications
```

## What's implemented

**M1** — Auth (signup/login/verify/forgot/reset), roles, profiles, protected routes.

**M2** — Campaigns (CRUD, public list, search), Applications (apply, list, accept/reject/withdraw).

Tables auto-create on first boot (TypeORM synchronize in development).
