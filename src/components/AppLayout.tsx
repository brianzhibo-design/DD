'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import MobileHeader from './MobileHeader';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
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

