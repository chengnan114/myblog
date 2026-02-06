import Link from 'next/link'
import { Post } from '@/lib/posts'

interface ArticleCardProps extends Post {}

export default function ArticleCard({
  slug,
  title,
  date,
  excerpt,
  readingTime,
}: ArticleCardProps) {
  return (
    <article className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col">
      <div className="flex-1">
        <h3 className="text-xl font-bold mb-3 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          <Link href={`/blog/${slug}`}>
            {title}
          </Link>
        </h3>
        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
          <time>{date}</time>
          <span>·</span>
          <span>{readingTime} 分钟阅读</span>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
          {excerpt}
        </p>
      </div>
      <Link
        href={`/blog/${slug}`}
        className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
      >
        阅读更多
        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </article>
  )
}
