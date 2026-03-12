import { ImageResponse } from "next/og";
import { getPostBySlug } from "@/lib/posts";

export const alt = "文章封面";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  const title = post?.title || "文章";
  const description = post?.description || "";
  const date = post
    ? new Date(post.date).toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";
  const tags = post?.tags?.slice(0, 4) || [];

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "60px 70px",
        background:
          "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        fontFamily: "sans-serif",
      }}
    >
      {/* 顶部：博客名 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: 20,
            fontWeight: 700,
          }}
        >
          C
        </div>
        <div style={{ fontSize: 20, color: "#94a3b8", display: "flex" }}>
          chengnan 的技术笔记
        </div>
      </div>

      {/* 中间：文章标题和描述 */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          flex: 1,
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontSize: title.length > 20 ? 42 : 52,
            fontWeight: 800,
            color: "white",
            lineHeight: 1.3,
            display: "flex",
          }}
        >
          {title.length > 40 ? title.slice(0, 40) + "..." : title}
        </div>
        {description && (
          <div
            style={{
              fontSize: 22,
              color: "#94a3b8",
              lineHeight: 1.5,
              display: "flex",
            }}
          >
            {description.length > 80
              ? description.slice(0, 80) + "..."
              : description}
          </div>
        )}
      </div>

      {/* 底部：标签和日期 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", gap: 10 }}>
          {tags.map((tag) => (
            <div
              key={tag}
              style={{
                padding: "6px 16px",
                borderRadius: 16,
                background: "rgba(99, 102, 241, 0.2)",
                color: "#a5b4fc",
                fontSize: 16,
                display: "flex",
              }}
            >
              {tag}
            </div>
          ))}
        </div>
        <div style={{ fontSize: 16, color: "#64748b", display: "flex" }}>
          {date}
        </div>
      </div>
    </div>,
    { ...size },
  );
}
