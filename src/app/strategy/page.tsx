'use client';

import { useState } from 'react';
import { 
  Target, TrendingUp, Calendar, AlertTriangle, CheckCircle2, 
  ChevronRight, Users, Coins, FileText, Clock, Zap, Shield,
  BarChart3, Sparkles, Package, Star, ArrowRight, Check,
  Circle, CircleDot, Milestone, Flag, Lightbulb, Eye, Heart,
  Bookmark, MessageCircle, Video, Image, BookOpen, Palette,
  Award, Rocket, Building2, UserPlus, DollarSign, Percent
} from 'lucide-react';

// 账号诊断数据
const accountDiagnosis = {
  fans: 43161,
  likes: 368938,
  collected: 35545,
  notes: 56,
  fanLikeRatio: '1:8.6',
  collectRate: '13.8%',
  publishRate: '3.7篇/月'
};

// 三大赛道
const tracks = [
  {
    id: 'emotion',
    name: '情绪赛道',
    icon: Heart,
    percent: 35,
    color: 'rose',
    bgColor: 'bg-rose-50',
    textColor: 'text-rose-600',
    borderColor: 'border-rose-200',
    purpose: '引流涨粉',
    contents: ['氛围感短视频', '情绪文案', '治愈内容', '头像/壁纸向'],
    monetization: '流量变现'
  },
  {
    id: 'beauty',
    name: '颜值赛道',
    icon: Palette,
    percent: 40,
    color: 'amber',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-600',
    borderColor: 'border-amber-200',
    purpose: '商业变现',
    contents: ['美妆教程', '穿搭分享', '好物种草', '变美攻略'],
    monetization: '商单+橱窗'
  },
  {
    id: 'growth',
    name: '成长赛道',
    icon: BookOpen,
    percent: 25,
    color: 'emerald',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-600',
    borderColor: 'border-emerald-200',
    purpose: '粉丝沉淀',
    contents: ['女性成长', '自律生活', '认知提升', '幕后花絮'],
    monetization: '知识付费'
  }
];

// 阶段规划
const phases = [
  {
    id: 'short',
    name: '短期战略',
    duration: '0-3个月',
    status: 'current',
    color: 'bg-[#2D4B3E]',
    targets: [
      { label: '粉丝目标', current: '4.3万', target: '6万', icon: Users },
      { label: '月发布量', current: '3.7篇', target: '12篇', icon: FileText },
      { label: '篇均点赞', current: '1010', target: '1500', icon: Heart },
      { label: '月收入', current: '0', target: '3000元', icon: Coins },
    ],
    keyActions: [
      '开通蒲公英平台认证',
      '开通商品橱窗',
      '建立"三驾马车"内容体系',
      '每周发布3篇以上笔记',
      '打造首篇5000+赞爆款'
    ],
    weeklyPlan: [
      { day: '周一', type: '情绪', content: '氛围感短视频', time: '12:00' },
      { day: '周三', type: '颜值', content: '美妆/穿搭教程', time: '19:00' },
      { day: '周五', type: '颜值', content: '好物种草/合集', time: '20:00' },
      { day: '周日', type: '成长', content: 'vlog/互动', time: '11:00' },
    ]
  },
  {
    id: 'mid',
    name: '中期战略',
    duration: '3-8个月',
    status: 'upcoming',
    color: 'bg-[#C5A267]',
    targets: [
      { label: '粉丝目标', current: '6万', target: '15万', icon: Users },
      { label: '月发布量', current: '12篇', target: '16篇', icon: FileText },
      { label: '篇均点赞', current: '1500', target: '3000', icon: Heart },
      { label: '月收入', current: '3000', target: '2万', icon: Coins },
    ],
    keyActions: [
      '打造4大标志性栏目',
      '开启多平台分发（抖音/B站）',
      '建立稳定商单来源',
      '开启直播带货',
      '组建团队雏形'
    ],
    incomeBreakdown: [
      { source: '品牌商单', amount: 12000, percent: 60 },
      { source: '橱窗佣金', amount: 5000, percent: 25 },
      { source: '其他收入', amount: 3000, percent: 15 },
    ]
  },
  {
    id: 'long',
    name: '长期战略',
    duration: '8-18个月',
    status: 'upcoming',
    color: 'bg-slate-600',
    targets: [
      { label: '粉丝目标', current: '15万', target: '50万', icon: Users },
      { label: '月发布量', current: '16篇', target: '20篇', icon: FileText },
      { label: '月收入', current: '2万', target: '10万+', icon: Coins },
      { label: '团队规模', current: '1人', target: '3-5人', icon: Building2 },
    ],
    keyActions: [
      '达成头部博主地位',
      '孵化子账号矩阵',
      '建立自有品牌/联名',
      '知识付费产品上线',
      '工作室化运营'
    ],
    incomeBreakdown: [
      { source: '品牌商单', amount: 50000, percent: 50 },
      { source: '直播带货', amount: 20000, percent: 20 },
      { source: '橱窗佣金', amount: 15000, percent: 15 },
      { source: '知识付费', amount: 10000, percent: 10 },
      { source: '其他', amount: 5000, percent: 5 },
    ]
  }
];

// 标志性栏目
const columns = [
  { name: '御姐变美记', type: '美妆穿搭教程', frequency: '周更', potential: 5, icon: Palette },
  { name: '岛岛碎碎念', type: '情绪文案内容', frequency: '周更', potential: 3, icon: Heart },
  { name: '好物不踩雷', type: '真实测评种草', frequency: '双周更', potential: 5, icon: Package },
  { name: '成长日记', type: 'vlog认知分享', frequency: '月更', potential: 4, icon: BookOpen },
];

// 风险预案
const risks = [
  { 
    name: '内容限流', 
    probability: '中', 
    impact: '高', 
    solution: '多账号矩阵分散风险' 
  },
  { 
    name: '粉丝增长停滞', 
    probability: '中', 
    impact: '中', 
    solution: '调整内容方向，互推合作' 
  },
  { 
    name: '商单断档', 
    probability: '低', 
    impact: '中', 
    solution: '橱窗佣金保底收入' 
  },
  { 
    name: '负面舆情', 
    probability: '低', 
    impact: '高', 
    solution: '及时回应，真诚沟通' 
  },
  { 
    name: '平台政策变化', 
    probability: '低', 
    impact: '高', 
    solution: '多平台布局，分散风险' 
  },
];

// KPI监控
const kpis = [
  { name: '周发布量', target: '≥3篇', warning: '<2篇', frequency: '每周' },
  { name: '单篇点赞', target: '≥800', warning: '<300', frequency: '每篇' },
  { name: '收藏率', target: '≥12%', warning: '<8%', frequency: '每篇' },
  { name: '粉丝周增长', target: '≥800', warning: '<200', frequency: '每周' },
];

// 立即行动清单
const immediateActions = [
  { task: '注册蒲公英平台', priority: 'high' },
  { task: '开通商品橱窗', priority: 'high' },
  { task: '制定下月12篇内容选题', priority: 'high' },
  { task: '拍摄2条美妆教程素材', priority: 'medium' },
  { task: '整理20套穿搭素材照片', priority: 'medium' },
];

export default function StrategyPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'tracks' | 'phases' | 'risks' | 'execution'>('overview');
  const [expandedPhase, setExpandedPhase] = useState<string>('short');

  const tabs = [
    { id: 'overview', label: '战略总览', icon: Target },
    { id: 'tracks', label: '三大赛道', icon: Rocket },
    { id: 'phases', label: '阶段规划', icon: Milestone },
    { id: 'risks', label: '风险预案', icon: Shield },
    { id: 'execution', label: '执行清单', icon: CheckCircle2 },
  ];

  return (
    <div className="max-w-6xl mx-auto pb-20">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#2D4B3E] flex items-center justify-center">
            <Target size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1A2421] font-serif">全域发展战略规划</h1>
            <p className="text-xs text-[#6B7A74]">基于真实数据 · 短中长期发展方案</p>
          </div>
        </div>
      </div>

      {/* Core Positioning Banner */}
      <div className="bg-gradient-to-br from-[#2D4B3E] to-[#1A2421] rounded-[2rem] p-6 mb-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={18} className="text-[#C5A267]" />
            <span className="text-xs text-white/60 font-bold uppercase tracking-wider">IP宇宙</span>
          </div>
          <h2 className="text-2xl font-bold mb-2 font-serif">小离岛岛</h2>
          <p className="text-white/70 text-sm mb-4">"每个女生都值得成为主角"</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              <p className="text-2xl font-bold">{(accountDiagnosis.fans / 10000).toFixed(1)}万</p>
              <p className="text-xs text-white/60">粉丝数</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              <p className="text-2xl font-bold">{accountDiagnosis.fanLikeRatio}</p>
              <p className="text-xs text-white/60">粉赞比 (极优秀)</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              <p className="text-2xl font-bold">{accountDiagnosis.collectRate}</p>
              <p className="text-xs text-white/60">收藏率 (Top 10%)</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              <p className="text-2xl font-bold">{accountDiagnosis.notes}篇</p>
              <p className="text-xs text-white/60">笔记数</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-medium whitespace-nowrap transition-all text-sm ${
              activeTab === tab.id
                ? 'bg-[#2D4B3E] text-white shadow-lg shadow-[#2D4B3E]/20'
                : 'bg-white text-[#6B7A74] hover:bg-[#F4F6F0] border border-[#2D4B3E]/10'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          {/* 三阶段概览 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {phases.map((phase, i) => (
              <div 
                key={phase.id}
                className={`rounded-[2rem] p-5 text-white relative overflow-hidden ${phase.color}`}
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="relative">
                  <p className="text-xs text-white/60 font-bold uppercase tracking-wider mb-1">{phase.duration}</p>
                  <h3 className="text-lg font-bold mb-3">{phase.name}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-white/60">粉丝</span>
                      <span className="font-bold">{phase.targets[0].target}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-white/60">月收入</span>
                      <span className="font-bold">{phase.targets[3].target}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 四大栏目 */}
          <div className="bg-white rounded-[2rem] p-5 border border-[#2D4B3E]/5">
            <h3 className="font-bold text-[#1A2421] mb-4 flex items-center gap-2 font-serif">
              <Award size={18} className="text-[#C5A267]" />
              四大标志性栏目
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {columns.map((col, i) => (
                <div key={i} className="p-4 bg-[#FDFBF7] rounded-xl border border-[#2D4B3E]/5">
                  <col.icon size={20} className="text-[#2D4B3E] mb-2" />
                  <h4 className="font-bold text-[#1A2421] text-sm">【{col.name}】</h4>
                  <p className="text-xs text-[#6B7A74] mt-1">{col.type}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-[#9BA8A3]">{col.frequency}</span>
                    <div className="flex gap-0.5">
                      {[...Array(col.potential)].map((_, j) => (
                        <Star key={j} size={10} className="text-[#C5A267] fill-[#C5A267]" />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 收入结构演进 */}
          <div className="bg-white rounded-[2rem] p-5 border border-[#2D4B3E]/5">
            <h3 className="font-bold text-[#1A2421] mb-4 flex items-center gap-2 font-serif">
              <DollarSign size={18} className="text-[#2D4B3E]" />
              收入结构演进
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-[#F4F6F0] rounded-xl">
                <p className="text-xs text-[#6B7A74] mb-1">短期（3个月）</p>
                <p className="text-2xl font-bold text-[#1A2421]">3,000<span className="text-sm font-normal text-[#6B7A74]">元/月</span></p>
                <div className="mt-3 space-y-1 text-xs text-[#6B7A74]">
                  <p>商单 1,500 · 橱窗 500 · 其他 1,000</p>
                </div>
              </div>
              <div className="p-4 bg-[#2D4B3E]/5 rounded-xl border border-[#2D4B3E]/10">
                <p className="text-xs text-[#2D4B3E] mb-1">中期（8个月）</p>
                <p className="text-2xl font-bold text-[#1A2421]">20,000<span className="text-sm font-normal text-[#6B7A74]">元/月</span></p>
                <div className="mt-3 space-y-1 text-xs text-[#6B7A74]">
                  <p>商单 12,000 · 橱窗 5,000 · 其他 3,000</p>
                </div>
              </div>
              <div className="p-4 bg-[#C5A267]/10 rounded-xl border border-[#C5A267]/20">
                <p className="text-xs text-[#C5A267] mb-1">长期（18个月）</p>
                <p className="text-2xl font-bold text-[#1A2421]">100,000+<span className="text-sm font-normal text-[#6B7A74]">元/月</span></p>
                <div className="mt-3 space-y-1 text-xs text-[#6B7A74]">
                  <p>商单 · 直播 · 橱窗 · 知识付费</p>
                </div>
              </div>
            </div>
          </div>

          {/* KPI监控 */}
          <div className="bg-white rounded-[2rem] p-5 border border-[#2D4B3E]/5">
            <h3 className="font-bold text-[#1A2421] mb-4 flex items-center gap-2 font-serif">
              <Eye size={18} className="text-[#2D4B3E]" />
              核心KPI监控
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {kpis.map((kpi, i) => (
                <div key={i} className="p-4 bg-[#FDFBF7] rounded-xl">
                  <p className="text-sm font-medium text-[#1A2421]">{kpi.name}</p>
                  <p className="text-lg font-bold text-[#2D4B3E] mt-1">{kpi.target}</p>
                  <p className="text-xs text-rose-500 mt-1">预警: {kpi.warning}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tracks' && (
        <div className="space-y-5">
          {/* 三大赛道详情 */}
          {tracks.map((track) => (
            <div 
              key={track.id}
              className={`rounded-[2rem] p-5 ${track.bgColor} border ${track.borderColor}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl ${track.bgColor} flex items-center justify-center`}>
                    <track.icon size={24} className={track.textColor} />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1A2421] text-lg">{track.name}</h3>
                    <p className="text-sm text-[#6B7A74]">{track.purpose}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-3xl font-bold ${track.textColor}`}>{track.percent}%</p>
                  <p className="text-xs text-[#6B7A74]">内容占比</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                {track.contents.map((content, i) => (
                  <div key={i} className="bg-white/80 rounded-lg p-3 text-center">
                    <p className="text-sm font-medium text-[#1A2421]">{content}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/50">
                <span className="text-sm text-[#6B7A74]">变现方式</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${track.bgColor} ${track.textColor}`}>
                  {track.monetization}
                </span>
              </div>
            </div>
          ))}

          {/* 内容占比图 */}
          <div className="bg-white rounded-[2rem] p-5 border border-[#2D4B3E]/5">
            <h3 className="font-bold text-[#1A2421] mb-4 font-serif">内容配比策略</h3>
            <div className="space-y-3">
              {tracks.map((track) => (
                <div key={track.id}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <track.icon size={16} className={track.textColor} />
                      <span className="text-sm font-medium text-[#1A2421]">{track.name}</span>
                    </div>
                    <span className="text-sm font-bold text-[#1A2421]">{track.percent}%</span>
                  </div>
                  <div className="h-3 bg-[#F4F6F0] rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        track.id === 'emotion' ? 'bg-rose-400' :
                        track.id === 'beauty' ? 'bg-amber-400' : 'bg-emerald-400'
                      }`}
                      style={{ width: `${track.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'phases' && (
        <div className="space-y-4">
          {phases.map(phase => (
            <div 
              key={phase.id}
              className={`bg-white rounded-[2rem] border overflow-hidden ${
                phase.status === 'current' ? 'border-[#2D4B3E] ring-2 ring-[#2D4B3E]/20' : 'border-[#2D4B3E]/10'
              }`}
            >
              <button
                onClick={() => setExpandedPhase(expandedPhase === phase.id ? '' : phase.id)}
                className="w-full p-5 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${phase.color} flex items-center justify-center text-white`}>
                    {phase.status === 'current' ? <CircleDot size={24} /> : <Circle size={24} />}
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg text-[#1A2421]">{phase.name}</h3>
                      {phase.status === 'current' && (
                        <span className="px-2 py-0.5 bg-[#2D4B3E]/10 text-[#2D4B3E] text-xs font-bold rounded-full">当前</span>
                      )}
                    </div>
                    <p className="text-sm text-[#6B7A74]">{phase.duration}</p>
                  </div>
                </div>
                <ChevronRight 
                  size={20} 
                  className={`text-[#9BA8A3] transition-transform ${expandedPhase === phase.id ? 'rotate-90' : ''}`} 
                />
              </button>

              {expandedPhase === phase.id && (
                <div className="px-5 pb-5 pt-0 border-t border-[#2D4B3E]/5 space-y-5">
                  {/* 目标卡片 */}
                  <div>
                    <h4 className="font-medium text-[#1A2421] mb-3 mt-5 flex items-center gap-2">
                      <Target size={16} className="text-[#2D4B3E]" />
                      阶段目标
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {phase.targets.map((target, i) => (
                        <div key={i} className="p-3 bg-[#FDFBF7] rounded-xl">
                          <div className="flex items-center gap-2 mb-1">
                            <target.icon size={14} className="text-[#6B7A74]" />
                            <span className="text-xs text-[#6B7A74]">{target.label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-[#9BA8A3] line-through">{target.current}</span>
                            <ArrowRight size={12} className="text-[#2D4B3E]" />
                            <span className="font-bold text-[#1A2421]">{target.target}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 关键行动 */}
                  <div>
                    <h4 className="font-medium text-[#1A2421] mb-3 flex items-center gap-2">
                      <Zap size={16} className="text-[#C5A267]" />
                      关键行动
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {phase.keyActions.map((action, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-[#F4F6F0] rounded-xl">
                          <div className="w-6 h-6 rounded-full bg-[#2D4B3E]/10 flex items-center justify-center text-[#2D4B3E] text-xs font-bold">
                            {i + 1}
                          </div>
                          <span className="text-sm text-[#1A2421]">{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 周发布计划（仅短期） */}
                  {phase.weeklyPlan && (
                    <div>
                      <h4 className="font-medium text-[#1A2421] mb-3 flex items-center gap-2">
                        <Calendar size={16} className="text-[#2D4B3E]" />
                        每周发布计划
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {phase.weeklyPlan.map((plan, i) => (
                          <div key={i} className="p-3 bg-[#FDFBF7] rounded-xl text-center">
                            <p className="font-bold text-[#1A2421]">{plan.day}</p>
                            <p className="text-xs text-[#6B7A74] mt-1">{plan.type} · {plan.time}</p>
                            <p className="text-xs text-[#2D4B3E] mt-1">{plan.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 收入结构（中长期） */}
                  {phase.incomeBreakdown && (
                    <div>
                      <h4 className="font-medium text-[#1A2421] mb-3 flex items-center gap-2">
                        <Coins size={16} className="text-[#C5A267]" />
                        收入结构
                      </h4>
                      <div className="space-y-2">
                        {phase.incomeBreakdown.map((item, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="flex-1">
                              <div className="flex justify-between mb-1">
                                <span className="text-sm text-[#1A2421]">{item.source}</span>
                                <span className="text-sm font-bold text-[#1A2421]">¥{item.amount.toLocaleString()}</span>
                              </div>
                              <div className="h-2 bg-[#F4F6F0] rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-[#2D4B3E] rounded-full"
                                  style={{ width: `${item.percent}%` }}
                                />
                              </div>
                            </div>
                            <span className="text-xs text-[#6B7A74] w-10 text-right">{item.percent}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'risks' && (
        <div className="space-y-5">
          {/* 风险表格 */}
          <div className="bg-white rounded-[2rem] p-5 border border-[#2D4B3E]/5 overflow-hidden">
            <h3 className="font-bold text-[#1A2421] mb-4 flex items-center gap-2 font-serif">
              <AlertTriangle size={18} className="text-amber-500" />
              风险预案表
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#2D4B3E]/10">
                    <th className="text-left py-3 px-2 text-[#6B7A74] font-medium">风险</th>
                    <th className="text-center py-3 px-2 text-[#6B7A74] font-medium">概率</th>
                    <th className="text-center py-3 px-2 text-[#6B7A74] font-medium">影响</th>
                    <th className="text-left py-3 px-2 text-[#6B7A74] font-medium">预案</th>
                  </tr>
                </thead>
                <tbody>
                  {risks.map((risk, i) => (
                    <tr key={i} className="border-b border-[#2D4B3E]/5">
                      <td className="py-3 px-2 font-medium text-[#1A2421]">{risk.name}</td>
                      <td className="py-3 px-2 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          risk.probability === '高' ? 'bg-rose-100 text-rose-600' :
                          risk.probability === '中' ? 'bg-amber-100 text-amber-600' :
                          'bg-emerald-100 text-emerald-600'
                        }`}>
                          {risk.probability}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          risk.impact === '高' ? 'bg-rose-100 text-rose-600' :
                          risk.impact === '中' ? 'bg-amber-100 text-amber-600' :
                          'bg-emerald-100 text-emerald-600'
                        }`}>
                          {risk.impact}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-[#6B7A74]">{risk.solution}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 内容效果评估 */}
          <div className="bg-white rounded-[2rem] p-5 border border-[#2D4B3E]/5">
            <h3 className="font-bold text-[#1A2421] mb-4 flex items-center gap-2 font-serif">
              <BarChart3 size={18} className="text-[#2D4B3E]" />
              内容效果评估标准
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-4 bg-[#2D4B3E] rounded-xl text-white">
                <p className="text-xs text-white/60 mb-1">S级爆款</p>
                <p className="text-lg font-bold">&gt;5000赞</p>
                <p className="text-xs text-white/60 mt-1">收藏率 &gt;20%</p>
                <p className="text-xs text-emerald-300 mt-2">→ 复制模板，系列化</p>
              </div>
              <div className="p-4 bg-[#C5A267]/10 rounded-xl border border-[#C5A267]/20">
                <p className="text-xs text-[#C5A267] mb-1">A级优质</p>
                <p className="text-lg font-bold text-[#1A2421]">2000-5000赞</p>
                <p className="text-xs text-[#6B7A74] mt-1">收藏率 15-20%</p>
                <p className="text-xs text-[#2D4B3E] mt-2">→ 分析亮点，优化</p>
              </div>
              <div className="p-4 bg-[#F4F6F0] rounded-xl">
                <p className="text-xs text-[#6B7A74] mb-1">B级合格</p>
                <p className="text-lg font-bold text-[#1A2421]">800-2000赞</p>
                <p className="text-xs text-[#6B7A74] mt-1">收藏率 10-15%</p>
                <p className="text-xs text-[#6B7A74] mt-2">→ 正常迭代</p>
              </div>
              <div className="p-4 bg-rose-50 rounded-xl border border-rose-100">
                <p className="text-xs text-rose-500 mb-1">C级待改进</p>
                <p className="text-lg font-bold text-[#1A2421]">&lt;800赞</p>
                <p className="text-xs text-[#6B7A74] mt-1">收藏率 &lt;10%</p>
                <p className="text-xs text-rose-500 mt-2">→ 分析原因，调整</p>
              </div>
            </div>
          </div>

          {/* 核心原则 */}
          <div className="bg-[#FDFBF7] rounded-[2rem] p-5 border border-[#2D4B3E]/5">
            <h3 className="font-bold text-[#1A2421] mb-4 flex items-center gap-2 font-serif">
              <Lightbulb size={18} className="text-[#C5A267]" />
              核心原则
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-xl">
                <h4 className="font-bold text-[#1A2421] mb-2">内容原则</h4>
                <ul className="space-y-1 text-sm text-[#6B7A74]">
                  <li>• 真实 &gt; 完美</li>
                  <li>• 价值 &gt; 流量</li>
                  <li>• 长期 &gt; 短期</li>
                </ul>
              </div>
              <div className="p-4 bg-white rounded-xl">
                <h4 className="font-bold text-[#1A2421] mb-2">商业原则</h4>
                <ul className="space-y-1 text-sm text-[#6B7A74]">
                  <li>• 选品严格</li>
                  <li>• 报价合理</li>
                  <li>• 长期合作</li>
                </ul>
              </div>
              <div className="p-4 bg-white rounded-xl">
                <h4 className="font-bold text-[#1A2421] mb-2">成长原则</h4>
                <ul className="space-y-1 text-sm text-[#6B7A74]">
                  <li>• 持续学习</li>
                  <li>• 数据驱动</li>
                  <li>• 健康第一</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'execution' && (
        <div className="space-y-5">
          {/* 立即行动 */}
          <div className="bg-[#2D4B3E] rounded-[2rem] p-5 text-white">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Zap size={18} className="text-[#C5A267]" />
              立即行动（本周）
            </h3>
            <div className="space-y-2">
              {immediateActions.map((action, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-white/10 rounded-xl">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    action.priority === 'high' ? 'bg-rose-500' : 'bg-white/20'
                  }`}>
                    <Check size={14} className="text-white" />
                  </div>
                  <span className="flex-1">{action.task}</span>
                  {action.priority === 'high' && (
                    <span className="text-xs bg-rose-500/30 px-2 py-0.5 rounded-full">高优先</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 第1个月计划 */}
          <div className="bg-white rounded-[2rem] p-5 border border-[#2D4B3E]/5">
            <h3 className="font-bold text-[#1A2421] mb-4 flex items-center gap-2 font-serif">
              <Calendar size={18} className="text-[#2D4B3E]" />
              第1个月内容排期
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#2D4B3E]/10">
                    <th className="text-left py-3 px-2 text-[#6B7A74] font-medium">周次</th>
                    <th className="text-center py-3 px-2 text-[#6B7A74] font-medium">周一(情绪)</th>
                    <th className="text-center py-3 px-2 text-[#6B7A74] font-medium">周三(颜值)</th>
                    <th className="text-center py-3 px-2 text-[#6B7A74] font-medium">周五(颜值)</th>
                    <th className="text-center py-3 px-2 text-[#6B7A74] font-medium">周日(成长)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['W1', '情绪文案视频', '御姐妆教程', '冬季穿搭10套', '早起routine'],
                    ['W2', '治愈系图文', '显脸小发型', '口红合集', '读书分享'],
                    ['W3', '情绪短视频', '约会妆教程', '大衣穿搭', '拍摄幕后'],
                    ['W4', '氛围感写真', '眼妆教程', '好物种草', 'Q&A互动'],
                  ].map((week, i) => (
                    <tr key={i} className="border-b border-[#2D4B3E]/5">
                      <td className="py-3 px-2 font-bold text-[#1A2421]">{week[0]}</td>
                      <td className="py-3 px-2 text-center text-rose-600 bg-rose-50/50">{week[1]}</td>
                      <td className="py-3 px-2 text-center text-amber-600 bg-amber-50/50">{week[2]}</td>
                      <td className="py-3 px-2 text-center text-amber-600 bg-amber-50/50">{week[3]}</td>
                      <td className="py-3 px-2 text-center text-emerald-600 bg-emerald-50/50">{week[4]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 里程碑 */}
          <div className="bg-white rounded-[2rem] p-5 border border-[#2D4B3E]/5">
            <h3 className="font-bold text-[#1A2421] mb-4 flex items-center gap-2 font-serif">
              <Flag size={18} className="text-[#C5A267]" />
              月度里程碑
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { month: '第1个月', fans: '4.5万', income: '0', tasks: ['发布12篇', '蒲公英认证', '橱窗上架30+'] },
                { month: '第2个月', fans: '5万', income: '1000', tasks: ['发布12篇', '首单商业合作', '打造1篇5000+赞'] },
                { month: '第3个月', fans: '6万', income: '3000', tasks: ['发布12篇', '建立3个栏目', '稳定商单'] },
              ].map((m, i) => (
                <div key={i} className="p-4 bg-[#FDFBF7] rounded-xl">
                  <h4 className="font-bold text-[#1A2421] mb-3">{m.month}</h4>
                  <div className="flex justify-between mb-3">
                    <div>
                      <p className="text-xs text-[#6B7A74]">粉丝</p>
                      <p className="font-bold text-[#2D4B3E]">{m.fans}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[#6B7A74]">收入</p>
                      <p className="font-bold text-[#C5A267]">¥{m.income}</p>
                    </div>
                  </div>
                  <ul className="space-y-1">
                    {m.tasks.map((task, j) => (
                      <li key={j} className="flex items-center gap-2 text-xs text-[#6B7A74]">
                        <Circle size={8} className="text-[#9BA8A3]" />
                        {task}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* 最佳发布时间 */}
          <div className="bg-white rounded-[2rem] p-5 border border-[#2D4B3E]/5">
            <h3 className="font-bold text-[#1A2421] mb-4 flex items-center gap-2 font-serif">
              <Clock size={18} className="text-[#2D4B3E]" />
              最佳发布时间
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { time: '12:00', label: '午休种草', stars: 4 },
                { time: '19:00', label: '下班放松', stars: 4 },
                { time: '20:00-22:00', label: '黄金时段', stars: 5, highlight: true },
                { time: '11:00 周末', label: '周末慢享', stars: 3 },
              ].map((slot, i) => (
                <div key={i} className={`p-4 rounded-xl text-center ${
                  slot.highlight ? 'bg-[#2D4B3E] text-white' : 'bg-[#F4F6F0]'
                }`}>
                  <p className={`text-lg font-bold ${slot.highlight ? '' : 'text-[#1A2421]'}`}>{slot.time}</p>
                  <div className="flex justify-center gap-0.5 my-2">
                    {[...Array(slot.stars)].map((_, j) => (
                      <Star key={j} size={12} className={slot.highlight ? 'text-[#C5A267] fill-[#C5A267]' : 'text-[#C5A267] fill-[#C5A267]'} />
                    ))}
                  </div>
                  <p className={`text-xs ${slot.highlight ? 'text-white/60' : 'text-[#6B7A74]'}`}>{slot.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
