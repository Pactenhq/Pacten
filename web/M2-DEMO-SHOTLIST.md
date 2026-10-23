# M2 Demo Video — Shot List (silent, no voiceover, ~3–4 min)

Seed first: `node m2-demo-seed.js` (API must be running on localhost:4000).
Then record in this order with the seeded logins.

## Scene 1 — Brand posts a campaign (live)
1. Login as brand: `demo-brand@pacten.demo` / `DemoPass123`
2. Go to **Post Campaign** (`/dashboard/campaigns/new`)
3. Fill: title "Autumn Fashion Collab", budget "$800", niches "fashion", submit
4. **My Campaigns** (`/dashboard/campaigns`) now shows 3 campaigns

## Scene 2 — Public marketplace + search
1. Log out, open `/campaigns` (no login needed)
2. Scroll the seeded campaigns ("Summer Glow Skincare Launch", "Tech Gadget Unboxing Series")
3. Search "skincare" → 1 result; clear; apply a Category filter
4. ⚠️ Do NOT click **View Details** on cards — that button is dead until the client design arrives

## Scene 3 — Creator applies + checks applications
1. Login as creator: `demo-creator@pacten.demo` / `DemoPass123`
2. Marketplace → open the Tech Gadget campaign → apply (short cover letter), submit
3. **My Applications** (`/dashboard/applications`): shows 1 Accepted, 1 Pending
   (the accepted one is pre-seeded; the pending one is the live application)

## Scene 4 — Brand receives + accepts
1. Login as brand again
2. **Received Applications** (`/dashboard/applications/received`): 2 rows
3. Open the pending application → **Accept** → status flips to Accepted

## Scene 5 — Brand manages a campaign
1. **My Campaigns** → open one campaign → **Edit** → change budget → save

Done. Export 1080p, no audio. These two logins cover every M2 flow Sania needs to see.
