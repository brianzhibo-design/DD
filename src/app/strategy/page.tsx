'use client';

import { useState } from 'react';
import { 
  Target, TrendingUp, Calendar, AlertTriangle, CheckCircle2, 
  ChevronRight, Users, Coins, FileText, Clock, Zap, Shield,
  BarChart3, Sparkles, Package, Star, ArrowRight, Check,
  Circle, CircleDot, Milestone, Flag, Lightbulb, Eye
} from 'lucide-react';

// 阶段数据
const phases = [
  {
    id: 1,
    name: '冷启动期',
    duration: '0-2个月',
    status: 'current', // 'completed', 'current', 'upcoming'
    color: 'emerald',
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
    color: 'blue',
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
    color: 'purple',
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
    color: 'rose',
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

// 里程碑数据
const milestones = [
  { fans: '1,000', unlock: '开通商品橱窗', income: '500-2,000/月', status: 'pending' },
  { fans: '5,000', unlock: '入驻蒲公英平台', income: '2,000-5,000/月', status: 'pending' },
  { fans: '10,000', unlock: '稳定商单', income: '5,000-15,000/月', status: 'pending' },
  { fans: '30,000', unlock: '品牌年框资格', income: '15,000-30,000/月', status: 'pending' },
  { fans: '50,000+', unlock: '头部KOC', income: '30,000+/月', status: 'pending' },
];

// 风险指标
const riskIndicators = [
  {
    name: '女粉占比',
    current: null, // 从数据中获取
    healthy: '≥70%',
    warning: '60-70%',
    danger: '<60%',
    status: 'unknown',
  },
  {
    name: '互动率',
    current: null,
    healthy: '≥5%',
    warning: '3-5%',
    danger: '<3%',
    status: 'unknown',
  },
  {
    name: '周涨粉',
    current: null,
    healthy: '≥100',
    warning: '50-100',
    danger: '<50',
    status: 'unknown',
  },
];

// 本周执行清单
const weeklyChecklist = [
  { day: '周一', tasks: ['发布本周第1篇笔记', '回复前一周笔记的新评论', '查看周末笔记数据'] },
  { day: '周二', tasks: ['回复评论和私信', '浏览同类账号寻找灵感', '整理下一篇素材'] },
  { day: '周三', tasks: ['发布本周第2篇笔记', '回复评论', '商单沟通（如有）'] },
  { day: '周四', tasks: ['回复评论和私信', '检查本周数据', '准备周五笔记'] },
  { day: '周五', tasks: ['发布本周第3篇笔记', '回复评论', '制定周末拍摄计划'] },
  { day: '周六', tasks: ['集中拍摄下周素材', '修图、初步剪辑', '可选：发布第4篇'] },
  { day: '周日', tasks: ['周数据复盘', '下周内容排期', '写好下周前2篇文案'] },
];

// 内容配比
const contentMix = [
  { type: '生活方式', percent: 40, purpose: '涨粉+变现', color: 'bg-rose-500' },
  { type: '好物分享', percent: 25, purpose: '涨粉+变现', color: 'bg-pink-500' },
  { type: '好物种草', percent: 25, purpose: '核心变现', color: 'bg-amber-500' },
  { type: '日常生活', percent: 10, purpose: '人设+记忆点', color: 'bg-purple-500' },
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
        <h1 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <Target size={24} className="text-rose-500" />
          战略规划中心
        </h1>
        <p className="text-gray-500">小红书业务完整战略规划 · 从0到50000粉的成长路径</p>
      </div>

      {/* Core Positioning Banner */}
      <div className="aurora-bg rounded-2xl p-6 mb-6 text-white">
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
                ? 'aurora-bg text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50 border'
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
          <div className="bento-card">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Flag size={18} className="text-amber-500" />
              关键里程碑
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {milestones.map((m, i) => (
                <div key={i} className={`p-4 rounded-xl border-2 ${
                  m.status === 'completed' ? 'border-green-300 bg-green-50' : 'border-gray-100 bg-gray-50'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {m.status === 'completed' ? (
                      <Check size={16} className="text-green-500" />
                    ) : (
                      <Circle size={16} className="text-gray-300" />
                    )}
                    <span className="font-bold text-lg text-gray-800">{m.fans}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{m.unlock}</p>
                  <p className="text-xs text-gray-400">{m.income}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Year Projection */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bento-card text-center">
              <Users size={24} className="mx-auto mb-2 text-pink-500" />
              <p className="text-xs text-gray-500 mb-1">第一年粉丝目标</p>
              <p className="text-2xl font-bold text-gray-800">30,000-50,000</p>
            </div>
            <div className="bento-card text-center">
              <Coins size={24} className="mx-auto mb-2 text-amber-500" />
              <p className="text-xs text-gray-500 mb-1">第一年GMV目标</p>
              <p className="text-2xl font-bold text-gray-800">10-15万元</p>
            </div>
            <div className="bento-card text-center">
              <FileText size={24} className="mx-auto mb-2 text-purple-500" />
              <p className="text-xs text-gray-500 mb-1">第一年商单目标</p>
              <p className="text-2xl font-bold text-gray-800">20-30单</p>
            </div>
            <div className="bento-card text-center">
              <Star size={24} className="mx-auto mb-2 text-rose-500" />
              <p className="text-xs text-gray-500 mb-1">稳定合作品牌</p>
              <p className="text-2xl font-bold text-gray-800">3-5个</p>
            </div>
          </div>

          {/* Content Mix */}
          <div className="bento-card">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <BarChart3 size={18} className="text-blue-500" />
              内容配比策略
            </h3>
            <div className="space-y-3">
              {contentMix.map((item, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{item.type}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">{item.purpose}</span>
                      <span className="text-sm font-bold text-gray-800">{item.percent}%</span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Core Metrics */}
          <div className="bento-card">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Eye size={18} className="text-emerald-500" />
              核心监控指标
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-pink-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">女粉占比</p>
                <p className="text-xl font-bold text-pink-600">≥75%</p>
                <p className="text-xs text-gray-400">底线 ≥70%</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">互动率</p>
                <p className="text-xl font-bold text-blue-600">≥8%</p>
                <p className="text-xs text-gray-400">底线 ≥5%</p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">周涨粉</p>
                <p className="text-xl font-bold text-emerald-600">≥150</p>
                <p className="text-xs text-gray-400">底线 ≥50</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">商品点击率</p>
                <p className="text-xl font-bold text-amber-600">≥5%</p>
                <p className="text-xs text-gray-400">底线 ≥3%</p>
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
              className={`bento-card overflow-hidden ${
                phase.status === 'current' ? 'ring-2 ring-pink-300' : ''
              }`}
            >
              {/* Phase Header */}
              <button
                onClick={() => setExpandedPhase(expandedPhase === phase.id ? null : phase.id)}
                className="w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    phase.status === 'completed' ? 'bg-green-100' :
                    phase.status === 'current' ? 'bg-pink-100' : 'bg-gray-100'
                  }`}>
                    {phase.status === 'completed' ? (
                      <Check size={24} className="text-green-500" />
                    ) : phase.status === 'current' ? (
                      <CircleDot size={24} className="text-pink-500" />
                    ) : (
                      <Circle size={24} className="text-gray-400" />
                    )}
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg text-gray-800">{phase.name}</h3>
                      {phase.status === 'current' && (
                        <span className="px-2 py-0.5 bg-pink-100 text-pink-600 text-xs rounded-full">当前阶段</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{phase.duration}</p>
                  </div>
                </div>
                <ChevronRight 
                  size={20} 
                  className={`text-gray-400 transition-transform ${expandedPhase === phase.id ? 'rotate-90' : ''}`} 
                />
              </button>

              {/* Phase Content */}
              {expandedPhase === phase.id && (
                <div className="mt-6 pt-6 border-t space-y-6">
                  {/* Targets */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <Target size={16} />
                      阶段目标
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {phase.targets.map((target, i) => (
                        <div key={i} className="p-3 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-2 mb-1">
                            <target.icon size={14} className="text-gray-400" />
                            <span className="text-xs text-gray-500">{target.label}</span>
                          </div>
                          <p className="font-bold text-gray-800">{target.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Key Tasks */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <CheckCircle2 size={16} />
                      通过条件
                    </h4>
                    <div className="space-y-2">
                      {phase.keyTasks.map((task, i) => (
                        <div key={i} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                          <div className="w-5 h-5 rounded border-2 border-gray-300 flex items-center justify-center">
                            <Check size={12} className="text-gray-300" />
                          </div>
                          <span className="text-gray-700">{task}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Unlocks */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <Zap size={16} />
                      解锁能力
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {phase.unlocks.map((unlock, i) => (
                        <span key={i} className="px-3 py-1.5 bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 rounded-full text-sm font-medium">
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
          {/* Risk Dashboard */}
          <div className="bento-card">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-500" />
              风险监控仪表盘
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {riskIndicators.map((risk, i) => (
                <div key={i} className="p-4 border rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-gray-700">{risk.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      risk.status === 'healthy' ? 'bg-green-100 text-green-700' :
                      risk.status === 'warning' ? 'bg-amber-100 text-amber-700' :
                      risk.status === 'danger' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {risk.status === 'unknown' ? '待录入' : risk.status === 'healthy' ? '健康' : risk.status === 'warning' ? '警戒' : '危险'}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-gray-600">健康: {risk.healthy}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-amber-500 rounded-full" />
                      <span className="text-gray-600">警戒: {risk.warning}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full" />
                      <span className="text-gray-600">危险: {risk.danger}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Risk: Male Fans */}
          <div className="bento-card border-l-4 border-l-red-400">
            <h3 className="font-bold text-gray-800 mb-2">风险1：男性粉丝比例过高</h3>
            <p className="text-sm text-gray-500 mb-4">抖音颜值内容可能吸引大量男性粉丝，影响带货转化</p>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Shield size={14} />
                  预防措施（日常执行）
                </h4>
                <ul className="text-sm text-gray-600 space-y-1 ml-5 list-disc">
                  <li>内容/好物分享为主，弱化纯颜值展示</li>
                  <li>闺蜜分享式文案，切入女性痛点</li>
                  <li>优先回复女性用户，引导女性话题</li>
                  <li>选择性导流，从优质内容引流</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <AlertTriangle size={14} />
                  应急措施（触发警戒线时）
                </h4>
                <ul className="text-sm text-gray-600 space-y-1 ml-5 list-disc">
                  <li>提高教程、攻略类内容比例</li>
                  <li>降低纯露脸、纯展示内容</li>
                  <li>选择女性活跃时段发布</li>
                  <li>暂停从抖音向小红书导流</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Risk: Slow Growth */}
          <div className="bento-card border-l-4 border-l-amber-400">
            <h3 className="font-bold text-gray-800 mb-2">风险2：涨粉慢/流量差</h3>
            <p className="text-sm text-gray-500 mb-4">内容不够吸引或方向偏差导致增长停滞</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-700 mb-1">点击率低</p>
                <p className="text-sm text-gray-500">→ 优化封面和标题</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-700 mb-1">互动率低</p>
                <p className="text-sm text-gray-500">→ 增加干货和实用性</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-700 mb-1">完播率低</p>
                <p className="text-sm text-gray-500">→ 优化开头和节奏</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-700 mb-1">涨粉率低</p>
                <p className="text-sm text-gray-500">→ 强化账号定位</p>
              </div>
            </div>
          </div>

          {/* Risk: Low Conversion */}
          <div className="bento-card border-l-4 border-l-blue-400">
            <h3 className="font-bold text-gray-800 mb-2">风险3：变现转化低</h3>
            <p className="text-sm text-gray-500 mb-4">有流量但商品点击和转化不佳</p>
            
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <ArrowRight size={16} className="text-gray-400" />
                <span className="text-sm text-gray-700">优化选品：选择与内容高度相关的商品</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <ArrowRight size={16} className="text-gray-400" />
                <span className="text-sm text-gray-700">增加场景：多展示商品使用场景和效果</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <ArrowRight size={16} className="text-gray-400" />
                <span className="text-sm text-gray-700">优化价格：调整到粉丝能接受的价格带</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <ArrowRight size={16} className="text-gray-400" />
                <span className="text-sm text-gray-700">增加信任：展示真实使用体验和效果</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'execution' && (
        <div className="space-y-6">
          {/* Weekly Schedule */}
          <div className="bento-card">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar size={18} className="text-blue-500" />
              周执行清单
              <span className="text-xs text-gray-400 font-normal ml-2">每周约4.5小时</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
              {weeklyChecklist.map((day, i) => (
                <div key={i} className={`p-3 rounded-xl ${
                  i === 5 || i === 6 ? 'bg-purple-50' : 'bg-gray-50'
                }`}>
                  <p className="font-medium text-gray-700 mb-2">{day.day}</p>
                  <ul className="space-y-1">
                    {day.tasks.map((task, j) => (
                      <li key={j} className="text-xs text-gray-600 flex items-start gap-1">
                        <Check size={10} className="text-gray-300 mt-0.5 flex-shrink-0" />
                        {task}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Time Allocation */}
          <div className="bento-card">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Clock size={18} className="text-emerald-500" />
              时间分配建议
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-3">工作日</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">发布笔记+评论</span>
                    <span className="text-sm font-medium">30-40分钟</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">互动+数据检查</span>
                    <span className="text-sm font-medium">20分钟</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-3">周末</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-purple-50 rounded-lg">
                    <span className="text-sm text-gray-600">集中拍摄素材</span>
                    <span className="text-sm font-medium">60分钟</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-purple-50 rounded-lg">
                    <span className="text-sm text-gray-600">复盘+下周准备</span>
                    <span className="text-sm font-medium">60分钟</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Best Posting Times */}
          <div className="bento-card">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Zap size={18} className="text-amber-500" />
              最佳发布时间
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="p-3 bg-gray-50 rounded-xl text-center">
                <p className="text-xs text-gray-500 mb-1">7:00-9:00</p>
                <div className="flex justify-center gap-0.5">
                  {[1,2,3].map(i => <Star key={i} size={12} className="text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-xs text-gray-400 mt-1">日常分享</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl text-center">
                <p className="text-xs text-gray-500 mb-1">12:00-14:00</p>
                <div className="flex justify-center gap-0.5">
                  {[1,2,3,4].map(i => <Star key={i} size={12} className="text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-xs text-gray-400 mt-1">午休种草</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl text-center">
                <p className="text-xs text-gray-500 mb-1">18:00-20:00</p>
                <div className="flex justify-center gap-0.5">
                  {[1,2,3,4].map(i => <Star key={i} size={12} className="text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-xs text-gray-400 mt-1">生活记录</p>
              </div>
              <div className="p-3 bg-pink-50 rounded-xl text-center border-2 border-pink-200">
                <p className="text-xs text-pink-600 mb-1 font-medium">20:00-22:00</p>
                <div className="flex justify-center gap-0.5">
                  {[1,2,3,4,5].map(i => <Star key={i} size={12} className="text-pink-400 fill-pink-400" />)}
                </div>
                <p className="text-xs text-pink-500 mt-1">最佳时段</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl text-center">
                <p className="text-xs text-gray-500 mb-1">22:00-24:00</p>
                <div className="flex justify-center gap-0.5">
                  {[1,2,3].map(i => <Star key={i} size={12} className="text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-xs text-gray-400 mt-1">日常分享</p>
              </div>
            </div>
          </div>

          {/* Quick Start Actions */}
          <div className="bento-card bg-gradient-to-r from-pink-50 to-purple-50 border-pink-100">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Lightbulb size={18} className="text-pink-500" />
              立即行动：第1周任务
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-white rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 text-xs font-bold">1</div>
                  <span className="font-medium text-gray-700">完成账号设置</span>
                </div>
                <p className="text-sm text-gray-500 ml-8">昵称、头像、简介、专业号</p>
              </div>
              <div className="p-3 bg-white rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 text-xs font-bold">2</div>
                  <span className="font-medium text-gray-700">研究对标账号</span>
                </div>
                <p className="text-sm text-gray-500 ml-8">分析5-10个同类型账号</p>
              </div>
              <div className="p-3 bg-white rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 text-xs font-bold">3</div>
                  <span className="font-medium text-gray-700">确定首批选题</span>
                </div>
                <p className="text-sm text-gray-500 ml-8">列出5个内容选题</p>
              </div>
              <div className="p-3 bg-white rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 text-xs font-bold">4</div>
                  <span className="font-medium text-gray-700">拍摄首批素材</span>
                </div>
                <p className="text-sm text-gray-500 ml-8">3-5条内容素材，高清多角度</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

