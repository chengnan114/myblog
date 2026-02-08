'use client'

import { MDXRemote, type MDXRemoteProps } from 'next-mdx-remote'
import { CodeHighlight } from './CodeHighlight'

// 自定义 MDX 组件映射
const mdxComponents = {
  code: ({ className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || '')
    const language = match ? match[1] : 'text'

    return (
      <CodeHighlight className={className} {...props}>
        {String(children).replace(/\n$/, '')}
      </CodeHighlight>
    )
  },
  pre: ({ children }: any) => <>{children}</>,
  h1: ({ children }: any) => (
    <h1 className="text-3xl font-bold mt-8 mb-4">{children}</h1>
  ),
  h2: ({ children }: any) => (
    <h2 className="text-2xl font-bold mt-10 mb-4">{children}</h2>
  ),
  h3: ({ children }: any) => (
    <h3 className="text-xl font-semibold mt-6 mb-3">{children}</h3>
  ),
  p: ({ children }: any) => (
    <p className="my-4 leading-relaxed">{children}</p>
  ),
  a: ({ href, children }: any) => (
    <a
      href={href}
      className="text-blue-600 dark:text-blue-400 hover:underline"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  ul: ({ children }: any) => (
    <ul className="list-disc list-inside my-4 space-y-2">{children}</ul>
  ),
  ol: ({ children }: any) => (
    <ol className="list-decimal list-inside my-4 space-y-2">{children}</ol>
  ),
  blockquote: ({ children }: any) => (
    <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic my-4 text-gray-700 dark:text-gray-300">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-8 border-gray-300 dark:border-gray-600" />,
  img: ({ src, alt }: any) => (
    <img src={src} alt={alt} className="rounded-lg my-4 max-w-full h-auto" />
  ),
  strong: ({ children }: any) => (
    <strong className="font-bold">{children}</strong>
  ),
  em: ({ children }: any) => <em className="italic">{children}</em>,
}

interface MDXContentProps extends MDXRemoteProps {
  content: string
}

export function MDXContent({ content, ...props }: MDXContentProps) {
  return (
    <div className="prose prose-lg dark:prose-invert max-w-none">
      <MDXRemote
        source={content}
        components={mdxComponents}
        {...props}
      />
    </div>
  )
}

export { mdxComponents }
export { CodeHighlight } from './CodeHighlight'
