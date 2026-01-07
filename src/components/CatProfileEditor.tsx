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
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="sticky top-0 p-4 border-b border-[#E2E8D5] bg-[#F4F6F0] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CatIcon size={24} className="text-[#4A6741]" />
            <h3 className="font-bold text-lg text-[#2D3A30]">编辑 {cat.name} 的档案</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-lg">
            <X size={20} className="text-[#7D8A80]" />
          </button>
        </div>
        
        <div className="p-4">
          {/* 模式切换 */}
          <div className="flex gap-2 mb-4">
            <button 
              onClick={() => setMode('form')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                mode === 'form' 
                  ? 'bg-[#4A6741] text-white shadow-md' 
                  : 'bg-[#F4F6F0] text-[#7D8A80] hover:bg-[#E2E8D5]'
              }`}
            >
              <FileText size={16} />
              表单录入
            </button>
            <button 
              onClick={() => setMode('chat')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                mode === 'chat' 
                  ? 'bg-[#4A6741] text-white shadow-md' 
                  : 'bg-[#F4F6F0] text-[#7D8A80] hover:bg-[#E2E8D5]'
              }`}
            >
              <MessageSquare size={16} />
              AI对话录入
            </button>
          </div>

          {mode === 'form' ? (
            <div className="space-y-4">
              {/* 头像上传 */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg bg-[#F4F6F0]">
                    {formData.avatar ? (
                      <img 
                        src={formData.avatar} 
                        alt={cat.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <CatIcon size={40} className="text-[#4A6741]" />
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 w-8 h-8 bg-[#4A6741] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#3A5233] transition-colors">
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
              <p className="text-center text-xs text-[#7D8A80]">点击相机图标上传头像</p>

              <div>
                <label className="block text-sm font-medium mb-1 text-[#2D3A30]">昵称</label>
                <input 
                  type="text"
                  value={formData.nickname || ''}
                  onChange={e => setFormData({...formData, nickname: e.target.value})}
                  placeholder="如：胖虎、大橘..."
                  className="w-full px-3 py-2 border border-[#E2E8D5] rounded-lg focus:ring-2 focus:ring-[#4A6741]/20 focus:border-[#4A6741] text-[#2D3A30]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-[#2D3A30]">性格特点</label>
                <input 
                  type="text"
                  value={formData.personality || ''}
                  onChange={e => setFormData({...formData, personality: e.target.value})}
                  placeholder="如：高冷、粘人、调皮..."
                  className="w-full px-3 py-2 border border-[#E2E8D5] rounded-lg focus:ring-2 focus:ring-[#4A6741]/20 focus:border-[#4A6741] text-[#2D3A30]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-[#2D3A30]">特征标签（逗号分隔）</label>
                <input 
                  type="text"
                  value={formData.traits?.join(', ') || ''}
                  onChange={e => setFormData({
                    ...formData, 
                    traits: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  })}
                  placeholder="如：爱吃, 怕生, 会握手..."
                  className="w-full px-3 py-2 border border-[#E2E8D5] rounded-lg focus:ring-2 focus:ring-[#4A6741]/20 focus:border-[#4A6741] text-[#2D3A30]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-[#2D3A30]">外貌描述</label>
                <input 
                  type="text"
                  value={formData.appearance || ''}
                  onChange={e => setFormData({...formData, appearance: e.target.value})}
                  placeholder="如：橘猫、长毛、蓝眼睛..."
                  className="w-full px-3 py-2 border border-[#E2E8D5] rounded-lg focus:ring-2 focus:ring-[#4A6741]/20 focus:border-[#4A6741] text-[#2D3A30]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-[#2D3A30]">适合内容类型</label>
                <input 
                  type="text"
                  value={formData.bestContentType || ''}
                  onChange={e => setFormData({...formData, bestContentType: e.target.value})}
                  placeholder="如：适合拍摄氛围感、颜值向内容..."
                  className="w-full px-3 py-2 border border-[#E2E8D5] rounded-lg focus:ring-2 focus:ring-[#4A6741]/20 focus:border-[#4A6741] text-[#2D3A30]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-[#2D3A30]">备注</label>
                <textarea 
                  value={formData.notes || ''}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  placeholder="其他想记录的信息..."
                  className="w-full px-3 py-2 border border-[#E2E8D5] rounded-lg focus:ring-2 focus:ring-[#4A6741]/20 focus:border-[#4A6741] h-20 resize-none text-[#2D3A30]"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-[#F4F6F0] rounded-lg p-3 text-sm text-[#7D8A80] flex items-center gap-2">
                <Lightbulb size={16} className="text-[#B8860B] flex-shrink-0" />
                用自然语言描述 {cat.name} 的特点，AI会自动提取关键信息
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-[#2D3A30]">
                  描述 {cat.name} 的特点
                </label>
                <textarea 
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder={`例如：${cat.name}是我养的第一只猫，特别高冷不太粘人，但是颜值很高很上镜，平时喜欢...`}
                  className="w-full px-3 py-2 border border-[#E2E8D5] rounded-lg focus:ring-2 focus:ring-[#4A6741]/20 focus:border-[#4A6741] h-32 resize-none text-[#2D3A30]"
                />
              </div>
              
              <button 
                onClick={handleAnalyze}
                disabled={analyzing || !chatInput.trim()}
                className="w-full px-4 py-2 bg-[#4A6741] text-white rounded-lg hover:bg-[#3A5233] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                <div className="bg-[#C75050]/10 text-[#C75050] p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {aiSuggestion && (
                <div className="bg-[#4A6741]/10 rounded-lg p-4">
                  <h4 className="font-medium mb-3 text-[#4A6741] flex items-center gap-2">
                    <Sparkles size={16} />
                    AI提取的信息：
                  </h4>
                  <div className="text-sm space-y-2 text-[#2D3A30]">
                    {aiSuggestion.personality && (
                      <p><span className="font-medium">性格：</span>{aiSuggestion.personality}</p>
                    )}
                    {aiSuggestion.traits && aiSuggestion.traits.length > 0 && (
                      <p><span className="font-medium">特征：</span>{aiSuggestion.traits.join(', ')}</p>
                    )}
                    {aiSuggestion.appearance && (
                      <p><span className="font-medium">外貌：</span>{aiSuggestion.appearance}</p>
                    )}
                    {aiSuggestion.bestContentType && (
                      <p><span className="font-medium">适合内容：</span>{aiSuggestion.bestContentType}</p>
                    )}
                    {aiSuggestion.notes && (
                      <p><span className="font-medium">备注：</span>{aiSuggestion.notes}</p>
                    )}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button 
                      onClick={handleAcceptSuggestion}
                      className="flex-1 px-3 py-2 bg-[#4A6741] text-white rounded-lg text-sm hover:bg-[#3A5233] flex items-center justify-center gap-1"
                    >
                      <Check size={14} />
                      确认采用
                    </button>
                    <button 
                      onClick={() => setAiSuggestion(null)}
                      className="flex-1 px-3 py-2 bg-[#E2E8D5] text-[#2D3A30] rounded-lg text-sm hover:bg-[#D5DCC8] flex items-center justify-center gap-1"
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
          <div className="mt-6 pt-4 border-t border-[#E2E8D5]">
            <button 
              onClick={handleSave}
              className="w-full py-3 bg-[#4A6741] text-white rounded-xl font-medium hover:bg-[#3A5233] transition-colors flex items-center justify-center gap-2"
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
