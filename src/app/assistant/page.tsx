'use client'

import React, { useState, useRef, useEffect } from 'react'
import { 
  Send, 
  ImagePlus, 
  Sparkles, 
  User, 
  TrendingUp, 
  Lightbulb, 
  PenTool, 
  Cat,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  Zap
} from 'lucide-react'

// ============================================
// Types
// ============================================
interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isError?: boolean
}

interface QuickAction {
  icon: React.ReactNode
  label: string
  prompt: string
  gradient: string
}

// ============================================
// Constants
// ============================================
const QUICK_ACTIONS: QuickAction[] = [
  { 
    icon: <TrendingUp className="w-5 h-5" />, 
    label: '数据分析', 
    prompt: '帮我分析最近的运营数据表现，给出改进建议',
    gradient: 'from-blue-500 to-cyan-400'
  },
  { 
    icon: <Lightbulb className="w-5 h-5" />, 
    label: '爆款选题', 
    prompt: '根据我的账号定位，推荐5个最可能爆火的选题',
    gradient: 'from-amber-500 to-orange-400'
  },
  { 
    icon: <PenTool className="w-5 h-5" />, 
    label: '文案优化', 
    prompt: '帮我优化小红书笔记的标题和文案，让它更吸引人',
    gradient: 'from-emerald-500 to-teal-400'
  },
  { 
    icon: <Cat className="w-5 h-5" />, 
    label: '猫咪创意', 
    prompt: '推荐几个让猫咪自然出镜的创意拍摄方案',
    gradient: 'from-pink-500 to-rose-400'
  },
]

// ============================================
// Main Component
// ============================================
export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // 自动调整输入框高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '24px'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [input])

  // 格式化时间
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }

  // 判断是否显示时间戳
  const shouldShowTime = (current: Message, previous?: Message) => {
    if (!previous) return true
    return current.timestamp.getTime() - previous.timestamp.getTime() > 5 * 60 * 1000
  }

  // 复制消息
  const handleCopy = async (id: string, content: string) => {
    await navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // 发送消息
  const handleSend = async (text?: string) => {
    const messageText = (text || input).trim()
    if (!messageText || loading) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
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
          message: messageText,
          history: messages.slice(-10).map(m => ({ role: m.role, content: m.content }))
        })
      })

      const data = await response.json()
      
      const content = data.message || data.response || data.content || 
                      (data.error ? `错误: ${data.error}` : '抱歉，无法获取回复')

      setMessages(prev => [...prev, {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content,
        timestamp: new Date(),
        isError: !!data.error
      }])
    } catch {
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: '网络连接失败，请检查网络后重试',
        timestamp: new Date(),
        isError: true
      }])
    }

    setLoading(false)
  }

  // 重试发送
  const handleRetry = () => {
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')
    if (lastUserMessage) {
      setMessages(prev => prev.filter(m => m.id !== messages[messages.length - 1].id))
      handleSend(lastUserMessage.content)
    }
  }

  // 键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* ====== Header ====== */}
      <header className="flex-shrink-0 px-4 py-3 lg:py-4 border-b border-slate-100 bg-white">
        <div className="flex items-center gap-3">
          {/* AI 头像 */}
          <div className="relative">
            <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg shadow-slate-200">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            {/* 在线状态 */}
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
          </div>
          
          {/* 标题信息 */}
          <div className="flex-1">
            <h1 className="text-base lg:text-lg font-semibold text-slate-900">
              AI 运营助手
            </h1>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 bg-emerald-400 rounded-full" />
              基于账号数据的智能建议
            </p>
          </div>
        </div>
      </header>

      {/* ====== Messages Area ====== */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 pb-4"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {/* 空状态 - 欢迎界面 */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] py-8">
            {/* Logo */}
            <div className="relative mb-6">
              <div className="relative w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-slate-900 flex items-center justify-center shadow-xl shadow-slate-200">
                <Sparkles className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
              </div>
            </div>

            {/* 欢迎文案 */}
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-xl lg:text-2xl font-bold text-slate-900">
                你好，岛岛
              </h2>
            </div>
            <p className="text-sm text-slate-500 mb-8 text-center max-w-xs">
              我是你的专属 AI 运营助手，已接入账号历史数据
            </p>

            {/* 快捷操作 */}
            <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
              {QUICK_ACTIONS.map((action, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(action.prompt)}
                  disabled={loading}
                  className="group relative overflow-hidden rounded-xl bg-white p-4 text-left border border-slate-100 hover:border-slate-200 hover:shadow-md active:scale-[0.98] transition-all duration-200 disabled:opacity-50"
                >
                  {/* 背景渐变 hover 效果 */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
                  
                  {/* 图标 */}
                  <div className="w-10 h-10 rounded-lg bg-slate-100 group-hover:bg-slate-900 flex items-center justify-center text-slate-600 group-hover:text-white mb-3 transition-colors">
                    {action.icon}
                  </div>
                  
                  {/* 文字 */}
                  <span className="text-sm font-medium text-slate-800">
                    {action.label}
                  </span>
                </button>
              ))}
            </div>

            {/* 提示文字 */}
            <p className="text-xs text-slate-400 mt-8">
              点击卡片或直接输入问题开始对话
            </p>
          </div>
        )}

        {/* 消息列表 */}
        <div className="space-y-4 max-w-2xl mx-auto">
          {messages.map((msg, index) => (
            <div key={msg.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* 时间戳 */}
              {shouldShowTime(msg, messages[index - 1]) && (
                <div className="flex justify-center my-4">
                  <span className="text-[11px] text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              )}

              {/* 消息行 */}
              <div className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {/* 头像 */}
                {msg.role === 'assistant' && (
                  <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${
                    msg.isError 
                      ? 'bg-red-500' 
                      : 'bg-slate-900'
                  }`}>
                    {msg.isError ? (
                      <AlertCircle className="w-4 h-4 text-white" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-white" />
                    )}
                  </div>
                )}

                {msg.role === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                    <User className="w-4 h-4 text-slate-600" />
                  </div>
                )}

                {/* 气泡 */}
                <div className={`group relative max-w-[80%] lg:max-w-[70%] ${
                  msg.role === 'user'
                    ? 'bg-slate-900 text-white rounded-2xl rounded-tr-sm shadow-lg shadow-slate-200/50'
                    : msg.isError
                      ? 'bg-red-50 text-red-700 rounded-2xl rounded-tl-sm border border-red-100'
                      : 'bg-white text-slate-700 rounded-2xl rounded-tl-sm border border-slate-100'
                }`}>
                  {/* 内容 */}
                  <div className="px-4 py-3">
                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                      {msg.content}
                    </p>
                  </div>

                  {/* 操作按钮 - AI 消息 */}
                  {msg.role === 'assistant' && !msg.isError && (
                    <div className="absolute -bottom-6 left-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="p-1.5 rounded-md bg-white shadow-sm border border-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
                        title="复制"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}

                  {/* 错误消息重试按钮 */}
                  {msg.isError && (
                    <button
                      onClick={handleRetry}
                      className="absolute -bottom-6 left-2 flex items-center gap-1 px-2 py-1 rounded-md bg-white shadow-sm border border-slate-100 text-red-500 hover:bg-red-50 text-xs transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" />
                      重试
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* 加载状态 */}
          {loading && (
            <div className="flex gap-2.5 animate-in fade-in duration-200">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center shadow-sm">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm border border-slate-100">
                <div className="flex items-center gap-1.5 h-5">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          {/* 滚动锚点 */}
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      {/* ====== Input Area ====== */}
      <footer className="flex-shrink-0 px-4 py-3 mb-16 lg:mb-0 bg-white border-t border-slate-100">
        <div className="max-w-2xl mx-auto">
          {/* 输入框容器 */}
          <div className="flex items-end gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200 focus-within:border-slate-300 transition-colors">
            {/* 附件按钮 */}
            <button
              className="flex-shrink-0 w-10 h-10 rounded-lg bg-white flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 active:scale-95 transition-all shadow-sm"
              aria-label="添加图片"
            >
              <ImagePlus className="w-5 h-5" />
            </button>

            {/* 文本输入 */}
            <div className="flex-1 min-w-0">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入你的问题..."
                rows={1}
                disabled={loading}
                className="w-full px-2 py-2.5 bg-transparent resize-none outline-none text-sm text-slate-700 placeholder:text-slate-400 disabled:opacity-50 leading-relaxed"
                style={{ maxHeight: '120px', minHeight: '24px' }}
              />
            </div>

            {/* 发送按钮 */}
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              aria-label="发送"
              className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 ${
                input.trim() && !loading
                  ? 'bg-slate-900 text-white shadow-lg shadow-slate-200 hover:bg-black active:scale-95'
                  : 'bg-slate-100 text-slate-300'
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          {/* 提示文字 */}
          <p className="text-center text-[11px] text-slate-400 mt-2">
            按 Enter 发送，Shift + Enter 换行
          </p>
        </div>
      </footer>
    </div>
  )
}
