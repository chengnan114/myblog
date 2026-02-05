export const metadata = {
  title: 'About - My Blog',
  description: 'Learn more about me and this blog',
}

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">About</h1>

      <div className="prose dark:prose-invert max-w-none">
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
          Welcome to my personal blog! This is a space where I share my thoughts,
          experiences, and knowledge about technology, programming, and software development.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">About Me</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          I&apos;m a passionate developer who loves building things with code.
          This blog serves as a platform for me to document my learning journey
          and share insights with the community.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">About This Blog</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Built with Next.js 14, TypeScript, and Tailwind CSS, this blog features:
        </p>
        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
          <li>Fast and responsive design</li>
          <li>Dark mode support</li>
          <li>MDX support for rich content</li>
          <li>Code syntax highlighting</li>
          <li>SEO optimized</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">Get In Touch</h2>
        <p className="text-gray-700 dark:text-gray-300">
          Feel free to reach out if you have any questions or just want to say hello!
        </p>
      </div>
    </div>
  )
}
