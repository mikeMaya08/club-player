# club-player

Player app of the **Baseline Tennis Club** sandbox, served at `/player`. Mobile-first React 18 + Vite +
TypeScript + Tailwind. No backend: data lives in `localStorage` through the `club-store` package.
Every interactive element and key text has a `data-testid`.

## Features

Availability grid (courts × hourly slots, six cell states, peak marking) · 3-step booking modal ·
My reservations (Upcoming / History with infinite scroll, cancel with confirm and tooltip) · Lessons
(Enroll/Leave/Full) · Coach notes with star ratings · Notifications dropdown · Club rules in an `<iframe>` ·
Hidden debug panel (**Ctrl+Shift+D**).

## Added in the product upgrade

- **Weekly recurring bookings:** in the booking modal choose *Every week for 2/4/6/8 weeks*. The summary shows every date and the total. A whole series counts as one active reservation, shows a *Weekly series* badge in Upcoming and has a **Cancel series** button (sessions inside the cancellation window stay booked).
- **Lesson waitlist:** a full lesson offers **Join waitlist**; waiting players see their position and are enrolled automatically (with a notification) when a seat opens up.

## Dark mode and accessibility

- **Dark mode:** toggle in the header (🌙/☀️). The choice is saved in `localStorage['club:theme']`, which all apps share, and defaults to the operating system preference. It is implemented by remapping the Tailwind utilities in `src/index.css` under a `.dark` class (no `dark:` variants on each element).
- **Accessibility:** skip link, landmarks, visible focus ring, dialogs with `aria-labelledby`, focus moved into the dialog, kept inside it with Tab and restored on close. Audited with axe-core (WCAG 2 A/AA + best practices) on every page and dialog in light and dark themes: 0 violations at the time of writing.

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
  the app through `club-shell` (<http://127.0.0.1:5000/player/>) so it sees the same data as admin and coach.
- `vite.config.ts` sets `base: '/player/'`, the router uses `basename="/player"`, and `resolve.dedupe`
  keeps one copy of React when `club-store` is linked.

### Deploying

The committed dependency is the tagged git version (works on Vercel). For live development against a local `club-store`, temporarily use `"club-store": "file:../club-store"` and run `npm install`:

```json
"club-store": "git+https://github.com/mikeMaya08/club-store.git#v0.1.0"
```

Deploy as its own **Vercel** project from this repo (config in `vercel.json`; the build writes to `dist/player` so the files match the `/player/` base path, and a rewrite gives deep links the SPA fallback). Name the project `club-player` so `club-shell` can proxy `/player/*` to `https://club-player.vercel.app`. If the `club-store` repo is private, Vercel needs access to it (or switch to a public repo).

## Test hooks

Add to any URL (they are applied once, stored in `sessionStorage`, then removed from the address bar):
`?reset=1&seed=demo|empty|full`, `?as=player-1`, `?now=2026-10-10T18:30`, `?latency=800`, `?flaky=0.2`,
`?bug=double-booking,stale-ui,wrong-price,cancel-anytime,slow-render`. `window.__club` exposes
`{ state, reset(seed), setBugs([]), setNow(iso) }`. See the `club-store` README.

Example: <http://127.0.0.1:5000/player/?reset=1&seed=demo&as=player-1&now=2026-10-10T10:00>

## Notes for testers

- Session: `sessionStorage['club:session:player']` (each tab can be a different user).
- Deactivated users are sent to the login page with a message, both when the route guard re-evaluates and
  when an action returns `USER_INACTIVE`.
- With `?bug=cancel-anytime` the Cancel button is also enabled inside the cancellation window.
