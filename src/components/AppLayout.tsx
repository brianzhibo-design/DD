'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import MobileHeader from './MobileHeader';

// 这些页面使用独立布局，不需要通用的 header/sidebar/bottomnav
const STANDALONE_PAGES = ['/assistant'];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  
  // 检查是否是独立布局页面
  const isStandalonePage = STANDALONE_PAGES.some(page => pathname?.startsWith(page));
  
  // 独立布局页面直接渲染 children
  if (isStandalonePage) {
    return <>{children}</>;
  }
  
  return (
    <div className="flex min-h-screen min-h-dvh bg-gray-50">
      {/* 桌面端侧边栏 */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* 主内容区 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 移动端头部 */}
        <MobileHeader />
        
        {/* 页面内容 */}
        <main className="flex-1 p-4 lg:p-8 pb-24 lg:pb-8 overflow-auto">
          {children}
        </main>
      </div>
      
      {/* 移动端底部导航 */}
      <BottomNav onMoreClick={() => setSidebarOpen(true)} />
    </div>
  );
}
