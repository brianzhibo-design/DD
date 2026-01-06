'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Send, Image as ImageIcon, Sparkles, User, BarChart3, Lightbulb, FileText, Cat, AlertCircle } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isError?: boolean
}

// 快捷操作卡片组件
function QuickActionCard({ icon, title, color, onClick, disabled }: {
  icon: React.ReactNode
  title: string
  color: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`group flex items-center gap-3 p-3.5 md:p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-pink-200 focus:ring-offset-1`}
      aria-label={`快速提问: ${title}`}
    >
      <div className={`w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform`}>
        {icon}
      </div>
      <span className="text-[13px] md:text-[14px] font-medium text-slate-700 text-left flex-1">{title}</span>
    </button>
  )
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '24px'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 128) + 'px'
    }
  }, [input])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }

  const shouldShowTime = (current: Message, previous?: Message) => {
    if (!previous) return true
    const diff = current.timestamp.getTime() - previous.timestamp.getTime()
    return diff > 5 * 60 * 1000
  }

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim()
    if (!messageText || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage.content,
          history: messages.map(m => ({ role: m.role, content: m.content }))
        })
      })

      const data = await response.json()

      const extractContent = (d: Record<string, unknown>): string => {
        if (typeof d.message === 'string' && d.message) return d.message
        if (typeof d.response === 'string' && d.response) return d.response
        if (typeof d.content === 'string' && d.content) return d.content
        if (typeof d.error === 'string' && d.error) return `错误: ${d.error}`
        return '抱歉，无法解析响应'
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: extractContent(data),
        timestamp: new Date(),
        isError: !!data.error
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('发送失败:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '网络错误，请检查连接后重试',
        timestamp: new Date(),
        isError: true
      }
      setMessages(prev => [...prev, errorMessage])
    }

    setLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* 顶部标题栏 - 毛玻璃效果 */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-slate-100/80 px-4 md:px-6 py-3 md:py-4 flex-shrink-0">
        <div className="flex items-center gap-3 max-w-3xl mx-auto">
          <div className="relative">
            <div className="w-10 h-10 md:w-11 md:h-11 rounded-2xl bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-400 flex items-center justify-center shadow-lg shadow-purple-200/50">
              <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" aria-label="在线状态"></span>
          </div>
          <div>
            <h1 className="text-[15px] md:text-[16px] font-semibold text-slate-800">AI助手</h1>
            <p className="text-[11px] md:text-[12px] text-slate-400">小离岛岛</p>
          </div>
        </div>
      </header>

      {/* 消息列表区域 */}
      <main className="flex-1 overflow-y-auto px-3 md:px-6 py-4 md:py-6" role="log" aria-live="polite">
        <div className="max-w-3xl mx-auto space-y-4">
          {/* 欢迎区域 - 光晕效果 */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 md:py-16 px-4">
              {/* 头像光晕效果 */}
              <div className="relative mb-5 md:mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-300 to-purple-300 rounded-full blur-2xl opacity-40 scale-150" aria-hidden="true"></div>
                <div className="relative w-18 h-18 md:w-20 md:h-20 rounded-3xl bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-400 flex items-center justify-center shadow-xl shadow-purple-200/40" style={{ width: '72px', height: '72px' }}>
                  <Sparkles className="w-9 h-9 md:w-10 md:h-10 text-white" />
                </div>
              </div>
              
              {/* 欢迎文字 */}
              <h2 className="text-[18px] md:text-[20px] font-semibold text-slate-800 mb-1.5">你好，岛岛!</h2>
              <p className="text-[13px] md:text-[14px] text-slate-500 mb-6 md:mb-8">我是你的AI运营助手，可以帮你：</p>
              
              {/* 快捷操作卡片 - 2x2网格 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 md:gap-3 w-full max-w-md">
                <QuickActionCard 
                  icon={<BarChart3 className="w-4 h-4 md:w-5 md:h-5" />}
                  title="分析数据表现"
                  color="from-blue-400 to-cyan-400"
                  onClick={() => handleSend('帮我分析最近的数据表现')}
                  disabled={loading}
                />
                <QuickActionCard 
                  icon={<Lightbulb className="w-4 h-4 md:w-5 md:h-5" />}
                  title="推荐爆款选题"
                  color="from-amber-400 to-orange-400"
                  onClick={() => handleSend('推荐5个爆款选题')}
                  disabled={loading}
                />
                <QuickActionCard 
                  icon={<FileText className="w-4 h-4 md:w-5 md:h-5" />}
                  title="优化标题文案"
                  color="from-emerald-400 to-teal-400"
                  onClick={() => handleSend('帮我优化标题文案')}
                  disabled={loading}
                />
                <QuickActionCard 
                  icon={<Cat className="w-4 h-4 md:w-5 md:h-5" />}
                  title="猫咪出镜创意"
                  color="from-pink-400 to-rose-400"
                  onClick={() => handleSend('给我一些猫咪出镜的创意')}
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {/* 消息气泡 */}
          {messages.map((msg, index) => (
            <div key={msg.id}>
              {/* 时间戳 */}
              {shouldShowTime(msg, messages[index - 1]) && (
                <div className="text-center text-[11px] text-slate-400 my-4 select-none font-medium">
                  {formatTime(msg.timestamp)}
                </div>
              )}
              
              {/* 消息行 */}
              <div className={`flex items-end gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {/* 头像 - 只有AI显示 */}
                {msg.role === 'assistant' && (
                  <div 
                    className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center shadow-sm ${
                      msg.isError 
                        ? 'bg-gradient-to-br from-red-400 to-red-500'
                        : 'bg-gradient-to-br from-pink-400 to-purple-500'
                    }`}
                    aria-hidden="true"
                  >
                    {msg.isError 
                      ? <AlertCircle className="w-4 h-4 text-white" />
                      : <Sparkles className="w-4 h-4 text-white" />
                    }
                  </div>
                )}
                
                {/* 用户头像 */}
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center shadow-sm bg-gradient-to-br from-blue-400 to-cyan-500" aria-hidden="true">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
                
                {/* 气泡 - 更圆润 */}
                <div 
                  className={`max-w-[80%] md:max-w-[75%] px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-pink-500 to-purple-500 text-white rounded-[20px] rounded-br-lg shadow-lg shadow-pink-200/30'
                      : msg.isError
                        ? 'bg-red-50 text-red-700 rounded-[20px] rounded-bl-lg border border-red-100'
                        : 'bg-white text-slate-700 rounded-[20px] rounded-bl-lg shadow-md shadow-slate-100/60 border border-slate-100/80'
                  }`}
                >
                  <p className="text-[14px] md:text-[15px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            </div>
          ))}

          {/* 打字中动画 */}
          {loading && (
            <div className="flex items-end gap-2.5" role="status" aria-label="AI正在思考">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center shadow-sm" aria-hidden="true">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white px-4 py-3.5 rounded-[20px] rounded-bl-lg shadow-md shadow-slate-100/60 border border-slate-100/80">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-pink-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-purple-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
              <span className="sr-only">AI正在思考中...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* 底部输入区域 - 更现代 */}
      <footer className="sticky bottom-0 bg-white/95 backdrop-blur-xl border-t border-slate-100/80 px-3 md:px-6 py-3 md:py-4 flex-shrink-0 pb-safe shadow-[0_-8px_30px_rgba(0,0,0,0.04)]">
        <div className="flex items-end gap-2 md:gap-3 max-w-3xl mx-auto">
          {/* 附件按钮 */}
          <button 
            className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-200"
            aria-label="添加附件"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
          
          {/* 输入框 */}
          <div className="flex-1 bg-slate-100/80 rounded-2xl px-4 py-2.5 md:py-3 focus-within:ring-2 focus-within:ring-pink-200 focus-within:ring-offset-1 focus-within:bg-white transition-all border border-transparent focus-within:border-pink-200/50">
            <label htmlFor="chat-input" className="sr-only">输入你的问题</label>
            <textarea
              id="chat-input"
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入你的问题..."
              rows={1}
              disabled={loading}
              className="w-full bg-transparent resize-none outline-none text-[14px] md:text-[15px] text-slate-700 placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed leading-relaxed"
              style={{ minHeight: '24px', maxHeight: '128px' }}
            />
          </div>
          
          {/* 发送按钮 */}
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            aria-label="发送消息"
            className={`w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:ring-offset-1 ${
              input.trim() && !loading
                ? 'bg-gradient-to-br from-pink-500 to-purple-500 text-white shadow-lg shadow-pink-200/50 hover:shadow-xl hover:shadow-pink-200/60 active:scale-95'
                : 'bg-slate-100 text-slate-300 cursor-not-allowed'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </footer>
    </div>
  )
}
