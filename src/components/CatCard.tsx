'use client';

import { Cat as CatType } from '@/data/cats';
import { useState } from 'react';
import { ChevronDown, ChevronUp, Edit2, Cat, Camera, Palette, Sparkles, Tag, FileText } from 'lucide-react';

interface CatCardProps {
  cat: CatType;
  appearances?: number;
  onEdit?: () => void;
}

export default function CatCard({ cat, appearances = 0, onEdit }: CatCardProps) {
  const [expanded, setExpanded] = useState(false);
  
  const hasProfile = cat.personality || (cat.traits && cat.traits.length > 0);
  
  return (
    <div 
      className={`${cat.bgColor} rounded-2xl p-5 transition-all hover:shadow-lg border border-white/50`}
    >
      {/* 头部 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div 
            className="w-14 h-14 rounded-full flex items-center justify-center shadow-sm"
            style={{ backgroundColor: cat.color + '30' }}
          >
            <Cat size={24} style={{ color: cat.color }} />
          </div>
          <div>
            <h3 className="font-bold text-lg" style={{ color: cat.color }}>
              {cat.name}
            </h3>
            <p className="text-xs text-gray-500">
              {cat.gender} · {cat.appearance}
            </p>
          </div>
        </div>
        
        {onEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
          >
            <Edit2 size={16} className="text-gray-500" />
          </button>
        )}
      </div>
      
      {/* 性格标签 */}
      {cat.personality && (
        <div className="mb-3">
          <span 
            className="inline-block px-3 py-1 rounded-full text-sm font-medium text-white"
            style={{ backgroundColor: cat.color }}
          >
            {cat.personality}
          </span>
        </div>
      )}
      
      {/* 特点标签 */}
      {cat.traits && cat.traits.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {cat.traits.map(trait => (
            <span 
              key={trait}
              className="text-xs px-2 py-1 rounded-full bg-white/60 text-gray-600"
            >
              {trait}
            </span>
          ))}
        </div>
      )}
      
      {/* 未完善提示 */}
      {!hasProfile && (
        <div className="mb-3 p-3 bg-white/50 rounded-lg text-center">
          <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
            <FileText size={14} />
            点击编辑完善猫咪档案
          </p>
        </div>
      )}
      
      {/* 出镜统计 */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span className="flex items-center gap-1">
          <Camera size={14} />
          已出镜 {appearances} 次
        </span>
        
        {hasProfile && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 hover:text-gray-700"
          >
            {expanded ? '收起' : '详情'}
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        )}
      </div>
      
      {/* 展开详情 */}
      {expanded && hasProfile && (
        <div className="mt-4 pt-4 border-t border-white/50 space-y-3">
          {cat.appearance && (
            <div>
              <p className="text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Palette size={12} />
                外貌特征
              </p>
              <p className="text-sm text-gray-600">{cat.appearance}</p>
            </div>
          )}
          
          {cat.bestContentType && (
            <div>
              <p className="text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Sparkles size={12} />
                适合内容类型
              </p>
              <p className="text-sm text-gray-600">{cat.bestContentType}</p>
            </div>
          )}
          
          {cat.contentTags && cat.contentTags.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Tag size={12} />
                推荐标签
              </p>
              <div className="flex flex-wrap gap-1">
                {cat.contentTags.map(tag => (
                  <span key={tag} className="text-xs text-gray-500">#{tag}</span>
                ))}
              </div>
            </div>
          )}
          
          {cat.notes && (
            <div>
              <p className="text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                <FileText size={12} />
                备注
              </p>
              <p className="text-sm text-gray-600">{cat.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
