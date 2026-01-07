'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Cat, BarChart3, Lightbulb, MessageCircle, Settings, Sparkles, Target, X, User, LogOut } from 'lucide-react';
import { getUserProfile, UserProfile, loadUserProfile } from '@/lib/user-profile';

const navItems = [
  { href: '/', label: '数据总览', icon: Home },
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
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile>({});

  useEffect(() => {
    setUserProfile(getUserProfile());
    loadUserProfile().then(setUserProfile);
    
    const interval = setInterval(() => {
      setUserProfile(getUserProfile());
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    if (confirm('确定要退出系统吗？')) {
      await fetch('/api/auth', { method: 'DELETE' });
      router.push('/login');
    }
  };
  
  return (
    <>
      {/* 移动端遮罩层 */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* 侧边栏 */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50
        w-64 h-full lg:h-screen
        bg-[#F4F6F0] border-r border-[#E2E8D5] flex flex-col
        transform transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* 移动端关闭按钮 */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-lg bg-white text-[#7D8A80] hover:text-[#2D3A30] lg:hidden min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
          aria-label="关闭菜单"
        >
          <X size={18} />
        </button>
        
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-[#E2E8D5]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#4A6741] rounded-lg flex items-center justify-center shadow-md">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-[#2D3A30] text-lg">小离岛岛</span>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1">
          {navItems.map(item => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  isActive
                    ? 'bg-white text-[#4A6741] font-medium shadow-sm'
                    : 'text-[#7D8A80] hover:bg-white/50 hover:text-[#2D3A30]'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-sm">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#4A6741]" />
                )}
              </Link>
            );
          })}
        </nav>
        
        {/* Settings & User */}
        <div className="p-4 border-t border-[#E2E8D5] space-y-2">
          {/* 用户信息 */}
          <Link
            href="/settings"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/50 transition-colors group"
          >
            {userProfile.avatar ? (
              <img 
                src={userProfile.avatar} 
                alt="头像"
                className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-sm"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#E2E8D5] flex items-center justify-center">
                <User size={16} className="text-[#7D8A80]" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-[#2D3A30] truncate">
                {userProfile.nickname || '离岛岛主'}
              </div>
              <div className="text-[10px] text-[#7D8A80] uppercase font-bold tracking-tight">Administrator</div>
            </div>
            <Settings size={16} className="text-[#9CA89F] group-hover:text-[#7D8A80] transition-colors" />
          </Link>
          
          {/* 退出按钮 */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#7D8A80] hover:bg-[#C75050]/10 hover:text-[#C75050] transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">退出系统</span>
          </button>
        </div>
      </aside>
    </>
  );
}
