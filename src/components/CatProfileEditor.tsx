'use client';

import { Cat } from '@/data/cats';
import { useState } from 'react';
import { X, Sparkles, Loader2, FileText, MessageSquare, Lightbulb, Check, XCircle, Save, Cat as CatIcon, Camera } from 'lucide-react';

interface CatProfileEditorProps {
  cat: Cat;
  onSave: (updatedCat: Cat) => void;
  onClose: () => void;
}

interface AISuggestion {
  personality?: string;
  traits?: string[];
  appearance?: string;
  notes?: string;
  bestContentType?: string;
}

export default function CatProfileEditor({ cat, onSave, onClose }: CatProfileEditorProps) {
  const [mode, setMode] = useState<'form' | 'chat'>('form');
  const [formData, setFormData] = useState<Cat>(cat);
  const [chatInput, setChatInput] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<AISuggestion | null>(null);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!chatInput.trim()) return;
    setAnalyzing(true);
    setError('');
    
    try {
      const res = await fetch('/api/analyze-cat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          description: chatInput,
          catName: cat.name 
        }),
      });
      
      const data = await res.json();
      
      if (data.success && data.data) {
        setAiSuggestion(data.data);
      } else {
        setError(data.error || '分析失败，请重试');
      }
    } catch {
      setError('网络错误，请重试');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAcceptSuggestion = () => {
    if (aiSuggestion) {
      setFormData(prev => ({
        ...prev,
        personality: aiSuggestion.personality || prev.personality,
        traits: aiSuggestion.traits?.length ? aiSuggestion.traits : prev.traits,
        appearance: aiSuggestion.appearance || prev.appearance,
        notes: aiSuggestion.notes || prev.notes,
        bestContentType: aiSuggestion.bestContentType || prev.bestContentType,
      }));
      setAiSuggestion(null);
      setChatInput('');
      setMode('form');
    }
  };

  const handleSave = () => {
    onSave({
      ...formData,
      updatedAt: new Date(),
    });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('请上传图片文件');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('图片大小不能超过2MB');
      return;
    }

    try {
      const base64 = await compressImage(file, 200, 200);
      setFormData(prev => ({ ...prev, avatar: base64 }));
    } catch {
      setError('图片处理失败，请重试');
    }
  };

  const compressImage = (file: File, maxWidth: number, maxHeight: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;

          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[2rem] w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-[0_20px_50px_rgba(45,75,62,0.2)]">
        {/* 头部 */}
        <div className="sticky top-0 p-5 border-b border-[#2D4B3E]/5 bg-[#F7F3EE] rounded-t-[2rem] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CatIcon size={24} className="text-[#2D4B3E]" />
            <h3 className="font-bold text-lg text-[#2D4B3E]">编辑 {cat.name} 的档案</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-xl">
            <X size={20} className="text-[#6B7A74]" />
          </button>
        </div>
        
        <div className="p-6">
          {/* 模式切换 */}
          <div className="flex gap-2 mb-6">
            <button 
              onClick={() => setMode('form')}
              className={`flex-1 px-5 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                mode === 'form' 
                  ? 'bg-[#2D4B3E] text-white shadow-lg shadow-[#2D4B3E]/20' 
                  : 'bg-[#F4F6F0] text-[#6B7A74] hover:bg-[#2D4B3E]/5'
              }`}
            >
              <FileText size={16} />
              表单录入
            </button>
            <button 
              onClick={() => setMode('chat')}
              className={`flex-1 px-5 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                mode === 'chat' 
                  ? 'bg-[#2D4B3E] text-white shadow-lg shadow-[#2D4B3E]/20' 
                  : 'bg-[#F4F6F0] text-[#6B7A74] hover:bg-[#2D4B3E]/5'
              }`}
            >
              <MessageSquare size={16} />
              AI对话录入
            </button>
          </div>

          {mode === 'form' ? (
            <div className="space-y-5">
              {/* 头像上传 */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-lg bg-[#F4F6F0]">
                    {formData.avatar ? (
                      <img 
                        src={formData.avatar} 
                        alt={cat.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <CatIcon size={40} className="text-[#2D4B3E]" />
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 w-8 h-8 bg-[#2D4B3E] rounded-xl flex items-center justify-center cursor-pointer hover:bg-[#3D6654] transition-colors shadow-lg">
                    <Camera size={16} className="text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              <p className="text-center text-xs text-[#6B7A74]">点击相机图标上传头像</p>

              <div>
                <label className="block text-sm font-bold mb-2 text-[#2D4B3E]">昵称</label>
                <input 
                  type="text"
                  value={formData.nickname || ''}
                  onChange={e => setFormData({...formData, nickname: e.target.value})}
                  placeholder="如：胖虎、大橘..."
                  className="w-full px-5 py-3 border-none rounded-xl focus:ring-2 focus:ring-[#2D4B3E]/10 text-[#2D4B3E] bg-[#F4F6F0]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-2 text-[#2D4B3E]">性格特点</label>
                <input 
                  type="text"
                  value={formData.personality || ''}
                  onChange={e => setFormData({...formData, personality: e.target.value})}
                  placeholder="如：高冷、粘人、调皮..."
                  className="w-full px-5 py-3 border-none rounded-xl focus:ring-2 focus:ring-[#2D4B3E]/10 text-[#2D4B3E] bg-[#F4F6F0]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-2 text-[#2D4B3E]">特征标签（逗号分隔）</label>
                <input 
                  type="text"
                  value={formData.traits?.join(', ') || ''}
                  onChange={e => setFormData({
                    ...formData, 
                    traits: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  })}
                  placeholder="如：爱吃, 怕生, 会握手..."
                  className="w-full px-5 py-3 border-none rounded-xl focus:ring-2 focus:ring-[#2D4B3E]/10 text-[#2D4B3E] bg-[#F4F6F0]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-2 text-[#2D4B3E]">外貌描述</label>
                <input 
                  type="text"
                  value={formData.appearance || ''}
                  onChange={e => setFormData({...formData, appearance: e.target.value})}
                  placeholder="如：橘猫、长毛、蓝眼睛..."
                  className="w-full px-5 py-3 border-none rounded-xl focus:ring-2 focus:ring-[#2D4B3E]/10 text-[#2D4B3E] bg-[#F4F6F0]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-2 text-[#2D4B3E]">适合内容类型</label>
                <input 
                  type="text"
                  value={formData.bestContentType || ''}
                  onChange={e => setFormData({...formData, bestContentType: e.target.value})}
                  placeholder="如：适合拍摄氛围感、颜值向内容..."
                  className="w-full px-5 py-3 border-none rounded-xl focus:ring-2 focus:ring-[#2D4B3E]/10 text-[#2D4B3E] bg-[#F4F6F0]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-2 text-[#2D4B3E]">备注</label>
                <textarea 
                  value={formData.notes || ''}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  placeholder="其他想记录的信息..."
                  className="w-full px-5 py-3 border-none rounded-xl focus:ring-2 focus:ring-[#2D4B3E]/10 h-24 resize-none text-[#2D4B3E] bg-[#F4F6F0]"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="bg-[#FDFBF7] rounded-xl p-4 text-sm text-[#6B7A74] flex items-center gap-3 border border-[#2D4B3E]/5">
                <Lightbulb size={18} className="text-[#C5A267] flex-shrink-0" />
                用自然语言描述 {cat.name} 的特点，AI会自动提取关键信息
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-2 text-[#2D4B3E]">
                  描述 {cat.name} 的特点
                </label>
                <textarea 
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder={`例如：${cat.name}是我养的第一只猫，特别高冷不太粘人，但是颜值很高很上镜，平时喜欢...`}
                  className="w-full px-5 py-3 border-none rounded-xl focus:ring-2 focus:ring-[#2D4B3E]/10 h-36 resize-none text-[#2D4B3E] bg-[#F4F6F0]"
                />
              </div>
              
              <button 
                onClick={handleAnalyze}
                disabled={analyzing || !chatInput.trim()}
                className="w-full px-5 py-3 bg-[#2D4B3E] text-white rounded-xl hover:bg-[#3D6654] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-bold shadow-lg shadow-[#2D4B3E]/20"
              >
                {analyzing ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    分析中...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    AI分析提取
                  </>
                )}
              </button>

              {error && (
                <div className="bg-[#B85C5C]/5 text-[#B85C5C] p-4 rounded-xl text-sm">
                  {error}
                </div>
              )}

              {aiSuggestion && (
                <div className="bg-[#2D4B3E]/5 rounded-xl p-5">
                  <h4 className="font-bold mb-4 text-[#2D4B3E] flex items-center gap-2">
                    <Sparkles size={16} className="text-[#C5A267]" />
                    AI提取的信息：
                  </h4>
                  <div className="text-sm space-y-2 text-[#2D4B3E]">
                    {aiSuggestion.personality && (
                      <p><span className="font-bold">性格：</span>{aiSuggestion.personality}</p>
                    )}
                    {aiSuggestion.traits && aiSuggestion.traits.length > 0 && (
                      <p><span className="font-bold">特征：</span>{aiSuggestion.traits.join(', ')}</p>
                    )}
                    {aiSuggestion.appearance && (
                      <p><span className="font-bold">外貌：</span>{aiSuggestion.appearance}</p>
                    )}
                    {aiSuggestion.bestContentType && (
                      <p><span className="font-bold">适合内容：</span>{aiSuggestion.bestContentType}</p>
                    )}
                    {aiSuggestion.notes && (
                      <p><span className="font-bold">备注：</span>{aiSuggestion.notes}</p>
                    )}
                  </div>
                  <div className="flex gap-3 mt-5">
                    <button 
                      onClick={handleAcceptSuggestion}
                      className="flex-1 px-4 py-2.5 bg-[#2D4B3E] text-white rounded-xl text-sm hover:bg-[#3D6654] flex items-center justify-center gap-1 font-bold"
                    >
                      <Check size={14} />
                      确认采用
                    </button>
                    <button 
                      onClick={() => setAiSuggestion(null)}
                      className="flex-1 px-4 py-2.5 bg-[#F4F6F0] text-[#2D4B3E] rounded-xl text-sm hover:bg-[#2D4B3E]/10 flex items-center justify-center gap-1 font-bold"
                    >
                      <XCircle size={14} />
                      重新描述
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 保存按钮 */}
          <div className="mt-8 pt-5 border-t border-[#2D4B3E]/5">
            <button 
              onClick={handleSave}
              className="w-full py-4 bg-[#2D4B3E] text-white rounded-xl font-bold hover:bg-[#3D6654] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#2D4B3E]/20"
            >
              <Save size={18} />
              保存档案
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
