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
  Check
} from 'lucide-react'

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
}

const QUICK_ACTIONS: QuickAction[] = [
  { 
    icon: <TrendingUp className="w-5 h-5" />, 
    label: '数据分析', 
    prompt: '帮我分析最近的运营数据表现，给出改进建议'
  },
  { 
    icon: <Lightbulb className="w-5 h-5" />, 
    label: '爆款选题', 
    prompt: '根据我的账号定位，推荐5个最可能爆火的选题'
  },
  { 
    icon: <PenTool className="w-5 h-5" />, 
    label: '文案优化', 
    prompt: '帮我优化小红书笔记的标题和文案，让它更吸引人'
  },
  { 
    icon: <Cat className="w-5 h-5" />, 
    label: '猫咪创意', 
    prompt: '推荐几个让猫咪自然出镜的创意拍摄方案'
  },
]

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '24px'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [input])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }

  const shouldShowTime = (current: Message, previous?: Message) => {
    if (!previous) return true
    return current.timestamp.getTime() - previous.timestamp.getTime() > 5 * 60 * 1000
  }

  const handleCopy = async (id: string, content: string) => {
    await navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

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

  const handleRetry = () => {
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')
    if (lastUserMessage) {
      setMessages(prev => prev.filter(m => m.id !== messages[messages.length - 1].id))
      handleSend(lastUserMessage.content)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <header className="flex-shrink-0 px-4 py-3 lg:py-4 border-b border-[#E2E8D5] bg-[#F4F6F0]">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-xl bg-[#4A6741] flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#4A6741] rounded-full border-2 border-white" />
          </div>
          
          <div className="flex-1">
            <h1 className="text-base lg:text-lg font-semibold text-[#2D3A30]">
              AI 运营助手
            </h1>
            <p className="text-xs text-[#7D8A80] flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 bg-[#4A6741] rounded-full" />
              基于账号数据的智能建议
            </p>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div 
        className="flex-1 overflow-y-auto px-4 pb-4 bg-[#FDFBF7]"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {/* 空状态 */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] py-8">
            <div className="relative mb-6">
              <div className="relative w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-[#4A6741] flex items-center justify-center shadow-xl">
                <Sparkles className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
              </div>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-xl lg:text-2xl font-bold text-[#2D3A30]">
                你好，岛岛
              </h2>
            </div>
            <p className="text-sm text-[#7D8A80] mb-8 text-center max-w-xs">
              我是你的专属 AI 运营助手，已接入账号历史数据
            </p>

            {/* 快捷操作 */}
            <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
              {QUICK_ACTIONS.map((action, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(action.prompt)}
                  disabled={loading}
                  className="group relative overflow-hidden rounded-xl bg-white p-4 text-left border border-[#E2E8D5] hover:border-[#4A6741] hover:shadow-md active:scale-[0.98] transition-all duration-200 disabled:opacity-50"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#F4F6F0] group-hover:bg-[#4A6741] flex items-center justify-center text-[#4A6741] group-hover:text-white mb-3 transition-colors">
                    {action.icon}
                  </div>
                  
                  <span className="text-sm font-medium text-[#2D3A30]">
                    {action.label}
                  </span>
                </button>
              ))}
            </div>

            <p className="text-xs text-[#7D8A80] mt-8">
              点击卡片或直接输入问题开始对话
            </p>
          </div>
        )}

        {/* 消息列表 */}
        <div className="space-y-4 max-w-2xl mx-auto">
          {messages.map((msg, index) => (
            <div key={msg.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              {shouldShowTime(msg, messages[index - 1]) && (
                <div className="flex justify-center my-4">
                  <span className="text-[11px] text-[#7D8A80] bg-[#F4F6F0] px-3 py-1 rounded-full">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              )}

              <div className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {msg.role === 'assistant' && (
                  <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${
                    msg.isError 
                      ? 'bg-[#C75050]' 
                      : 'bg-[#4A6741]'
                  }`}>
                    {msg.isError ? (
                      <AlertCircle className="w-4 h-4 text-white" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-white" />
                    )}
                  </div>
                )}

                {msg.role === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#E2E8D5] flex items-center justify-center">
                    <User className="w-4 h-4 text-[#4A6741]" />
                  </div>
                )}

                <div className={`group relative max-w-[80%] lg:max-w-[70%] ${
                  msg.role === 'user'
                    ? 'bg-[#4A6741] text-white rounded-2xl rounded-tr-sm shadow-lg'
                    : msg.isError
                      ? 'bg-[#C75050]/10 text-[#C75050] rounded-2xl rounded-tl-sm border border-[#C75050]/20'
                      : 'bg-white text-[#2D3A30] rounded-2xl rounded-tl-sm border border-[#E2E8D5]'
                }`}>
                  <div className="px-4 py-3">
                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                      {msg.content}
                    </p>
                  </div>

                  {msg.role === 'assistant' && !msg.isError && (
                    <div className="absolute -bottom-6 left-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="p-1.5 rounded-md bg-white shadow-sm border border-[#E2E8D5] text-[#7D8A80] hover:text-[#4A6741] hover:bg-[#F4F6F0] transition-colors"
                        title="复制"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-[#4A6741]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}

                  {msg.isError && (
                    <button
                      onClick={handleRetry}
                      className="absolute -bottom-6 left-2 flex items-center gap-1 px-2 py-1 rounded-md bg-white shadow-sm border border-[#E2E8D5] text-[#C75050] hover:bg-[#C75050]/5 text-xs transition-colors"
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
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#4A6741] flex items-center justify-center shadow-sm">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm border border-[#E2E8D5]">
                <div className="flex items-center gap-1.5 h-5">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      {/* Input Area */}
      <footer className="flex-shrink-0 px-4 py-3 mb-16 lg:mb-0 bg-white border-t border-[#E2E8D5]">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-end gap-2 p-2 bg-[#F4F6F0] rounded-xl border border-[#E2E8D5] focus-within:border-[#4A6741] transition-colors">
            <button
              className="flex-shrink-0 w-10 h-10 rounded-lg bg-white flex items-center justify-center text-[#7D8A80] hover:bg-[#E2E8D5] hover:text-[#4A6741] active:scale-95 transition-all shadow-sm"
              aria-label="添加图片"
            >
              <ImagePlus className="w-5 h-5" />
            </button>

            <div className="flex-1 min-w-0">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入你的问题..."
                rows={1}
                disabled={loading}
                className="w-full px-2 py-2.5 bg-transparent resize-none outline-none text-sm text-[#2D3A30] placeholder:text-[#9CA89F] disabled:opacity-50 leading-relaxed"
                style={{ maxHeight: '120px', minHeight: '24px' }}
              />
            </div>

            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              aria-label="发送"
              className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 ${
                input.trim() && !loading
                  ? 'bg-[#4A6741] text-white shadow-lg hover:bg-[#3A5233] active:scale-95'
                  : 'bg-[#E2E8D5] text-[#9CA89F]'
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          <p className="text-center text-[11px] text-[#7D8A80] mt-2">
            按 Enter 发送，Shift + Enter 换行
          </p>
        </div>
      </footer>
    </div>
  )
}
