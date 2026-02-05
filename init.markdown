创建一个Next.js14个人博客项目，要求：

**技术栈：**
-Next.js14(App Router)
-TypeScript
-Tailwind CSS
-MDX(支持Markdown+React组件)

**项目结构：**

/app
 /layout.tsx  #全局布局
 /page.tsx    #首页（文章列表）
 /about
  /page.tsx   #关于页面
 /blog
  /page.tsx   #博客列表页
  /[slug]
   /page.tsx  #文章详情页
/components
 /Header.tsx  #导航栏
 /Footer.tsx  #页脚
 /BlogCard.tsx  #文章卡片
/lib
 /posts.ts    #文章数据获取
/content
 /post1.mdx   #文章内容

**功能要求：**
1.首页展示最新5篇文章
2.文章列表页分页显示所有文章
3.文章详情页支持MDX渲染
4.代码块语法高亮（使用prism.js或shiki）
5.暗色模式切换
6.响应式设计
7.SEO优化（metadata、sitemap）

请先生成项目配置和基础文件