'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import MobileHeader from './MobileHeader';

// 这些页面有自己的 header，不需要通用的 MobileHeader
const CUSTOM_HEADER_PAGES = ['/assistant'];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  
  // 检查是否是自定义 header 页面
  const hasCustomHeader = CUSTOM_HEADER_PAGES.some(page => pathname?.startsWith(page));
  
  return (
    <div className="flex min-h-screen min-h-dvh bg-gray-50">
      {/* 桌面端侧边栏 */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* 主内容区 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 移动端头部 - 自定义 header 页面不显示 */}
        {!hasCustomHeader && <MobileHeader />}
        
        {/* 页面内容 */}
        <main className={`flex-1 overflow-auto ${hasCustomHeader ? '' : 'p-4 lg:p-8 pb-24 lg:pb-8'}`}>
          {children}
        </main>
      </div>
      
      {/* 移动端底部导航 - 始终显示 */}
      <BottomNav onMoreClick={() => setSidebarOpen(true)} />
    </div>
  );
}
