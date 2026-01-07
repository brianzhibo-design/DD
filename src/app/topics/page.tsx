'use client';

import { useState } from 'react';
import { 
  Lightbulb, 
  TrendingUp, 
  Star, 
  Wand2, 
  ChevronRight, 
  Loader2,
  Sparkles,
  Copy,
  Check,
  ArrowUpRight
} from 'lucide-react';
import { getTopicSuggestions, Topic } from '@/lib/api';

const categories = ['生活方式', '好物分享', '萌宠', '美食', '家居', '旅行'];

export default function TopicsPage() {
  const [selectedCategory, setSelectedCategory] = useState('生活方式');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const generateTopics = async () => {
    setLoading(true);
    setTopics([]);
    try {
      const result = await getTopicSuggestions(selectedCategory);
      if (result && result.length > 0) {
        setTopics(result);
      } else {
        alert('未能获取推荐话题，请稍后再试');
      }
    } catch (error) {
      console.error('获取话题失败:', error);
      alert('获取话题失败，请检查网络连接');
    }
    setLoading(false);
  };

  const copyTitle = (title: string, index: number) => {
    navigator.clipboard.writeText(title);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-serif text-[#2D4B3E] mb-2">话题推荐</h1>
        <p className="text-[#6B7A74]">AI驱动的爆款选题生成器，精准匹配流量趋势</p>
      </div>

      {/* Category Selection */}
      <div className="bg-white border border-[#2D4B3E]/5 rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-8">
        <div className="flex items-center gap-2 mb-6">
          <Lightbulb className="w-5 h-5 text-[#2D4B3E]" />
          <h2 className="font-bold text-[#2D4B3E] font-serif">选择内容赛道</h2>
        </div>
        
        <div className="flex flex-wrap gap-3 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-3 rounded-xl font-bold text-sm transition-all ${
                selectedCategory === cat 
                  ? 'bg-[#2D4B3E] text-white shadow-lg shadow-[#2D4B3E]/20' 
                  : 'bg-[#F4F6F0] text-[#6B7A74] hover:text-[#2D4B3E] hover:bg-[#E8EDE5]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <button
          onClick={generateTopics}
          disabled={loading}
          className="w-full bg-[#2D4B3E] hover:bg-[#3D6654] text-white font-bold py-4 px-8 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-[#2D4B3E]/20 disabled:opacity-50 active:scale-[0.98]"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              AI正在为你挖掘爆款话题...
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5" />
              生成爆款选题
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {topics.length > 0 && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-[#2D4B3E] font-serif flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#C5A267]" />
              为你推荐 {topics.length} 个选题
            </h2>
            <span className="text-xs text-[#6B7A74] font-bold uppercase tracking-wider bg-[#F4F6F0] px-3 py-1.5 rounded-lg">
              {selectedCategory}
            </span>
          </div>
          
          {topics.map((topic, index) => (
            <div 
              key={index} 
              className="bg-white border border-[#2D4B3E]/5 rounded-[2rem] p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(45,75,62,0.1)] transition-all hover:translate-y-[-4px] group"
            >
              <div className="flex items-start justify-between gap-4 mb-5">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-[#2D4B3E] mb-2 group-hover:text-[#426B5A] transition-colors font-serif">
                    {topic.title}
                  </h3>
                  <p className="text-[#6B7A74] text-sm leading-relaxed">{topic.reason}</p>
                </div>
                <button
                  onClick={() => copyTitle(topic.title, index)}
                  className="shrink-0 p-3 rounded-xl bg-[#F4F6F0] text-[#6B7A74] hover:bg-[#2D4B3E] hover:text-white transition-colors"
                  title="复制标题"
                >
                  {copiedIndex === index ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-5">
                {topic.tags?.map((tag, i) => (
                  <span 
                    key={i} 
                    className="text-xs px-3 py-1.5 rounded-lg bg-[#F4F6F0] text-[#2D4B3E] font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              
              <div className="flex items-center gap-6 text-xs text-[#6B7A74] pt-5 border-t border-[#2D4B3E]/5">
                <div className="flex items-center gap-1.5">
                  <TrendingUp size={14} className="text-[#2D4B3E]" />
                  <span className="font-bold">{topic.potential}</span>
                </div>
                {topic.difficulty && (
                  <div className="flex items-center gap-1.5">
                    <Star size={14} className="text-[#C5A267]" />
                    <span className="font-bold">难度: {topic.difficulty}</span>
                  </div>
                )}
                <ChevronRight size={14} className="ml-auto text-[#9BA8A3]" />
              </div>
              
              {topic.outline && (
                <div className="mt-5 p-4 bg-[#FDFBF7] rounded-xl border border-[#C5A267]/20">
                  <p className="text-sm text-[#C5A267] flex items-start gap-2">
                    <Sparkles size={14} className="shrink-0 mt-0.5" />
                    <span><strong>创作提示：</strong>{topic.outline}</span>
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {topics.length === 0 && !loading && (
        <div className="bg-white border border-[#2D4B3E]/5 rounded-[2rem] p-16 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="inline-block p-5 bg-[#F4F6F0] rounded-2xl text-[#9BA8A3] mb-5">
            <Wand2 size={44} />
          </div>
          <h3 className="text-xl font-bold text-[#2D4B3E] mb-2 font-serif">等待你的灵感召唤</h3>
          <p className="text-[#6B7A74] max-w-sm mx-auto">
            选择一个内容赛道，点击上方按钮，AI将为你生成精准匹配的爆款选题
          </p>
        </div>
      )}
    </div>
  );
}
