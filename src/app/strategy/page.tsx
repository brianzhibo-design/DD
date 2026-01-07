'use client';

import { useState } from 'react';
import { 
  Target, TrendingUp, Calendar, AlertTriangle, CheckCircle2, 
  ChevronRight, Users, Coins, FileText, Clock, Zap, Shield,
  BarChart3, Sparkles, Package, Star, ArrowRight, Check,
  Circle, CircleDot, Milestone, Flag, Lightbulb, Eye
} from 'lucide-react';

const phases = [
  {
    id: 1,
    name: '冷启动期',
    duration: '0-2个月',
    status: 'current',
    targets: [
      { label: '粉丝目标', value: '1,000', icon: Users },
      { label: '发布笔记', value: '20-30篇', icon: FileText },
      { label: '互动率', value: '≥5%', icon: TrendingUp },
      { label: '女粉占比', value: '≥70%', icon: Users },
    ],
    keyTasks: [
      '完成账号搭建和专业号认证',
      '确定1-2个有效内容类型',
      '开通商品橱窗',
      '形成可复制的爆款模板',
    ],
    unlocks: ['商品橱窗', '基础带货能力'],
  },
  {
    id: 2,
    name: '内容验证期',
    duration: '2-4个月',
    status: 'upcoming',
    targets: [
      { label: '粉丝目标', value: '5,000', icon: Users },
      { label: '更新频率', value: '每周4-5篇', icon: Calendar },
      { label: '月GMV', value: '3,000-5,000元', icon: Coins },
      { label: '首次成交', value: '有带货记录', icon: Package },
    ],
    keyTasks: [
      '稳定每周4-5篇更新（连续8周）',
      '入驻蒲公英平台',
      '实现首次带货成交',
      '建立2-3个爆款模板',
    ],
    unlocks: ['蒲公英接单', '品牌合作资格'],
  },
  {
    id: 3,
    name: '商业化期',
    duration: '4-8个月',
    status: 'upcoming',
    targets: [
      { label: '粉丝目标', value: '10,000-30,000', icon: Users },
      { label: '月GMV', value: '10,000-30,000元', icon: Coins },
      { label: '月商单', value: '3-5单', icon: FileText },
      { label: '品牌合作', value: '3-5个稳定', icon: Star },
    ],
    keyTasks: [
      '建立商单报价体系',
      '开发品牌合作资源',
      '平衡商业内容与日常内容',
      '组建团队雏形',
    ],
    unlocks: ['稳定商单收入', '品牌年框资格'],
  },
  {
    id: 4,
    name: '品牌化期',
    duration: '9-12个月',
    status: 'upcoming',
    targets: [
      { label: '粉丝目标', value: '50,000+', icon: Users },
      { label: '年GMV', value: '500,000+', icon: Coins },
      { label: '品牌年框', value: '2-3个', icon: Star },
      { label: '私域建设', value: '粉丝群运营', icon: Users },
    ],
    keyTasks: [
      '达成头部KOC地位',
      '建立2-3个品牌年框合作',
      '完成私域用户沉淀',
      '实现多元变现布局',
    ],
    unlocks: ['多元变现', 'IP化运营'],
  },
];

const milestones = [
  { fans: '1,000', unlock: '开通商品橱窗', income: '500-2,000/月', status: 'pending' },
  { fans: '5,000', unlock: '入驻蒲公英平台', income: '2,000-5,000/月', status: 'pending' },
  { fans: '10,000', unlock: '稳定商单', income: '5,000-15,000/月', status: 'pending' },
  { fans: '30,000', unlock: '品牌年框资格', income: '15,000-30,000/月', status: 'pending' },
  { fans: '50,000+', unlock: '头部KOC', income: '30,000+/月', status: 'pending' },
];

const riskIndicators = [
  { name: '女粉占比', healthy: '≥70%', warning: '60-70%', danger: '<60%', status: 'unknown' },
  { name: '互动率', healthy: '≥5%', warning: '3-5%', danger: '<3%', status: 'unknown' },
  { name: '周涨粉', healthy: '≥100', warning: '50-100', danger: '<50', status: 'unknown' },
];

const weeklyChecklist = [
  { day: '周一', tasks: ['发布本周第1篇笔记', '回复前一周笔记的新评论', '查看周末笔记数据'] },
  { day: '周二', tasks: ['回复评论和私信', '浏览同类账号寻找灵感', '整理下一篇素材'] },
  { day: '周三', tasks: ['发布本周第2篇笔记', '回复评论', '商单沟通（如有）'] },
  { day: '周四', tasks: ['回复评论和私信', '检查本周数据', '准备周五笔记'] },
  { day: '周五', tasks: ['发布本周第3篇笔记', '回复评论', '制定周末拍摄计划'] },
  { day: '周六', tasks: ['集中拍摄下周素材', '修图、初步剪辑', '可选：发布第4篇'] },
  { day: '周日', tasks: ['周数据复盘', '下周内容排期', '写好下周前2篇文案'] },
];

const contentMix = [
  { type: '生活方式', percent: 40, purpose: '涨粉+变现' },
  { type: '好物分享', percent: 25, purpose: '涨粉+变现' },
  { type: '好物种草', percent: 25, purpose: '核心变现' },
  { type: '日常生活', percent: 10, purpose: '人设+记忆点' },
];

export default function StrategyPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'phases' | 'risks' | 'execution'>('overview');
  const [expandedPhase, setExpandedPhase] = useState<number | null>(1);

  const tabs = [
    { id: 'overview', label: '战略总览', icon: Target },
    { id: 'phases', label: '阶段规划', icon: Milestone },
    { id: 'risks', label: '风险预案', icon: Shield },
    { id: 'execution', label: '执行清单', icon: CheckCircle2 },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#2D3A30] mb-2 flex items-center gap-2">
          <Target size={24} className="text-[#4A6741]" />
          战略规划中心
        </h1>
        <p className="text-[#7D8A80]">小红书业务完整战略规划 · 从0到50000粉的成长路径</p>
      </div>

      {/* Core Positioning Banner */}
      <div className="bg-[#4A6741] rounded-2xl p-6 mb-6 text-white">
        <div className="flex items-center gap-3 mb-3">
          <Sparkles size={20} />
          <span className="font-medium">核心定位</span>
        </div>
        <h2 className="text-2xl font-bold mb-2">内容创作 × 生活方式 × 精致分享</h2>
        <p className="text-white/80 text-sm">差异化竞争策略：打造独特个人风格</p>
        <div className="flex flex-wrap gap-3 mt-4">
          <span className="px-3 py-1.5 bg-white/20 rounded-full text-sm">每天1-2小时</span>
          <span className="px-3 py-1.5 bg-white/20 rounded-full text-sm">前期少投放</span>
          <span className="px-3 py-1.5 bg-white/20 rounded-full text-sm">抖音4.5万粉资产</span>
          <span className="px-3 py-1.5 bg-white/20 rounded-full text-sm">六只猫记忆点</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-[#4A6741] text-white shadow-lg'
                : 'bg-white text-[#7D8A80] hover:bg-[#F4F6F0] border border-[#E2E8D5]'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Milestones */}
          <div className="bg-white rounded-xl p-6 border border-[#E2E8D5]">
            <h3 className="font-bold text-[#2D3A30] mb-4 flex items-center gap-2">
              <Flag size={18} className="text-[#B8860B]" />
              关键里程碑
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {milestones.map((m, i) => (
                <div key={i} className={`p-4 rounded-xl border-2 ${
                  m.status === 'completed' ? 'border-[#4A6741] bg-[#4A6741]/5' : 'border-[#E2E8D5] bg-[#F4F6F0]'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {m.status === 'completed' ? (
                      <Check size={16} className="text-[#4A6741]" />
                    ) : (
                      <Circle size={16} className="text-[#9CA89F]" />
                    )}
                    <span className="font-bold text-lg text-[#2D3A30]">{m.fans}</span>
                  </div>
                  <p className="text-sm text-[#7D8A80] mb-1">{m.unlock}</p>
                  <p className="text-xs text-[#9CA89F]">{m.income}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Year Projection */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-5 border border-[#E2E8D5] text-center">
              <Users size={24} className="mx-auto mb-2 text-[#4A6741]" />
              <p className="text-xs text-[#7D8A80] mb-1">第一年粉丝目标</p>
              <p className="text-2xl font-bold text-[#2D3A30]">30,000-50,000</p>
            </div>
            <div className="bg-white rounded-xl p-5 border border-[#E2E8D5] text-center">
              <Coins size={24} className="mx-auto mb-2 text-[#B8860B]" />
              <p className="text-xs text-[#7D8A80] mb-1">第一年GMV目标</p>
              <p className="text-2xl font-bold text-[#2D3A30]">10-15万元</p>
            </div>
            <div className="bg-white rounded-xl p-5 border border-[#E2E8D5] text-center">
              <FileText size={24} className="mx-auto mb-2 text-[#4A6741]" />
              <p className="text-xs text-[#7D8A80] mb-1">第一年商单目标</p>
              <p className="text-2xl font-bold text-[#2D3A30]">20-30单</p>
            </div>
            <div className="bg-white rounded-xl p-5 border border-[#E2E8D5] text-center">
              <Star size={24} className="mx-auto mb-2 text-[#B8860B]" />
              <p className="text-xs text-[#7D8A80] mb-1">稳定合作品牌</p>
              <p className="text-2xl font-bold text-[#2D3A30]">3-5个</p>
            </div>
          </div>

          {/* Content Mix */}
          <div className="bg-white rounded-xl p-6 border border-[#E2E8D5]">
            <h3 className="font-bold text-[#2D3A30] mb-4 flex items-center gap-2">
              <BarChart3 size={18} className="text-[#4A6741]" />
              内容配比策略
            </h3>
            <div className="space-y-3">
              {contentMix.map((item, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-[#2D3A30]">{item.type}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#7D8A80]">{item.purpose}</span>
                      <span className="text-sm font-bold text-[#2D3A30]">{item.percent}%</span>
                    </div>
                  </div>
                  <div className="h-2 bg-[#F4F6F0] rounded-full overflow-hidden">
                    <div className="h-full bg-[#4A6741] rounded-full" style={{ width: `${item.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Core Metrics */}
          <div className="bg-white rounded-xl p-6 border border-[#E2E8D5]">
            <h3 className="font-bold text-[#2D3A30] mb-4 flex items-center gap-2">
              <Eye size={18} className="text-[#4A6741]" />
              核心监控指标
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-[#F4F6F0] rounded-xl">
                <p className="text-sm text-[#7D8A80] mb-1">女粉占比</p>
                <p className="text-xl font-bold text-[#4A6741]">≥75%</p>
                <p className="text-xs text-[#9CA89F]">底线 ≥70%</p>
              </div>
              <div className="p-4 bg-[#F4F6F0] rounded-xl">
                <p className="text-sm text-[#7D8A80] mb-1">互动率</p>
                <p className="text-xl font-bold text-[#4A6741]">≥8%</p>
                <p className="text-xs text-[#9CA89F]">底线 ≥5%</p>
              </div>
              <div className="p-4 bg-[#F4F6F0] rounded-xl">
                <p className="text-sm text-[#7D8A80] mb-1">周涨粉</p>
                <p className="text-xl font-bold text-[#4A6741]">≥150</p>
                <p className="text-xs text-[#9CA89F]">底线 ≥50</p>
              </div>
              <div className="p-4 bg-[#F4F6F0] rounded-xl">
                <p className="text-sm text-[#7D8A80] mb-1">商品点击率</p>
                <p className="text-xl font-bold text-[#4A6741]">≥5%</p>
                <p className="text-xs text-[#9CA89F]">底线 ≥3%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'phases' && (
        <div className="space-y-4">
          {phases.map(phase => (
            <div 
              key={phase.id}
              className={`bg-white rounded-xl p-6 border overflow-hidden ${
                phase.status === 'current' ? 'border-[#4A6741] ring-2 ring-[#4A6741]/20' : 'border-[#E2E8D5]'
              }`}
            >
              <button
                onClick={() => setExpandedPhase(expandedPhase === phase.id ? null : phase.id)}
                className="w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    phase.status === 'completed' ? 'bg-[#4A6741]/10' :
                    phase.status === 'current' ? 'bg-[#4A6741]/10' : 'bg-[#F4F6F0]'
                  }`}>
                    {phase.status === 'completed' ? (
                      <Check size={24} className="text-[#4A6741]" />
                    ) : phase.status === 'current' ? (
                      <CircleDot size={24} className="text-[#4A6741]" />
                    ) : (
                      <Circle size={24} className="text-[#9CA89F]" />
                    )}
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg text-[#2D3A30]">{phase.name}</h3>
                      {phase.status === 'current' && (
                        <span className="px-2 py-0.5 bg-[#4A6741]/10 text-[#4A6741] text-xs rounded-full">当前阶段</span>
                      )}
                    </div>
                    <p className="text-sm text-[#7D8A80]">{phase.duration}</p>
                  </div>
                </div>
                <ChevronRight 
                  size={20} 
                  className={`text-[#9CA89F] transition-transform ${expandedPhase === phase.id ? 'rotate-90' : ''}`} 
                />
              </button>

              {expandedPhase === phase.id && (
                <div className="mt-6 pt-6 border-t border-[#E2E8D5] space-y-6">
                  <div>
                    <h4 className="font-medium text-[#2D3A30] mb-3 flex items-center gap-2">
                      <Target size={16} className="text-[#4A6741]" />
                      阶段目标
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {phase.targets.map((target, i) => (
                        <div key={i} className="p-3 bg-[#F4F6F0] rounded-xl">
                          <div className="flex items-center gap-2 mb-1">
                            <target.icon size={14} className="text-[#7D8A80]" />
                            <span className="text-xs text-[#7D8A80]">{target.label}</span>
                          </div>
                          <p className="font-bold text-[#2D3A30]">{target.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-[#2D3A30] mb-3 flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-[#4A6741]" />
                      通过条件
                    </h4>
                    <div className="space-y-2">
                      {phase.keyTasks.map((task, i) => (
                        <div key={i} className="flex items-center gap-3 p-2 hover:bg-[#F4F6F0] rounded-lg">
                          <div className="w-5 h-5 rounded border-2 border-[#E2E8D5] flex items-center justify-center">
                            <Check size={12} className="text-[#9CA89F]" />
                          </div>
                          <span className="text-[#2D3A30]">{task}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-[#2D3A30] mb-3 flex items-center gap-2">
                      <Zap size={16} className="text-[#4A6741]" />
                      解锁能力
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {phase.unlocks.map((unlock, i) => (
                        <span key={i} className="px-3 py-1.5 bg-[#4A6741]/10 text-[#4A6741] rounded-full text-sm font-medium">
                          {unlock}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'risks' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-[#E2E8D5]">
            <h3 className="font-bold text-[#2D3A30] mb-4 flex items-center gap-2">
              <AlertTriangle size={18} className="text-[#B8860B]" />
              风险监控仪表盘
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {riskIndicators.map((risk, i) => (
                <div key={i} className="p-4 border border-[#E2E8D5] rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-[#2D3A30]">{risk.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      risk.status === 'healthy' ? 'bg-[#4A6741]/10 text-[#4A6741]' :
                      risk.status === 'warning' ? 'bg-[#B8860B]/10 text-[#B8860B]' :
                      risk.status === 'danger' ? 'bg-[#C75050]/10 text-[#C75050]' :
                      'bg-[#F4F6F0] text-[#7D8A80]'
                    }`}>
                      {risk.status === 'unknown' ? '待录入' : risk.status === 'healthy' ? '健康' : risk.status === 'warning' ? '警戒' : '危险'}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-[#4A6741] rounded-full" />
                      <span className="text-[#7D8A80]">健康: {risk.healthy}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-[#B8860B] rounded-full" />
                      <span className="text-[#7D8A80]">警戒: {risk.warning}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-[#C75050] rounded-full" />
                      <span className="text-[#7D8A80]">危险: {risk.danger}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-[#E2E8D5] border-l-4 border-l-[#C75050]">
            <h3 className="font-bold text-[#2D3A30] mb-2">风险1：男性粉丝比例过高</h3>
            <p className="text-sm text-[#7D8A80] mb-4">抖音颜值内容可能吸引大量男性粉丝，影响带货转化</p>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-[#2D3A30] mb-2 flex items-center gap-2">
                  <Shield size={14} className="text-[#4A6741]" />
                  预防措施
                </h4>
                <ul className="text-sm text-[#7D8A80] space-y-1 ml-5 list-disc">
                  <li>内容/好物分享为主，弱化纯颜值展示</li>
                  <li>闺蜜分享式文案，切入女性痛点</li>
                  <li>优先回复女性用户，引导女性话题</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-[#2D3A30] mb-2 flex items-center gap-2">
                  <AlertTriangle size={14} className="text-[#B8860B]" />
                  应急措施
                </h4>
                <ul className="text-sm text-[#7D8A80] space-y-1 ml-5 list-disc">
                  <li>提高教程、攻略类内容比例</li>
                  <li>降低纯露脸、纯展示内容</li>
                  <li>暂停从抖音向小红书导流</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-[#E2E8D5] border-l-4 border-l-[#B8860B]">
            <h3 className="font-bold text-[#2D3A30] mb-2">风险2：涨粉慢/流量差</h3>
            <p className="text-sm text-[#7D8A80] mb-4">内容不够吸引或方向偏差导致增长停滞</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-[#F4F6F0] rounded-lg">
                <p className="font-medium text-[#2D3A30] mb-1">点击率低</p>
                <p className="text-sm text-[#7D8A80]">→ 优化封面和标题</p>
              </div>
              <div className="p-3 bg-[#F4F6F0] rounded-lg">
                <p className="font-medium text-[#2D3A30] mb-1">互动率低</p>
                <p className="text-sm text-[#7D8A80]">→ 增加干货和实用性</p>
              </div>
              <div className="p-3 bg-[#F4F6F0] rounded-lg">
                <p className="font-medium text-[#2D3A30] mb-1">完播率低</p>
                <p className="text-sm text-[#7D8A80]">→ 优化开头和节奏</p>
              </div>
              <div className="p-3 bg-[#F4F6F0] rounded-lg">
                <p className="font-medium text-[#2D3A30] mb-1">涨粉率低</p>
                <p className="text-sm text-[#7D8A80]">→ 强化账号定位</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'execution' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-[#E2E8D5]">
            <h3 className="font-bold text-[#2D3A30] mb-4 flex items-center gap-2">
              <Calendar size={18} className="text-[#4A6741]" />
              周执行清单
              <span className="text-xs text-[#7D8A80] font-normal ml-2">每周约4.5小时</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
              {weeklyChecklist.map((day, i) => (
                <div key={i} className={`p-3 rounded-xl ${
                  i === 5 || i === 6 ? 'bg-[#4A6741]/5' : 'bg-[#F4F6F0]'
                }`}>
                  <p className="font-medium text-[#2D3A30] mb-2">{day.day}</p>
                  <ul className="space-y-1">
                    {day.tasks.map((task, j) => (
                      <li key={j} className="text-xs text-[#7D8A80] flex items-start gap-1">
                        <Check size={10} className="text-[#9CA89F] mt-0.5 flex-shrink-0" />
                        {task}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-[#E2E8D5]">
            <h3 className="font-bold text-[#2D3A30] mb-4 flex items-center gap-2">
              <Clock size={18} className="text-[#4A6741]" />
              时间分配建议
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-[#2D3A30] mb-3">工作日</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-[#F4F6F0] rounded-lg">
                    <span className="text-sm text-[#7D8A80]">发布笔记+评论</span>
                    <span className="text-sm font-medium text-[#2D3A30]">30-40分钟</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-[#F4F6F0] rounded-lg">
                    <span className="text-sm text-[#7D8A80]">互动+数据检查</span>
                    <span className="text-sm font-medium text-[#2D3A30]">20分钟</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-[#2D3A30] mb-3">周末</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-[#4A6741]/5 rounded-lg">
                    <span className="text-sm text-[#7D8A80]">集中拍摄素材</span>
                    <span className="text-sm font-medium text-[#2D3A30]">60分钟</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-[#4A6741]/5 rounded-lg">
                    <span className="text-sm text-[#7D8A80]">复盘+下周准备</span>
                    <span className="text-sm font-medium text-[#2D3A30]">60分钟</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-[#E2E8D5]">
            <h3 className="font-bold text-[#2D3A30] mb-4 flex items-center gap-2">
              <Zap size={18} className="text-[#B8860B]" />
              最佳发布时间
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="p-3 bg-[#F4F6F0] rounded-xl text-center">
                <p className="text-xs text-[#7D8A80] mb-1">7:00-9:00</p>
                <div className="flex justify-center gap-0.5">
                  {[1,2,3].map(i => <Star key={i} size={12} className="text-[#B8860B] fill-[#B8860B]" />)}
                </div>
                <p className="text-xs text-[#9CA89F] mt-1">日常分享</p>
              </div>
              <div className="p-3 bg-[#F4F6F0] rounded-xl text-center">
                <p className="text-xs text-[#7D8A80] mb-1">12:00-14:00</p>
                <div className="flex justify-center gap-0.5">
                  {[1,2,3,4].map(i => <Star key={i} size={12} className="text-[#B8860B] fill-[#B8860B]" />)}
                </div>
                <p className="text-xs text-[#9CA89F] mt-1">午休种草</p>
              </div>
              <div className="p-3 bg-[#F4F6F0] rounded-xl text-center">
                <p className="text-xs text-[#7D8A80] mb-1">18:00-20:00</p>
                <div className="flex justify-center gap-0.5">
                  {[1,2,3,4].map(i => <Star key={i} size={12} className="text-[#B8860B] fill-[#B8860B]" />)}
                </div>
                <p className="text-xs text-[#9CA89F] mt-1">生活记录</p>
              </div>
              <div className="p-3 bg-[#4A6741]/10 rounded-xl text-center border-2 border-[#4A6741]/30">
                <p className="text-xs text-[#4A6741] mb-1 font-medium">20:00-22:00</p>
                <div className="flex justify-center gap-0.5">
                  {[1,2,3,4,5].map(i => <Star key={i} size={12} className="text-[#4A6741] fill-[#4A6741]" />)}
                </div>
                <p className="text-xs text-[#4A6741] mt-1">最佳时段</p>
              </div>
              <div className="p-3 bg-[#F4F6F0] rounded-xl text-center">
                <p className="text-xs text-[#7D8A80] mb-1">22:00-24:00</p>
                <div className="flex justify-center gap-0.5">
                  {[1,2,3].map(i => <Star key={i} size={12} className="text-[#B8860B] fill-[#B8860B]" />)}
                </div>
                <p className="text-xs text-[#9CA89F] mt-1">日常分享</p>
              </div>
            </div>
          </div>

          <div className="bg-[#4A6741]/5 rounded-xl p-6 border border-[#4A6741]/20">
            <h3 className="font-bold text-[#2D3A30] mb-4 flex items-center gap-2">
              <Lightbulb size={18} className="text-[#4A6741]" />
              立即行动：第1周任务
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-white rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-[#4A6741]/10 flex items-center justify-center text-[#4A6741] text-xs font-bold">1</div>
                  <span className="font-medium text-[#2D3A30]">完成账号设置</span>
                </div>
                <p className="text-sm text-[#7D8A80] ml-8">昵称、头像、简介、专业号</p>
              </div>
              <div className="p-3 bg-white rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-[#4A6741]/10 flex items-center justify-center text-[#4A6741] text-xs font-bold">2</div>
                  <span className="font-medium text-[#2D3A30]">研究对标账号</span>
                </div>
                <p className="text-sm text-[#7D8A80] ml-8">分析5-10个同类型账号</p>
              </div>
              <div className="p-3 bg-white rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-[#4A6741]/10 flex items-center justify-center text-[#4A6741] text-xs font-bold">3</div>
                  <span className="font-medium text-[#2D3A30]">确定首批选题</span>
                </div>
                <p className="text-sm text-[#7D8A80] ml-8">列出5个内容选题</p>
              </div>
              <div className="p-3 bg-white rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-[#4A6741]/10 flex items-center justify-center text-[#4A6741] text-xs font-bold">4</div>
                  <span className="font-medium text-[#2D3A30]">拍摄首批素材</span>
                </div>
                <p className="text-sm text-[#7D8A80] ml-8">3-5条内容素材</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
