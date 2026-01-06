'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, BarChart3, Lightbulb, AlertTriangle, ShoppingBag, Cat, Loader2 } from 'lucide-react';
import { getAnalyticsContext, getCatAppearanceContext, getCatProfilesContext } from '@/lib/storage';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const quickActions = [
  { icon: BarChart3, label: '数据复盘', prompt: '帮我分析当前的运营数据，有什么需要改进的地方？给出具体建议。' },
  { icon: Lightbulb, label: '穿搭选题', prompt: '帮我生成5个御姐风穿搭OOTD的选题，要有吸引力的标题和简单的内容大纲。' },
  { icon: AlertTriangle, label: '风险检查', prompt: '检查当前粉丝画像数据，分析女性粉丝占比是否达到80%以上，有什么风险需要注意？' },
  { icon: ShoppingBag, label: '选品建议', prompt: '根据我的账号定位（御姐风穿搭×氛围感美妆），推荐本周可以带货的服饰、配饰或美妆产品。' },
  { icon: Cat, label: '猫咪加分', prompt: '我想让猫咪偶尔出镜增加记忆点，帮我策划1-2个猫咪+穿搭/生活的内容创意。' },
];

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const getContext = () => {
    const analytics = getAnalyticsContext();
    const catAppearances = getCatAppearanceContext();
    const catProfiles = getCatProfilesContext();
    
    return `${analytics}\n\n${catAppearances}\n\n猫咪档案：\n${catProfiles}`;
  };
  
  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: text,
          context: getContext()
        }),
      });
      
      const data = await res.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message || data.response || data.error || '抱歉，出现了一些问题',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '网络错误，请检查连接后重试',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleQuickAction = (prompt: string) => {
    sendMessage(prompt);
  };
  
  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* 头部 */}
      <div className="p-4 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
        <h2 className="text-white font-bold text-lg flex items-center gap-2">
          <Sparkles size={20} />
          AI运营助手
        </h2>
        <p className="text-white/80 text-sm">基于 Claude Haiku 4.5</p>
      </div>
      
      {/* 快捷操作 */}
      <div className="p-3 border-b bg-gray-50 flex gap-2 overflow-x-auto">
        {quickActions.map(action => (
          <button
            key={action.label}
            onClick={() => handleQuickAction(action.prompt)}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-100 rounded-full text-sm whitespace-nowrap shadow-sm border transition-colors disabled:opacity-50"
          >
            <action.icon size={14} className="text-pink-500" />
            <span className="text-gray-700">{action.label}</span>
          </button>
        ))}
      </div>
      
      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
              <Cat size={32} className="text-pink-500" />
            </div>
            <p className="font-medium">嗨～我是你的AI运营助手</p>
            <p className="text-sm mt-1">问我任何关于小红书运营的问题吧！</p>
            <p className="text-xs mt-3 text-gray-300">点击上方快捷按钮快速提问</p>
          </div>
        )}
        
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-br-md'
                  : 'bg-white text-gray-800 rounded-bl-md border'
              }`}
            >
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
              <p className={`text-xs mt-2 ${msg.role === 'user' ? 'text-white/60' : 'text-gray-400'}`}>
                {msg.timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-2xl rounded-bl-md shadow-sm border">
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-sm">思考中...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* 输入框 */}
      <div className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
            placeholder="输入你的问题..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300 disabled:bg-gray-50"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={isLoading || !input.trim()}
            className="p-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

