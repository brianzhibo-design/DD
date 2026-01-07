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
    <div className="bg-white border border-[#2D4B3E]/5 rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(45,75,62,0.1)] transition-all">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          {cat.avatar ? (
            <img 
              src={cat.avatar} 
              alt={cat.name}
              className="w-14 h-14 rounded-xl object-cover bg-white p-0.5 border border-[#2D4B3E]/10"
            />
          ) : (
            <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-[#F4F6F0]">
              <Cat size={24} className="text-[#2D4B3E]" />
            </div>
          )}
          <div>
            <h3 className="font-bold text-[#2D4B3E] text-lg">
              {cat.name}
            </h3>
            <p className="text-xs text-[#6B7A74]">
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
            className="p-2.5 hover:bg-[#F4F6F0] rounded-xl transition-colors"
          >
            <Edit2 size={16} className="text-[#6B7A74]" />
          </button>
        )}
      </div>
      
      {/* 性格标签 */}
      {cat.personality && (
        <div className="mb-4">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold bg-[#2D4B3E] text-white">
            {cat.personality}
          </span>
        </div>
      )}
      
      {/* 特点标签 */}
      {cat.traits && cat.traits.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {cat.traits.map(trait => (
            <span 
              key={trait}
              className="text-xs px-3 py-1 rounded-full bg-[#F4F6F0] text-[#2D4B3E] font-medium"
            >
              {trait}
            </span>
          ))}
        </div>
      )}
      
      {/* 未完善提示 */}
      {!hasProfile && (
        <div className="mb-4 p-4 bg-[#FDFBF7] rounded-xl text-center border border-[#2D4B3E]/5">
          <p className="text-sm text-[#6B7A74] flex items-center justify-center gap-2">
            <FileText size={14} />
            点击编辑完善猫咪档案
          </p>
        </div>
      )}
      
      {/* 出镜统计 */}
      <div className="flex items-center justify-between text-xs text-[#6B7A74] font-medium">
        <span className="flex items-center gap-1.5">
          <Camera size={14} />
          已出镜 {appearances} 次
        </span>
        
        {hasProfile && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 hover:text-[#2D4B3E] transition-colors"
          >
            {expanded ? '收起' : '详情'}
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        )}
      </div>
      
      {/* 展开详情 */}
      {expanded && hasProfile && (
        <div className="mt-5 pt-5 border-t border-[#2D4B3E]/5 space-y-4">
          {cat.appearance && (
            <div>
              <p className="text-xs font-bold text-[#2D4B3E] mb-1 flex items-center gap-1">
                <Palette size={12} className="text-[#C5A267]" />
                外貌特征
              </p>
              <p className="text-sm text-[#6B7A74]">{cat.appearance}</p>
            </div>
          )}
          
          {cat.bestContentType && (
            <div>
              <p className="text-xs font-bold text-[#2D4B3E] mb-1 flex items-center gap-1">
                <Sparkles size={12} className="text-[#C5A267]" />
                适合内容类型
              </p>
              <p className="text-sm text-[#6B7A74]">{cat.bestContentType}</p>
            </div>
          )}
          
          {cat.contentTags && cat.contentTags.length > 0 && (
            <div>
              <p className="text-xs font-bold text-[#2D4B3E] mb-1 flex items-center gap-1">
                <Tag size={12} className="text-[#C5A267]" />
                推荐标签
              </p>
              <div className="flex flex-wrap gap-1.5">
                {cat.contentTags.map(tag => (
                  <span key={tag} className="text-xs text-[#6B7A74]">#{tag}</span>
                ))}
              </div>
            </div>
          )}
          
          {cat.notes && (
            <div>
              <p className="text-xs font-bold text-[#2D4B3E] mb-1 flex items-center gap-1">
                <FileText size={12} className="text-[#C5A267]" />
                备注
              </p>
              <p className="text-sm text-[#6B7A74]">{cat.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
