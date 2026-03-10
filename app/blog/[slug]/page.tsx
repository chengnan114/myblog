import { getPostBySlug, getAllPosts, getAdjacentPosts } from '@/lib/posts'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MDXContent } from '@/components/MDXComponents'
import { Comments } from '@/components/Comments'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

const SITE_URL = 'https://chengnanblog.cn'

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) {
    return {
      title: '文章未找到',
    }
  }

  return {
    title: post.title,
    description: post.description,
    keywords: post.tags,
    authors: [{ name: 'chengnan' }],
    openGraph: {
      type: 'article',
      locale: 'zh_CN',
      url: `${SITE_URL}/blog/${slug}`,
      title: post.title,
      description: post.description,
      siteName: 'chengnan 的技术博客',
      publishedTime: post.date,
      authors: ['chengnan'],
      tags: post.tags,
    },
    twitter: {
      card: 'summary',
      title: post.title,
      description: post.description,
    },
    alternates: {
      canonical: `${SITE_URL}/blog/${slug}`,
    },
  }
}

export default async function BlogPost({ params }: PageProps) {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post || !post.content) {
    notFound()
  }

  const { prev, next } = getAdjacentPosts(slug)

  // Article 结构化数据 (JSON-LD)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: {
      '@type': 'Person',
      name: 'chengnan',
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Person',
      name: 'chengnan',
    },
    url: `${SITE_URL}/blog/${slug}`,
    keywords: post.tags?.join(', '),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/blog/${slug}`,
    },
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* 结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-[768px] mx-auto px-4 py-8 md:py-12">
        {/* 返回列表按钮 */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 mb-8 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span>返回文章列表</span>
        </Link>

        {/* 文章头部元信息 */}
        <header className="mb-10 pb-8 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100 leading-tight">
            {post.title}
          </h1>

          {post.description && (
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              {post.description}
            </p>
          )}

          {/* 元信息：日期、阅读时间、标签 */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-500">
            <div className="flex items-center gap-1">
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </div>

            {post.readingTime && (
              <div className="flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>{post.readingTime} 分钟阅读</span>
              </div>
            )}

            {post.tags && post.tags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                  <line x1="7" y1="7" x2="7.01" y2="7"></line>
                </svg>
                <div className="flex gap-2 flex-wrap">
                  {post.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/blog?tag=${encodeURIComponent(tag)}`}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-xs"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* MDX 内容 */}
        <article className="prose prose-lg dark:prose-invert max-w-none">
          <div
            className="text-[18px] leading-[1.8] text-gray-800 dark:text-gray-200"
          >
            <MDXContent content={post.content} />
          </div>
        </article>

        {/* 上一篇/下一篇导航 */}
        <nav className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-4">
            {prev ? (
              <Link
                href={`/blog/${prev.slug}`}
                className="group p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-left"
              >
                <div className="text-sm text-gray-500 dark:text-gray-500 mb-1">
                  ← 上一篇
                </div>
                <div className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2">
                  {prev.title}
                </div>
              </Link>
            ) : (
              <div />
            )}

            {next ? (
              <Link
                href={`/blog/${next.slug}`}
                className="group p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-right"
              >
                <div className="text-sm text-gray-500 dark:text-gray-500 mb-1">
                  下一篇 →
                </div>
                <div className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2">
                  {next.title}
                </div>
              </Link>
            ) : (
              <div />
            )}
          </div>
        </nav>

        {/* 评论区 */}
        <Comments />
      </div>
    </div>
  )
}
