import RSS from "rss";
import { getAllPosts } from "@/lib/posts";

const SITE_URL = "https://chengnanblog.cn";

export async function GET() {
  const posts = getAllPosts().slice(0, 10);

  const feed = new RSS({
    title: "我的技术笔记",
    description:
      "热爱编程，专注于前端技术和用户体验设计。分享学习心得、项目经验和技术见解。",
    site_url: SITE_URL,
    feed_url: `${SITE_URL}/rss.xml`,
    language: "zh-CN",
    pubDate: posts.length > 0 ? new Date(posts[0].date) : new Date(),
    copyright: `© ${new Date().getFullYear()} My Blog`,
    managingEditor: "chengnan",
    webMaster: "chengnan",
  });

  posts.forEach((post) => {
    feed.item({
      title: post.title,
      description: post.excerpt || post.description || "",
      url: `${SITE_URL}/blog/${post.slug}`,
      date: new Date(post.date),
      author: "chengnan",
      categories: post.tags || [],
    });
  });

  return new Response(feed.xml({ indent: true }), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
