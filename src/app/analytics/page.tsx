'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Users, Heart, Bookmark, MessageCircle, TrendingUp, 
  FileText, Calendar, RefreshCw, ArrowUpRight,
  ArrowDownRight, BarChart3, Plus, X, Save, Upload,
  Camera, Sparkles, Image as ImageIcon, Loader2
} from 'lucide-react'
import NoteDetailModal from '@/components/NoteDetailModal'

interface WeeklyStats {
  id?: string
  week_start: string
  week_end: string
  followers: number
  new_followers: number
  likes: number
  saves: number
  comments: number
  shares: number
  views: number
  posts_count: number
  female_ratio: number
}

interface Note {
  id: string
  title: string
  type: string
  likes: number
  collects: number
  comments: number
  cover_url: string
  publish_time: number
}

const emptyWeeklyData: WeeklyStats = {
  week_start: '',
  week_end: '',
  followers: 0,
  new_followers: 0,
  likes: 0,
  saves: 0,
  comments: 0,
  shares: 0,
  views: 0,
  posts_count: 0,
  female_ratio: 85
}

export default function AnalyticsPage() {
  const [weeklyData, setWeeklyData] = useState<WeeklyStats[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  
  // 手动录入相关状态
  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState<WeeklyStats>(emptyWeeklyData)
  const [saving, setSaving] = useState(false)
  
  // 截图分析相关状态
  const [analyzing, setAnalyzing] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // 笔记详情弹窗
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)

  const loadData = async () => {
    try {
      const [statsRes, notesRes] = await Promise.all([
        fetch('/api/weekly-stats'),
        fetch('/api/notes?sort=likes&limit=50')
      ])
      
      const statsData = await statsRes.json()
      const notesData = await notesRes.json()
      
      if (statsData.data) {
        setWeeklyData(statsData.data)
      } else if (statsData.success && statsData.data) {
        setWeeklyData(statsData.data)
      }

      if (notesData.notes) {
        setNotes(notesData.notes)
      }
    } catch (e) {
      console.error('加载数据失败:', e)
    }
    setLoading(false)
  }

  const syncData = async () => {
    setSyncing(true)
    try {
      const res = await fetch('/api/sync-xhs', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        await loadData()
        alert('同步成功！')
      } else {
        alert('同步失败: ' + data.error)
      }
    } catch (e: any) {
      alert('同步失败: ' + e.message)
    }
    setSyncing(false)
  }

  // 手动保存周数据
  const saveWeeklyData = async () => {
    if (!formData.week_start || !formData.week_end) {
      alert('请填写周期开始和结束日期')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/weekly-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await res.json()
      if (data.success) {
        await loadData()
        setShowAddModal(false)
        setFormData(emptyWeeklyData)
        alert('数据保存成功！')
      } else {
        alert('保存失败: ' + data.error)
      }
    } catch (e: any) {
      alert('保存失败: ' + e.message)
    }
    setSaving(false)
  }

  // 设置本周日期
  const setThisWeek = () => {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const monday = new Date(now)
    monday.setDate(now.getDate() + diff)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    
    setFormData({
      ...formData,
      week_start: monday.toISOString().split('T')[0],
      week_end: sunday.toISOString().split('T')[0]
    })
  }

  // 处理图片上传
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 转换为 base64
    const reader = new FileReader()
    reader.onload = async (event) => {
      const base64 = event.target?.result as string
      setUploadedImage(base64)
      await analyzeScreenshot(base64)
    }
    reader.readAsDataURL(file)
  }

  // 分析截图
  const analyzeScreenshot = async (imageData: string) => {
    setAnalyzing(true)
    try {
      const res = await fetch('/api/analyze-screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData })
      })
      const result = await res.json()
      
      if (result.success && result.data) {
        // 将识别到的数据填充到表单
        setFormData(prev => ({
          ...prev,
          followers: result.data.followers || prev.followers,
          new_followers: result.data.new_followers || prev.new_followers,
          likes: result.data.likes || prev.likes,
          saves: result.data.saves || prev.saves,
          comments: result.data.comments || prev.comments,
          views: result.data.views || prev.views,
          posts_count: result.data.posts_count || prev.posts_count,
          female_ratio: result.data.female_ratio || prev.female_ratio
        }))
        alert('✅ 截图识别成功！数据已自动填充')
      } else {
        alert('识别失败: ' + (result.error || '请尝试上传更清晰的截图'))
      }
    } catch (e: any) {
      alert('分析失败: ' + e.message)
    }
    setAnalyzing(false)
  }

  // 清除上传的图片
  const clearImage = () => {
    setUploadedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  useEffect(() => { loadData() }, [])

  const formatNumber = (num: number) => {
    if (num >= 10000) return (num / 10000).toFixed(1) + '万'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
    return num.toString()
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  const getWeekChange = (current: number, previous: number) => {
    if (!previous) return { value: '0', positive: true }
    const change = ((current - previous) / previous) * 100
    return { value: Math.abs(change).toFixed(1), positive: change >= 0 }
  }

  const currentWeek = weeklyData[0]
  const lastWeek = weeklyData[1]

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-[#6B7A74]">加载中...</div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* 头部 */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2421] font-serif">数据分析</h1>
          <p className="text-[#6B7A74] text-sm mt-1">追踪运营数据，分析内容表现</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setThisWeek()
              setShowAddModal(true)
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#2D4B3E]/20 text-[#2D4B3E] rounded-full hover:bg-[#F4F6F0] text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            手动录入
          </button>
          <button
            onClick={syncData}
            disabled={syncing}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#2D4B3E] text-white rounded-full hover:bg-[#3D6654] disabled:opacity-50 text-sm font-bold shadow-lg shadow-[#2D4B3E]/20"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? '同步中...' : '自动同步'}
          </button>
        </div>
      </div>

      {/* 本周数据概览 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { 
            label: '粉丝', 
            value: currentWeek?.followers || 0, 
            icon: Users, 
            color: 'text-[#2D4B3E]',
            change: getWeekChange(currentWeek?.followers || 0, lastWeek?.followers || 0),
            isPrimary: true
          },
          { 
            label: '新增粉丝', 
            value: currentWeek?.new_followers || 0, 
            icon: TrendingUp, 
            color: 'text-emerald-500',
            isNew: true
          },
          { 
            label: '点赞', 
            value: currentWeek?.likes || 0, 
            icon: Heart, 
            color: 'text-rose-500',
            change: getWeekChange(currentWeek?.likes || 0, lastWeek?.likes || 0)
          },
          { 
            label: '收藏', 
            value: currentWeek?.saves || 0, 
            icon: Bookmark, 
            color: 'text-[#C5A267]',
            change: getWeekChange(currentWeek?.saves || 0, lastWeek?.saves || 0)
          },
          { 
            label: '评论', 
            value: currentWeek?.comments || 0, 
            icon: MessageCircle, 
            color: 'text-blue-500' 
          },
          { 
            label: '笔记数', 
            value: currentWeek?.posts_count || 0, 
            icon: FileText, 
            color: 'text-[#6B7A74]' 
          },
        ].map((stat, index) => (
          <div 
            key={index}
            className={`rounded-[2rem] p-5 ${
              stat.isPrimary 
                ? 'bg-[#2D4B3E] text-white shadow-lg shadow-[#2D4B3E]/20' 
                : 'bg-white border border-[#2D4B3E]/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]'
            }`}
          >
            <div className="flex items-center gap-2 mb-3">
              <stat.icon className={`w-4 h-4 ${stat.isPrimary ? 'text-white/60' : stat.color}`} />
              <span className={`text-xs font-bold uppercase tracking-wider ${stat.isPrimary ? 'text-white/60' : 'text-[#6B7A74]'}`}>
                {stat.label}
              </span>
            </div>
            <div className={`text-2xl font-black font-serif ${stat.isPrimary ? 'text-white' : 'text-[#1A2421]'}`}>
              {stat.isNew ? `+${formatNumber(stat.value)}` : formatNumber(stat.value)}
            </div>
            {stat.change && (
              <div className={`flex items-center gap-1 mt-2 text-xs ${
                stat.isPrimary 
                  ? (stat.change.positive ? 'text-emerald-300' : 'text-rose-300')
                  : (stat.change.positive ? 'text-emerald-500' : 'text-rose-500')
              }`}>
                {stat.change.positive ? 
                  <ArrowUpRight className="w-3 h-3" /> : 
                  <ArrowDownRight className="w-3 h-3" />
                }
                {stat.change.value}%
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 历史数据表格 */}
      <div className="bg-white rounded-[2rem] p-6 border border-[#2D4B3E]/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-[#1A2421] font-serif flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#2D4B3E]" />
            历史数据
          </h2>
          <span className="text-xs text-[#9BA8A3]">共 {weeklyData.length} 周</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#6B7A74] border-b border-[#2D4B3E]/5">
                <th className="pb-3 font-bold">周期</th>
                <th className="pb-3 font-bold text-right">粉丝</th>
                <th className="pb-3 font-bold text-right">新增</th>
                <th className="pb-3 font-bold text-right">点赞</th>
                <th className="pb-3 font-bold text-right">收藏</th>
                <th className="pb-3 font-bold text-right">评论</th>
                <th className="pb-3 font-bold text-right">女粉占比</th>
              </tr>
            </thead>
            <tbody>
              {weeklyData.length > 0 ? weeklyData.map((week, index) => (
                <tr key={week.week_start} className="border-b border-[#2D4B3E]/5">
                  <td className="py-4">
                    <span className="text-[#1A2421] font-medium">
                      {formatDate(week.week_start)} - {formatDate(week.week_end)}
                    </span>
                    {index === 0 && (
                      <span className="ml-2 text-xs text-[#2D4B3E] font-bold bg-[#F4F6F0] px-2 py-0.5 rounded-full">最新</span>
                    )}
                  </td>
                  <td className="py-4 text-right font-bold text-[#1A2421]">{formatNumber(week.followers)}</td>
                  <td className="py-4 text-right">
                    <span className={week.new_followers > 0 ? 'text-emerald-500 font-bold' : 'text-[#9BA8A3]'}>
                      {week.new_followers > 0 ? `+${week.new_followers}` : '0'}
                    </span>
                  </td>
                  <td className="py-4 text-right text-[#1A2421]">{formatNumber(week.likes)}</td>
                  <td className="py-4 text-right text-[#1A2421]">{formatNumber(week.saves)}</td>
                  <td className="py-4 text-right text-[#1A2421]">{week.comments}</td>
                  <td className="py-4 text-right text-[#1A2421]">{week.female_ratio || 85}%</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#9BA8A3]">
                    <Upload className="w-10 h-10 mx-auto mb-3 text-[#E2E8D5]" />
                    <p>暂无数据</p>
                    <p className="text-xs mt-1">点击「手动录入」或「自动同步」添加数据</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 笔记表现 */}
      <div className="bg-white rounded-[2rem] p-6 border border-[#2D4B3E]/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <h2 className="text-lg font-bold text-[#1A2421] mb-5 font-serif flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#2D4B3E]" />
          笔记表现（按点赞排序）
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.length > 0 ? notes.slice(0, 12).map((note) => (
            <div 
              key={note.id}
              onClick={() => setSelectedNoteId(note.id)}
              className="flex gap-3 p-4 rounded-xl border border-[#2D4B3E]/5 hover:border-[#2D4B3E]/15 hover:shadow-md transition-all cursor-pointer bg-[#FDFBF7]"
            >
              {note.cover_url ? (
                <img 
                  src={note.cover_url} 
                  alt={note.title}
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-[#F4F6F0] flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-[#9BA8A3]" />
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-[#1A2421] line-clamp-2">
                  {note.title}
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-[#6B7A74]">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3 text-rose-400" />
                    {formatNumber(note.likes)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Bookmark className="w-3 h-3 text-[#C5A267]" />
                    {formatNumber(note.collects)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-3 h-3 text-[#2D4B3E]" />
                    {note.comments}
                  </span>
                </div>
                <div className="text-xs text-[#9BA8A3] mt-1">
                  {note.type} · {note.publish_time ? new Date(note.publish_time * 1000).toLocaleDateString('zh-CN') : '-'}
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-3 text-center text-[#9BA8A3] py-12">
              <FileText className="w-10 h-10 mx-auto mb-3 text-[#E2E8D5]" />
              <p>暂无笔记数据</p>
            </div>
          )}
        </div>
      </div>

      {/* 手动录入弹窗 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-[#1A2421] font-serif">手动录入周数据</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-[#F4F6F0] rounded-full"
              >
                <X className="w-5 h-5 text-[#6B7A74]" />
              </button>
            </div>

            <div className="space-y-4">
              {/* 截图上传区域 */}
              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="screenshot-upload"
                />
                
                {!uploadedImage ? (
                  <label
                    htmlFor="screenshot-upload"
                    className="flex flex-col items-center justify-center gap-3 p-6 border-2 border-dashed border-[#2D4B3E]/20 rounded-2xl cursor-pointer hover:border-[#2D4B3E]/40 hover:bg-[#F4F6F0]/50 transition-all"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2D4B3E] to-[#4A7C6F] flex items-center justify-center">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-[#1A2421]">上传小红书后台截图</p>
                      <p className="text-xs text-[#9BA8A3] mt-1">AI 自动识别数据并填充</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-[#2D4B3E] font-medium">
                      <Sparkles className="w-3 h-3" />
                      点击上传或拖拽图片
                    </div>
                  </label>
                ) : (
                  <div className="relative rounded-2xl overflow-hidden bg-[#F4F6F0]">
                    <img 
                      src={uploadedImage} 
                      alt="上传的截图" 
                      className="w-full h-40 object-contain"
                    />
                    {analyzing && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="flex items-center gap-2 text-white">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span className="text-sm font-medium">AI 识别中...</span>
                        </div>
                      </div>
                    )}
                    <button
                      onClick={clearImage}
                      className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full hover:bg-white"
                    >
                      <X className="w-4 h-4 text-[#6B7A74]" />
                    </button>
                    {!analyzing && (
                      <label
                        htmlFor="screenshot-upload"
                        className="absolute bottom-2 right-2 flex items-center gap-1 px-3 py-1.5 bg-white/90 rounded-full text-xs font-medium text-[#2D4B3E] cursor-pointer hover:bg-white"
                      >
                        <ImageIcon className="w-3 h-3" />
                        重新上传
                      </label>
                    )}
                  </div>
                )}
              </div>

              <div className="relative flex items-center gap-3">
                <div className="flex-1 h-px bg-[#E2E8D5]"></div>
                <span className="text-xs text-[#9BA8A3]">或手动填写</span>
                <div className="flex-1 h-px bg-[#E2E8D5]"></div>
              </div>

              {/* 日期选择 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#6B7A74] mb-1.5 font-medium">周开始</label>
                  <input
                    type="date"
                    value={formData.week_start}
                    onChange={(e) => setFormData({ ...formData, week_start: e.target.value })}
                    className="w-full px-3 py-2.5 bg-[#F4F6F0] rounded-xl border-none text-sm focus:ring-2 focus:ring-[#2D4B3E]/20"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#6B7A74] mb-1.5 font-medium">周结束</label>
                  <input
                    type="date"
                    value={formData.week_end}
                    onChange={(e) => setFormData({ ...formData, week_end: e.target.value })}
                    className="w-full px-3 py-2.5 bg-[#F4F6F0] rounded-xl border-none text-sm focus:ring-2 focus:ring-[#2D4B3E]/20"
                  />
                </div>
              </div>

              {/* 核心数据 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#6B7A74] mb-1.5 font-medium">
                    <Users className="w-3 h-3 inline mr-1" />
                    粉丝总数
                  </label>
                  <input
                    type="number"
                    value={formData.followers || ''}
                    onChange={(e) => setFormData({ ...formData, followers: parseInt(e.target.value) || 0 })}
                    placeholder="43161"
                    className="w-full px-3 py-2.5 bg-[#F4F6F0] rounded-xl border-none text-sm focus:ring-2 focus:ring-[#2D4B3E]/20"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#6B7A74] mb-1.5 font-medium">
                    <TrendingUp className="w-3 h-3 inline mr-1" />
                    新增粉丝
                  </label>
                  <input
                    type="number"
                    value={formData.new_followers || ''}
                    onChange={(e) => setFormData({ ...formData, new_followers: parseInt(e.target.value) || 0 })}
                    placeholder="100"
                    className="w-full px-3 py-2.5 bg-[#F4F6F0] rounded-xl border-none text-sm focus:ring-2 focus:ring-[#2D4B3E]/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#6B7A74] mb-1.5 font-medium">
                    <Heart className="w-3 h-3 inline mr-1" />
                    获赞总数
                  </label>
                  <input
                    type="number"
                    value={formData.likes || ''}
                    onChange={(e) => setFormData({ ...formData, likes: parseInt(e.target.value) || 0 })}
                    placeholder="368938"
                    className="w-full px-3 py-2.5 bg-[#F4F6F0] rounded-xl border-none text-sm focus:ring-2 focus:ring-[#2D4B3E]/20"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#6B7A74] mb-1.5 font-medium">
                    <Bookmark className="w-3 h-3 inline mr-1" />
                    收藏总数
                  </label>
                  <input
                    type="number"
                    value={formData.saves || ''}
                    onChange={(e) => setFormData({ ...formData, saves: parseInt(e.target.value) || 0 })}
                    placeholder="35546"
                    className="w-full px-3 py-2.5 bg-[#F4F6F0] rounded-xl border-none text-sm focus:ring-2 focus:ring-[#2D4B3E]/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#6B7A74] mb-1.5 font-medium">
                    <MessageCircle className="w-3 h-3 inline mr-1" />
                    评论数
                  </label>
                  <input
                    type="number"
                    value={formData.comments || ''}
                    onChange={(e) => setFormData({ ...formData, comments: parseInt(e.target.value) || 0 })}
                    placeholder="500"
                    className="w-full px-3 py-2.5 bg-[#F4F6F0] rounded-xl border-none text-sm focus:ring-2 focus:ring-[#2D4B3E]/20"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#6B7A74] mb-1.5 font-medium">
                    <FileText className="w-3 h-3 inline mr-1" />
                    笔记数
                  </label>
                  <input
                    type="number"
                    value={formData.posts_count || ''}
                    onChange={(e) => setFormData({ ...formData, posts_count: parseInt(e.target.value) || 0 })}
                    placeholder="56"
                    className="w-full px-3 py-2.5 bg-[#F4F6F0] rounded-xl border-none text-sm focus:ring-2 focus:ring-[#2D4B3E]/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#6B7A74] mb-1.5 font-medium">
                  女粉占比 (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.female_ratio || ''}
                  onChange={(e) => setFormData({ ...formData, female_ratio: parseInt(e.target.value) || 85 })}
                  placeholder="85"
                  className="w-full px-3 py-2.5 bg-[#F4F6F0] rounded-xl border-none text-sm focus:ring-2 focus:ring-[#2D4B3E]/20"
                />
              </div>

              {/* 按钮 */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 border border-[#2D4B3E]/20 text-[#6B7A74] rounded-full font-medium hover:bg-[#F4F6F0]"
                >
                  取消
                </button>
                <button
                  onClick={saveWeeklyData}
                  disabled={saving}
                  className="flex-1 py-3 bg-[#2D4B3E] text-white rounded-full font-bold flex items-center justify-center gap-2 hover:bg-[#3D6654] disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? '保存中...' : '保存数据'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 笔记详情弹窗 */}
      <NoteDetailModal 
        noteId={selectedNoteId} 
        onClose={() => setSelectedNoteId(null)} 
      />
    </div>
  )
}
