'use client';

import { useState } from 'react';
import { Sparkles, Loader2, Copy, Check, Lightbulb, TrendingUp, Star, Clock } from 'lucide-react';

interface Topic {
  title: string;
  tags: string[];
  difficulty: '简单' | '中等' | '复杂';
  potential: '高' | '中' | '低';
  reason: string;
  outline: string[];
}

const categories = [
  { value: '生活方式', label: '生活方式' },
  { value: '好物分享', label: '好物分享' },
  { value: '好物', label: '好物种草' },
  { value: '生活', label: '生活日常' },
];

const seasons = [
  { value: '通用', label: '通用' },
  { value: '春夏', label: '春夏' },
  { value: '秋冬', label: '秋冬' },
];

const difficultyConfig = {
  '简单': { color: 'bg-[#4A6741]/10 text-[#4A6741]' },
  '中等': { color: 'bg-[#B8860B]/10 text-[#B8860B]' },
  '复杂': { color: 'bg-[#C75050]/10 text-[#C75050]' },
};

const potentialConfig = {
  '高': { color: 'bg-[#4A6741]/10 text-[#4A6741]', stars: 3 },
  '中': { color: 'bg-[#B8860B]/10 text-[#B8860B]', stars: 2 },
  '低': { color: 'bg-[#7D8A80]/10 text-[#7D8A80]', stars: 1 },
};

export default function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [category, setCategory] = useState('生活方式');
  const [season, setSeason] = useState('通用');
  const [error, setError] = useState<string | null>(null);
  
  const generateTopics = async () => {
    setIsGenerating(true);
    setError(null);
    setTopics([]);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 55000);
      
      const res = await fetch('/api/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, season }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.error || `请求失败 (${res.status})`);
        return;
      }
      
      const data = await res.json();
      
      if (data.error && !data.topics?.length) {
        setError(data.error);
        return;
      }
      
      if (data.topics && Array.isArray(data.topics) && data.topics.length > 0) {
        setTopics(data.topics);
      } else if (data.raw) {
        setError('AI返回格式异常，请重试');
      } else {
        setError('未能生成选题，请重试');
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setError('请求超时，AI正在思考中，请稍后重试');
      } else {
        setError('网络错误，请检查连接后重试');
      }
    } finally {
      setIsGenerating(false);
    }
  };
  
  const copyTitle = (title: string, index: number) => {
    navigator.clipboard.writeText(title);
    setCopiedId(index);
    setTimeout(() => setCopiedId(null), 2000);
  };
  
  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#2D3A30] mb-2 flex items-center gap-2">
          <Lightbulb size={24} className="text-[#4A6741]" />
          AI话题推荐
        </h1>
        <p className="text-[#7D8A80]">基于账号定位，智能生成爆款选题</p>
      </div>
      
      {/* Controls */}
      <div className="bg-white rounded-xl p-6 border border-[#E2E8D5] mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-[#2D3A30] mb-2">
              内容类型
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 border border-[#E2E8D5] rounded-lg focus:ring-2 focus:ring-[#4A6741]/20 focus:border-[#4A6741] bg-white text-[#2D3A30]"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
          
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-[#2D3A30] mb-2">
              季节
            </label>
            <select
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              className="w-full px-4 py-2.5 border border-[#E2E8D5] rounded-lg focus:ring-2 focus:ring-[#4A6741]/20 focus:border-[#4A6741] bg-white text-[#2D3A30]"
            >
              {seasons.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          
          <button
            onClick={generateTopics}
            disabled={isGenerating}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#4A6741] text-white rounded-lg hover:bg-[#3A5233] transition-colors disabled:opacity-50 font-medium shadow-lg"
          >
            {isGenerating ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                生成选题
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Error */}
      {error && (
        <div className="bg-[#C75050]/10 border border-[#C75050]/20 text-[#C75050] px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      {/* Topics Grid */}
      {topics.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topics.map((topic, index) => {
            const difficulty = difficultyConfig[topic.difficulty] || difficultyConfig['中等'];
            const potential = potentialConfig[topic.potential] || potentialConfig['中'];
            
            return (
              <div 
                key={index}
                className="bg-white rounded-xl p-5 border border-[#E2E8D5] hover:shadow-md transition-shadow"
              >
                {/* Badges */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${difficulty.color}`}>
                    <Clock size={12} />
                    {topic.difficulty}
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${potential.color}`}>
                    <TrendingUp size={12} />
                    爆款潜力: {topic.potential}
                  </span>
                  <div className="flex items-center gap-0.5 ml-auto">
                    {Array.from({ length: potential.stars }).map((_, i) => (
                      <Star key={i} size={14} className="text-[#B8860B] fill-[#B8860B]" />
                    ))}
                    {Array.from({ length: 3 - potential.stars }).map((_, i) => (
                      <Star key={i} size={14} className="text-[#E2E8D5]" />
                    ))}
                  </div>
                </div>
                
                {/* Title */}
                <h3 className="font-bold text-[#2D3A30] text-lg mb-3 leading-snug">
                  {topic.title}
                </h3>
                
                {/* Reason */}
                <p className="text-sm text-[#7D8A80] mb-3 bg-[#F4F6F0] rounded-lg p-3 border border-[#E2E8D5]">
                  {topic.reason}
                </p>
                
                {/* Outline */}
                <div className="bg-[#F4F6F0] rounded-lg p-3 mb-3">
                  <p className="text-xs text-[#7D8A80] mb-2 font-medium">内容大纲</p>
                  <ul className="text-sm text-[#2D3A30] space-y-1">
                    {(Array.isArray(topic.outline) ? topic.outline : [topic.outline]).map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[#4A6741] mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {topic.tags.map(tag => (
                    <span key={tag} className="text-xs text-[#7D8A80]">
                      #{tag}
                    </span>
                  ))}
                </div>
                
                {/* Copy Button */}
                <button
                  onClick={() => copyTitle(topic.title, index)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#4A6741] text-white rounded-lg hover:bg-[#3A5233] transition-colors font-medium shadow-lg"
                >
                  {copiedId === index ? (
                    <>
                      <Check size={16} />
                      已复制
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      复制标题
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        !isGenerating && !error && (
          <div className="bg-white rounded-xl p-10 text-center border border-[#E2E8D5]">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#F4F6F0] text-[#9CA89F] mb-4">
              <Lightbulb size={32} />
            </div>
            <p className="text-[#7D8A80]">选择内容类型和季节，生成你的专属选题！</p>
          </div>
        )
      )}
    </div>
  );
}
