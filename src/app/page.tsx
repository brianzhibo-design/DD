'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Cat, BarChart3, Lightbulb, TrendingUp, Users, Heart, Bookmark, 
  Sparkles, ArrowUpRight, Eye, PieChart, Bot, Loader2, Plus
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
    { href: '/topics', label: '话题推荐', icon: Lightbulb, desc: 'AI内容选题生成' },
    { href: '/assistant', label: 'AI助手', icon: Bot, desc: '智能运营建议' },
    { href: '/cats', label: '猫咪档案', icon: Cat, desc: '6只猫的信息管理' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-8">
      {/* Hero Header - 黑底白字 */}
      <div className="bg-black rounded-2xl p-6 md:p-8 text-white relative overflow-hidden">
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={18} className="text-white" />
            <span className="text-white text-sm font-medium">小红书运营系统</span>
          </div>
          
          <h1 className="text-2xl md:text-3xl font-bold mb-2 tracking-tight text-white">
            下午好，{userProfile.nickname || '岛主'}
          </h1>
          <p className="text-white text-sm md:text-base">
            今天的数据表现平稳，保持专注
          </p>
        </div>
        
        {/* 日期 */}
        <div className="absolute top-6 right-6 text-xs text-white font-mono hidden md:block">
          {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-4 flex justify-center py-8">
            <Loader2 size={24} className="animate-spin text-slate-400" />
          </div>
        ) : (
          [
            { 
              label: '总浏览量', 
              value: weeklyData?.views?.toLocaleString() || '--', 
              trend: '+12.5%',
              icon: Eye, 
              dark: true 
            },
            { 
              label: '新增粉丝', 
              value: weeklyData?.new_followers?.toLocaleString() || '--', 
              trend: '+8.2%',
              icon: Users 
            },
            { 
              label: '互动总数', 
              value: weeklyData?.likes ? (weeklyData.likes + (weeklyData.saves || 0) + (weeklyData.comments || 0)).toLocaleString() : '--', 
              trend: '+24.3%',
              icon: Heart 
            },
            { 
              label: '女粉占比', 
              value: weeklyData?.female_ratio ? `${weeklyData.female_ratio}%` : '--', 
              trend: weeklyData?.female_ratio && weeklyData.female_ratio < 60 ? '-2.1%' : '+1.5%',
              icon: TrendingUp,
              trendDown: weeklyData?.female_ratio && weeklyData.female_ratio < 60
            },
          ].map((stat, i) => (
            <div 
              key={i} 
              className={`p-5 rounded-xl transition-all ${
                stat.dark 
                  ? 'bg-black text-white' 
                  : 'bg-white border border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  stat.dark ? 'bg-white' : 'bg-slate-100'
                }`}>
                  <stat.icon className={`w-5 h-5 ${stat.dark ? 'text-black' : 'text-black'}`} />
                </div>
                {stat.trend && (
                  <span className={`text-xs font-medium flex items-center gap-1 px-2 py-1 rounded-md ${
                    stat.trendDown 
                      ? 'text-red-600 bg-red-100' 
                      : 'text-emerald-600 bg-emerald-100'
                  }`}>
                    <TrendingUp className={`w-3 h-3 ${stat.trendDown ? 'rotate-180' : ''}`} />
                    {stat.trend}
                  </span>
                )}
              </div>
              <p className={`text-xs font-medium mb-1 ${stat.dark ? 'text-white' : 'text-black'}`}>
                {stat.label}
              </p>
              <p className={`text-2xl font-bold ${stat.dark ? 'text-white' : 'text-black'}`}>
                {stat.value}
              </p>
            </div>
          ))
        )}
      </div>
      
      {/* Quick Links Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Quick Links */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-slate-100">
          <h2 className="font-bold text-slate-800 mb-5">快捷入口</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickLinks.map(link => (
              <Link 
                key={link.href}
                href={link.href}
                className="flex gap-4 p-4 rounded-lg border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center group-hover:bg-slate-900 transition-colors flex-shrink-0">
                  <link.icon className="w-5 h-5 text-slate-600 group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-slate-800 text-sm group-hover:text-slate-900">{link.label}</h3>
                  <p className="text-xs text-slate-400 truncate">{link.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
        
        {/* 内容配比 */}
        <div className="bg-white rounded-xl p-6 border border-slate-100">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-slate-800">内容配比</h2>
            <PieChart size={18} className="text-slate-400" />
          </div>
          <div className="space-y-4">
            {[
              { label: '生活方式', percent: 40 },
              { label: '好物分享', percent: 25 },
              { label: '好物种草', percent: 20 },
              { label: '猫咪日常', percent: 15 },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-slate-600">{item.label}</span>
                  <span className="text-sm font-medium text-slate-800">{item.percent}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-slate-800 rounded-full transition-all"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Cats Section */}
      <div className="bg-white rounded-xl p-6 border border-slate-100">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <Cat size={18} className="text-slate-600" />
            六只猫档案
          </h2>
          <Link 
            href="/cats" 
            className="text-sm text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors"
          >
            查看详情 
            <ArrowUpRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {initialCats.map((cat) => (
            <div 
              key={cat.id} 
              className="bg-slate-50 hover:bg-slate-100 rounded-xl p-4 text-center transition-all cursor-pointer hover:-translate-y-1 hover:shadow-md"
            >
              <div className="w-10 h-10 mx-auto rounded-full bg-white flex items-center justify-center shadow-sm">
                <Cat size={18} className="text-slate-600" />
              </div>
              <p className="font-semibold text-slate-800 mt-2 text-sm">{cat.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">{cat.gender}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
