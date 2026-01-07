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
      console.log('[Cats] Loaded from DB:', dbCats);
      
      if (dbCats.length > 0) {
        // 合并数据库数据和初始数据
        const mergedCats = initialCats.map(cat => {
          const dbCat = dbCats.find((c: CatRecord) => c.name === cat.name);
          if (dbCat) {
            return {
              ...cat,
              dbId: dbCat.id, // 保存数据库ID
              personality: dbCat.personality || cat.personality,
              appearance: dbCat.color || cat.appearance,
              notes: dbCat.breed || cat.notes, // breed -> notes (品种)
              avatar: dbCat.avatar || cat.avatar,
            };
          }
          return cat;
        });
        setCats(mergedCats);
      }
    } catch (error) {
      console.error('[Cats] Failed to load:', error);
    }
    setLoading(false);
  };
  
  const handleSaveCat = async (updatedCat: Cat) => {
    try {
      // 使用保存的数据库ID，或重新查找
      let dbId = (updatedCat as Cat & { dbId?: string }).dbId;
      
      if (!dbId) {
        const dbCats = await getCats();
        const dbCat = dbCats.find((c: CatRecord) => c.name === updatedCat.name);
        dbId = dbCat?.id;
      }
      
      if (dbId) {
        // 更新数据库中存在的字段
        const result = await updateCat(dbId, {
          personality: updatedCat.personality || '',
          color: updatedCat.appearance || '',
          breed: updatedCat.notes || '', // notes -> breed (品种)
          avatar: updatedCat.avatar || '',
        });
        console.log('[Cats] Update result:', result);
      } else {
        console.error('[Cats] No DB record found for:', updatedCat.name);
      }
      
      // 更新本地状态
      setCats(prev => prev.map(c => c.id === updatedCat.id ? updatedCat : c));
      setEditingCat(null);
    } catch (error) {
      console.error('[Cats] Failed to save:', error);
    }
  };
  
  const completedCount = cats.filter(c => c.personality || (c.traits && c.traits.length > 0)).length;
  
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-slate-400" />
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
          <CatIcon size={22} className="text-slate-600" />
          六只猫档案
        </h1>
        <p className="text-slate-500 text-sm">管理猫咪信息，偶尔出镜增加记忆点（5公1母，多为长毛猫）</p>
      </div>
      
      {/* Progress */}
      <div className="bg-white rounded-xl p-5 border border-slate-100 mb-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-slate-700">档案完善进度</span>
          <span className="text-sm text-slate-500">{completedCount}/6 只已完善</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-slate-900 rounded-full transition-all"
            style={{ width: `${(completedCount / 6) * 100}%` }}
          />
        </div>
        {completedCount < 6 && (
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <Lightbulb size={14} className="text-slate-400" />
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
      <div className="mt-6 bg-slate-50 rounded-xl p-5 border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2 text-sm">
          <Sparkles size={16} className="text-slate-600" />
          猫咪出镜建议
        </h3>
        <ul className="text-sm text-slate-600 space-y-2">
          <li>• 猫咪是加分项，偶尔出镜增加记忆点，不要喧宾夺主</li>
          <li>• 可以拍摄"居家日常+猫咪"、"生活vlog"等内容</li>
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
