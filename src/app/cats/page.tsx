'use client';

import { useState, useEffect } from 'react';
import { Cat as CatIcon, Lightbulb, Sparkles, Loader2 } from 'lucide-react';
import { initialCats, Cat } from '@/data/cats';
import { getCats, updateCat } from '@/lib/db';
import { CatRecord } from '@/lib/supabase';
import CatCard from '@/components/CatCard';
import CatProfileEditor from '@/components/CatProfileEditor';

export default function CatsPage() {
  const [cats, setCats] = useState<Cat[]>(initialCats);
  const [loading, setLoading] = useState(true);
  const [editingCat, setEditingCat] = useState<Cat | null>(null);
  
  useEffect(() => {
    loadCats();
  }, []);

  const loadCats = async () => {
    setLoading(true);
    try {
      const dbCats = await getCats();
      if (dbCats.length > 0) {
        // 合并数据库数据和初始数据
        const mergedCats = initialCats.map(cat => {
          const dbCat = dbCats.find((c: CatRecord) => c.name === cat.name);
          if (dbCat) {
            return {
              ...cat,
              personality: dbCat.personality || cat.personality,
              traits: dbCat.traits || cat.traits,
              appearance: dbCat.color || cat.appearance,
              notes: dbCat.breed || cat.notes,
            };
          }
          return cat;
        });
        setCats(mergedCats);
      }
    } catch (error) {
      console.error('Failed to load cats:', error);
    }
    setLoading(false);
  };
  
  const handleSaveCat = async (updatedCat: Cat) => {
    try {
      // 查找对应的数据库记录
      const dbCats = await getCats();
      const dbCat = dbCats.find((c: CatRecord) => c.name === updatedCat.name);
      
      if (dbCat && dbCat.id) {
        await updateCat(dbCat.id, {
          personality: updatedCat.personality,
          traits: updatedCat.traits,
          color: updatedCat.appearance,
        });
      }
      
      // 更新本地状态
      setCats(prev => prev.map(c => c.id === updatedCat.id ? updatedCat : c));
      setEditingCat(null);
    } catch (error) {
      console.error('Failed to save cat:', error);
    }
  };
  
  const completedCount = cats.filter(c => c.personality || (c.traits && c.traits.length > 0)).length;
  
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-pink-500" />
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <CatIcon size={24} className="text-pink-500" />
          六只猫档案
        </h1>
        <p className="text-gray-500">管理猫咪信息，偶尔出镜增加记忆点（5公1母，多为长毛猫）</p>
      </div>
      
      {/* Progress */}
      <div className="bg-white rounded-xl p-5 shadow-sm border mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">档案完善进度</span>
          <span className="text-sm text-gray-500">{completedCount}/6 只已完善</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full transition-all"
            style={{ width: `${(completedCount / 6) * 100}%` }}
          />
        </div>
        {completedCount < 6 && (
          <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
            <Lightbulb size={14} className="text-amber-400" />
            点击猫咪卡片的编辑按钮，可以手动填写或使用AI对话录入信息
          </p>
        )}
      </div>
      
      {/* Cat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cats.map(cat => (
          <CatCard
            key={cat.id}
            cat={cat}
            appearances={0}
            onEdit={() => setEditingCat(cat)}
          />
        ))}
      </div>
      
      {/* Tips */}
      <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
        <h3 className="font-bold text-purple-800 mb-3 flex items-center gap-2">
          <Sparkles size={18} className="text-purple-500" />
          猫咪出镜建议
        </h3>
        <ul className="text-sm text-purple-700 space-y-2">
          <li>• 猫咪是加分项，偶尔出镜增加记忆点，不要喧宾夺主</li>
          <li>• 可以拍摄"居家穿搭+猫咪"、"氛围感生活vlog"等内容</li>
          <li>• 熊崽是缅因猫体型大，可以做对比内容亮点</li>
          <li>• 达令是唯一母猫，可以突出"大姐"人设</li>
        </ul>
      </div>
      
      {/* Editor Modal */}
      {editingCat && (
        <CatProfileEditor
          cat={editingCat}
          onSave={handleSaveCat}
          onClose={() => setEditingCat(null)}
        />
      )}
    </div>
  );
}
