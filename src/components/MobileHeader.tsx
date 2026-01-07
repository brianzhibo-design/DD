'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sparkles, User } from 'lucide-react';
import { getUserProfile, UserProfile, loadUserProfile } from '@/lib/user-profile';

const pageNames: Record<string, string> = {
  '/': '数据总览',
  '/strategy': '战略规划',
  '/analytics': '数据分析',
  '/topics': '话题推荐',
  '/assistant': 'AI助手',
  '/cats': '猫咪档案',
  '/settings': '系统设置',
};

export default function MobileHeader() {
  const pathname = usePathname();
  const pageName = pageNames[pathname] || '小离岛岛';
  const [userProfile, setUserProfile] = useState<UserProfile>({});

  useEffect(() => {
    setUserProfile(getUserProfile());
    loadUserProfile().then(setUserProfile);
    
    const interval = setInterval(() => {
      setUserProfile(getUserProfile());
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <header className="sticky top-0 z-30 lg:hidden">
      {/* 背景 */}
      <div className="absolute inset-0 bg-white border-b border-slate-100" />
      
      {/* 内容 */}
      <div className="relative flex items-center justify-between px-4 py-3 min-h-[56px]">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center shadow-md shadow-slate-200">
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">{pageName}</p>
            <p className="text-[10px] text-slate-400">{userProfile.nickname || '小离岛岛'}</p>
          </div>
        </div>

        {/* 用户头像 */}
        <div className="flex items-center gap-3">
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
        </div>
      </div>
    </header>
  );
}
