'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Cat, BarChart3, Lightbulb, MessageCircle, Settings, Sparkles, Shirt, Palette, Star, Palmtree, Target } from 'lucide-react';

const navItems = [
  { href: '/', label: '首页', icon: Home },
  { href: '/strategy', label: '战略规划', icon: Target },
  { href: '/analytics', label: '数据分析', icon: BarChart3 },
  { href: '/topics', label: '话题推荐', icon: Lightbulb },
  { href: '/assistant', label: 'AI助手', icon: MessageCircle },
  { href: '/cats', label: '猫咪档案', icon: Cat },
];

export default function Sidebar() {
  const pathname = usePathname();
  
  return (
    <aside className="w-64 glass-strong min-h-screen p-4 flex flex-col border-r border-pink-100/50">
      {/* Logo */}
      <div className="mb-8 px-3 pt-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
            <Palmtree size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gradient">
              小离岛岛
            </h1>
            <p className="text-[10px] text-gray-400 flex items-center gap-1">
              <Sparkles size={10} className="text-pink-400" />
              御姐风运营系统
            </p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 space-y-1.5">
        {navItems.map(item => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'aurora-bg text-white shadow-lg shadow-pink-200/50'
                  : 'text-gray-600 hover:bg-white/80 hover:shadow-md hover:text-pink-600'
              }`}
            >
              <item.icon 
                size={20} 
                className={`transition-transform duration-200 ${
                  isActive ? '' : 'group-hover:scale-110'
                }`} 
              />
              <span className="font-medium text-sm">{item.label}</span>
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>
      
      {/* Footer */}
      <div className="pt-4 border-t border-pink-100/50">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-500 hover:bg-white/80 hover:text-pink-600 transition-all duration-200"
        >
          <Settings size={18} />
          <span className="text-sm">设置</span>
        </Link>
        
        {/* Brand Footer */}
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50 border border-pink-100/30">
          <div className="flex items-center gap-2 mb-2">
            <Shirt size={16} className="text-rose-400" />
            <Palette size={16} className="text-pink-400" />
            <Star size={16} className="text-amber-400" />
          </div>
          <p className="text-xs font-medium text-gray-600">御姐风穿搭</p>
          <p className="text-xs text-gray-400">氛围感美妆 · 精致生活</p>
          
          {/* Mini cat indicators */}
          <div className="flex gap-1 mt-3">
            {['#E879F9', '#FDA4AF', '#FB923C', '#60A5FA', '#FBBF24', '#F472B6'].map((color, i) => (
              <span 
                key={i}
                className="w-4 h-4 rounded-full shadow-sm border border-white/50"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
