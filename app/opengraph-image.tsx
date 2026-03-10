import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'chengnan 的技术博客'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        {/* 装饰元素 */}
        <div
          style={{
            position: 'absolute',
            top: 40,
            right: 60,
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: 'rgba(99, 102, 241, 0.2)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 80,
            left: 80,
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'rgba(139, 92, 246, 0.15)',
            display: 'flex',
          }}
        />

        {/* 主标题 */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: 'white',
            marginBottom: 16,
            display: 'flex',
          }}
        >
          🚀 chengnan
        </div>

        {/* 副标题 */}
        <div
          style={{
            fontSize: 28,
            color: '#94a3b8',
            marginBottom: 40,
            display: 'flex',
          }}
        >
          前端开发 · 技术博客
        </div>

        {/* 标签 */}
        <div
          style={{
            display: 'flex',
            gap: 12,
          }}
        >
          {['React', 'Next.js', 'TypeScript', 'Web开发'].map((tag) => (
            <div
              key={tag}
              style={{
                padding: '8px 20px',
                borderRadius: 20,
                background: 'rgba(99, 102, 241, 0.2)',
                color: '#a5b4fc',
                fontSize: 18,
                display: 'flex',
              }}
            >
              {tag}
            </div>
          ))}
        </div>

        {/* 底部域名 */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            fontSize: 18,
            color: '#64748b',
            display: 'flex',
          }}
        >
          chengnanblog.cn
        </div>
      </div>
    ),
    { ...size }
  )
}
