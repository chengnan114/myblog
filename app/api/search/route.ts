import { getAllPosts } from '@/lib/posts'
import { NextResponse } from 'next/server'

export async function GET() {
  const posts = getAllPosts()

  const searchData = posts.map((post) => ({
    slug: post.slug,
    title: post.title,
    description: post.description || '',
    excerpt: post.excerpt || '',
    date: post.date,
    tags: post.tags || [],
  }))

  return NextResponse.json(searchData, {
    headers: {
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  })
}
