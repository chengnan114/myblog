import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SearchDialog } from "@/components/Search";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

const SITE_URL = "https://chengnanblog.cn";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "chengnan 的技术笔记",
    template: "%s | chengnan 的技术笔记",
  },
  description:
    "热爱编程，专注于前端技术和用户体验设计。分享学习心得、项目经验和技术见解。",
  keywords: [
    "前端开发",
    "React",
    "Next.js",
    "TypeScript",
    "Web开发",
    "技术笔记",
  ],
  authors: [{ name: "chengnan" }],
  creator: "chengnan",
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: SITE_URL,
    siteName: "chengnan 的技术笔记",
    title: "chengnan 的技术笔记",
    description:
      "热爱编程，专注于前端技术和用户体验设计。分享学习心得、项目经验和技术见解。",
  },
  twitter: {
    card: "summary_large_image",
    title: "chengnan 的技术笔记",
    description:
      "热爱编程，专注于前端技术和用户体验设计。分享学习心得、项目经验和技术见解。",
  },
  alternates: {
    canonical: SITE_URL,
    types: {
      "application/rss+xml": `${SITE_URL}/rss.xml`,
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="min-h-screen flex flex-col">
            <Header />
            <SearchDialog />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
