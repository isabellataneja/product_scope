'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

/** Mirrors Commure Ambient app areas for design alignment (see docs/COMMURE_AMBIENT_DESIGN_CONTEXT.md) */
const tabs = [
  { label: 'Visits', href: '/' },
  { label: 'My Scribes', href: '/master' },
  { label: 'Copilot', href: '/product-lines', title: 'Copilot / AI Studio' },
  { label: 'Inbox', href: '/compare' },
  { label: 'Menu', href: '/menu' },
];

export default function NavBar() {
  const pathname = usePathname();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('darkMode');
    if (stored === 'true') {
      setDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  function toggleDark() {
    const next = !dark;
    setDark(next);
    localStorage.setItem('darkMode', String(next));
    document.documentElement.classList.toggle('dark', next);
  }

  return (
    <header className="bg-white dark:bg-commure-navy border-b border-gray-200 dark:border-commure-navy-muted sticky top-0 z-50 shadow-sm">
      <div className="flex items-center justify-between px-4 h-12">
        <div className="flex items-center gap-6 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-commure-blue-bright to-commure-teal flex items-center justify-center flex-shrink-0">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path d="M12 3a9 9 0 100 18 9 9 0 000-18zm-1 4h2v5h3v2H11V7zm1 9a1.5 1.5 0 110 3 1.5 1.5 0 010-3z"/>
              </svg>
            </div>
            <div className="min-w-0">
              <span className="text-sm font-bold text-gray-900 dark:text-white tracking-tight block truncate">
                Commure Ambient
              </span>
              <span className="text-[10px] text-gray-500 dark:text-commure-cyan/80 font-medium uppercase tracking-wide hidden sm:block">
                Scope &amp; matrix (internal)
              </span>
            </div>
          </div>
          <nav className="flex overflow-x-auto no-scrollbar" aria-label="Primary">
            {tabs.map(tab => {
              const active = pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  title={'title' in tab ? tab.title : undefined}
                  className={[
                    'px-3 sm:px-4 h-12 flex items-center text-[13px] font-semibold border-b-2 transition-colors whitespace-nowrap',
                    active
                      ? 'border-commure-teal text-commure-navy dark:text-white dark:border-commure-cyan'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-commure-navy dark:hover:text-white hover:border-gray-300 dark:hover:border-commure-teal/40',
                  ].join(' ')}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <button
          onClick={toggleDark}
          className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-commure-navy-muted transition-colors"
          title="Toggle dark mode"
          aria-label="Toggle dark mode"
        >
          {dark ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364-.707.707M6.343 17.657l-.707.707m12.728 0-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/>
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>
      </div>
    </header>
  );
}
