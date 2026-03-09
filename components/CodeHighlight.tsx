'use client'

import { useEffect, useState, useCallback } from 'react'
import { useTheme } from 'next-themes'

interface CodeProps {
  children?: string
  className?: string
  language?: string
  showLineNumbers?: boolean
  [key: string]: any
}

// 语言显示名称映射
const LANG_DISPLAY: Record<string, string> = {
  js: 'JavaScript',
  jsx: 'JSX',
  ts: 'TypeScript',
  tsx: 'TSX',
  py: 'Python',
  go: 'Go',
  rust: 'Rust',
  rs: 'Rust',
  bash: 'Bash',
  sh: 'Shell',
  json: 'JSON',
  css: 'CSS',
  html: 'HTML',
  yaml: 'YAML',
  yml: 'YAML',
  sql: 'SQL',
  md: 'Markdown',
  markdown: 'Markdown',
  java: 'Java',
  c: 'C',
  cpp: 'C++',
  swift: 'Swift',
  kotlin: 'Kotlin',
  ruby: 'Ruby',
  php: 'PHP',
  dart: 'Dart',
  text: 'Text',
  plaintext: 'Text',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  python: 'Python',
}

export function CodeHighlight({
  children,
  className,
  language: langProp,
  showLineNumbers = true,
  ...props
}: CodeProps) {
  const [highlightedCode, setHighlightedCode] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  const language = langProp || className?.replace(/language-/, '') || 'text'
  const displayLang = LANG_DISPLAY[language] || language.toUpperCase()
  const code = (children || '').trim()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    async function highlight() {
      try {
        const { createHighlighter } = await import('shiki')
        const highlighter = await createHighlighter({
          themes: ['github-light', 'dracula'],
          langs: [
            language,
            'typescript', 'javascript', 'python', 'bash', 'json',
            'css', 'html', 'tsx', 'jsx', 'go', 'rust', 'java',
            'c', 'cpp', 'swift', 'kotlin', 'ruby', 'php', 'sql',
            'yaml', 'markdown', 'shell', 'dart',
          ],
        })

        const currentTheme = resolvedTheme === 'dark' ? 'dracula' : 'github-light'

        const html = highlighter.codeToHtml(code, {
          lang: language,
          theme: currentTheme,
        })

        setHighlightedCode(html)
      } catch (error) {
        console.error('Shiki 高亮失败:', error)
        setHighlightedCode('')
      }
    }

    if (mounted) {
      highlight()
    }
  }, [code, language, resolvedTheme, mounted])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
      const textarea = document.createElement('textarea')
      textarea.value = code
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [code])

  const lines = code.split('\n')

  // 加载中或未挂载
  if (!highlightedCode || !mounted) {
    return (
      <div className="code-block-wrapper">
        <div className="code-block-header">
          <span className="code-block-lang">{displayLang}</span>
        </div>
        <pre className="bg-gray-50 dark:bg-[#282a36] p-4 rounded-b-lg overflow-x-auto text-sm">
          <code className={className}>{code}</code>
        </pre>
      </div>
    )
  }

  return (
    <div className="code-block-wrapper">
      {/* 顶部工具栏 */}
      <div className="code-block-header">
        <span className="code-block-lang">{displayLang}</span>
        <button
          onClick={handleCopy}
          className="code-copy-btn"
          aria-label="复制代码"
          title="复制代码"
        >
          {copied ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>已复制</span>
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              <span>复制</span>
            </>
          )}
        </button>
      </div>

      {/* 代码区域 */}
      <div className="code-block-body">
        {showLineNumbers && (
          <div className="code-line-numbers" aria-hidden="true">
            {lines.map((_, i) => (
              <span key={i}>{i + 1}</span>
            ))}
          </div>
        )}
        <div
          className="code-block-content"
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
          {...props}
        />
      </div>
    </div>
  )
}
