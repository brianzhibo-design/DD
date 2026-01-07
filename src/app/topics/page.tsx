'use client';

import { useState } from 'react';
import { Sparkles, Loader2, Copy, Check, Lightbulb, Info, TrendingUp, Star, Clock } from 'lucide-react';

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
  '简单': { color: 'bg-emerald-50 text-emerald-600', icon: '' },
  '中等': { color: 'bg-amber-50 text-amber-600', icon: '' },
  '复杂': { color: 'bg-red-50 text-red-600', icon: '' },
};

const potentialConfig = {
  '高': { color: 'bg-slate-900 text-white', stars: 3 },
  '中': { color: 'bg-slate-100 text-slate-700', stars: 2 },
  '低': { color: 'bg-slate-50 text-slate-500', stars: 1 },
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
    setTopics([]); // 清空之前的结果
    
    try {
      console.log('[Topics] Requesting topics for:', { category, season });
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 55000); // 55秒超时
      
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
      console.log('[Topics] API Response:', data);
      
      if (data.error && !data.topics?.length) {
        setError(data.error);
        return;
      }
      
      if (data.topics && Array.isArray(data.topics) && data.topics.length > 0) {
        setTopics(data.topics);
      } else if (data.raw) {
        // 如果有原始内容但解析失败
        setError('AI返回格式异常，请重试');
        console.log('[Topics] Raw content:', data.raw);
      } else {
        setError('未能生成选题，请重试');
      }
    } catch (err) {
      console.error('[Topics] Generate error:', err);
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
          <Lightbulb size={22} className="text-slate-600" />
          AI话题推荐
        </h1>
        <p className="text-slate-500 text-sm">基于账号定位，智能生成爆款选题</p>
      </div>
      
      {/* Controls */}
      <div className="bg-white rounded-xl p-5 border border-slate-100 mb-5">
        <div className="flex flex-wrap items-end gap-4">
          {/* Category Select */}
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-medium text-slate-500 mb-2">
              内容类型
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400 bg-white text-sm"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
          
          {/* Season Select */}
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-medium text-slate-500 mb-2">
              季节
            </label>
            <select
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400 bg-white text-sm"
            >
              {seasons.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          
          {/* Generate Button */}
          <button
            onClick={generateTopics}
            disabled={isGenerating}
            className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-black text-white rounded-lg transition-colors disabled:opacity-50 font-medium shadow-lg shadow-slate-200"
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
      
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
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
                className="bg-white rounded-xl p-5 border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all"
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
                      <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                    ))}
                    {Array.from({ length: 3 - potential.stars }).map((_, i) => (
                      <Star key={i} size={14} className="text-slate-200" />
                    ))}
                  </div>
                </div>
                
                {/* Title */}
                <h3 className="font-bold text-slate-900 text-lg mb-3 leading-snug">
                  {topic.title}
                </h3>
                
                {/* Reason */}
                <p className="text-sm text-slate-600 mb-3 bg-slate-50 rounded-lg p-3 border border-slate-100">
                  {topic.reason}
                </p>
                
                {/* Outline */}
                <div className="bg-slate-50 rounded-lg p-3 mb-3">
                  <p className="text-xs text-slate-500 mb-2 font-medium">内容大纲</p>
                  <ul className="text-sm text-slate-600 space-y-1">
                    {(Array.isArray(topic.outline) ? topic.outline : [topic.outline]).map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-slate-400 mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {topic.tags.map(tag => (
                    <span key={tag} className="text-xs text-slate-400">
                      #{tag}
                    </span>
                  ))}
                </div>
                
                {/* Actions */}
                <button
                  onClick={() => copyTitle(topic.title, index)}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                >
                  {copiedId === index ? (
                    <>
                      <Check size={14} className="text-green-500" />
                      已复制
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      复制标题
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl p-12 shadow-sm border text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
            <Lightbulb size={40} className="text-amber-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            {isGenerating ? '正在生成选题...' : '选择类型，生成爆款选题'}
          </h3>
          <p className="text-gray-500 mb-6">
            {isGenerating 
              ? 'AI正在根据你的账号定位生成内容建议'
              : '选择内容类型和季节，点击生成按钮'}
          </p>
        </div>
      )}
      
      {/* Tips */}
      <div className="mt-8 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-100">
        <h3 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
          <Info size={18} />
          选题使用建议
        </h3>
        <ul className="text-sm text-amber-700 space-y-2">
          <li>• 建议每周生成一次，保持内容新鲜度</li>
          <li>• 可以把选题复制后在AI助手中进一步优化标题和内容</li>
          <li>• 高潜力选题优先制作，简单难度的可以快速产出</li>
          <li>• 结合当前热点和季节选择合适的类型</li>
        </ul>
      </div>
    </div>
  );
}
