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
    { icon: <BarChart3 className="w-[18px] h-[18px]" />, text: '分析数据表现', color: 'text-blue-500', bg: 'bg-blue-50' },
    { icon: <Lightbulb className="w-[18px] h-[18px]" />, text: '推荐爆款选题', color: 'text-amber-500', bg: 'bg-amber-50' },
    { icon: <FileText className="w-[18px] h-[18px]" />, text: '优化标题文案', color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { icon: <Cat className="w-[18px] h-[18px]" />, text: '猫咪出镜创意', color: 'text-pink-500', bg: 'bg-pink-50' },
  ]

  return (
    <div className="flex flex-col h-full min-h-0 bg-[#F5F5F5]">
      {/* ===== 顶部标题栏 ===== */}
      {/* 高度: 56px (移动端) / 64px (桌面端) - 符合 iOS 导航栏标准 */}
      <header className="flex-shrink-0 h-14 lg:h-16 bg-white border-b border-gray-100 px-4 flex items-center gap-3">
        {/* 头像: 36x36 (移动端) / 40x40 (桌面端) */}
        <div className="relative">
          <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-[12px] bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-400 flex items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          {/* 在线状态指示器 */}
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white"></span>
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-[15px] lg:text-[16px] font-semibold text-gray-900 leading-tight">AI助手</h1>
          <p className="text-[11px] lg:text-[12px] text-gray-400 leading-tight">小离岛岛 · 运营顾问</p>
        </div>
      </header>

      {/* ===== 消息区域 ===== */}
      {/* flex-1 填充剩余空间，overflow-y-auto 支持滚动 */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto overscroll-contain"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {/* 内容容器: 水平间距 16px，垂直间距 16px，最大宽度 720px */}
        <div className="px-4 py-4 space-y-3 max-w-3xl mx-auto">
          
          {/* ===== 欢迎区域 ===== */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center pt-8 lg:pt-16 pb-6">
              {/* 头像区域 - 带光晕效果 */}
              <div className="relative mb-5">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full blur-2xl opacity-50 scale-150"></div>
                <div className="relative w-20 h-20 lg:w-24 lg:h-24 rounded-[24px] lg:rounded-[28px] bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-400 flex items-center justify-center shadow-xl">
                  <Sparkles className="w-10 h-10 lg:w-12 lg:h-12 text-white" />
                </div>
              </div>
              
              {/* 欢迎文案 - 间距遵循 8pt 网格 */}
              <h2 className="text-[20px] lg:text-[24px] font-semibold text-gray-900 mb-2">你好，岛岛!</h2>
              <p className="text-[14px] lg:text-[15px] text-gray-500 mb-8">我是你的AI运营助手，可以帮你：</p>
              
              {/* 快捷操作按钮 - 2列网格，间距 12px */}
              <div className="grid grid-cols-2 gap-3 w-full max-w-[320px] lg:max-w-[360px]">
                {quickActions.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(item.text)}
                    disabled={loading}
                    className={`
                      flex items-center gap-3 
                      px-4 py-3.5 
                      bg-white rounded-2xl 
                      border border-gray-100 
                      text-[14px] text-gray-700 font-medium 
                      shadow-sm 
                      hover:shadow-md hover:border-gray-200 
                      active:scale-[0.98] 
                      transition-all duration-200
                      disabled:opacity-50 disabled:pointer-events-none
                      min-h-[52px]
                    `}
                  >
                    <span className={`${item.color} ${item.bg} p-1.5 rounded-lg`}>{item.icon}</span>
                    <span className="truncate flex-1 text-left">{item.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ===== 消息列表 ===== */}
          {messages.map((msg, index) => (
            <div key={msg.id}>
              {/* 时间戳 - 上下间距 12px */}
              {shouldShowTime(msg, messages[index - 1]) && (
                <div className="text-center text-[12px] text-gray-400 my-3 py-1 select-none">
                  {formatTime(msg.timestamp)}
                </div>
              )}
              
              {/* 消息行 - 头像与气泡间距 8px */}
              <div className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {/* AI 头像: 32x32 */}
                {msg.role === 'assistant' && (
                  <div className={`
                    w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm
                    ${msg.isError 
                      ? 'bg-gradient-to-br from-red-400 to-red-500'
                      : 'bg-gradient-to-br from-pink-400 to-purple-500'
                    }
                  `}>
                    {msg.isError 
                      ? <AlertCircle className="w-4 h-4 text-white" />
                      : <Sparkles className="w-4 h-4 text-white" />
                    }
                  </div>
                )}
                
                {/* 用户头像: 32x32 */}
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
                
                {/* 消息气泡 - 内边距 12px 16px，最大宽度 75% */}
                <div className={`
                  max-w-[75%] 
                  px-4 py-3
                  ${msg.role === 'user'
                    ? 'bg-gradient-to-br from-pink-500 to-purple-500 text-white rounded-[20px] rounded-br-md shadow-md'
                    : msg.isError
                      ? 'bg-red-50 text-red-700 rounded-[20px] rounded-bl-md border border-red-100'
                      : 'bg-white text-gray-700 rounded-[20px] rounded-bl-md shadow-sm border border-gray-50'
                  }
                `}>
                  <p className="text-[15px] leading-[1.6] whitespace-pre-wrap break-words">{msg.content}</p>
                </div>
              </div>
            </div>
          ))}

          {/* ===== 加载动画 ===== */}
          {loading && (
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center shadow-sm">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white px-4 py-3 rounded-[20px] rounded-bl-md shadow-sm border border-gray-50">
                <div className="flex gap-1.5 items-center h-[24px]">
                  <span className="w-2 h-2 bg-pink-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-purple-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          )}
          
          {/* 底部安全区 - 为输入框留出视觉空间 */}
          <div className="h-2"></div>
        </div>
      </div>

      {/* ===== 底部输入区域 ===== */}
      {/* 底部间距 64px (mb-16) 为底部导航栏留空间 */}
      <footer className="flex-shrink-0 bg-white border-t border-gray-100 px-4 py-3 mb-16 lg:mb-0">
        {/* 输入行容器 - 最大宽度与消息区域一致 */}
        <div className="flex items-end gap-3 max-w-3xl mx-auto">
          {/* 附件按钮: 44x44 触摸目标 */}
          <button 
            className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 hover:text-gray-600 active:scale-95 transition-all flex-shrink-0"
            aria-label="添加附件"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
          
          {/* 输入框容器 - 圆角 24px，内边距 12px 16px */}
          <div className="flex-1 bg-gray-100 rounded-[24px] px-4 py-2.5 focus-within:ring-2 focus-within:ring-pink-200 focus-within:bg-white focus-within:shadow-sm transition-all">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入你的问题..."
              rows={1}
              disabled={loading}
              className="w-full bg-transparent resize-none outline-none text-[15px] text-gray-700 placeholder:text-gray-400 disabled:opacity-50 leading-[1.5]"
              style={{ maxHeight: '120px', minHeight: '24px' }}
            />
          </div>
          
          {/* 发送按钮: 44x44 触摸目标 */}
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            aria-label="发送消息"
            className={`
              w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 
              transition-all duration-200
              ${input.trim() && !loading
                ? 'bg-gradient-to-br from-pink-500 to-purple-500 text-white shadow-lg shadow-pink-200/50 hover:shadow-xl active:scale-95'
                : 'bg-gray-100 text-gray-300'
              }
            `}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        
        {/* iOS 安全区域 */}
        <div className="h-safe"></div>
      </footer>
    </div>
  )
}
