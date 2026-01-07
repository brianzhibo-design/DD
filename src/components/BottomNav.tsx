'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BarChart3, 
  Lightbulb, 
  Cat,
  Bot
} from 'lucide-react';

const navItems = [
  { href: '/', label: '首页', icon: LayoutDashboard },
  { href: '/analytics', label: '数据', icon: BarChart3 },
  { href: '/assistant', label: 'AI', icon: Bot },
  { href: '/topics', label: '话题', icon: Lightbulb },
  { href: '/cats', label: '猫咪', icon: Cat },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#2D4B3E]/5 lg:hidden z-40 pb-safe">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center min-w-[60px] min-h-[60px] transition-all active:scale-95 ${
                isActive 
                  ? 'text-[#2D4B3E]' 
                  : 'text-[#9BA8A3]'
              }`}
            >
              <div className={`p-2 rounded-xl mb-0.5 transition-all ${
                isActive ? 'bg-[#2D4B3E]/10' : ''
              }`}>
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-bold ${isActive ? '' : 'opacity-70'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
