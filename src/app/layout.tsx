import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

import { ThemeProvider } from '@/components/ThemeProvider';
import { LocaleProvider } from '@/components/LocaleProvider';
import { Navbar } from '@/components/Navbar';

// ─── Fonts ────────────────────────────────────────────────────────────────────

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'WaniTracker',
  description:
    'A read-only dashboard consuming the WaniKani V2 API to display your kanji study progress.',
};

// ─── Layout ───────────────────────────────────────────────────────────────────

/*
 * suppressHydrationWarning is required on <html> because the inline script
 * below adds the `dark` class before React hydrates, causing a class mismatch
 * that would otherwise generate a React warning.
 */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/*
         * next/script with strategy="beforeInteractive" ensures this script
         * runs before React hydration, preventing a flash of wrong theme (FOCT).
         * This avoids the React 19 warning about bare <script> tags in components.
         */}
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('wt-theme');if(!t)t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';if(t==='dark')document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />

        <ThemeProvider>
          <LocaleProvider>
            <Navbar />

            <main id="main-content" className="flex-1 pt-16">
              {children}
            </main>

            <footer className="py-6 text-center text-xs text-gray-400 dark:text-gray-600 border-t border-gray-100 dark:border-gray-800">
              WaniTracker — Powered by{' '}
              <a
                href="https://yujiseto.github.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-wk-pink hover:underline"
              >
                YujiSeto
              </a>
            </footer>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
