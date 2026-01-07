'use client';

import { useState, useEffect } from 'react';
import { 
  Lightbulb, 
  TrendingUp, 
  Wand2, 
  ChevronDown, 
  Sparkles,
  Copy,
  Check,
  Flame,
  RefreshCw,
  Clock,
  Search,
  ArrowRight
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
  const [customInput, setCustomInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateTopics = async (category?: string, custom?: string) => {
    setLoading(true);
    setError('');
    setTopics([]);
    
    const targetCategory = custom || category || selectedCategory;
    
    try {
      const response = await fetch('/api/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          category: targetCategory,
          customPrompt: custom || undefined
        })
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
    setCustomInput('');
    generateTopics(cat);
  };

  const handleCustomSearch = () => {
    if (!customInput.trim()) return;
    setSelectedCategory('');
    generateTopics(undefined, customInput.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCustomSearch();
    }
  };

  // 初始加载
  useEffect(() => {
    generateTopics();
  }, []);

  return (
    <div className="space-y-4 pb-20">
      {/* Header - 移动端优化 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#1A2421]">选题推荐</h1>
          <p className="text-[#9BA8A3] text-xs mt-0.5">AI智能推荐爆款选题</p>
        </div>
        <button
          onClick={() => generateTopics()}
          disabled={loading}
          className="flex items-center gap-1.5 bg-[#2D4B3E] text-white text-sm font-medium py-2 px-4 rounded-full disabled:opacity-50 transition-all active:scale-95"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? '生成中' : '换一批'}
        </button>
      </div>

      {/* 自定义输入框 - 移动端优化 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9BA8A3]" />
        <input
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入选题方向，如：春季穿搭、职场通勤..."
          className="w-full pl-9 pr-12 py-3 bg-white border border-[#2D4B3E]/10 rounded-xl text-sm text-[#1A2421] placeholder-[#9BA8A3] focus:outline-none focus:ring-2 focus:ring-[#2D4B3E]/10"
        />
        {customInput.trim() && (
          <button
            onClick={handleCustomSearch}
            disabled={loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#C5A267] text-white rounded-lg disabled:opacity-50"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 分类筛选 - 横向滚动 */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            disabled={loading}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat 
                ? 'bg-[#2D4B3E] text-white' 
                : 'bg-white text-[#6B7A74] border border-[#2D4B3E]/10'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 市场洞察 */}
      {marketInsight && (
        <div className="bg-[#C5A267]/10 rounded-xl p-3">
          <div className="flex items-start gap-2">
            <TrendingUp className="w-4 h-4 text-[#C5A267] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[#6B7A74] leading-relaxed">{marketInsight}</p>
          </div>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="bg-[#B85C5C]/10 rounded-xl p-3 text-[#B85C5C] text-sm">
          {error}
        </div>
      )}

      {/* 加载状态 - 移动端优化 */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#2D4B3E]/5 p-4 animate-pulse">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-[#F4F6F0] rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-[#F4F6F0] rounded w-full" />
                  <div className="h-3 bg-[#F4F6F0] rounded w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 空状态 */}
      {!loading && topics.length === 0 && !error && (
        <div className="bg-white rounded-2xl p-10 text-center">
          <div className="inline-block p-4 bg-[#F4F6F0] rounded-2xl text-[#9BA8A3] mb-4">
            <Wand2 size={32} />
          </div>
          <h3 className="text-base font-semibold text-[#2D4B3E] mb-1">等待灵感召唤</h3>
          <p className="text-sm text-[#9BA8A3]">
            输入选题方向或选择分类
          </p>
        </div>
      )}

      {/* 话题列表 - 移动端单列 */}
      {!loading && topics.length > 0 && (
        <div className="space-y-3">
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
    <div className="bg-white rounded-2xl border border-[#2D4B3E]/5 shadow-sm p-4">
      {/* 头部 */}
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-semibold text-xs shrink-0 ${
          rank <= 3 ? 'bg-[#2D4B3E] text-white' : 'bg-[#F4F6F0] text-[#6B7A74]'
        }`}>
          {rank}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-[#1A2421] text-sm leading-snug mb-1.5">{topic.title}</h3>
          <div className="flex items-center gap-2 text-xs text-[#9BA8A3] flex-wrap">
            <span className="px-1.5 py-0.5 bg-[#F4F6F0] rounded text-[#6B7A74]">{topic.category}</span>
            <span className={`flex items-center gap-0.5 ${heatColor}`}>
              <Flame className="w-3 h-3" />
              {topic.heat}
            </span>
            {topic.trend && <span className="text-emerald-600">{topic.trend}</span>}
          </div>
        </div>
        <button 
          onClick={handleCopy} 
          className="p-2 text-[#9BA8A3] hover:text-[#2D4B3E] rounded-lg hover:bg-[#F4F6F0] transition-colors shrink-0"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      {/* 数据指标 - 紧凑版 */}
      <div className="flex items-center justify-between bg-[#FDFBF7] rounded-lg p-2.5 mb-3 text-center text-xs">
        <div className="flex-1">
          <div className="text-[#9BA8A3] text-[10px]">曝光</div>
          <div className="font-medium text-[#2D4B3E]">{topic.estimatedViews || '-'}</div>
        </div>
        <div className="w-px h-6 bg-[#2D4B3E]/5" />
        <div className="flex-1">
          <div className="text-[#9BA8A3] text-[10px]">互动率</div>
          <div className="font-medium text-[#2D4B3E]">{topic.engagement || '-'}</div>
        </div>
        <div className="w-px h-6 bg-[#2D4B3E]/5" />
        <div className="flex-1">
          <div className="text-[#9BA8A3] text-[10px]">竞争</div>
          <div className="font-medium text-[#2D4B3E]">{topic.competitorCount || '-'}</div>
        </div>
      </div>

      {/* 标签 */}
      {topic.tags && topic.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {topic.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="px-2 py-0.5 bg-white border border-[#2D4B3E]/10 rounded text-[10px] text-[#6B7A74]">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* 推荐理由 */}
      {topic.reason && (
        <div className="flex items-start gap-2 p-2 bg-[#2D4B3E]/5 rounded-lg mb-2">
          <Sparkles className="w-3.5 h-3.5 text-[#2D4B3E] flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-[#2D4B3E] leading-relaxed">{topic.reason}</p>
        </div>
      )}

      {/* 展开详情 */}
      <button 
        onClick={() => setExpanded(!expanded)}
        className="text-xs text-[#9BA8A3] hover:text-[#2D4B3E] flex items-center gap-1 transition-colors"
      >
        {expanded ? '收起' : '查看创作建议'}
        <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-[#2D4B3E]/5 space-y-2 text-xs">
          {topic.contentTips && (
            <div className="flex items-start gap-2">
              <Lightbulb className="w-3.5 h-3.5 text-[#C5A267] shrink-0 mt-0.5" />
              <p className="text-[#2D4B3E]">{topic.contentTips}</p>
            </div>
          )}
          {topic.bestPostTime && (
            <div className="flex items-center gap-2 text-[#6B7A74]">
              <Clock className="w-3.5 h-3.5" />
              <span>最佳发布：{topic.bestPostTime}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
