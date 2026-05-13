'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { Locale } from '@/lib/translations';

// ─── Context ──────────────────────────────────────────────────────────────────

interface LocaleContextValue {
  locale: Locale;
  localeTag: string;
  setLocale: (l: Locale) => void;
}

const getLocaleTag = (l: Locale) => (l === 'ja' ? 'ja-JP' : l === 'pt' ? 'pt-BR' : 'en-US');

const LocaleContext = createContext<LocaleContextValue>({
  locale: 'en',
  localeTag: 'en-US',
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
        // Defer to avoid synchronous cascading render warning
        setTimeout(() => setLocaleState(saved), 0);
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

  const localeTag = getLocaleTag(locale);

  return (
    <LocaleContext.Provider value={{ locale, localeTag, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}
