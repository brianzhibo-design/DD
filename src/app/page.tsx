'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Cat, BarChart3, Lightbulb, TrendingUp, Users, Heart, Bookmark, 
  Sparkles, ArrowUpRight, Shirt, Palette, Gift, CheckCircle2, Plus,
  PieChart, Bot, Loader2
} from 'lucide-react';
import { getLatestWeeklyStat } from '@/lib/db';
import { WeeklyStat } from '@/lib/supabase';
import { initialCats } from '@/data/cats';
import { getUserProfile, UserProfile, loadUserProfile } from '@/lib/user-profile';

export default function Home() {
  const [weeklyData, setWeeklyData] = useState<WeeklyStat | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile>({});
  
  useEffect(() => {
    loadData();
    setUserProfile(getUserProfile());
    loadUserProfile().then(setUserProfile);
  }, []);

  const loadData = async () => {
    try {
      const data = await getLatestWeeklyStat();
      setWeeklyData(data);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
    setLoading(false);
  };

  const quickLinks = [
    { href: '/analytics', label: '数据分析', icon: BarChart3, gradient: 'from-rose-400 via-pink-500 to-rose-600', desc: '追踪运营数据趋势' },
    { href: '/topics', label: '话题推荐', icon: Lightbulb, gradient: 'from-amber-400 via-orange-500 to-amber-600', desc: '内容选题生成' },
    { href: '/assistant', label: 'AI助手', icon: Bot, gradient: 'from-purple-400 via-fuchsia-500 to-purple-600', desc: '智能运营建议' },
    { href: '/cats', label: '猫咪档案', icon: Cat, gradient: 'from-blue-400 via-indigo-500 to-blue-600', desc: '6只猫的信息管理' },
  ];

  const contentTypes = [
    { label: '生活方式', icon: Shirt, percent: 40, color: 'bg-gradient-to-r from-rose-400 to-rose-500' },
    { label: '好物分享', icon: Palette, percent: 25, color: 'bg-gradient-to-r from-pink-400 to-pink-500' },
    { label: '好物种草', icon: Gift, percent: 20, color: 'bg-gradient-to-r from-amber-400 to-amber-500' },
    { label: '生活氛围', icon: Cat, percent: 15, color: 'bg-gradient-to-r from-purple-400 to-purple-500' },
  ];

  const todos = [
    { text: '拍摄2-3条内容素材', color: 'rose', checked: false },
    { text: '录制1个精品视频', color: 'pink', checked: false },
    { text: '整理好物分享素材', color: 'amber', checked: false },
    { text: '录入本周运营数据', color: 'blue', checked: false },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-0 space-y-5 md:space-y-6 pb-24 lg:pb-8">
      {/* Hero Header - Aurora Style */}
      <div className="aurora-bg rounded-2xl md:rounded-3xl p-5 md:p-8 text-white relative overflow-hidden shadow-xl">
        {/* Decorative Elements */}
        <div className="absolute right-0 top-0 opacity-20">
          <svg width="300" height="300" viewBox="0 0 200 200" className="blur-sm">
            <circle cx="100" cy="100" r="80" fill="white" fillOpacity="0.3" />
            <circle cx="150" cy="50" r="40" fill="white" fillOpacity="0.2" />
          </svg>
        </div>
        
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={20} className="text-white/80" />
            <span className="text-white/80 text-sm font-medium">小红书运营系统</span>
          </div>
          
          <h1 className="text-2xl md:text-4xl font-bold mb-2 md:mb-3 tracking-tight">
            欢迎回来，{userProfile.nickname || '岛岛'}！
          </h1>
          <p className="text-white/90 text-lg font-medium">
            内容创作 × 生活方式 × 精致分享
          </p>
          
          <div className="flex flex-wrap gap-2 mt-6">
            {[
              { icon: Shirt, label: '生活方式' },
              { icon: Palette, label: '好物分享' },
              { icon: Gift, label: '好物种草' },
              { icon: Cat, label: '6只猫' },
            ].map((tag, i) => (
              <span 
                key={i}
                className="px-4 py-2 bg-white/15 backdrop-blur-sm rounded-full text-sm font-medium border border-white/20 hover:bg-white/25 transition-colors cursor-default flex items-center gap-2"
              >
                <tag.icon size={14} />
                {tag.label}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      {/* Stats Grid - Bento Style */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {loading ? (
          <div className="col-span-4 flex justify-center py-8">
            <Loader2 size={24} className="animate-spin text-pink-500" />
          </div>
        ) : (
          [
            { label: '本周粉丝', value: weeklyData?.new_followers ? `+${weeklyData.new_followers}` : '--', icon: Users, iconBg: 'bg-pink-100', iconColor: 'text-pink-500' },
            { label: '本周点赞', value: weeklyData?.likes?.toLocaleString() || '--', icon: Heart, iconBg: 'bg-rose-100', iconColor: 'text-rose-500' },
            { label: '本周收藏', value: weeklyData?.saves?.toLocaleString() || '--', icon: Bookmark, iconBg: 'bg-amber-100', iconColor: 'text-amber-500' },
            { label: '女粉占比', value: weeklyData?.female_ratio ? `${weeklyData.female_ratio}%` : '--', icon: TrendingUp, iconBg: 'bg-emerald-100', iconColor: 'text-emerald-500', alert: weeklyData?.female_ratio && weeklyData.female_ratio < 60 },
          ].map((stat, i) => (
            <div key={i} className="bento-card group">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 ${stat.iconBg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <stat.icon size={20} className={stat.iconColor} />
                </div>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              {stat.alert && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                  低于60%警戒线
                </p>
              )}
            </div>
          ))
        )}
      </div>
      
      {/* Quick Links - Bento Grid */}
      <div>
        <h2 className="text-base md:text-lg font-bold text-gray-800 mb-3 md:mb-4 flex items-center gap-2">
          <span className="w-1 h-5 bg-gradient-to-b from-pink-500 to-purple-500 rounded-full" />
          快捷入口
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {quickLinks.map(link => (
            <Link 
              key={link.href}
              href={link.href}
              className="bento-card group relative overflow-hidden"
            >
              {/* Hover Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${link.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              
              <div className="relative">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <div className={`w-11 h-11 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-gradient-to-br ${link.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    <link.icon size={20} className="text-white md:w-6 md:h-6" />
                  </div>
                  <ArrowUpRight size={18} className="text-gray-300 group-hover:text-pink-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                </div>
                <h3 className="font-semibold md:font-bold text-gray-800 text-sm md:text-base mb-0.5 md:mb-1 group-hover:text-pink-600 transition-colors">{link.label}</h3>
                <p className="text-xs md:text-sm text-gray-500 line-clamp-1">{link.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
      
      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Content Strategy */}
        <div className="bento-card">
          <h2 className="text-base md:text-lg font-bold text-gray-800 mb-4 md:mb-5 flex items-center gap-2">
            <PieChart size={18} className="text-pink-500 md:w-5 md:h-5" />
            内容配比建议
          </h2>
          <div className="space-y-4">
            {contentTypes.map((type, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <type.icon size={16} className="text-gray-500" />
                    {type.label}
                  </span>
                  <span className="text-sm font-semibold text-gradient">{type.percent}%</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${type.color} rounded-full transition-all duration-500`} 
                    style={{ width: `${type.percent}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 flex items-center gap-1.5">
              <Sparkles size={12} className="text-pink-400" />
              内容创作是主线，猫咪偶尔出镜增加记忆点
            </p>
          </div>
        </div>
        
        {/* Weekly Todos */}
        <div className="bento-card">
          <h2 className="text-base md:text-lg font-bold text-gray-800 mb-4 md:mb-5 flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-500 md:w-5 md:h-5" />
            本周待办
          </h2>
          <div className="space-y-3">
            {todos.map((todo, i) => (
              <label 
                key={i} 
                className={`flex items-center gap-3 p-3.5 bg-${todo.color}-50/80 rounded-xl cursor-pointer group hover:bg-${todo.color}-100/80 transition-colors`}
              >
                <input 
                  type="checkbox" 
                  defaultChecked={todo.checked}
                  className={`w-5 h-5 rounded-lg border-2 border-${todo.color}-300 text-${todo.color}-500 focus:ring-${todo.color}-400 focus:ring-offset-0`} 
                />
                <span className="text-gray-700 group-hover:text-gray-900 transition-colors">{todo.text}</span>
              </label>
            ))}
          </div>
          <button className="mt-4 w-full py-2.5 text-sm text-pink-500 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition-colors font-medium flex items-center justify-center gap-1">
            <Plus size={16} />
            添加待办事项
          </button>
        </div>
      </div>
      
      {/* 6 Cats Section */}
      <div className="bento-card">
        <div className="flex items-center justify-between mb-4 md:mb-5">
          <h2 className="text-base md:text-lg font-bold text-gray-800 flex items-center gap-2">
            <Cat size={18} className="text-pink-500 md:w-5 md:h-5" />
            六只猫档案
            <span className="text-[10px] md:text-xs font-normal text-gray-400 ml-1 md:ml-2 hidden sm:inline">5公1母 · 偶尔出镜增加记忆点</span>
          </h2>
          <Link 
            href="/cats" 
            className="text-sm text-pink-500 hover:text-pink-600 flex items-center gap-1 group"
          >
            查看详情 
            <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
          {initialCats.map((cat, i) => (
            <div 
              key={cat.id} 
              className={`${cat.bgColor} rounded-xl md:rounded-2xl p-2.5 md:p-4 text-center group hover:shadow-md transition-all cursor-pointer hover:-translate-y-1`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div 
                className="w-8 h-8 md:w-10 md:h-10 mx-auto rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"
                style={{ backgroundColor: cat.color + '30' }}
              >
                <Cat size={16} className="md:w-5 md:h-5" style={{ color: cat.color }} />
              </div>
              <p className="font-bold mt-1.5 md:mt-2 text-sm md:text-base" style={{ color: cat.color }}>{cat.name}</p>
              <p className="text-[10px] md:text-xs text-gray-500 mt-0.5 line-clamp-1">{cat.gender} · {cat.appearance}</p>
              {cat.notes && (
                <p className="text-[9px] md:text-[10px] text-gray-400 mt-0.5 md:mt-1 truncate hidden md:block">{cat.notes}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
