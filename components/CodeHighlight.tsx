'use client'

import { useEffect, useState } from 'react'

interface CodeProps {
  children?: string
  className?: string
  language?: string
  [key: string]: any
}

export function CodeHighlight({ children, className, language: langProp, ...props }: CodeProps) {
  const [highlightedCode, setHighlightedCode] = useState<string>('')
  const language = langProp || className?.replace(/language-/, '') || 'text'

  useEffect(() => {
    async function highlight() {
      try {
        const { getHighlighter } = await import('shiki')
        const highlighter = await getHighlighter({
          themes: ['github-light', 'github-dark'],
          langs: [language, 'typescript', 'javascript', 'python', 'bash', 'json', 'css', 'html', 'tsx', 'jsx'],
        })

        const html = highlighter.codeToHtml(children || '', {
          lang: language,
          theme: 'github-light',
        })

        setHighlightedCode(html)
      } catch (error) {
        console.error('Error highlighting code:', error)
        // Fallback to simple pre/code block
        setHighlightedCode(`<pre class="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto"><code class="language-${language}">${children || ''}</code></pre>`)
      }
    }

    highlight()
  }, [children, language])

  if (!highlightedCode) {
    return (
      <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto my-4">
        <code className={className}>{children}</code>
      </pre>
    )
  }

  return (
    <div
      dangerouslySetInnerHTML={{ __html: highlightedCode }}
      className="overflow-x-auto my-4 rounded-lg"
      {...props}
    />
  )
}
