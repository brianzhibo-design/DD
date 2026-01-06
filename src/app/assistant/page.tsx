'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, User, BarChart3, Lightbulb, ShoppingBag, Cat, AlertCircle } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isError?: boolean
}

const quickPrompts = [
  { icon: BarChart3, label: '分析数据表现', color: 'text-blue-500', bgColor: 'bg-blue-50 hover:bg-blue-100' },
  { icon: Lightbulb, label: '推荐爆款选题', color: 'text-amber-500', bgColor: 'bg-amber-50 hover:bg-amber-100' },
  { icon: ShoppingBag, label: '优化标题文案', color: 'text-pink-500', bgColor: 'bg-pink-50 hover:bg-pink-100' },
  { icon: Cat, label: '猫咪出镜创意', color: 'text-purple-500', bgColor: 'bg-purple-50 hover:bg-purple-100' },
]

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

  // 自动调整输入框高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '24px'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
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
    <div className="flex flex-col h-[100dvh] bg-gradient-to-b from-slate-50 to-slate-100">
      {/* 顶部标题栏 - Soft UI Evolution */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between flex-shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-11 md:h-11 rounded-2xl bg-gradient-to-br from-pink-400 via-pink-500 to-purple-500 flex items-center justify-center shadow-lg shadow-pink-200/40">
            <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <div>
            <h1 className="font-semibold md:font-bold text-slate-800 text-base md:text-lg">AI运营助手</h1>
            <p className="text-[11px] md:text-xs text-slate-400">基于历史数据的智能建议</p>
          </div>
        </div>
        <div className="text-[11px] md:text-xs text-emerald-600 flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1.5 rounded-full font-medium">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" aria-hidden="true"></span>
          在线
        </div>
      </header>

      {/* 消息列表区域 */}
      <main className="flex-1 overflow-y-auto px-3 md:px-6 py-4 md:py-6 space-y-4" role="log" aria-live="polite">
        {/* 欢迎消息 */}
        {messages.length === 0 && (
          <div className="text-center py-6 md:py-12 max-w-md mx-auto">
            <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 md:mb-5 rounded-3xl bg-gradient-to-br from-pink-400 via-pink-500 to-purple-500 flex items-center justify-center shadow-xl shadow-pink-200/40">
              <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-white" />
            </div>
            <h2 className="text-lg md:text-xl font-bold text-slate-800 mb-1.5">你好，岛岛!</h2>
            <p className="text-slate-500 text-sm mb-5 md:mb-6">我是你的AI运营助手，可以帮你：</p>
            
            {/* 快捷操作按钮 - 改进的触摸目标 */}
            <div className="grid grid-cols-2 gap-2 md:gap-3">
              {quickPrompts.map(item => (
                <button 
                  key={item.label}
                  onClick={() => handleSend(item.label)}
                  disabled={loading}
                  className={`flex items-center gap-2 px-3 md:px-4 py-3 md:py-3.5 ${item.bgColor} rounded-xl text-sm text-slate-700 font-medium transition-all border border-transparent hover:border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]`}
                  aria-label={`快速提问: ${item.label}`}
                >
                  <item.icon size={18} className={item.color} aria-hidden="true" />
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 消息气泡 */}
        {messages.map((msg, index) => (
          <div key={msg.id}>
            {/* 时间戳 */}
            {shouldShowTime(msg, messages[index - 1]) && (
              <div className="text-center text-[11px] text-slate-400 my-3 md:my-4 select-none font-medium">
                {formatTime(msg.timestamp)}
              </div>
            )}
            
            {/* 消息行 */}
            <div className={`flex items-end gap-2 md:gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {/* 头像 */}
              <div 
                className={`w-8 h-8 md:w-9 md:h-9 rounded-xl md:rounded-2xl flex-shrink-0 flex items-center justify-center shadow-md ${
                  msg.role === 'assistant' 
                    ? msg.isError 
                      ? 'bg-gradient-to-br from-red-400 to-red-500'
                      : 'bg-gradient-to-br from-pink-400 to-purple-500' 
                    : 'bg-gradient-to-br from-blue-400 to-cyan-500'
                }`}
                aria-hidden="true"
              >
                {msg.role === 'assistant' 
                  ? msg.isError 
                    ? <AlertCircle className="w-4 h-4 text-white" />
                    : <Sparkles className="w-4 h-4 text-white" />
                  : <User className="w-4 h-4 text-white" />
                }
              </div>
              
              {/* 气泡 - 改进的颜色对比度 */}
              <div 
                className={`max-w-[80%] md:max-w-[75%] px-3.5 md:px-4 py-2.5 md:py-3 ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-2xl rounded-br-lg shadow-md shadow-pink-200/30'
                    : msg.isError
                      ? 'bg-red-50 text-red-700 rounded-2xl rounded-bl-lg border border-red-100'
                      : 'bg-white text-slate-700 rounded-2xl rounded-bl-lg shadow-md shadow-slate-100/50 border border-slate-100'
                }`}
              >
                <p className="text-[13px] md:text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              </div>
            </div>
          </div>
        ))}

        {/* 加载动画 - 仅用于加载指示 */}
        {loading && (
          <div className="flex items-end gap-2 md:gap-3" role="status" aria-label="正在思考">
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl md:rounded-2xl bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center shadow-md" aria-hidden="true">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-lg shadow-md shadow-slate-100/50 border border-slate-100">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-pink-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-pink-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-pink-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
            <span className="sr-only">AI正在思考中...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* 底部输入区域 - 改进的无障碍访问 */}
      <footer className="bg-white/95 backdrop-blur-md border-t border-slate-100 px-3 md:px-6 py-3 md:py-4 flex-shrink-0 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        <div className="flex items-end gap-2 md:gap-3 max-w-3xl mx-auto">
          {/* 输入框容器 */}
          <div className="flex-1 bg-slate-100/80 rounded-2xl px-4 py-2.5 md:py-3 focus-within:ring-2 focus-within:ring-pink-300 focus-within:ring-offset-1 focus-within:bg-white transition-all border border-transparent focus-within:border-pink-200">
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
              className="w-full bg-transparent resize-none outline-none text-sm md:text-base text-slate-700 placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ minHeight: '24px', maxHeight: '120px' }}
              aria-describedby="chat-hint"
            />
          </div>
          <p id="chat-hint" className="sr-only">按 Enter 发送消息，Shift+Enter 换行</p>
          
          {/* 发送按钮 - 改进的无障碍访问 */}
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            aria-label="发送消息"
            className={`p-3 md:p-3.5 rounded-xl md:rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:ring-offset-2 ${
              input.trim() && !loading
                ? 'bg-gradient-to-br from-pink-500 to-pink-600 text-white shadow-lg shadow-pink-200/40 hover:shadow-xl hover:shadow-pink-200/50 active:scale-95'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </footer>
    </div>
  )
}
