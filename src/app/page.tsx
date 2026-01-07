'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Cat, BarChart3, Lightbulb, TrendingUp, Users, Heart, Bookmark, 
  Sparkles, ArrowUpRight, Palette, Gift, CheckCircle2, Plus,
  PieChart, Bot, Loader2, Eye
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
    { href: '/analytics', label: '数据分析', icon: BarChart3, desc: '追踪运营数据趋势' },
    { href: '/topics', label: '话题推荐', icon: Lightbulb, desc: '内容选题生成' },
    { href: '/assistant', label: 'AI助手', icon: Bot, desc: '智能运营建议' },
    { href: '/cats', label: '猫咪档案', icon: Cat, desc: '6只猫的信息管理' },
  ];

  const contentTypes = [
    { label: '生活方式', icon: Palette, percent: 40 },
    { label: '好物分享', icon: Gift, percent: 25 },
    { label: '好物种草', icon: Sparkles, percent: 20 },
    { label: '猫咪日常', icon: Cat, percent: 15 },
  ];

  const todos = [
    { text: '拍摄2-3条内容素材', checked: false },
    { text: '录制1个精品视频', checked: false },
    { text: '整理好物分享素材', checked: false },
    { text: '录入本周运营数据', checked: false },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Hero Header */}
      <div className="bg-[#4A6741] rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg">
        {/* 装饰 */}
        <div className="absolute right-0 top-0 opacity-10">
          <svg width="300" height="300" viewBox="0 0 200 200" className="blur-sm">
            <circle cx="100" cy="100" r="80" fill="white" />
            <circle cx="150" cy="50" r="40" fill="white" />
          </svg>
        </div>
        
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={18} className="text-white/80" />
            <span className="text-white/80 text-sm">小红书运营系统</span>
          </div>
          
          <h1 className="text-2xl md:text-3xl font-bold mb-2 tracking-tight">
            欢迎回来，{userProfile.nickname || '岛岛'}！
          </h1>
          <p className="text-white/70 text-base">
            内容创作 × 生活方式 × 精致分享
          </p>
          
          <div className="flex flex-wrap gap-2 mt-6">
            {[
              { icon: Palette, label: '生活方式' },
              { icon: Gift, label: '好物分享' },
              { icon: Sparkles, label: '好物种草' },
              { icon: Cat, label: '6只猫' },
            ].map((tag, i) => (
              <span 
                key={i}
                className="px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full text-sm border border-white/20 flex items-center gap-1.5"
              >
                <tag.icon size={14} />
                {tag.label}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-4 flex justify-center py-8">
            <Loader2 size={24} className="animate-spin text-[#7D8A80]" />
          </div>
        ) : (
          [
            { label: '总浏览量', value: weeklyData?.views?.toLocaleString() || '--', icon: Eye, primary: true },
            { label: '新增粉丝', value: weeklyData?.new_followers?.toLocaleString() || '--', icon: Users },
            { label: '互动总数', value: weeklyData?.likes ? (weeklyData.likes + (weeklyData.saves || 0) + (weeklyData.comments || 0)).toLocaleString() : '--', icon: Heart },
            { label: '女粉占比', value: weeklyData?.female_ratio ? `${weeklyData.female_ratio}%` : '--', icon: TrendingUp, alert: weeklyData?.female_ratio && weeklyData.female_ratio < 60 },
          ].map((stat, i) => (
            <div key={i} className={`p-5 rounded-xl transition-all border ${
              stat.primary 
                ? 'bg-[#4A6741] text-white border-transparent shadow-lg' 
                : 'bg-white border-[#E2E8D5] hover:shadow-md'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  stat.primary ? 'bg-white/20' : 'bg-[#F4F6F0]'
                }`}>
                  <stat.icon className={`w-5 h-5 ${stat.primary ? 'text-white' : 'text-[#4A6741]'}`} />
                </div>
              </div>
              <p className={`text-xs font-medium mb-1 ${stat.primary ? 'text-white/70' : 'text-[#7D8A80]'}`}>
                {stat.label}
              </p>
              <p className={`text-2xl font-bold ${stat.primary ? 'text-white' : 'text-[#2D3A30]'}`}>
                {stat.value}
              </p>
              {stat.alert && (
                <p className="text-xs text-[#C75050] mt-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-[#C75050] rounded-full animate-pulse" />
                  低于60%警戒线
                </p>
              )}
            </div>
          ))
        )}
      </div>
      
      {/* Quick Links */}
      <div>
        <h2 className="text-base font-bold text-[#2D3A30] mb-4 flex items-center gap-2">
          <span className="w-1 h-5 bg-[#4A6741] rounded-full" />
          快捷入口
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map(link => (
            <Link 
              key={link.href}
              href={link.href}
              className="bg-white rounded-xl p-5 border border-[#E2E8D5] hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#4A6741] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <link.icon size={20} className="text-white" />
                </div>
                <ArrowUpRight size={18} className="text-[#9CA89F] group-hover:text-[#4A6741] transition-colors" />
              </div>
              <h3 className="font-semibold text-[#2D3A30] text-sm mb-1">{link.label}</h3>
              <p className="text-xs text-[#7D8A80]">{link.desc}</p>
            </Link>
          ))}
        </div>
      </div>
      
      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content Strategy */}
        <div className="bg-white rounded-xl p-6 border border-[#E2E8D5]">
          <h2 className="text-base font-bold text-[#2D3A30] mb-5 flex items-center gap-2">
            <PieChart size={18} className="text-[#4A6741]" />
            内容配比建议
          </h2>
          <div className="space-y-4">
            {contentTypes.map((type, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-[#2D3A30] flex items-center gap-2">
                    <type.icon size={14} className="text-[#7D8A80]" />
                    {type.label}
                  </span>
                  <span className="text-sm font-semibold text-[#2D3A30]">{type.percent}%</span>
                </div>
                <div className="h-2.5 bg-[#F4F6F0] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#4A6741] rounded-full transition-all duration-500" 
                    style={{ width: `${type.percent}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-[#E2E8D5]">
            <p className="text-xs text-[#7D8A80] flex items-center gap-1.5">
              <Sparkles size={12} className="text-[#4A6741]" />
              内容创作是主线，猫咪偶尔出镜增加记忆点
            </p>
          </div>
        </div>
        
        {/* Weekly Todos */}
        <div className="bg-white rounded-xl p-6 border border-[#E2E8D5]">
          <h2 className="text-base font-bold text-[#2D3A30] mb-5 flex items-center gap-2">
            <CheckCircle2 size={18} className="text-[#4A6741]" />
            本周待办
          </h2>
          <div className="space-y-3">
            {todos.map((todo, i) => (
              <label 
                key={i} 
                className="flex items-center gap-3 p-3.5 bg-[#F4F6F0] rounded-xl cursor-pointer group hover:bg-[#E2E8D5]/50 transition-colors"
              >
                <input 
                  type="checkbox" 
                  defaultChecked={todo.checked}
                  className="w-5 h-5 rounded-lg border-2 border-[#E2E8D5] text-[#4A6741] focus:ring-[#4A6741] focus:ring-offset-0" 
                />
                <span className="text-[#2D3A30] group-hover:text-[#2D3A30] transition-colors">{todo.text}</span>
              </label>
            ))}
          </div>
          <button className="mt-4 w-full py-2.5 text-sm text-[#7D8A80] hover:text-[#4A6741] hover:bg-[#F4F6F0] rounded-xl transition-colors font-medium flex items-center justify-center gap-1">
            <Plus size={16} />
            添加待办事项
          </button>
        </div>
      </div>
      
      {/* 6 Cats Section */}
      <div className="bg-white rounded-xl p-6 border border-[#E2E8D5]">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-[#2D3A30] flex items-center gap-2">
            <Cat size={18} className="text-[#4A6741]" />
            六只猫档案
            <span className="text-xs font-normal text-[#7D8A80] ml-2 hidden sm:inline">5公1母 · 偶尔出镜增加记忆点</span>
          </h2>
          <Link 
            href="/cats" 
            className="text-sm text-[#7D8A80] hover:text-[#4A6741] flex items-center gap-1 group"
          >
            查看详情 
            <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {initialCats.map((cat, i) => (
            <div 
              key={cat.id} 
              className="bg-[#F4F6F0] rounded-xl p-3 text-center group hover:shadow-md transition-all cursor-pointer hover:-translate-y-1"
            >
              <div className="w-10 h-10 mx-auto rounded-full flex items-center justify-center bg-white group-hover:scale-110 transition-transform">
                <Cat size={18} className="text-[#4A6741]" />
              </div>
              <p className="font-bold mt-2 text-sm text-[#2D3A30]">{cat.name}</p>
              <p className="text-[10px] text-[#7D8A80] mt-0.5">{cat.gender} · {cat.appearance}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
