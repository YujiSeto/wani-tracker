'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLocale } from '@/components/LocaleProvider';
import { t } from '@/lib/translations';

// ─── Feature data ─────────────────────────────────────────────────────────────

function useFeatures() {
  const { locale } = useLocale();
  return [
    {
      icon: '🔒',
      title: t(locale, 'home.feature1.title'),
      desc: t(locale, 'home.feature1.desc'),
    },
    {
      icon: '📊',
      title: t(locale, 'home.feature2.title'),
      desc: t(locale, 'home.feature2.desc'),
    },
    {
      icon: '🤖',
      title: t(locale, 'home.feature3.title'),
      desc: t(locale, 'home.feature3.desc'),
    },
  ];
}

function useSteps() {
  const { locale } = useLocale();
  return [
    { icon: '🔑', text: t(locale, 'home.how.step1') },
    { icon: '⚡', text: t(locale, 'home.how.step2') },
    { icon: '✨', text: t(locale, 'home.how.step3') },
  ];
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const { locale } = useLocale();
  const features = useFeatures();
  const steps = useSteps();

  return (
    <div className="min-h-[calc(100vh-4rem)]">

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-28 px-6 text-center">
        {/* Gradient wash */}
        <div
          className="absolute inset-0 -z-10 opacity-[0.06] dark:opacity-[0.10]"
          style={{
            background:
              'linear-gradient(135deg, #e8006f 0%, #9b4dca 50%, #00aaff 100%)',
          }}
          aria-hidden="true"
        />
        {/* Decorative ambient blobs */}
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-wk-pink/20 dark:bg-wk-pink/10 rounded-full blur-3xl -z-10" aria-hidden="true" />
        <div className="absolute -bottom-10 -right-10 w-80 h-80 bg-wk-blue/15 dark:bg-wk-blue/8 rounded-full blur-3xl -z-10" />

        <div className="max-w-3xl mx-auto">
          {/* Badge */}
          <a 
            href="https://docs.api.wanikani.com/20170710/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-wk-pink/10 dark:bg-wk-pink/20 text-wk-pink border border-wk-pink/20 dark:border-wk-pink/30 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6 hover:bg-wk-pink/20 dark:hover:bg-wk-pink/30 hover:scale-105 transition-all duration-200"
          >
            <span aria-hidden="true">🎌</span>
            <span>WaniKani V2 API</span>
          </a>

          {/* Logo Icon */}
          <div className="flex justify-center mb-6">
            <Image 
              src="/WaniBlackLine.svg" 
              alt="WaniTracker Logo" 
              width={112} 
              height={112} 
              className="dark:hidden block drop-shadow-xl transition-transform hover:-rotate-12 hover:scale-110 duration-500 ease-out" 
              priority 
            />
            <Image 
              src="/WaniWhiteLine.svg" 
              alt="WaniTracker Logo" 
              width={112} 
              height={112} 
              className="hidden dark:block drop-shadow-[0_10px_20px_rgba(232,0,111,0.2)] transition-transform hover:-rotate-12 hover:scale-110 duration-500 ease-out" 
              priority 
            />
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-gray-900 dark:text-white mb-5 leading-none">
            Wani<span className="text-wk-pink">Tracker</span>
          </h1>

          {/* Tagline */}
          <p className="text-xl md:text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
            {t(locale, 'home.hero.tagline')}
          </p>

          {/* Subtitle */}
          <p className="text-base text-gray-500 dark:text-gray-400 max-w-xl mx-auto mb-10 leading-relaxed">
            {t(locale, 'home.hero.subtitle')}
          </p>

          {/* CTA */}
          <Link
            href="/data"
            id="cta-view-dashboard"
            className="group inline-flex items-center gap-3 px-8 py-4 bg-wk-pink text-white font-black text-lg rounded-2xl shadow-xl shadow-wk-pink/30 hover:shadow-wk-pink/50 hover:bg-wk-pink/90 hover:scale-105 transition-all duration-300"
          >
            <span>{t(locale, 'home.hero.cta')}</span>
            <span
              className="text-xl transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            >
              →
            </span>
          </Link>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────────────── */}
      <section
        className="py-20 px-6 bg-gray-50 dark:bg-gray-900/40"
        aria-label="Features"
      >
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="group bg-white dark:bg-gray-800/60 rounded-2xl p-6 border border-gray-100 dark:border-gray-700/50 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
              >
                <div
                  className="text-3xl mb-4 transition-transform duration-300 group-hover:scale-110 inline-block"
                  aria-hidden="true"
                >
                  {f.icon}
                </div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">
                  {f.title}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────────────── */}
      <section className="py-20 px-6" aria-label="How it works">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-black text-center text-gray-900 dark:text-white mb-12">
            {t(locale, 'home.how.title')}
          </h2>

          <ol className="space-y-6" aria-label="Steps">
            {steps.map((step, i) => (
              <li key={i} className="flex items-start gap-5 group">
                {/* Step icon */}
                <div
                  className="flex-shrink-0 w-12 h-12 rounded-xl bg-wk-pink/10 dark:bg-wk-pink/20 flex items-center justify-center text-xl transition-transform duration-300 group-hover:scale-110"
                  aria-hidden="true"
                >
                  {step.icon}
                </div>

                {/* Step text */}
                <div className="flex-1 pt-2.5">
                  <span className="text-[10px] font-bold text-wk-pink uppercase tracking-widest block mb-0.5">
                    Step {i + 1}
                  </span>
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    {step.text}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
