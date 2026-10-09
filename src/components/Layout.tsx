import { useEffect, useRef } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useClub } from 'club-store'
import { useMe } from '../lib/useMe'
import Header from './Header'
import PendingBar from './PendingBar'
import { useToast } from './Toast'

const LINKS = [
  { to: '/', label: 'Book', id: 'availability', end: true },
  { to: '/reservations', label: 'Reservations', id: 'reservations' },
  { to: '/lessons', label: 'Lessons', id: 'lessons' },
  { to: '/notes', label: 'Notes', id: 'notes' },
  { to: '/activity', label: 'Activity', id: 'activity' },
  { to: '/rules', label: 'Rules', id: 'rules' },
]

/** Pops a toast whenever a new notification arrives while the app is open. */
function useNotificationToasts(userId: string) {
  const toast = useToast()
  const mine = useClub((s) => s.notifications.filter((n) => n.userId === userId))
  const seen = useRef<Set<string> | null>(null)

  useEffect(() => {
    if (!seen.current) {
      seen.current = new Set(mine.map((n) => n.id))
      return
    }
    for (const n of mine) {
      if (!seen.current.has(n.id)) {
        seen.current.add(n.id)
        toast(n.message, 'info')
      }
    }
  }, [mine, toast])
}

export default function Layout() {
  const me = useMe()
  useNotificationToasts(me.id)

  return (
    <div className="flex min-h-screen flex-col pb-16 md:pb-0">
      <a
        href="#main"
        className="sr-only rounded bg-white px-3 py-2 text-slate-900 focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[90]"
      >
        Skip to content
      </a>
      <PendingBar />
      <Header />
      <nav className="hidden border-b bg-white md:block" aria-label="Main">
        <div className="mx-auto flex max-w-5xl gap-1 px-4">
          {LINKS.map((l) => (
            <NavLink
              key={l.id}
              to={l.to}
              end={l.end}
              data-testid={`nav-${l.id}`}
              className={({ isActive }) =>
                `border-b-2 px-4 py-3 text-sm font-medium ${isActive ? 'border-green-600 text-green-700' : 'border-transparent text-slate-600 hover:text-slate-900'}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>
      </nav>
      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-5xl flex-1 px-3 py-4 outline-none md:px-4">
        <Outlet context={me} />
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t bg-white md:hidden" aria-label="Main (mobile)">
        <div className="grid grid-cols-6">
          {LINKS.map((l) => (
            <NavLink
              key={l.id}
              to={l.to}
              end={l.end}
              data-testid={`mobile-nav-${l.id}`}
              className={({ isActive }) =>
                `py-3 text-center text-xs font-medium ${isActive ? 'text-green-700' : 'text-slate-500'}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
