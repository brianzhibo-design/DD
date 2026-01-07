'use client';

import { useState, useEffect } from 'react';
import { 
  Cat, 
  Edit3, 
  Save, 
  X, 
  Loader2, 
  Upload,
  Sparkles,
  Star,
  ArrowUpRight
} from 'lucide-react';
import { getCats, updateCat, CatRecord } from '@/lib/db';
import { initialCats, Cat as CatType } from '@/data/cats';

type EditingCat = CatType;

export default function CatsPage() {
  const [cats, setCats] = useState<CatType[]>(initialCats);
  const [loading, setLoading] = useState(true);
  const [editingCat, setEditingCat] = useState<EditingCat | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    loadCats();
  }, []);

  const loadCats = async () => {
    try {
      const dbCats = await getCats();
      if (dbCats && dbCats.length > 0) {
        const mergedCats = initialCats.map(cat => {
          const dbCat = dbCats.find(dc => dc.name === cat.name);
          if (dbCat) {
            return {
              ...cat,
              personality: dbCat.personality || cat.personality,
              gender: (dbCat.gender as '公' | '母') || cat.gender,
              appearance: dbCat.color || cat.appearance,
              avatar: dbCat.avatar || cat.avatar,
            };
          }
          return cat;
        });
        setCats(mergedCats);
      }
    } catch (error) {
      console.error('加载猫咪失败:', error);
    }
    setLoading(false);
  };

  const handleEdit = (cat: CatType) => {
    setEditingCat({ ...cat, id: cat.id });
  };

  const handleSave = async () => {
    if (!editingCat) return;
    setSaving(true);
    
    try {
      const updateData: Partial<CatRecord> = {
        name: editingCat.name,
        gender: editingCat.gender,
        color: editingCat.appearance,
        personality: editingCat.personality,
        avatar: editingCat.avatar,
      };
      
      const success = await updateCat(String(editingCat.id), updateData);
      
      if (success) {
        setCats(cats.map(c => c.id === editingCat.id ? editingCat : c));
        setEditingCat(null);
      } else {
        alert('保存失败');
      }
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败');
    }
    setSaving(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingCat) return;

    if (!file.type.startsWith('image/')) {
      alert('请上传图片文件');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('图片大小不能超过2MB');
      return;
    }

    setUploadingAvatar(true);

    try {
      const img = new Image();
      const canvas = document.createElement('canvas');
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          const MAX_SIZE = 200;
          let { width, height } = img;
          
          if (width > height) {
            if (width > MAX_SIZE) {
              height = (height * MAX_SIZE) / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width = (width * MAX_SIZE) / height;
              height = MAX_SIZE;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          const base64 = canvas.toDataURL('image/jpeg', 0.8);
          setEditingCat({ ...editingCat, avatar: base64 });
          resolve();
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
      });
    } catch (error) {
      console.error('上传失败:', error);
      alert('上传失败');
    }

    setUploadingAvatar(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#2D4B3E] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-serif text-[#2D4B3E] mb-2">猫咪档案馆</h1>
        <p className="text-[#6B7A74]">记录6只小可爱的日常，偶尔出镜增加记忆点</p>
      </div>

      {/* Stats Overview */}
      <div className="bg-[#2D4B3E] rounded-[2rem] p-8 mb-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/5 to-transparent" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3 text-white/70">
            <Cat size={18} />
            <span className="text-sm font-medium">档案统计</span>
          </div>
          <div className="grid grid-cols-3 gap-8">
            <div>
              <p className="text-3xl font-black font-serif">{cats.length}</p>
              <p className="text-sm text-white/60 mt-1">总猫咪数</p>
            </div>
            <div>
              <p className="text-3xl font-black font-serif">{cats.filter(c => c.gender === '公').length}</p>
              <p className="text-sm text-white/60 mt-1">公猫</p>
            </div>
            <div>
              <p className="text-3xl font-black font-serif">{cats.filter(c => c.gender === '母').length}</p>
              <p className="text-sm text-white/60 mt-1">母猫</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cat Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cats.map((cat, index) => (
          <div 
            key={cat.id} 
            className="bg-white border border-[#2D4B3E]/5 rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(45,75,62,0.1)] transition-all hover:translate-y-[-4px] group"
          >
            {/* Avatar Area */}
            <div className="h-40 bg-gradient-to-br from-[#F4F6F0] to-[#E8EDE5] flex items-center justify-center relative">
              {cat.avatar ? (
                <img 
                  src={cat.avatar} 
                  alt={cat.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg">
                  <Cat size={32} className="text-[#2D4B3E]" />
                </div>
              )}
              
              {/* Edit Button */}
              <button
                onClick={() => handleEdit(cat)}
                className="absolute top-4 right-4 p-2.5 bg-white/90 rounded-xl text-[#2D4B3E] hover:bg-[#2D4B3E] hover:text-white transition-all opacity-0 group-hover:opacity-100"
              >
                <Edit3 size={16} />
              </button>
            </div>
            
            {/* Info */}
            <div className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-lg font-bold text-[#2D4B3E] font-serif">{cat.name}</h3>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                  cat.gender === '公' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'
                }`}>
                  {cat.gender}
                </span>
              </div>
              
              <div className="space-y-2 text-sm text-[#6B7A74]">
                <p className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2D4B3E]/30" />
                  {cat.appearance}
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C5A267]/50" />
                  {cat.personality}
                </p>
              </div>
              
              {cat.notes && (
                <p className="mt-4 pt-4 border-t border-[#2D4B3E]/5 text-xs text-[#6B7A74] flex items-start gap-2">
                  <Star size={12} className="text-[#C5A267] shrink-0 mt-0.5" />
                  {cat.notes}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingCat && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(45,75,62,0.2)] w-full max-w-md p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold text-[#2D4B3E] font-serif">编辑猫咪档案</h3>
              <button 
                onClick={() => setEditingCat(null)} 
                className="text-[#6B7A74] hover:text-[#2D4B3E]"
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Avatar Upload */}
            <div className="flex justify-center mb-8">
              <label className="relative cursor-pointer group">
                <div className={`w-28 h-28 rounded-2xl overflow-hidden border-2 border-dashed transition-colors ${
                  uploadingAvatar ? 'border-[#6B7A74] bg-[#F4F6F0]' : 'border-[#2D4B3E]/20 hover:border-[#2D4B3E]/40'
                } flex items-center justify-center bg-[#F4F6F0]`}>
                  {uploadingAvatar ? (
                    <Loader2 className="w-6 h-6 text-[#2D4B3E] animate-spin" />
                  ) : editingCat.avatar ? (
                    <img src={editingCat.avatar} alt={editingCat.name} className="w-full h-full object-cover" />
                  ) : (
                    <Upload size={24} className="text-[#6B7A74]" />
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  disabled={uploadingAvatar}
                />
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-[#6B7A74] bg-white px-2 py-0.5 rounded-md shadow whitespace-nowrap">
                  点击上传头像
                </div>
              </label>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-[#2D4B3E] mb-2">名字</label>
                <input
                  type="text"
                  value={editingCat.name}
                  onChange={(e) => setEditingCat({ ...editingCat, name: e.target.value })}
                  className="w-full px-4 py-3 border-none rounded-xl focus:ring-2 focus:ring-[#2D4B3E]/10 bg-[#F4F6F0] text-[#2D4B3E]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-[#2D4B3E] mb-2">性别</label>
                <div className="flex gap-3">
                  {['公', '母'].map(g => (
                    <button
                      key={g}
                      onClick={() => setEditingCat({ ...editingCat, gender: g as '公' | '母' })}
                      className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                        editingCat.gender === g 
                          ? 'bg-[#2D4B3E] text-white shadow-lg shadow-[#2D4B3E]/20' 
                          : 'bg-[#F4F6F0] text-[#6B7A74] hover:bg-[#E8EDE5]'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-[#2D4B3E] mb-2">外观特征</label>
                <input
                  type="text"
                  value={editingCat.appearance}
                  onChange={(e) => setEditingCat({ ...editingCat, appearance: e.target.value })}
                  className="w-full px-4 py-3 border-none rounded-xl focus:ring-2 focus:ring-[#2D4B3E]/10 bg-[#F4F6F0] text-[#2D4B3E]"
                  placeholder="例：橘白相间，胖乎乎的"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-[#2D4B3E] mb-2">性格特点</label>
                <input
                  type="text"
                  value={editingCat.personality}
                  onChange={(e) => setEditingCat({ ...editingCat, personality: e.target.value })}
                  className="w-full px-4 py-3 border-none rounded-xl focus:ring-2 focus:ring-[#2D4B3E]/10 bg-[#F4F6F0] text-[#2D4B3E]"
                  placeholder="例：粘人，爱撒娇"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setEditingCat(null)}
                className="flex-1 bg-[#F4F6F0] text-[#6B7A74] py-4 rounded-xl hover:bg-[#E8EDE5] transition-colors font-bold"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-[#2D4B3E] text-white py-4 rounded-xl hover:bg-[#3D6654] transition-colors disabled:opacity-50 font-bold shadow-lg shadow-[#2D4B3E]/20 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={18} />}
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
