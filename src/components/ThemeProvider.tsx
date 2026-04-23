'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

// ─── Provider ─────────────────────────────────────────────────────────────────

/**
 * Provides `theme` and `toggleTheme` to the subtree.
 * The initial value is synced from whatever the ThemeScript already applied
 * to `<html>` (reads the `dark` class), so there is no flash.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  // Sync state to the class that the inline script set before hydration.
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark';
      document.documentElement.classList.toggle('dark', next === 'dark');
      try {
        localStorage.setItem('wt-theme', next);
      } catch {
        // localStorage may be unavailable in private browsing
      }
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
