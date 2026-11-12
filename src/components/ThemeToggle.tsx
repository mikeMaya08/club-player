import { toggleTheme, useTheme } from '../lib/theme'

/** Light/dark switch. The choice is shared by all apps (see lib/theme.ts). */
export default function ThemeToggle() {
  const theme = useTheme()
  return (
    <button
      type="button"
      data-testid="theme-toggle"
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className="rounded-md bg-green-800 px-3 py-1.5 text-sm hover:bg-green-900"
      onClick={toggleTheme}
    >
      <span aria-hidden>{theme === 'dark' ? '☀️' : '🌙'}</span>
    </button>
  )
}
