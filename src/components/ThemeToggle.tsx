import { useTheme } from '../useTheme'

export function ThemeToggle({ scrolled }: { scrolled: boolean }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDark}
      className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
        scrolled
          ? 'border-fg/15 text-fg hover:bg-fg/5'
          : 'border-sky/30 text-sky hover:bg-sky/10'
      }`}
    >
      {isDark ? (
        <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5">
          <path
            d="M12 3.5a1 1 0 011 1V6a1 1 0 11-2 0V4.5a1 1 0 011-1zM12 18a1 1 0 011 1v1.5a1 1 0 11-2 0V19a1 1 0 011-1zM4.5 12a1 1 0 011-1H7a1 1 0 110 2H5.5a1 1 0 01-1-1zM17 12a1 1 0 011-1h1.5a1 1 0 110 2H18a1 1 0 01-1-1zM6.34 6.34a1 1 0 011.41 0l.71.7a1 1 0 11-1.41 1.42l-.71-.71a1 1 0 010-1.41zM15.54 15.54a1 1 0 011.41 0l.71.71a1 1 0 11-1.41 1.41l-.71-.7a1 1 0 010-1.42zM17.66 6.34a1 1 0 010 1.41l-.71.71a1 1 0 11-1.41-1.41l.7-.71a1 1 0 011.42 0zM8.46 15.54a1 1 0 010 1.42l-.7.7a1 1 0 11-1.42-1.41l.71-.71a1 1 0 011.41 0zM12 7.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z"
            fill="currentColor"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5">
          <path
            d="M20.4 14.7A8.5 8.5 0 019.3 3.6a.75.75 0 00-.9-.98A9.5 9.5 0 1021.4 15.6a.75.75 0 00-1-.9z"
            fill="currentColor"
          />
        </svg>
      )}
    </button>
  )
}
