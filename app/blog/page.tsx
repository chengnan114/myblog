import BlogCard from '@/components/BlogCard'
import { getPaginatedPosts } from '@/lib/posts'
import Link from 'next/link'

interface BlogPageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams
  const currentPage = Number(params.page) || 1
  const { posts, totalPages } = getPaginatedPosts(currentPage, 6)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Blog</h1>

      <div className="grid gap-6 mb-8">
        {posts.length > 0 ? (
          posts.map((post) => <BlogCard key={post.slug} {...post} />)
        ) : (
          <p className="text-gray-600 dark:text-gray-400">
            No posts found. Check back soon!
          </p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {currentPage > 1 && (
            <Link
              href={`/blog?page=${currentPage - 1}`}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              Previous
            </Link>
          )}
          <span className="px-4 py-2">
            Page {currentPage} of {totalPages}
          </span>
          {currentPage < totalPages && (
            <Link
              href={`/blog?page=${currentPage + 1}`}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
