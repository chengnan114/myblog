import Link from 'next/link'

interface BlogCardProps {
  slug: string
  title: string
  description: string
  date: string
}

export default function BlogCard({ slug, title, description, date }: BlogCardProps) {
  return (
    <article className="border border-gray-200 dark:border-gray-800 rounded-lg p-6 hover:shadow-lg transition">
      <Link href={`/blog/${slug}`}>
        <h2 className="text-xl font-bold mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition">
          {title}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{description}</p>
        <time className="text-sm text-gray-500 dark:text-gray-500">{date}</time>
      </Link>
    </article>
  )
}
