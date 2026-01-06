import type { Metadata, Viewport } from "next";
import "./globals.css";
import AppLayout from "@/components/AppLayout";

export const metadata: Metadata = {
  title: "小离岛岛 · 小红书运营系统",
  description: "御姐风穿搭 × 氛围感美妆 × 精致生活 - 小红书带货运营管理系统",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🏝️</text></svg>",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "小离岛岛",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Sans+SC:wght@300;400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
        {/* PWA 支持 */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#EC4899" />
      </head>
      <body className="antialiased overscroll-none touch-pan-y">
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
