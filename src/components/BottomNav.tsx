'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BarChart3, Lightbulb, MessageCircle, MoreHorizontal } from 'lucide-react';

const navItems = [
  { href: '/', label: '首页', icon: Home },
  { href: '/analytics', label: '数据', icon: BarChart3 },
  { href: '/topics', label: '选题', icon: Lightbulb },
  { href: '/assistant', label: 'AI', icon: MessageCircle },
];

interface BottomNavProps {
  onMoreClick: () => void;
}

export default function BottomNav({ onMoreClick }: BottomNavProps) {
  const pathname = usePathname();
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      {/* 安全区域背景 */}
      <div className="absolute inset-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]" />
      
      {/* 导航内容 */}
      <div className="relative flex items-center justify-around px-2 pb-safe">
        {navItems.map(item => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-2 px-4 min-h-[60px] min-w-[60px] rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'text-pink-500' 
                  : 'text-gray-400 active:text-pink-400 active:bg-pink-50'
              }`}
            >
              <div className={`relative ${isActive ? 'scale-110' : ''} transition-transform`}>
                <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                {isActive && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-pink-500 rounded-full animate-pulse" />
                )}
              </div>
              <span className={`text-[10px] mt-1 font-medium ${isActive ? 'text-pink-500' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
        
        {/* 更多按钮 */}
        <button
          onClick={onMoreClick}
          className="flex flex-col items-center justify-center py-2 px-4 min-h-[60px] min-w-[60px] rounded-xl text-gray-400 active:text-pink-400 active:bg-pink-50 transition-all duration-200"
          aria-label="更多选项"
        >
          <MoreHorizontal size={24} strokeWidth={2} />
          <span className="text-[10px] mt-1 font-medium">更多</span>
        </button>
      </div>
    </nav>
  );
}

