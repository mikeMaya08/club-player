import { useNavigate } from 'react-router-dom'
import { logout } from 'club-store'
import { useMe } from '../lib/useMe'
import NotificationBell from './NotificationBell'
import ThemeToggle from './ThemeToggle'

/** App bar: app name, current player, theme switch, notifications and log out. */
export default function Header() {
  const me = useMe()
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-40 border-b bg-green-700 text-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-3 py-2 md:px-4">
        <h1 data-testid="app-name" className="text-base font-semibold md:text-lg">
          Baseline Club <span className="font-normal text-green-100">· Player</span>
        </h1>
        <div className="flex items-center gap-2">
          <span
            data-testid="current-user"
            className="hidden items-center gap-2 text-sm sm:flex"
          >
            <span
              className="inline-block h-6 w-6 rounded-full"
              style={{ background: me.avatarColor }}
              aria-hidden
            />
            {me.name}
          </span>
          <ThemeToggle />
          <NotificationBell />
          <button
            type="button"
            data-testid="logout-btn"
            className="rounded-md bg-green-800 px-3 py-1.5 text-sm hover:bg-green-900"
            onClick={() => {
              logout('player')
              navigate('/login')
            }}
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  )
}
