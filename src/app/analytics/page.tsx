'use client'

import { useState, useEffect } from 'react'
import { 
  Users, Heart, Bookmark, MessageCircle, TrendingUp, 
  FileText, Calendar, RefreshCw, ArrowUpRight,
  ArrowDownRight, BarChart3, Plus
} from 'lucide-react'

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
  shares: number
  cover_image: string
  publish_date: string
}

export default function AnalyticsPage() {
  const [weeklyData, setWeeklyData] = useState<WeeklyStats[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  const loadData = async () => {
    try {
      // 获取周统计数据
      const statsRes = await fetch('/api/weekly-stats')
      const statsData = await statsRes.json()
      if (statsData.success) {
        setWeeklyData(statsData.data || [])
      }

      // 获取笔记数据
      const notesRes = await fetch('/api/notes')
      const notesData = await notesRes.json()
      if (notesData.success) {
        setNotes(notesData.data || [])
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

  useEffect(() => {
    loadData()
  }, [])

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

  // 计算周环比
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
        <div className="flex gap-3">
          <button
            onClick={syncData}
            disabled={syncing}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#2D4B3E] text-white rounded-full hover:bg-[#3D6654] disabled:opacity-50 text-sm font-bold shadow-lg shadow-[#2D4B3E]/20"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? '同步中...' : '同步数据'}
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
            bg: 'bg-[#2D4B3E]',
            textColor: 'text-white',
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
        <h2 className="text-lg font-bold text-[#1A2421] mb-5 font-serif flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#2D4B3E]" />
          历史数据
        </h2>
        
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
                    暂无数据，点击"同步数据"获取
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
          {notes.length > 0 ? notes.slice(0, 12).map((note, index) => (
            <div 
              key={note.id}
              className="flex gap-3 p-4 rounded-xl border border-[#2D4B3E]/5 hover:border-[#2D4B3E]/15 transition-colors bg-[#FDFBF7]"
            >
              {/* 封面 */}
              {note.cover_image ? (
                <img 
                  src={note.cover_image} 
                  alt={note.title}
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-[#F4F6F0] flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-[#9BA8A3]" />
                </div>
              )}
              
              {/* 内容 */}
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
                  {note.type} · {note.publish_date || '-'}
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-3 text-center text-[#9BA8A3] py-12">
              暂无笔记数据
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
