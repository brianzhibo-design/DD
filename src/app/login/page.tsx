'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Eye, EyeOff, Sparkles } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
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
      setError('请输入访问密码')
      return
    }
    
    setIsSubmitting(true)
    setError('')
    
    const result = await login(password)
    if (result.success) {
      router.replace('/')
    } else {
      setError(result.error || '密码错误')
      setPassword('')
    }
    setIsSubmitting(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-pink-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-pink-50 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-pink-100/50 rounded-full blur-[140px]" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-100/50 rounded-full blur-[120px]" />
      
      {/* 登录卡片 */}
      <div className="relative z-10 w-full max-w-sm p-4">
        <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl shadow-xl shadow-pink-100/30 p-8">
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-500 shadow-lg shadow-pink-200/50 mb-5">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-1">小离岛岛</h1>
            <p className="text-slate-400 text-sm">内容运营系统</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-2 block">访问密码</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-300" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (error) setError('')
                  }}
                  className="block w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-300 transition-all"
                  placeholder="请输入密码"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-xl border border-red-100">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-xl py-3.5 font-semibold transition-all shadow-lg shadow-pink-200/50 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>验证中...</span>
                </div>
              ) : (
                '进入系统'
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">
              初始密码: <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-mono">daodao888</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

