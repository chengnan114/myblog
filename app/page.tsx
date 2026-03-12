import ArticleCard from "@/components/ArticleCard";
import { getLatestPosts } from "@/lib/posts";
import SocialIcons from "@/components/SocialIcons";

export default function Home() {
  const posts = getLatestPosts(5);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Hero 区域 */}
      <section className="text-center mb-16">
        {/* 头像 */}
        <div className="mb-8">
          <div className="relative inline-block">
            {/* 脉冲动画效果 */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 blur-xl opacity-75 animate-pulse"></div>

            {/* 头像主体 */}
            <div className="relative w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-purple-600 flex items-center justify-center shadow-2xl ring-4 ring-white dark:ring-gray-800 hover:scale-105 transition-transform duration-300 cursor-pointer">
              <svg
                className="w-20 h-20 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
          </div>
        </div>

        {/* 标题 */}
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          我的技术笔记
        </h1>

        {/* 简介 */}
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
          热爱编程，专注于前端技术和用户体验设计。
          在这里分享我的学习心得、项目经验和技术见解。
          希望我的文章能对你有所帮助！
        </p>

        {/* 社交媒体图标 */}
        <div className="flex justify-center">
          <SocialIcons />
        </div>
      </section>

      {/* 最新文章区域 */}
      <section>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">最新文章</h2>
          <a
            href="/blog"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors inline-flex items-center"
          >
            查看全部
            <svg
              className="w-5 h-5 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </a>
        </div>

        {/* 响应式网格布局 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.length > 0 ? (
            posts.map((post) => <ArticleCard key={post.slug} {...post} />)
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                还没有文章，敬请期待！
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
