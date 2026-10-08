# club-player

Player app of the **Baseline Tennis Club** sandbox, served at `/player`. Mobile-first React 18 + Vite +
TypeScript + Tailwind. No backend: data lives in `localStorage` through the `club-store` package.
Every interactive element and key text has a `data-testid`.

## Features

Availability grid (courts × hourly slots, six cell states, peak marking) · 3-step booking modal ·
My reservations (Upcoming / History with infinite scroll, cancel with confirm and tooltip) · Lessons
(Enroll/Leave/Full) · Coach notes with star ratings · Notifications dropdown · Club rules in an `<iframe>` ·
Hidden debug panel (**Ctrl+Shift+D**).

## Scripts

| Script          | What it does                                       |
| --------------- | -------------------------------------------------- |
| `npm install`   | Install dependencies                               |
| `npm run dev`   | Dev server on <http://localhost:5101/player/>      |
| `npm run build` | Typecheck + build into `dist/player`               |

## How it connects to the other repos

- Depends on `club-store` (`"club-store": "file:../club-store"`), so clone the repos side by side and run
  `npm install` in `club-store` first (it builds `dist/`).
- Apps share data through `localStorage['club:v1']`, which only works when they share an **origin**. Open
  the app through `club-shell` (<http://localhost:5000/player/>) so it sees the same data as admin and coach.
- `vite.config.ts` sets `base: '/player/'`, the router uses `basename="/player"`, and `resolve.dedupe`
  keeps one copy of React when `club-store` is linked.

### Deploying

Switch the dependency to the tagged git version and install:

```json
"club-store": "github:<org>/club-store#v0.1.0"
```

Create a Netlify site from this repo (config in `netlify.toml`; build output goes to `dist/player` so the
paths match the base). Point `club-shell`'s `_redirects` at it.

## Test hooks

Add to any URL (they are applied once, stored in `sessionStorage`, then removed from the address bar):
`?reset=1&seed=demo|empty|full`, `?as=player-1`, `?now=2026-10-10T18:30`, `?latency=800`, `?flaky=0.2`,
`?bug=double-booking,stale-ui,wrong-price,cancel-anytime,slow-render`. `window.__club` exposes
`{ state, reset(seed), setBugs([]), setNow(iso) }`. See the `club-store` README.

Example: <http://localhost:5000/player/?reset=1&seed=demo&as=player-1&now=2026-10-10T10:00>

## Notes for testers

- Session: `sessionStorage['club:session:player']` (each tab can be a different user).
- Deactivated users are sent to the login page with a message, both when the route guard re-evaluates and
  when an action returns `USER_INACTIVE`.
- With `?bug=cancel-anytime` the Cancel button is also enabled inside the cancellation window.
