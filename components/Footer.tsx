export default function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 py-6 mt-auto">
      <div className="max-w-4xl mx-auto px-4 text-center text-gray-600 dark:text-gray-400 space-y-2">
        <p>&copy; {new Date().getFullYear()} chengnan 的技术笔记. All rights reserved.</p>
        <p className="text-sm flex items-center justify-center gap-4 flex-wrap">
          <a 
            href="https://beian.miit.gov.cn/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-blue-500 transition-colors"
          >
            闽ICP备2026008150号-1
          </a>
          <a
            href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=35058302351203"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-500 transition-colors inline-flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="inline-block" style={{ width: '14px', height: '14px' }}>
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18l7 3.12v4.7c0 4.83-3.13 9.37-7 10.5-3.87-1.13-7-5.67-7-10.5V6.3l7-3.12z"/>
            </svg>
            闽公网安备35058302351203号
          </a>
        </p>
      </div>
    </footer>
  )
}
