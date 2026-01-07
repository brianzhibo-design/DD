'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import MobileHeader from './MobileHeader';

const CUSTOM_HEADER_PAGES = ['/assistant'];
const NO_LAYOUT_PAGES = ['/login'];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  
  const noLayout = NO_LAYOUT_PAGES.some(page => pathname?.startsWith(page));
  
  if (noLayout) {
    return <>{children}</>;
  }
  
  const hasCustomHeader = CUSTOM_HEADER_PAGES.some(page => pathname?.startsWith(page));
  
  return (
    <div className="flex min-h-screen min-h-dvh bg-[#FDFBF7]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0">
        {!hasCustomHeader && <MobileHeader />}
        
        <main className={`flex-1 overflow-auto ${hasCustomHeader ? '' : 'p-4 lg:p-8 pb-24 lg:pb-8'}`}>
          {children}
        </main>
      </div>
      
      <BottomNav onMoreClick={() => setSidebarOpen(true)} />
    </div>
  );
}
