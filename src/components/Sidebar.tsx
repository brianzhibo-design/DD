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
        bg-white border-r border-slate-100 flex flex-col
        transform transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* 移动端关闭按钮 */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-lg bg-slate-50 text-slate-400 hover:text-slate-600 lg:hidden min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
          aria-label="关闭菜单"
        >
          <X size={18} />
        </button>
        
        {/* Logo & Profile */}
        <div className="h-16 flex items-center justify-center border-b border-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center shadow-md shadow-slate-200">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-lg tracking-tight">小离岛岛</span>
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
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
                  isActive
                    ? 'bg-slate-100 text-slate-900 font-medium'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <item.icon 
                  className={`w-4 h-4 ${
                    isActive ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-600'
                  }`} 
                />
                <span className="text-sm">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1 h-1 rounded-full bg-slate-900" />
                )}
              </Link>
            );
          })}
        </nav>
        
        {/* Settings & User */}
        <div className="p-4 border-t border-slate-50 space-y-2">
          {/* 用户信息 */}
          <Link
            href="/settings"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors group"
          >
            {userProfile.avatar ? (
              <img 
                src={userProfile.avatar} 
                alt="头像"
                className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-sm"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                <User size={16} className="text-slate-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-slate-800 truncate">
                {userProfile.nickname || '离岛岛主'}
              </div>
              <div className="text-xs text-slate-400">管理员</div>
            </div>
            <Settings size={16} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
          </Link>
          
          {/* 退出按钮 */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">退出登录</span>
          </button>
        </div>
      </aside>
    </>
  );
}
