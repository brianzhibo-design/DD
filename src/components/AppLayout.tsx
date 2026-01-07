'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import MobileHeader from './MobileHeader';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  
  // 登录页面不显示导航
  if (pathname === '/login') {
    return <>{children}</>;
  }

  // 首页和AI助手页面使用自己的 header
  const showMobileHeader = pathname !== '/assistant' && pathname !== '/';

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <div className="flex">
        {/* Desktop Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <div className="flex-1 min-h-screen">
          {/* Mobile Header */}
          {showMobileHeader && <MobileHeader />}
          
          {/* Page Content */}
          <main className="p-5 lg:p-10 pb-24 lg:pb-10">
            {children}
          </main>
        </div>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
