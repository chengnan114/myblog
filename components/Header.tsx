'use client'

import Link from 'next/link'
import { ThemeToggle } from './ThemeToggle'

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
          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}
