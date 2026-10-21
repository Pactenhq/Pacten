# Pacten — Creator Marketplace (Frontend)

Next.js 16 + React 19 + Tailwind CSS 4. Pixel-perfect implementation of the Pacten marketplace MVP designs.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

- `app/` — All routes (34 pages). `app/page.tsx` is the homepage.
- `components/` — Shared UI (Navbar, Footer, Button, dashboard shell, cards, etc.)
- `lib/` — API client (`api.ts`), auth context, mock data used as fallback
- `public/assets/` — Images, icons, logos

## Backend integration

The frontend talks to the NestJS API via `lib/api.ts`. Set the API URL:

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

If the API is unreachable, the marketplace pages fall back to local mock data so the UI still renders.

Auth state lives in `components/auth/AuthProvider.tsx` (signup, login, session, logout).

## Notes

- Homepage CTA uses `public/assets/home/cta-visual-v4.webp` (desktop) and `cta-visual-mobile-v4.webp` (mobile).
- All buttons navigate to real routes and have hover states.
- `npm run build` for a production build.
