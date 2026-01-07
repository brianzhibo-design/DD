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
      setError(result.error || '密钥无效，无法通过验证')
      setPassword('')
    }
    setLoading(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#FAFAFA] relative overflow-hidden">
      {/* 背景装饰 - 极淡的灰色 */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-slate-100 rounded-full blur-[140px]" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-gray-100 rounded-full blur-[120px]" />
      
      {/* 登录卡片 */}
      <div className="relative z-10 w-full max-w-sm px-6">
        <div className="bg-white border border-slate-100 rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] p-8 md:p-10">
          
          {/* Logo */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-slate-900 shadow-lg shadow-slate-200 mb-6">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">小离岛岛</h1>
            <p className="text-slate-400 text-xs tracking-widest uppercase">Private Operation System</p>
          </div>

          {/* 表单 */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                Access Key
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400 group-focus-within:text-slate-800 transition-colors" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (error) setError('')
                  }}
                  className="block w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400 transition-all text-sm"
                  placeholder="请输入访问密码"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-slate-400 hover:text-slate-600 transition-colors" />
                  ) : (
                    <Eye className="h-4 w-4 text-slate-400 hover:text-slate-600 transition-colors" />
                  )}
                </button>
              </div>
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="flex items-center gap-2 text-red-500 text-xs bg-red-50 p-3 rounded-lg border border-red-100">
                <div className="w-1 h-1 rounded-full bg-red-500" />
                {error}
              </div>
            )}

            {/* 登录按钮 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-black text-white rounded-lg py-3 text-sm font-medium transition-all active:scale-[0.98] disabled:opacity-70 shadow-lg shadow-slate-200"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying...</span>
                </div>
              ) : (
                'Enter System'
              )}
            </button>
          </form>
        </div>
        
        <div className="text-center mt-6">
          <p className="text-[10px] text-slate-300 uppercase tracking-widest">
            Private · Authorized Access Only
          </p>
        </div>
      </div>
    </div>
  )
}
