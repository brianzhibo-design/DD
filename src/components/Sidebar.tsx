'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BarChart3, 
  Lightbulb, 
  Cat, 
  Bot, 
  Settings,
  Sparkles,
  User,
  Plus,
  Map
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { getUserProfile, UserProfile, loadUserProfile } from '@/lib/user-profile';

const navItems = [
  { href: '/', label: '控制台', icon: LayoutDashboard },
  { href: '/analytics', label: '数据分析', icon: BarChart3 },
  { href: '/topics', label: '话题推荐', icon: Lightbulb },
  { href: '/assistant', label: 'AI助手', icon: Bot },
  { href: '/cats', label: '猫咪档案', icon: Cat },
  { href: '/strategy', label: '战略规划', icon: Map },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [userProfile, setUserProfile] = useState<UserProfile>({});
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    setUserProfile(getUserProfile());
    loadUserProfile().then(setUserProfile);
  }, []);

  return (
    <aside className="hidden lg:flex flex-col w-72 bg-[#F7F3EE] border-r border-[#2D4B3E]/5 h-screen sticky top-0">
      {/* Logo / Profile */}
      <Link 
        href="/settings"
        className="relative p-8 border-b border-[#2D4B3E]/5 group"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-[#2D4B3E] flex items-center justify-center shadow-lg shadow-[#2D4B3E]/20 overflow-hidden">
              {userProfile.avatar ? (
                <img src={userProfile.avatar} alt="头像" className="w-full h-full object-cover" />
              ) : (
                <Sparkles className="w-6 h-6 text-white" />
              )}
            </div>
            {isHovering && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow border border-[#2D4B3E]/10">
                <Plus size={12} className="text-[#2D4B3E]" />
              </div>
            )}
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#2D4B3E] font-serif">
              {userProfile.nickname || '小离岛岛'}
            </h1>
            <p className="text-xs text-[#6B7A74] mt-0.5">内容运营系统</p>
          </div>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 p-5 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3.5 px-5 py-3.5 rounded-xl font-medium text-sm transition-all ${
                isActive 
                  ? 'bg-[#2D4B3E] text-white shadow-lg shadow-[#2D4B3E]/20' 
                  : 'text-[#6B7A74] hover:text-[#2D4B3E] hover:bg-white'
              }`}
            >
              <item.icon size={18} className={isActive ? 'text-white' : ''} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Settings Link */}
      <div className="p-5 border-t border-[#2D4B3E]/5">
        <Link
          href="/settings"
          className={`flex items-center gap-3.5 px-5 py-3.5 rounded-xl font-medium text-sm transition-all ${
            pathname === '/settings'
              ? 'bg-[#2D4B3E] text-white shadow-lg shadow-[#2D4B3E]/20'
              : 'text-[#6B7A74] hover:text-[#2D4B3E] hover:bg-white'
          }`}
        >
          <Settings size={18} />
          系统设置
        </Link>
      </div>
    </aside>
  );
}
