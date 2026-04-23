'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { Locale } from '@/lib/translations';

// ─── Context ──────────────────────────────────────────────────────────────────

interface LocaleContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: 'en',
  setLocale: () => {},
});

export const useLocale = () => useContext(LocaleContext);

// ─── Provider ─────────────────────────────────────────────────────────────────

const SUPPORTED: Locale[] = ['en', 'pt', 'ja'];

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  // Restore saved preference after hydration
  useEffect(() => {
    try {
      const saved = localStorage.getItem('wt-locale') as Locale | null;
      if (saved && SUPPORTED.includes(saved)) {
        setLocaleState(saved);
      }
    } catch {
      // localStorage unavailable
    }
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem('wt-locale', l);
    } catch {
      // localStorage unavailable
    }
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}
