'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Eye, EyeOff, Sparkles } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { login, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/')
    }
  }, [isAuthenticated, isLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) {
      setError('请输入访问密钥')
      return
    }
    
    setLoading(true)
    setError('')
    
    const result = await login(password)
    if (result.success) {
      router.replace('/')
    } else {
      setError(result.error || '密钥无效')
      setPassword('')
    }
    setLoading(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#2D4B3E]/20 border-t-[#2D4B3E] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#FDFBF7] relative overflow-hidden p-6">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#2D4B3E]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-[#C5A267]/5 rounded-full blur-[100px]" />
      </div>
      
      {/* 登录卡片 */}
      <div className="relative z-10 w-full max-w-[420px]">
        <div className="bg-white border border-[#2D4B3E]/5 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-12">
          
          {/* Logo */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-[#2D4B3E] rounded-[1.2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-[#2D4B3E]/20">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-serif tracking-tight text-[#2D4B3E]">小离岛岛</h1>
            <p className="text-[#6B7A74] text-[10px] uppercase tracking-[0.4em] mt-3 font-bold opacity-60">Operations Management</p>
          </div>

          {/* 表单 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[#6B7A74] uppercase tracking-wider ml-1">
                Access Credential
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-[#6B7A74]" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (error) setError('')
                  }}
                  className="block w-full pl-12 pr-12 py-4 bg-[#F4F6F0] border-none rounded-2xl text-[#1A2421] placeholder-[#9BA8A3] focus:ring-2 focus:ring-[#2D4B3E]/10 outline-none transition-all text-sm"
                  placeholder="请输入访问密码"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-5 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-[#6B7A74] hover:text-[#2D4B3E] transition-colors" />
                  ) : (
                    <Eye className="h-4 w-4 text-[#6B7A74] hover:text-[#2D4B3E] transition-colors" />
                  )}
                </button>
              </div>
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="flex items-center gap-2 text-[#B85C5C] text-xs bg-[#B85C5C]/5 p-4 rounded-xl">
                <div className="w-1.5 h-1.5 rounded-full bg-[#B85C5C]" />
                {error}
              </div>
            )}

            {/* 登录按钮 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2D4B3E] hover:bg-[#3D6654] text-white rounded-xl py-4 text-sm font-bold transition-all active:scale-95 disabled:opacity-70 shadow-lg shadow-[#2D4B3E]/20"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>验证中...</span>
                </div>
              ) : (
                '开启岛屿管理'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
