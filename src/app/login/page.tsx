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
        <div className="w-8 h-8 border-2 border-[#E2E8D5] border-t-[#4A6741] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#FDFBF7] relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#4A6741] rounded-full blur-[140px] opacity-5" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#4A6741] rounded-full blur-[120px] opacity-5" />
      
      {/* 登录卡片 */}
      <div className="relative z-10 w-full max-w-sm px-6">
        <div className="bg-white border border-[#E2E8D5] rounded-2xl shadow-xl p-8">
          
          {/* Logo */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[#4A6741] shadow-lg mb-6">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[#2D3A30] tracking-tight mb-2">小离岛岛</h1>
            <p className="text-[#7D8A80] text-[10px] tracking-[0.2em] font-medium uppercase">Operation System</p>
          </div>

          {/* 表单 */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#7D8A80] uppercase tracking-wider ml-1">
                Access Key
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-[#7D8A80]" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (error) setError('')
                  }}
                  className="block w-full pl-10 pr-10 py-3 bg-white border border-[#E2E8D5] rounded-lg text-[#2D3A30] placeholder-[#9CA89F] focus:outline-none focus:ring-2 focus:ring-[#4A6741]/20 focus:border-[#4A6741] transition-all text-sm"
                  placeholder="请输入访问密码"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-[#7D8A80] hover:text-[#2D3A30] transition-colors" />
                  ) : (
                    <Eye className="h-4 w-4 text-[#7D8A80] hover:text-[#2D3A30] transition-colors" />
                  )}
                </button>
              </div>
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="flex items-center gap-2 text-[#C75050] text-xs bg-[#C75050]/5 p-3 rounded-lg border border-[#C75050]/20">
                <div className="w-1 h-1 rounded-full bg-[#C75050]" />
                {error}
              </div>
            )}

            {/* 登录按钮 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#4A6741] hover:bg-[#3A5233] text-white rounded-lg py-3 text-sm font-medium transition-all disabled:opacity-70 shadow-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>正在验证...</span>
                </div>
              ) : (
                '进入系统'
              )}
            </button>
          </form>
        </div>
        
        <div className="text-center mt-6">
          <p className="text-[10px] text-[#9CA89F] uppercase tracking-widest">
            Private · Authorized Access Only
          </p>
        </div>
      </div>
    </div>
  )
}
