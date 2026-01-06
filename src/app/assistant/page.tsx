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

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 滚动到底部
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  // 自动调整输入框高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '20px'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 100) + 'px'
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

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: extractContent(data),
        timestamp: new Date(),
        isError: !!data.error
      }])
    } catch (error) {
      console.error('发送失败:', error)
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '网络错误，请检查连接后重试',
        timestamp: new Date(),
        isError: true
      }])
    }

    setLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const quickActions = [
    { icon: <BarChart3 className="w-4 h-4" />, text: '分析数据表现', color: 'text-blue-500' },
    { icon: <Lightbulb className="w-4 h-4" />, text: '推荐爆款选题', color: 'text-amber-500' },
    { icon: <FileText className="w-4 h-4" />, text: '优化标题文案', color: 'text-emerald-500' },
    { icon: <Cat className="w-4 h-4" />, text: '猫咪出镜创意', color: 'text-pink-500' },
  ]

  return (
    <div className="flex flex-col h-full min-h-0 bg-gradient-to-b from-slate-50 to-white">
      {/* 顶部标题栏 - 固定高度 */}
      <header className="flex-shrink-0 h-14 md:h-16 bg-white/90 backdrop-blur-lg border-b border-slate-100 px-4 flex items-center gap-3">
        <div className="relative">
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-400 flex items-center justify-center shadow-md shadow-purple-200/40">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white"></span>
        </div>
        <div>
          <h1 className="text-[15px] md:text-[16px] font-semibold text-slate-800">AI助手</h1>
          <p className="text-[11px] md:text-[12px] text-slate-400">小离岛岛</p>
        </div>
      </header>

      {/* 消息区域 - 可滚动，填充剩余空间 */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto overscroll-contain"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="px-3 md:px-4 py-4 space-y-4 max-w-3xl mx-auto">
          {/* 欢迎区域 */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center pt-6 md:pt-12 pb-4">
              {/* 头像光晕效果 */}
              <div className="relative mb-4 md:mb-5">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-300 to-purple-300 rounded-full blur-2xl opacity-30 scale-150"></div>
                <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-400 flex items-center justify-center shadow-xl shadow-purple-200/40">
                  <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-white" />
                </div>
              </div>
              
              <h2 className="text-[17px] md:text-[20px] font-semibold text-slate-800 mb-1">你好，岛岛!</h2>
              <p className="text-[13px] md:text-[14px] text-slate-500 mb-5 md:mb-6">我是你的AI运营助手，可以帮你：</p>
              
              {/* 快捷操作按钮 */}
              <div className="grid grid-cols-2 gap-2 md:gap-3 w-full max-w-sm">
                {quickActions.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(item.text)}
                    disabled={loading}
                    className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-3 bg-white rounded-xl md:rounded-2xl border border-slate-100 text-[13px] md:text-[14px] text-slate-700 font-medium shadow-sm hover:shadow-md hover:border-slate-200 active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    <span className={item.color}>{item.icon}</span>
                    <span className="truncate">{item.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 消息列表 */}
          {messages.map((msg, index) => (
            <div key={msg.id}>
              {/* 时间戳 */}
              {shouldShowTime(msg, messages[index - 1]) && (
                <div className="text-center text-[11px] text-slate-400 my-3 select-none">
                  {formatTime(msg.timestamp)}
                </div>
              )}
              
              {/* 消息行 */}
              <div className={`flex items-end gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {/* 头像 */}
                {msg.role === 'assistant' && (
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                    msg.isError 
                      ? 'bg-gradient-to-br from-red-400 to-red-500'
                      : 'bg-gradient-to-br from-pink-400 to-purple-500'
                  }`}>
                    {msg.isError 
                      ? <AlertCircle className="w-4 h-4 text-white" />
                      : <Sparkles className="w-4 h-4 text-white" />
                    }
                  </div>
                )}
                
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
                
                {/* 气泡 */}
                <div className={`max-w-[78%] md:max-w-[75%] px-3.5 py-2.5 ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-pink-500 to-purple-500 text-white rounded-2xl rounded-br-lg shadow-md shadow-pink-200/30'
                    : msg.isError
                      ? 'bg-red-50 text-red-700 rounded-2xl rounded-bl-lg border border-red-100'
                      : 'bg-white text-slate-700 rounded-2xl rounded-bl-lg shadow-md shadow-slate-100/50 border border-slate-50'
                }`}>
                  <p className="text-[14px] leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                </div>
              </div>
            </div>
          ))}

          {/* 加载动画 */}
          {loading && (
            <div className="flex items-end gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center shadow-sm">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-lg shadow-md shadow-slate-100/50 border border-slate-50">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-pink-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-purple-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 底部输入区域 - 固定高度，为底部导航栏留空间 */}
      <footer className="flex-shrink-0 bg-white/95 backdrop-blur-lg border-t border-slate-100 px-3 md:px-4 py-2.5 md:py-3 mb-16 lg:mb-0">
        <div className="flex items-end gap-2 max-w-3xl mx-auto">
          {/* 附件按钮 */}
          <button 
            className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors flex-shrink-0"
            aria-label="添加附件"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
          
          {/* 输入框 */}
          <div className="flex-1 bg-slate-100/80 rounded-2xl px-3 md:px-4 py-2 md:py-2.5 focus-within:ring-2 focus-within:ring-pink-200 focus-within:bg-white transition-all">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入你的问题..."
              rows={1}
              disabled={loading}
              className="w-full bg-transparent resize-none outline-none text-[14px] md:text-[15px] text-slate-700 placeholder:text-slate-400 disabled:opacity-50 leading-relaxed"
              style={{ maxHeight: '100px', minHeight: '20px' }}
            />
          </div>
          
          {/* 发送按钮 */}
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            aria-label="发送消息"
            className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
              input.trim() && !loading
                ? 'bg-gradient-to-br from-pink-500 to-purple-500 text-white shadow-lg shadow-pink-200/40 hover:shadow-xl active:scale-95'
                : 'bg-slate-100 text-slate-300'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </footer>
    </div>
  )
}
