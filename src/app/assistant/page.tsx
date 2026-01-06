'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Send, ImageIcon, Sparkles, User, BarChart3, Lightbulb, ShoppingBag, Cat } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const quickPrompts = [
  { icon: BarChart3, label: '分析数据表现', color: 'text-blue-500' },
  { icon: Lightbulb, label: '推荐爆款选题', color: 'text-amber-500' },
  { icon: ShoppingBag, label: '优化标题文案', color: 'text-pink-500' },
  { icon: Cat, label: '猫咪出镜创意', color: 'text-purple-500' },
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
    return diff > 5 * 60 * 1000 // 5分钟以上显示时间
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

      // 兼容多种响应格式
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
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('发送失败:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '网络错误，请检查连接后重试',
        timestamp: new Date()
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
    <div className="flex flex-col h-[100dvh] bg-slate-100">
      {/* 顶部标题栏 */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between shadow-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center shadow-lg shadow-pink-200/50">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-slate-800">AI运营助手</h1>
            <p className="text-xs text-slate-400">基于历史数据的智能建议</p>
          </div>
        </div>
        <div className="text-xs text-green-500 flex items-center gap-1.5 bg-green-50 px-2 py-1 rounded-full">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
          在线
        </div>
      </div>

      {/* 消息列表区域 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {/* 欢迎消息 */}
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center shadow-xl shadow-pink-200/50">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-lg font-bold text-slate-700 mb-2">你好，岛岛!</h2>
            <p className="text-slate-500 text-sm mb-6">我是你的AI运营助手，可以帮你：</p>
            <div className="flex flex-wrap justify-center gap-2 max-w-sm mx-auto">
              {quickPrompts.map(item => (
                <button 
                  key={item.label}
                  onClick={() => handleSend(item.label)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white rounded-full text-sm text-slate-600 shadow-sm hover:shadow-md cursor-pointer transition-all border border-slate-100 hover:border-pink-200"
                >
                  <item.icon size={14} className={item.color} />
                  {item.label}
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
              <div className="text-center text-xs text-slate-400 my-4 select-none">
                {formatTime(msg.timestamp)}
              </div>
            )}
            
            {/* 消息行 */}
            <div className={`flex items-end gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {/* 头像 */}
              <div className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center shadow-md ${
                msg.role === 'assistant' 
                  ? 'bg-gradient-to-br from-pink-400 to-purple-500' 
                  : 'bg-gradient-to-br from-blue-400 to-cyan-500'
              }`}>
                {msg.role === 'assistant' 
                  ? <Sparkles className="w-4 h-4 text-white" />
                  : <User className="w-4 h-4 text-white" />
                }
              </div>
              
              {/* 气泡 */}
              <div className={`max-w-[75%] px-4 py-2.5 shadow-sm ${
                msg.role === 'user'
                  ? 'bg-pink-500 text-white rounded-2xl rounded-br-md'
                  : 'bg-white text-slate-700 rounded-2xl rounded-bl-md border border-slate-100'
              }`}>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              </div>
            </div>
          </div>
        ))}

        {/* 加载动画 */}
        {loading && (
          <div className="flex items-end gap-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center shadow-md">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md shadow-sm border border-slate-100">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 底部输入区域 */}
      <div className="bg-white border-t px-4 py-3 flex-shrink-0 pb-safe">
        <div className="flex items-end gap-2">
          {/* 图片按钮 */}
          <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-100">
            <ImageIcon className="w-6 h-6" />
          </button>
          
          {/* 输入框 */}
          <div className="flex-1 bg-slate-100 rounded-2xl px-4 py-2 focus-within:ring-2 focus-within:ring-pink-200 transition-all">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入你的问题..."
              rows={1}
              className="w-full bg-transparent resize-none outline-none text-sm text-slate-700 placeholder-slate-400"
              style={{ minHeight: '24px', maxHeight: '120px' }}
            />
          </div>
          
          {/* 发送按钮 */}
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className={`p-2.5 rounded-full transition-all ${
              input.trim() && !loading
                ? 'bg-pink-500 text-white shadow-lg shadow-pink-200 hover:bg-pink-600 active:scale-95'
                : 'bg-slate-200 text-slate-400'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
