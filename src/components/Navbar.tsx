'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLocale } from './LocaleProvider';
import { useTheme } from './ThemeProvider';
import { t, type Locale } from '@/lib/translations';

// ─── Locale config ────────────────────────────────────────────────────────────

const LOCALES: { code: Locale; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'pt', label: 'PT' },
  { code: 'ja', label: 'JA' },
];

// ─── Icons ────────────────────────────────────────────────────────────────────

function SunIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

export function Navbar() {
  const { locale, setLocale } = useLocale();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-white/10 transition-colors duration-300"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wk-pink rounded-lg"
        aria-label="WaniTracker home"
      >
        <Image 
          src="/WaniBlackLine.svg" 
          alt="WaniTracker Logo" 
          width={32} 
          height={32} 
          className="dark:hidden block drop-shadow-sm transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110" 
          priority 
        />
        <Image 
          src="/WaniWhiteLine.svg" 
          alt="WaniTracker Logo" 
          width={32} 
          height={32} 
          className="hidden dark:block drop-shadow-md transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110" 
          priority 
        />
        <span className="text-xl font-black tracking-tight text-gray-900 dark:text-white drop-shadow-sm select-none">
          WaniTracker
        </span>
      </Link>

      {/* Nav links */}
      <div className="hidden sm:flex items-center gap-1 text-sm font-semibold">
        <Link
          href="/data"
          className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-white/80 dark:hover:text-white dark:hover:bg-white/15 px-3 py-1.5 rounded-lg transition-all duration-150"
        >
          {t(locale, 'nav.dashboard')}
        </Link>
        <Link
          href="/data/levels"
          className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-white/80 dark:hover:text-white dark:hover:bg-white/15 px-3 py-1.5 rounded-lg transition-all duration-150"
        >
          {t(locale, 'nav.levels')}
        </Link>
        <Link
          href="/data/search"
          className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-white/80 dark:hover:text-white dark:hover:bg-white/15 px-3 py-1.5 rounded-lg transition-all duration-150"
        >
          {t(locale, 'nav.search')}
        </Link>
        <Link
          href="/data/ia"
          className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-white/80 dark:hover:text-white dark:hover:bg-white/15 px-3 py-1.5 rounded-lg transition-all duration-150"
        >
          {t(locale, 'nav.ai')}
        </Link>
      </div>


      {/* Controls */}
      <div className="flex items-center gap-3">
        {/* Locale switcher */}
        <div
          className="flex items-center bg-gray-100 dark:bg-white/10 rounded-full p-1 gap-0.5 border border-gray-200 dark:border-white/20"
          role="group"
          aria-label="Language selector"
        >
          {LOCALES.map(({ code, label }) => (
            <button
              key={code}
              id={`locale-btn-${code}`}
              onClick={() => setLocale(code)}
              aria-pressed={locale === code}
              aria-label={`Switch language to ${label}`}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 ${
                locale === code
                  ? 'bg-white dark:bg-white text-wk-pink shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:text-white/80 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/20'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Theme toggle */}
        <button
          id="theme-toggle-btn"
          onClick={toggleTheme}
          aria-label={
            theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
          }
          className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 border border-gray-200 dark:border-white/20 flex items-center justify-center text-gray-700 dark:text-white transition-all duration-200 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wk-pink"
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
    </nav>
  );
}
