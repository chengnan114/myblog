export default function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 py-6 mt-auto">
      <div className="max-w-4xl mx-auto px-4 text-center text-gray-600 dark:text-gray-400 space-y-2">
        <p>&copy; {new Date().getFullYear()} chengnan 的技术笔记. All rights reserved.</p>
        <p className="text-sm">
          <a 
            href="https://beian.miit.gov.cn/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-blue-500 transition-colors"
          >
            闽ICP备2026008150号-1
          </a>
        </p>
      </div>
    </footer>
  )
}
