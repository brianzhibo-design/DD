'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Cat, BarChart3, Lightbulb, MessageCircle, Settings, Sparkles, Palmtree, Target, X } from 'lucide-react';

const navItems = [
  { href: '/', label: '首页', icon: Home },
  { href: '/strategy', label: '战略规划', icon: Target },
  { href: '/analytics', label: '数据分析', icon: BarChart3 },
  { href: '/topics', label: '话题推荐', icon: Lightbulb },
  { href: '/assistant', label: 'AI助手', icon: MessageCircle },
  { href: '/cats', label: '猫咪档案', icon: Cat },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  
  return (
    <>
      {/* 移动端遮罩层 */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* 侧边栏 */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50
        w-72 lg:w-64 h-full lg:h-screen
        glass-strong p-4 flex flex-col border-r border-pink-100/50
        transform transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* 移动端关闭按钮 */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-xl bg-gray-100 text-gray-500 lg:hidden min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="关闭菜单"
        >
          <X size={20} />
        </button>
        
        {/* Logo */}
        <div className="mb-8 px-3 pt-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center shadow-lg">
              <Palmtree size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gradient">
                小离岛岛
              </h1>
              <p className="text-[11px] text-gray-400 flex items-center gap-1">
                <Sparkles size={10} className="text-pink-400" />
                内容运营系统
              </p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          {navItems.map(item => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`group flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 min-h-[48px] ${
                  isActive
                    ? 'aurora-bg text-white shadow-lg shadow-pink-200/50'
                    : 'text-gray-600 hover:bg-white/80 hover:shadow-md hover:text-pink-600 active:scale-[0.98]'
                }`}
              >
                <item.icon 
                  size={22} 
                  className={`transition-transform duration-200 ${
                    isActive ? '' : 'group-hover:scale-110'
                  }`} 
                />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-white animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>
        
        {/* Footer */}
        <div className="pt-4 border-t border-pink-100/50">
          <Link
            href="/settings"
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-gray-500 hover:bg-white/80 hover:text-pink-600 transition-all duration-200 min-h-[48px] active:scale-[0.98]"
          >
            <Settings size={20} />
            <span>设置</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
