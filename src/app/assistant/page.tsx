'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Sparkles,
  TrendingUp,
  Lightbulb,
  BarChart3,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { sendChat } from '@/lib/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const quickActions = [
  { label: '内容策略建议', icon: Lightbulb, prompt: '请根据我的账号定位，给我一些近期的内容创作方向建议' },
  { label: '数据分析解读', icon: BarChart3, prompt: '帮我分析一下最近的数据趋势，有什么需要改进的地方' },
  { label: '爆款标题生成', icon: TrendingUp, prompt: '帮我生成5个适合我账号风格的爆款标题' },
  { label: '运营节奏规划', icon: Sparkles, prompt: '帮我制定一个本周的内容发布计划' },
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await sendChat(messageText);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.response || '抱歉，出现了一些问题',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('发送失败:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '抱歉，发生了错误。请稍后重试。',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] lg:h-[calc(100vh-120px)] max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 pb-6 border-b border-[#2D4B3E]/5 mb-6">
        <Link 
          href="/" 
          className="p-2.5 rounded-xl bg-[#F4F6F0] text-[#6B7A74] hover:bg-[#2D4B3E] hover:text-white transition-all lg:hidden"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#2D4B3E] flex items-center justify-center shadow-lg shadow-[#2D4B3E]/20">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#2D4B3E] font-serif">小岛运营助手</h1>
            <p className="text-xs text-[#6B7A74]">基于账号数据的智能建议</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-2">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="w-20 h-20 rounded-2xl bg-[#F4F6F0] flex items-center justify-center mb-6">
              <Sparkles className="w-8 h-8 text-[#2D4B3E]" />
            </div>
            <h2 className="text-xl font-bold text-[#2D4B3E] mb-3 font-serif">有什么可以帮助你的？</h2>
            <p className="text-[#6B7A74] text-sm max-w-md mb-8">
              我已了解你的账号数据和运营目标，随时为你提供个性化建议
            </p>
            
            <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
              {quickActions.map((action, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(action.prompt)}
                  className="flex items-center gap-3 p-4 bg-white border border-[#2D4B3E]/5 rounded-xl text-left hover:shadow-md hover:translate-y-[-2px] transition-all group"
                >
                  <div className="p-2.5 rounded-lg bg-[#F4F6F0] text-[#2D4B3E] group-hover:bg-[#2D4B3E] group-hover:text-white transition-colors">
                    <action.icon size={16} />
                  </div>
                  <span className="text-sm font-medium text-[#2D4B3E]">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                  message.role === 'user' 
                    ? 'bg-[#C5A267] text-white' 
                    : 'bg-[#2D4B3E] text-white'
                }`}>
                  {message.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                </div>
                
                <div className={`flex-1 max-w-[80%] ${message.role === 'user' ? 'text-right' : ''}`}>
                  <div className={`inline-block p-5 rounded-2xl ${
                    message.role === 'user' 
                      ? 'bg-[#2D4B3E] text-white rounded-tr-md' 
                      : 'bg-white border border-[#2D4B3E]/5 text-[#2D4B3E] rounded-tl-md shadow-sm'
                  }`}>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                  </div>
                  <p className={`text-[10px] text-[#6B7A74] mt-2 ${message.role === 'user' ? 'text-right' : ''}`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#2D4B3E] flex items-center justify-center">
                  <Bot size={18} className="text-white" />
                </div>
                <div className="bg-white border border-[#2D4B3E]/5 p-5 rounded-2xl rounded-tl-md shadow-sm">
                  <div className="flex items-center gap-2">
                    <Loader2 size={16} className="text-[#2D4B3E] animate-spin" />
                    <span className="text-sm text-[#6B7A74]">正在思考...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="pt-4 border-t border-[#2D4B3E]/5 mt-4 mb-16 lg:mb-0">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入你的问题..."
              rows={1}
              className="w-full px-5 py-4 bg-[#F4F6F0] border-none rounded-2xl resize-none focus:ring-2 focus:ring-[#2D4B3E]/10 outline-none text-[#2D4B3E] placeholder:text-[#9BA8A3] max-h-32"
              style={{ minHeight: '56px' }}
            />
          </div>
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="p-4 bg-[#2D4B3E] text-white rounded-2xl hover:bg-[#3D6654] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[#2D4B3E]/20 active:scale-95"
          >
            {loading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
