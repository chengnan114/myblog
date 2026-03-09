'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import FlexSearch from 'flexsearch'

interface SearchPost {
  slug: string
  title: string
  description: string
  excerpt: string
  date: string
  tags: string[]
}

// 高亮关键词
function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text

  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'))

  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 text-inherit rounded px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  )
}

export function SearchDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchPost[]>([])
  const [posts, setPosts] = useState<SearchPost[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const indexRef = useRef<any>(null)
  const idMapRef = useRef<Map<number, SearchPost>>(new Map())

  // 加载文章数据并构建索引
  useEffect(() => {
    if (!isOpen || posts.length > 0) return

    async function loadPosts() {
      setLoading(true)
      try {
        const res = await fetch('/api/search')
        const data: SearchPost[] = await res.json()
        setPosts(data)

        // 构建 FlexSearch 索引
        const index = new FlexSearch.Index({
          tokenize: 'forward',
          resolution: 9,
        })

        const idMap = new Map<number, SearchPost>()

        data.forEach((post, i) => {
          const searchable = `${post.title} ${post.description} ${post.excerpt} ${post.tags.join(' ')}`
          index.add(i, searchable)
          idMap.set(i, post)
        })

        indexRef.current = index
        idMapRef.current = idMap
      } catch (error) {
        console.error('搜索数据加载失败:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPosts()
  }, [isOpen, posts.length])

  // 快捷键 Cmd/Ctrl + K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // 打开时聚焦输入框
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setQuery('')
      setResults([])
    }
  }, [isOpen])

  // 实时搜索
  const handleSearch = useCallback(
    (value: string) => {
      setQuery(value)

      if (!value.trim()) {
        setResults([])
        return
      }

      if (!indexRef.current) {
        // 索引未就绪，使用简单匹配
        const filtered = posts.filter(
          (post) =>
            post.title.toLowerCase().includes(value.toLowerCase()) ||
            post.description.toLowerCase().includes(value.toLowerCase()) ||
            post.excerpt.toLowerCase().includes(value.toLowerCase())
        )
        setResults(filtered)
        return
      }

      const ids = indexRef.current.search(value, { limit: 20 })
      const matched = ids
        .map((id: number) => idMapRef.current.get(id))
        .filter(Boolean) as SearchPost[]

      setResults(matched)
    },
    [posts]
  )

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      onClick={() => setIsOpen(false)}
    >
      {/* 遮罩 */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* 搜索面板 */}
      <div
        className="relative w-full max-w-xl mx-4 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 搜索输入 */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-400 flex-shrink-0"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="搜索文章..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="flex-1 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none text-base"
          />
          <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
            ESC
          </kbd>
        </div>

        {/* 搜索结果 */}
        <div className="max-h-[400px] overflow-y-auto">
          {loading && (
            <div className="px-4 py-8 text-center text-gray-500">
              <div className="animate-spin inline-block w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full mb-2" />
              <p className="text-sm">加载中...</p>
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="px-4 py-8 text-center text-gray-500">
              <p className="text-sm">未找到相关文章</p>
            </div>
          )}

          {!loading && query && results.length > 0 && (
            <>
              <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100 dark:border-gray-800">
                找到 {results.length} 篇相关文章
              </div>
              {results.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                >
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    {highlightText(post.title, query)}
                  </h3>
                  {post.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                      {highlightText(post.description, query)}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-xs text-gray-400">
                      {new Date(post.date).toLocaleDateString('zh-CN')}
                    </span>
                    {post.tags.length > 0 && (
                      <div className="flex gap-1">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </>
          )}

          {!loading && !query && (
            <div className="px-4 py-8 text-center text-gray-400">
              <p className="text-sm">输入关键词搜索文章</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// 搜索触发按钮
export function SearchButton() {
  return (
    <button
      onClick={() => {
        document.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'k', metaKey: true })
        )
      }}
      className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
      aria-label="搜索"
      title="搜索 (⌘K)"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    </button>
  )
}
