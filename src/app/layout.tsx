import type { Metadata, Viewport } from "next";
import "./globals.css";
import AppLayout from "@/components/AppLayout";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "小离岛岛 · 小红书运营系统",
  description: "小红书内容创作运营管理系统",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23EC4899' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M13 8c0-2.76-2.46-5-5.5-5S2 5.24 2 8h2l1-1 1 1h4'/><path d='M13 7.14A5.82 5.82 0 0 1 16.5 6c3.04 0 5.5 2.24 5.5 5h-3l-1-1-1 1h-3'/><path d='M5.89 9.71c-2.15 2.15-2.3 5.47-.35 7.43l4.24-4.25.7-.7.71-.71 2.12-2.12c-1.95-1.96-5.27-1.8-7.42.35z'/><path d='M11 15.5c.5 2.5-.17 4.5-1 6.5h4c2-5.5-.5-12-1-14'/></svg>",
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
          href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;600;800&family=Noto+Sans+SC:wght@300;400;500;700&family=ZCOOL+XiaoWei&display=swap" 
          rel="stylesheet" 
        />
        {/* PWA 支持 */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#2D4B3E" />
      </head>
      <body className="antialiased overscroll-none touch-pan-y">
        <AuthProvider>
          <AppLayout>{children}</AppLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
