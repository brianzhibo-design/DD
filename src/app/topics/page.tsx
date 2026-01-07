'use client';

import { useState, useEffect } from 'react';
import { 
  Lightbulb, 
  TrendingUp, 
  Star, 
  Wand2, 
  ChevronDown, 
  Loader2,
  Sparkles,
  Copy,
  Check,
  Flame,
  RefreshCw,
  Clock,
  Users
} from 'lucide-react';

interface Topic {
  title: string;
  category: string;
  heat: number;
  trend: string;
  estimatedViews: string;
  engagement: string;
  tags: string[];
  reason: string;
  contentTips: string;
  bestPostTime: string;
  competitorCount: string;
}

const categories = ['全部', '生活方式', '好物分享', '萌宠', '美食', '家居', '旅行'];

export default function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [marketInsight, setMarketInsight] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateTopics = async (category?: string) => {
    setLoading(true);
    setError('');
    setTopics([]);
    
    const targetCategory = category ?? selectedCategory;
    
    try {
      const response = await fetch('/api/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: targetCategory })
      });

      const result = await response.json();

      if (result.success && result.topics?.length > 0) {
        setTopics(result.topics);
        setMarketInsight(result.marketInsight || '');
      } else if (result.error) {
        setError(result.error);
      } else {
        setError('未能获取推荐话题，请重试');
      }
    } catch (e) {
      console.error('获取话题失败:', e);
      setError('网络错误，请检查连接后重试');
    }
    
    setLoading(false);
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    generateTopics(cat);
  };

  // 初始加载
  useEffect(() => {
    generateTopics();
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#1A2421]">选题推荐</h1>
          <p className="text-[#6B7A74] text-sm mt-1">基于小红书热点趋势和账号定位的AI智能推荐</p>
        </div>
        <button
          onClick={() => generateTopics()}
          disabled={loading}
          className="inline-flex items-center gap-2 bg-[#2D4B3E] hover:bg-[#3D6654] text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-[#2D4B3E]/20 disabled:opacity-50 transition-all active:scale-[0.98]"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? '生成中...' : '换一批'}
        </button>
      </div>

      {/* 市场洞察 */}
      {marketInsight && (
        <div className="bg-[#C5A267]/10 border border-[#C5A267]/20 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-[#C5A267] flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-[#2D4B3E] mb-1">市场洞察</h3>
              <p className="text-sm text-[#6B7A74]">{marketInsight}</p>
            </div>
          </div>
        </div>
      )}

      {/* 分类筛选 */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            disabled={loading}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
              selectedCategory === cat 
                ? 'bg-[#2D4B3E] text-white shadow-lg shadow-[#2D4B3E]/20' 
                : 'bg-white text-[#6B7A74] border border-[#2D4B3E]/10 hover:border-[#2D4B3E]/30'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="bg-[#B85C5C]/10 border border-[#B85C5C]/20 rounded-xl p-4 text-[#B85C5C] text-sm">
          {error}
        </div>
      )}

      {/* 加载状态 */}
      {loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-[2rem] border border-[#2D4B3E]/5 p-6 animate-pulse">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-[#F4F6F0] rounded-xl" />
                <div className="flex-1">
                  <div className="h-5 bg-[#F4F6F0] rounded w-3/4 mb-2" />
                  <div className="h-4 bg-[#F4F6F0] rounded w-1/2" />
                </div>
              </div>
              <div className="h-16 bg-[#F4F6F0] rounded-xl mb-4" />
              <div className="h-20 bg-[#FDFBF7] rounded-xl" />
            </div>
          ))}
        </div>
      )}

      {/* 空状态 */}
      {!loading && topics.length === 0 && !error && (
        <div className="bg-white border border-[#2D4B3E]/5 rounded-[2rem] p-16 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="inline-block p-5 bg-[#F4F6F0] rounded-2xl text-[#9BA8A3] mb-5">
            <Wand2 size={44} />
          </div>
          <h3 className="text-xl font-bold text-[#2D4B3E] mb-2 font-serif">等待你的灵感召唤</h3>
          <p className="text-[#6B7A74] max-w-sm mx-auto">
            点击上方按钮，AI将为你生成精准匹配的爆款选题
          </p>
        </div>
      )}

      {/* 话题列表 */}
      {!loading && topics.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {topics.map((topic, index) => (
            <TopicCard key={index} topic={topic} rank={index + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function TopicCard({ topic, rank }: { topic: Topic; rank: number }) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(topic.title);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const heatColor = topic.heat >= 80 ? 'text-[#B85C5C]' : topic.heat >= 60 ? 'text-[#C5A267]' : 'text-[#2D4B3E]';

  return (
    <div className="bg-white rounded-[2rem] border border-[#2D4B3E]/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(45,75,62,0.1)] transition-all p-5 md:p-6">
      {/* 头部 */}
      <div className="flex items-start gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
          rank <= 3 ? 'bg-[#2D4B3E] text-white' : 'bg-[#F4F6F0] text-[#6B7A74]'
        }`}>
          {rank}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-[#1A2421] mb-1.5 line-clamp-2 font-serif">{topic.title}</h3>
          <div className="flex items-center gap-2 text-xs text-[#6B7A74] flex-wrap">
            <span className="px-2 py-0.5 bg-[#F4F6F0] rounded-md font-medium">{topic.category}</span>
            <span className={`flex items-center gap-1 ${heatColor}`}>
              <Flame className="w-3.5 h-3.5" />
              热度 {topic.heat}
            </span>
            <span className="text-emerald-600 font-medium">{topic.trend}</span>
          </div>
        </div>
        <button 
          onClick={handleCopy} 
          className="p-2.5 text-[#6B7A74] hover:text-[#2D4B3E] rounded-xl hover:bg-[#F4F6F0] transition-colors shrink-0"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      {/* 数据指标 */}
      <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-[#FDFBF7] rounded-xl text-center">
        <div>
          <div className="text-[#6B7A74] text-[10px] font-bold uppercase tracking-wider">预估曝光</div>
          <div className="font-bold text-[#2D4B3E] text-sm mt-0.5">{topic.estimatedViews || '-'}</div>
        </div>
        <div className="border-x border-[#2D4B3E]/5">
          <div className="text-[#6B7A74] text-[10px] font-bold uppercase tracking-wider">互动率</div>
          <div className="font-bold text-[#2D4B3E] text-sm mt-0.5">{topic.engagement || '-'}</div>
        </div>
        <div>
          <div className="text-[#6B7A74] text-[10px] font-bold uppercase tracking-wider">竞争度</div>
          <div className="font-bold text-[#2D4B3E] text-sm mt-0.5">{topic.competitorCount || '-'}</div>
        </div>
      </div>

      {/* 标签 */}
      {topic.tags && topic.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {topic.tags.slice(0, 5).map((tag) => (
            <span key={tag} className="px-2 py-0.5 bg-white border border-[#2D4B3E]/10 rounded-md text-xs text-[#6B7A74]">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* 推荐理由 */}
      {topic.reason && (
        <div className="p-3 bg-[#2D4B3E]/5 rounded-xl mb-3">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-[#2D4B3E] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[#2D4B3E] leading-relaxed">{topic.reason}</p>
          </div>
        </div>
      )}

      {/* 展开详情 */}
      <button 
        onClick={() => setExpanded(!expanded)}
        className="text-xs text-[#6B7A74] hover:text-[#2D4B3E] flex items-center gap-1 transition-colors"
      >
        {expanded ? '收起' : '查看创作建议'}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-[#2D4B3E]/5 space-y-3 text-sm">
          {topic.contentTips && (
            <div className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-[#C5A267] shrink-0 mt-0.5" />
              <div>
                <span className="text-[#6B7A74] font-medium">创作建议：</span>
                <p className="text-[#2D4B3E] mt-0.5">{topic.contentTips}</p>
              </div>
            </div>
          )}
          {topic.bestPostTime && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#2D4B3E]" />
              <span className="text-[#6B7A74]">最佳发布时间：</span>
              <span className="text-[#2D4B3E] font-medium">{topic.bestPostTime}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
