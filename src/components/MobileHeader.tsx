'use client';

import Link from 'next/link';
import { Settings, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getUserProfile, UserProfile, loadUserProfile } from '@/lib/user-profile';

export default function MobileHeader() {
  const [userProfile, setUserProfile] = useState<UserProfile>({});

  useEffect(() => {
    setUserProfile(getUserProfile());
    loadUserProfile().then(setUserProfile);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-[#2D4B3E]/5 lg:hidden">
      <div className="flex items-center justify-between h-16 px-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2D4B3E] flex items-center justify-center shadow-lg shadow-[#2D4B3E]/20 overflow-hidden">
            {userProfile.avatar ? (
              <img src={userProfile.avatar} alt="头像" className="w-full h-full object-cover" />
            ) : (
              <Sparkles className="w-5 h-5 text-white" />
            )}
          </div>
          <div>
            <h1 className="text-base font-bold text-[#2D4B3E] font-serif">
              {userProfile.nickname || '小离岛岛'}
            </h1>
            <p className="text-[10px] text-[#6B7A74]">内容运营系统</p>
          </div>
        </div>
        
        <Link 
          href="/settings"
          className="p-2.5 rounded-xl text-[#6B7A74] hover:text-[#2D4B3E] hover:bg-[#F4F6F0] transition-all"
        >
          <Settings size={22} />
        </Link>
      </div>
    </header>
  );
}

