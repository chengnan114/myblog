import fs from 'fs'
import path from 'path'

export interface Post {
  slug: string
  title: string
  description: string
  date: string
  content?: string
  excerpt?: string
  readingTime?: number
  tags?: string[]
}

const postsDirectory = path.join(process.cwd(), 'content')

// 计算阅读时间（按每分钟200字计算）
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const words = content.trim().split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}

// 生成摘要（前150字）
function generateExcerpt(content: string, maxLength: number = 150): string {
  // 移除Markdown语法
  const plainText = content
    .replace(/^#{1,6}\s+/gm, '') // 移除标题
    .replace(/\*\*([^*]+)\*\*/g, '$1') // 移除粗体
    .replace(/\*([^*]+)\*/g, '$1') // 移除斜体
    .replace(/`([^`]+)`/g, '$1') // 移除行内代码
    .replace(/```[\s\S]*?```/g, '') // 移除代码块
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 移除链接
    .trim()

  if (plainText.length <= maxLength) {
    return plainText
  }

  return plainText.slice(0, maxLength).trim() + '...'
}

export function getAllPosts(): Post[] {
  const fileNames = fs.readdirSync(postsDirectory)
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith('.mdx'))
    .map((fileName) => {
      const slug = fileName.replace(/\.mdx$/, '')
      const fullPath = path.join(postsDirectory, fileName)
      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const matter = require('gray-matter')
      const { data, content } = matter(fileContents)

      return {
        slug,
        title: data.title,
        description: data.description,
        date: data.date,
        excerpt: generateExcerpt(content || ''),
        readingTime: calculateReadingTime(content || ''),
        tags: data.tags || [],
      } as Post
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1))

  return allPostsData
}

export function getPostBySlug(slug: string): Post | null {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.mdx`)
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const matter = require('gray-matter')
    const { data, content } = matter(fileContents)

    return {
      slug,
      title: data.title,
      description: data.description,
      date: data.date,
      content,
      readingTime: calculateReadingTime(content || ''),
      tags: data.tags || [],
    } as Post
  } catch {
    return null
  }
}

export function getLatestPosts(count: number = 5): Post[] {
  const allPosts = getAllPosts()
  return allPosts.slice(0, count)
}

export function getPaginatedPosts(page: number = 1, postsPerPage: number = 6) {
  const allPosts = getAllPosts()
  const totalPages = Math.ceil(allPosts.length / postsPerPage)
  const startIndex = (page - 1) * postsPerPage
  const endIndex = startIndex + postsPerPage
  const posts = allPosts.slice(startIndex, endIndex)

  return {
    posts,
    totalPages,
    currentPage: page,
  }
}

// 获取上一篇和下一篇文章
export function getAdjacentPosts(currentSlug: string): {
  prev: Post | null
  next: Post | null
} {
  const allPosts = getAllPosts()
  const currentIndex = allPosts.findIndex((post) => post.slug === currentSlug)

  if (currentIndex === -1) {
    return { prev: null, next: null }
  }

  return {
    prev: currentIndex > 0 ? allPosts[currentIndex - 1] : null,
    next: currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null,
  }
}
