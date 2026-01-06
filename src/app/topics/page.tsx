'use client';

import { useState } from 'react';
import { Sparkles, Loader2, Copy, Check, Cat, ShoppingBag, Home, Shirt, Lightbulb, Palette, Info } from 'lucide-react';
import { getAnalyticsContext, getCatAppearanceContext, getCatProfilesContext } from '@/lib/storage';

interface Topic {
  title: string;
  type: 'outfit' | 'makeup' | 'product' | 'lifestyle' | 'cat';
  cats: string[];
  outline: string;
  tags: string[];
}

const typeConfig = {
  outfit: { label: '穿搭', icon: Shirt, color: 'bg-rose-100 text-rose-700', iconColor: 'text-rose-500' },
  makeup: { label: '妆容', icon: Palette, color: 'bg-pink-100 text-pink-700', iconColor: 'text-pink-500' },
  product: { label: '好物', icon: ShoppingBag, color: 'bg-amber-100 text-amber-700', iconColor: 'text-amber-500' },
  lifestyle: { label: '生活', icon: Home, color: 'bg-purple-100 text-purple-700', iconColor: 'text-purple-500' },
  cat: { label: '猫咪', icon: Cat, color: 'bg-blue-100 text-blue-700', iconColor: 'text-blue-500' },
};

export default function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>('all');
  
  const generateTopics = async () => {
    setIsGenerating(true);
    
    try {
      const context = `
运营数据：
${getAnalyticsContext()}

猫咪出镜情况：
${getCatAppearanceContext()}

猫咪档案：
${getCatProfilesContext()}
      `;
      
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `根据以下数据，为小红书账号"小离岛岛"（御姐风穿搭博主）生成10个内容选题。

要求：
1. 核心定位：御姐风穿搭 × 氛围感美妆 × 精致生活
2. 内容配比：穿搭OOTD约40%、氛围感妆容约25%、好物种草约20%、生活氛围约15%（猫咪可偶尔出镜）
3. 风格要求：御姐、气质、高级感，不要甜腻
4. 结合当前季节和热点
5. 标题要有吸引力，符合小红书风格

请用JSON数组格式返回，每个选题包含：
{
  "title": "完整的笔记标题",
  "type": "outfit或makeup或product或lifestyle或cat",
  "cats": ["如果有猫咪出镜，填写猫咪名字，否则为空数组"],
  "outline": "内容大纲，3-5点，用换行分隔",
  "tags": ["标签1", "标签2", "标签3"]
}

只返回JSON数组，不要其他内容。`,
          context
        }),
      });
      
      const data = await res.json();
      
      // 解析JSON
      const jsonMatch = data.response?.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setTopics(parsed);
      }
    } catch (error) {
      console.error('Generate error:', error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const copyTitle = (title: string, index: number) => {
    navigator.clipboard.writeText(title);
    setCopiedId(index);
    setTimeout(() => setCopiedId(null), 2000);
  };
  
  const filteredTopics = filter === 'all' 
    ? topics 
    : topics.filter(t => t.type === filter);
  
  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            <Lightbulb size={24} className="text-amber-500" />
            AI话题推荐
          </h1>
          <p className="text-gray-500">根据运营数据和猫咪档案，智能生成内容选题</p>
        </div>
        <button
          onClick={generateTopics}
          disabled={isGenerating}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
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
      
      {/* Filter Tabs */}
      {topics.length > 0 && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              filter === 'all' 
                ? 'bg-gray-800 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            全部 ({topics.length})
          </button>
          {Object.entries(typeConfig).map(([key, config]) => {
            const count = topics.filter(t => t.type === key).length;
            if (count === 0) return null;
            const IconComponent = config.icon;
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  filter === key 
                    ? 'bg-gray-800 text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                <IconComponent size={14} />
                {config.label} ({count})
              </button>
            );
          })}
        </div>
      )}
      
      {/* Topics Grid */}
      {filteredTopics.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTopics.map((topic, index) => {
            const config = typeConfig[topic.type] || typeConfig.cat;
            const IconComponent = config.icon;
            
            return (
              <div 
                key={index}
                className="bg-white rounded-xl p-5 shadow-sm border hover:shadow-md transition-shadow"
              >
                {/* Type Badge */}
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${config.color}`}>
                    <IconComponent size={12} />
                    {config.label}
                  </span>
                  {topic.cats.length > 0 && (
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Cat size={12} />
                      出镜: {topic.cats.join(', ')}
                    </span>
                  )}
                </div>
                
                {/* Title */}
                <h3 className="font-bold text-gray-800 text-lg mb-3 leading-snug">
                  {topic.title}
                </h3>
                
                {/* Outline */}
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <p className="text-sm text-gray-600 whitespace-pre-line">
                    {topic.outline}
                  </p>
                </div>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {topic.tags.map(tag => (
                    <span key={tag} className="text-xs text-gray-400">
                      #{tag}
                    </span>
                  ))}
                </div>
                
                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => copyTitle(topic.title, index)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
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
            {isGenerating ? '正在生成选题...' : '还没有生成选题'}
          </h3>
          <p className="text-gray-500 mb-6">
            {isGenerating 
              ? 'AI正在根据你的运营数据和猫咪档案生成内容建议'
              : '点击上方按钮，让AI为你推荐本周内容选题'}
          </p>
          {!isGenerating && (
            <button
              onClick={generateTopics}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:opacity-90 transition-opacity"
            >
              开始生成
            </button>
          )}
        </div>
      )}
      
      {/* Tips */}
      <div className="mt-8 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-100">
        <h3 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
          <Info size={18} />
          选题使用建议
        </h3>
        <ul className="text-sm text-amber-700 space-y-2">
          <li>• 完善猫咪档案信息，AI可以生成更精准的猫咪相关选题</li>
          <li>• 录入运营数据后，AI会根据数据表现优化选题方向</li>
          <li>• 建议每周生成一次，保持内容新鲜度</li>
          <li>• 可以把选题复制后在AI助手中进一步优化标题和内容</li>
        </ul>
      </div>
    </div>
  );
}
