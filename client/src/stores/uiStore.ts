import { create } from 'zustand'

export type Theme = 'dark' | 'light'

const THEME_KEY = 'devsync-theme'

function readStoredTheme(): Theme {
  try {
    const value = localStorage.getItem(THEME_KEY)
    if (value === 'light' || value === 'dark') return value
  } catch {
    // localStorage unavailable
  }
  return 'dark'
}

let themeTransitionTimer: number | null = null

function applyTheme(theme: Theme, animate = false) {
  const root = document.documentElement

  if (animate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    root.classList.add('theme-transition')
    if (themeTransitionTimer !== null) {
      window.clearTimeout(themeTransitionTimer)
    }
    themeTransitionTimer = window.setTimeout(() => {
      root.classList.remove('theme-transition')
      themeTransitionTimer = null
    }, 380)
  }

  root.dataset.theme = theme
}

// Apply before first paint when this module loads (no animation)
applyTheme(readStoredTheme())

type UiState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

export const useUiStore = create<UiState>((set, get) => ({
  theme: readStoredTheme(),

  setTheme: (theme) => {
    try {
      localStorage.setItem(THEME_KEY, theme)
    } catch {
      // Ignore persistence failures
    }
    applyTheme(theme, true)
    set({ theme })
  },

  toggleTheme: () => {
    const next: Theme = get().theme === 'dark' ? 'light' : 'dark'
    get().setTheme(next)
  },
}))
