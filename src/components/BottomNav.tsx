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
      {/* 背景 */}
      <div className="absolute inset-0 bg-white border-t border-slate-100" />
      
      {/* 导航内容 */}
      <div className="relative flex items-center justify-around px-2 pb-safe">
        {navItems.map(item => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-2 px-4 min-h-[60px] min-w-[60px] rounded-lg transition-all ${
                isActive 
                  ? 'text-slate-900' 
                  : 'text-slate-400 active:text-slate-600 active:bg-slate-50'
              }`}
            >
              <div className={`relative ${isActive ? 'scale-110' : ''} transition-transform`}>
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-slate-900 rounded-full" />
                )}
              </div>
              <span className={`text-[10px] mt-1 font-medium`}>
                {item.label}
              </span>
            </Link>
          );
        })}
        
        {/* 更多按钮 */}
        <button
          onClick={onMoreClick}
          className="flex flex-col items-center justify-center py-2 px-4 min-h-[60px] min-w-[60px] rounded-lg text-slate-400 active:text-slate-600 active:bg-slate-50 transition-all"
          aria-label="更多选项"
        >
          <MoreHorizontal size={22} strokeWidth={2} />
          <span className="text-[10px] mt-1 font-medium">更多</span>
        </button>
      </div>
    </nav>
  );
}
