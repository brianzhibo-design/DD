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
    <div className="bg-white rounded-xl p-5 transition-all hover:shadow-md border border-slate-100 hover:border-slate-200">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {cat.avatar ? (
            <img 
              src={cat.avatar} 
              alt={cat.name}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-sm"
            />
          ) : (
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-slate-100">
              <Cat size={22} className="text-slate-500" />
            </div>
          )}
          <div>
            <h3 className="font-semibold text-slate-900">
              {cat.name}
            </h3>
            <p className="text-xs text-slate-500">
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
            className="p-2 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <Edit2 size={14} className="text-slate-400" />
          </button>
        )}
      </div>
      
      {/* 性格标签 */}
      {cat.personality && (
        <div className="mb-3">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-slate-900 text-white">
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
              className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600"
            >
              {trait}
            </span>
          ))}
        </div>
      )}
      
      {/* 未完善提示 */}
      {!hasProfile && (
        <div className="mb-3 p-3 bg-slate-50 rounded-lg text-center">
          <p className="text-sm text-slate-500 flex items-center justify-center gap-1">
            <FileText size={14} />
            点击编辑完善猫咪档案
          </p>
        </div>
      )}
      
      {/* 出镜统计 */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <Camera size={12} />
          已出镜 {appearances} 次
        </span>
        
        {hasProfile && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 hover:text-slate-700 transition-colors"
          >
            {expanded ? '收起' : '详情'}
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        )}
      </div>
      
      {/* 展开详情 */}
      {expanded && hasProfile && (
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
          {cat.appearance && (
            <div>
              <p className="text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
                <Palette size={12} />
                外貌特征
              </p>
              <p className="text-sm text-slate-600">{cat.appearance}</p>
            </div>
          )}
          
          {cat.bestContentType && (
            <div>
              <p className="text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
                <Sparkles size={12} />
                适合内容类型
              </p>
              <p className="text-sm text-slate-600">{cat.bestContentType}</p>
            </div>
          )}
          
          {cat.contentTags && cat.contentTags.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
                <Tag size={12} />
                推荐标签
              </p>
              <div className="flex flex-wrap gap-1">
                {cat.contentTags.map(tag => (
                  <span key={tag} className="text-xs text-slate-400">#{tag}</span>
                ))}
              </div>
            </div>
          )}
          
          {cat.notes && (
            <div>
              <p className="text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
                <FileText size={12} />
                备注
              </p>
              <p className="text-sm text-slate-600">{cat.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
