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
      <div className="absolute inset-0 bg-[#F4F6F0] border-b border-[#E2E8D5]" />
      
      {/* 内容 */}
      <div className="relative flex items-center justify-between px-4 py-3 min-h-[56px]">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#4A6741] rounded-lg flex items-center justify-center shadow-md">
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#2D3A30]">{pageName}</p>
            <p className="text-[10px] text-[#7D8A80]">{userProfile.nickname || '小离岛岛'}</p>
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
            <div className="w-8 h-8 rounded-full bg-[#E2E8D5] flex items-center justify-center">
              <User size={16} className="text-[#7D8A80]" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
