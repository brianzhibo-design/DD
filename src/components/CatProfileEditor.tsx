'use client';

import { Cat } from '@/data/cats';
import { useState } from 'react';
import { X, Sparkles, Loader2, FileText, MessageSquare, Lightbulb, Check, XCircle, Save, Cat as CatIcon } from 'lucide-react';

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

  // AI对话分析
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

  // 确认AI建议
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
      setMode('form'); // 切换到表单模式以便用户确认
    }
  };

  const handleSave = () => {
    onSave({
      ...formData,
      updatedAt: new Date(),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div 
          className="sticky top-0 p-4 border-b flex items-center justify-between"
          style={{ backgroundColor: cat.color + '20' }}
        >
          <div className="flex items-center gap-2">
            <CatIcon size={24} style={{ color: cat.color }} />
            <h3 className="font-bold text-lg">编辑 {cat.name} 的档案</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-lg">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4">
          {/* 模式切换 */}
          <div className="flex gap-2 mb-4">
            <button 
              onClick={() => setMode('form')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                mode === 'form' 
                  ? 'text-white shadow-md' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={mode === 'form' ? { backgroundColor: cat.color } : {}}
            >
              <FileText size={16} />
              表单录入
            </button>
            <button 
              onClick={() => setMode('chat')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                mode === 'chat' 
                  ? 'text-white shadow-md' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={mode === 'chat' ? { backgroundColor: cat.color } : {}}
            >
              <MessageSquare size={16} />
              AI对话录入
            </button>
          </div>

          {mode === 'form' ? (
            /* 表单模式 */
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">昵称</label>
                <input 
                  type="text"
                  value={formData.nickname || ''}
                  onChange={e => setFormData({...formData, nickname: e.target.value})}
                  placeholder="如：胖虎、大橘..."
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-300"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">性格特点</label>
                <input 
                  type="text"
                  value={formData.personality || ''}
                  onChange={e => setFormData({...formData, personality: e.target.value})}
                  placeholder="如：高冷、粘人、调皮..."
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-300"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">特征标签（逗号分隔）</label>
                <input 
                  type="text"
                  value={formData.traits?.join(', ') || ''}
                  onChange={e => setFormData({
                    ...formData, 
                    traits: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  })}
                  placeholder="如：爱吃, 怕生, 会握手..."
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-300"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">外貌描述</label>
                <input 
                  type="text"
                  value={formData.appearance || ''}
                  onChange={e => setFormData({...formData, appearance: e.target.value})}
                  placeholder="如：橘猫、长毛、蓝眼睛..."
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-300"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">适合内容类型</label>
                <input 
                  type="text"
                  value={formData.bestContentType || ''}
                  onChange={e => setFormData({...formData, bestContentType: e.target.value})}
                  placeholder="如：适合拍摄氛围感、颜值向内容..."
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-300"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">备注</label>
                <textarea 
                  value={formData.notes || ''}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  placeholder="其他想记录的信息..."
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-300 h-20 resize-none"
                />
              </div>
            </div>
          ) : (
            /* AI对话模式 */
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 flex items-center gap-2">
                <Lightbulb size={16} className="text-amber-500 flex-shrink-0" />
                用自然语言描述 {cat.name} 的特点，AI会自动提取关键信息
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  描述 {cat.name} 的特点
                </label>
                <textarea 
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder={`例如：${cat.name}是我养的第一只猫，特别高冷不太粘人，但是颜值很高很上镜，平时喜欢...`}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-300 focus:border-purple-300 h-32 resize-none"
                />
              </div>
              
              <button 
                onClick={handleAnalyze}
                disabled={analyzing || !chatInput.trim()}
                className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* AI分析结果 */}
              {aiSuggestion && (
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-medium mb-3 text-purple-800 flex items-center gap-2">
                    <Sparkles size={16} />
                    AI提取的信息：
                  </h4>
                  <div className="text-sm space-y-2 text-gray-700">
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
                      className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 flex items-center justify-center gap-1"
                    >
                      <Check size={14} />
                      确认采用
                    </button>
                    <button 
                      onClick={() => setAiSuggestion(null)}
                      className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 flex items-center justify-center gap-1"
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
          <div className="mt-6 pt-4 border-t">
            <button 
              onClick={handleSave}
              className="w-full py-3 text-white rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              style={{ backgroundColor: cat.color }}
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

