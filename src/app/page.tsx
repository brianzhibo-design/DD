'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Cat, BarChart3, Lightbulb, TrendingUp, Users, 
  Sparkles, ArrowUpRight, ArrowDownRight, Eye, CheckCircle2, Plus,
  PieChart, Bot, Loader2, MessageCircle, Minus
} from 'lucide-react';
import { getWeeklyStats } from '@/lib/db';
import { WeeklyStat } from '@/lib/supabase';
import { initialCats } from '@/data/cats';
import { getUserProfile, UserProfile, loadUserProfile } from '@/lib/user-profile';

// 计算增长率
function calcGrowth(current?: number, previous?: number): { value: string; isUp: boolean | null } {
  if (!current || !previous || previous === 0) {
    return { value: '', isUp: null };
  }
  const growth = ((current - previous) / previous) * 100;
  const formatted = growth > 0 ? `+${growth.toFixed(1)}%` : `${growth.toFixed(1)}%`;
  return { value: formatted, isUp: growth > 0 };
}

export default function Home() {
  const [currentWeek, setCurrentWeek] = useState<WeeklyStat | null>(null);
  const [previousWeek, setPreviousWeek] = useState<WeeklyStat | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile>({});
  const [greeting, setGreeting] = useState('你好');
  const [currentDate, setCurrentDate] = useState('');
  
  useEffect(() => {
    loadData();
    setUserProfile(getUserProfile());
    loadUserProfile().then(setUserProfile);
    
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('早上好');
    else if (hour < 18) setGreeting('下午好');
    else setGreeting('晚上好');
    
    setCurrentDate(new Date().toLocaleDateString('zh-CN', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    }));
  }, []);

  const loadData = async () => {
    try {
      // 获取最近两周的数据用于计算环比
      const stats = await getWeeklyStats();
      if (stats.length > 0) {
        setCurrentWeek(stats[0]);
        if (stats.length > 1) {
          setPreviousWeek(stats[1]);
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
    setLoading(false);
  };

  // 计算各项数据的环比
  const viewsGrowth = calcGrowth(currentWeek?.views, previousWeek?.views);
  const followersGrowth = calcGrowth(currentWeek?.new_followers, previousWeek?.new_followers);
  
  const currentInteraction = currentWeek ? (currentWeek.likes || 0) + (currentWeek.saves || 0) + (currentWeek.comments || 0) : 0;
  const previousInteraction = previousWeek ? (previousWeek.likes || 0) + (previousWeek.saves || 0) + (previousWeek.comments || 0) : 0;
  const interactionGrowth = calcGrowth(currentInteraction, previousInteraction);
  
  const femaleRatioGrowth = calcGrowth(currentWeek?.female_ratio, previousWeek?.female_ratio);

  // 判断数据表现
  const getStatusMessage = () => {
    if (!currentWeek) return '暂无数据，请先录入运营数据';
    
    const hasGrowth = viewsGrowth.isUp || followersGrowth.isUp || interactionGrowth.isUp;
    if (hasGrowth) return '本周数据表现良好，继续保持！';
    return '数据略有波动，建议调整内容策略';
  };

  const quickLinks = [
    { href: '/analytics', label: '数据分析', icon: BarChart3, desc: '追踪运营数据趋势' },
    { href: '/topics', label: '话题推荐', icon: Lightbulb, desc: 'AI内容选题生成' },
    { href: '/assistant', label: 'AI助手', icon: Bot, desc: '智能运营建议' },
    { href: '/cats', label: '猫咪档案', icon: Cat, desc: '6只猫的信息管理' },
  ];

  const contentTypes = [
    { label: '生活方式', percent: 40, color: 'bg-[#2D4B3E]' },
    { label: '好物分享', percent: 25, color: 'bg-[#426B5A]' },
    { label: '好物种草', percent: 20, color: 'bg-[#C5A267]' },
    { label: '猫咪日常', percent: 15, color: 'bg-[#6B7A74]' },
  ];

  const todos = [
    { text: '拍摄2-3条内容素材', checked: false },
    { text: '录制1个精品视频', checked: false },
    { text: '整理好物分享素材', checked: false },
    { text: '录入本周运营数据', checked: false },
  ];

  // 构建统计卡片数据
  const statsData = [
    { 
      label: '总浏览量', 
      value: currentWeek?.views?.toLocaleString() || '--', 
      growth: viewsGrowth,
      icon: Eye, 
      isPrimary: true 
    },
    { 
      label: '新增粉丝', 
      value: currentWeek?.new_followers?.toLocaleString() || '--', 
      growth: followersGrowth,
      icon: Users 
    },
    { 
      label: '互动总数', 
      value: currentInteraction > 0 ? currentInteraction.toLocaleString() : '--', 
      growth: interactionGrowth,
      icon: MessageCircle 
    },
    { 
      label: '女粉占比', 
      value: currentWeek?.female_ratio ? `${currentWeek.female_ratio}%` : '--', 
      growth: femaleRatioGrowth,
      icon: TrendingUp
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-8">
      {/* Hero Header */}
      <div className="bg-[#2D4B3E] text-white rounded-[2rem] p-8 relative overflow-hidden shadow-xl shadow-[#2D4B3E]/20">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3 opacity-80">
            <Sparkles size={18} className="text-[#C5A267]" />
            <span className="text-sm font-medium">小红书运营系统</span>
          </div>
          
          <h1 className="text-3xl font-bold mb-2 tracking-tight font-serif">
            {greeting}，{userProfile.nickname || '岛主'}
          </h1>
          <p className="text-white/70 text-sm">
            {getStatusMessage()}
          </p>
        </div>
        
        {currentDate && (
          <div className="absolute top-8 right-8 text-xs text-white/50 font-mono hidden md:block">
            {currentDate}
          </div>
        )}
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {loading ? (
          <div className="col-span-4 flex justify-center py-8">
            <Loader2 size={24} className="animate-spin text-[#6B7A74]" />
          </div>
        ) : (
          statsData.map((stat, i) => (
            <div 
              key={i} 
              className={`rounded-[2rem] p-6 group hover:translate-y-[-4px] transition-all cursor-default ${
                stat.isPrimary 
                  ? 'bg-[#2D4B3E] text-white shadow-lg shadow-[#2D4B3E]/20' 
                  : 'bg-white border border-[#2D4B3E]/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  stat.isPrimary ? 'bg-white/20' : 'bg-[#F4F6F0]'
                }`}>
                  <stat.icon className={`w-5 h-5 ${stat.isPrimary ? 'text-white' : 'text-[#2D4B3E]'}`} />
                </div>
                {stat.growth.value && (
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-0.5 ${
                    stat.isPrimary 
                      ? 'bg-white/20 text-white' 
                      : stat.growth.isUp 
                        ? 'bg-emerald-50 text-emerald-600'
                        : stat.growth.isUp === false 
                          ? 'bg-red-50 text-red-500'
                          : 'bg-gray-50 text-gray-500'
                  }`}>
                    {stat.growth.isUp === true && <ArrowUpRight className="w-3 h-3" />}
                    {stat.growth.isUp === false && <ArrowDownRight className="w-3 h-3" />}
                    {stat.growth.isUp === null && <Minus className="w-3 h-3" />}
                    {stat.growth.value}
                  </span>
                )}
              </div>
              <p className={`text-[11px] font-bold mb-1 uppercase tracking-widest ${stat.isPrimary ? 'text-white/70' : 'text-[#6B7A74]'}`}>
                {stat.label}
              </p>
              <p className={`text-2xl font-black font-serif ${stat.isPrimary ? 'text-white' : 'text-[#2D4B3E]'}`}>
                {stat.value}
              </p>
            </div>
          ))
        )}
      </div>
      
      {/* Quick Links */}
      <div>
        <h2 className="text-lg font-bold font-serif text-[#2D4B3E] mb-4 flex items-center gap-2">
          <span className="w-1 h-5 bg-[#2D4B3E] rounded-full" />
          快捷入口
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map(link => (
            <Link 
              key={link.href}
              href={link.href}
              className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#2D4B3E]/5 hover:shadow-md transition-shadow group relative overflow-hidden hover:translate-y-[-4px]"
            >
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#2D4B3E] flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <link.icon size={20} className="text-white" />
                  </div>
                  <ArrowUpRight size={18} className="text-[#6B7A74] group-hover:text-[#2D4B3E] group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                </div>
                <h3 className="font-bold text-[#2D4B3E] text-base mb-1 group-hover:text-[#426B5A] transition-colors font-serif">{link.label}</h3>
                <p className="text-xs text-[#6B7A74] line-clamp-1">{link.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
      
      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content Strategy */}
        <div className="bg-white border border-[#2D4B3E]/5 rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <h2 className="text-lg font-bold font-serif text-[#2D4B3E] mb-5 flex items-center gap-2">
            <PieChart size={18} className="text-[#2D4B3E]" />
            内容配比建议
          </h2>
          <div className="space-y-4">
            {contentTypes.map((type, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-[#2D4B3E]">{type.label}</span>
                  <span className="text-sm font-bold text-[#2D4B3E]">{type.percent}%</span>
                </div>
                <div className="h-2.5 bg-[#F4F6F0] rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${type.color} rounded-full transition-all duration-500`} 
                    style={{ width: `${type.percent}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-[#2D4B3E]/5">
            <p className="text-xs text-[#6B7A74] flex items-center gap-1.5">
              <Sparkles size={12} className="text-[#C5A267]" />
              内容创作是主线，猫咪偶尔出镜增加记忆点
            </p>
          </div>
        </div>
        
        {/* Weekly Todos */}
        <div className="bg-white border border-[#2D4B3E]/5 rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <h2 className="text-lg font-bold font-serif text-[#2D4B3E] mb-5 flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-600" />
            本周待办
          </h2>
          <div className="space-y-3">
            {todos.map((todo, i) => (
              <label 
                key={i} 
                className="flex items-center gap-3 p-3.5 bg-[#FDFBF7] rounded-xl cursor-pointer group hover:bg-[#F4F6F0] transition-colors border border-[#2D4B3E]/5"
              >
                <input 
                  type="checkbox" 
                  defaultChecked={todo.checked}
                  className="w-5 h-5 rounded-lg border-2 border-[#2D4B3E]/20 text-[#2D4B3E] focus:ring-[#2D4B3E] focus:ring-offset-0" 
                />
                <span className="text-[#2D4B3E] group-hover:text-[#426B5A] transition-colors text-sm">{todo.text}</span>
              </label>
            ))}
          </div>
          <button className="mt-4 w-full py-2.5 text-sm text-[#6B7A74] hover:text-[#2D4B3E] hover:bg-[#F4F6F0] rounded-xl transition-all flex items-center justify-center gap-2">
            <Plus size={16} />
            添加待办事项
          </button>
        </div>
      </div>
      
      {/* 6 Cats Section */}
      <div className="bg-white border border-[#2D4B3E]/5 rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold font-serif text-[#2D4B3E] flex items-center gap-2">
            <Cat size={18} className="text-[#2D4B3E]" />
            六只猫档案
            <span className="text-[10px] font-normal text-[#6B7A74] ml-2 hidden sm:inline">5公1母 · 偶尔出镜增加记忆点</span>
          </h2>
          <Link 
            href="/cats" 
            className="text-sm text-[#2D4B3E] hover:text-[#426B5A] flex items-center gap-1 group font-medium"
          >
            查看详情 
            <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {initialCats.map((cat) => (
            <div 
              key={cat.id} 
              className="bg-[#FDFBF7] rounded-xl p-4 text-center group hover:shadow-md transition-all cursor-pointer hover:-translate-y-1 border border-[#2D4B3E]/5"
            >
              <div className="w-10 h-10 mx-auto rounded-full flex items-center justify-center group-hover:scale-110 transition-transform bg-white border border-[#2D4B3E]/5">
                <Cat size={16} className="text-[#2D4B3E]" />
              </div>
              <p className="font-bold mt-2 text-sm text-[#2D4B3E]">{cat.name}</p>
              <p className="text-[10px] text-[#6B7A74] mt-0.5 line-clamp-1">{cat.gender} · {cat.appearance}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
