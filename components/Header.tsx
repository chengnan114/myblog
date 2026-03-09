'use client'

import Link from 'next/link'
import { ThemeToggle } from './ThemeToggle'
import { SearchButton } from './Search'

export default function Header() {
  return (
    <header className="border-b border-gray-200 dark:border-gray-800">
      <nav className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          My Blog
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition"
          >
            Home
          </Link>
          <Link
            href="/blog"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition"
          >
            Blog
          </Link>
          <Link
            href="/about"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition"
          >
            About
          </Link>
          <SearchButton />
          <a
            href="/rss.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950 transition"
            aria-label="RSS 订阅"
            title="RSS 订阅"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="6.18" cy="17.82" r="2.18" />
              <path d="M4 4.44v2.83c7.03 0 12.73 5.7 12.73 12.73h2.83c0-8.59-6.97-15.56-15.56-15.56zm0 5.66v2.83c3.9 0 7.07 3.17 7.07 7.07h2.83c0-5.47-4.43-9.9-9.9-9.9z" />
            </svg>
          </a>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}
