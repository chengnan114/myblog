'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import GiscusComponent from '@giscus/react'

export function Comments() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-lg" />
        </div>
      </div>
    )
  }

  return (
    <section className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        💬 评论
      </h2>
      <GiscusComponent
        repo="chengnan114/myblog"
        repoId=""
        category="Announcements"
        categoryId=""
        mapping="pathname"
        strict="0"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
        lang="zh-CN"
        loading="lazy"
      />
    </section>
  )
}
