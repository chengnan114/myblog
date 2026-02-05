import BlogCard from '@/components/BlogCard'
import { getLatestPosts } from '@/lib/posts'
import Link from 'next/link'

export default function Home() {
  const posts = getLatestPosts(5)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <section className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Welcome to My Blog</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          A place where I share my thoughts on technology, programming, and more.
        </p>
      </section>

      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Latest Posts</h2>
          <Link
            href="/blog"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            View All →
          </Link>
        </div>
        <div className="grid gap-6">
          {posts.length > 0 ? (
            posts.map((post) => <BlogCard key={post.slug} {...post} />)
          ) : (
            <p className="text-gray-600 dark:text-gray-400">
              No posts yet. Check back soon!
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
