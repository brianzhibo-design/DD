'use client';

import { usePathname } from 'next/navigation';
import { Palmtree, Sparkles } from 'lucide-react';

const pageNames: Record<string, string> = {
  '/': '首页',
  '/strategy': '战略规划',
  '/analytics': '数据分析',
  '/topics': '话题推荐',
  '/assistant': 'AI助手',
  '/cats': '猫咪档案',
  '/settings': '设置',
};

export default function MobileHeader() {
  const pathname = usePathname();
  const pageName = pageNames[pathname] || '小离岛岛';
  
  return (
    <header className="sticky top-0 z-30 lg:hidden">
      {/* 背景模糊层 */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-xl border-b border-gray-100" />
      
      {/* 内容 */}
      <div className="relative flex items-center justify-between px-4 py-3 min-h-[56px]">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center shadow-md">
            <Palmtree size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800">{pageName}</p>
            <p className="text-[9px] text-gray-400 flex items-center gap-0.5">
              <Sparkles size={8} className="text-pink-400" />
              小离岛岛
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

