'use client'

import { useState, useEffect } from 'react'
import { 
  Users, Heart, Bookmark, MessageCircle, FileText, RefreshCw, 
  ArrowUpRight, Sparkles
} from 'lucide-react'

interface AccountInfo {
  nickname: string
  red_id: string
  avatar: string
  description: string
  ip_location: string
  fans: number
  follows: number
  total_likes: number
  total_collected: number
  notes_count: number
  updated_at: string
}

interface WeeklyStats {
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
  cover_image: string
  publish_date: string
}

export default function HomePage() {
  const [account, setAccount] = useState<AccountInfo | null>(null)
  const [stats, setStats] = useState<WeeklyStats | null>(null)
  const [topNotes, setTopNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [lastSync, setLastSync] = useState<string>('')

  const loadData = async () => {
    try {
      const res = await fetch('/api/sync-xhs')
      const data = await res.json()
      
      if (data.data) {
        setAccount(data.data.account)
        setStats(data.data.latestStats)
        setTopNotes(data.data.topNotes || [])
        if (data.data.account?.updated_at) {
          setLastSync(new Date(data.data.account.updated_at).toLocaleString('zh-CN'))
        }
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

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-[#6B7A74]">加载中...</div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* 头部：账号信息 + 同步按钮 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          {account?.avatar ? (
            <img 
              src={account.avatar} 
              alt={account.nickname}
              className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-2 border-white shadow-lg"
            />
          ) : (
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#2D4B3E] flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          )}
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[#1A2421] font-serif">
              {account?.nickname || '小离岛岛'}
            </h1>
            <p className="text-sm text-[#6B7A74]">
              小红书号: {account?.red_id || '-'} · {account?.ip_location || ''}
            </p>
            <p className="text-xs text-[#9BA8A3] mt-1 line-clamp-1 max-w-md">
              {account?.description || ''}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#9BA8A3]">
            {lastSync ? `上次同步: ${lastSync}` : ''}
          </span>
          <button
            onClick={syncData}
            disabled={syncing}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#2D4B3E] text-white rounded-full hover:bg-[#3D6654] disabled:opacity-50 transition-all text-sm font-bold shadow-lg shadow-[#2D4B3E]/20"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? '同步中...' : '同步小红书'}
          </button>
        </div>
      </div>

      {/* 核心数据卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* 粉丝数 */}
        <div className="bg-[#2D4B3E] text-white rounded-[2rem] p-5 shadow-lg shadow-[#2D4B3E]/20">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-white/60" />
            <span className="text-xs text-white/60 font-bold uppercase tracking-wider">粉丝总数</span>
          </div>
          <div className="text-3xl font-black font-serif">
            {formatNumber(account?.fans || 0)}
          </div>
          {stats?.new_followers ? (
            <div className="flex items-center gap-1 mt-2 text-xs text-emerald-300">
              <ArrowUpRight className="w-3 h-3" />
              本周 +{stats.new_followers}
            </div>
          ) : null}
        </div>

        {/* 获赞数 */}
        <div className="bg-white rounded-[2rem] p-5 border border-[#2D4B3E]/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-4 h-4 text-rose-500" />
            <span className="text-xs text-[#6B7A74] font-bold uppercase tracking-wider">获赞总数</span>
          </div>
          <div className="text-3xl font-black text-[#1A2421] font-serif">
            {formatNumber(account?.total_likes || 0)}
          </div>
        </div>

        {/* 收藏数 */}
        <div className="bg-white rounded-[2rem] p-5 border border-[#2D4B3E]/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex items-center gap-2 mb-3">
            <Bookmark className="w-4 h-4 text-[#C5A267]" />
            <span className="text-xs text-[#6B7A74] font-bold uppercase tracking-wider">被收藏数</span>
          </div>
          <div className="text-3xl font-black text-[#1A2421] font-serif">
            {formatNumber(account?.total_collected || 0)}
          </div>
        </div>

        {/* 笔记数 */}
        <div className="bg-white rounded-[2rem] p-5 border border-[#2D4B3E]/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-[#2D4B3E]" />
            <span className="text-xs text-[#6B7A74] font-bold uppercase tracking-wider">笔记总数</span>
          </div>
          <div className="text-3xl font-black text-[#1A2421] font-serif">
            {account?.notes_count || 0}
          </div>
        </div>
      </div>

      {/* 关键指标 + 热门笔记 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* 关键指标 */}
        <div className="bg-white rounded-[2rem] p-6 border border-[#2D4B3E]/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <h2 className="text-lg font-bold text-[#1A2421] mb-5 font-serif">关键指标</h2>
          
          <div className="space-y-5">
            {/* 收藏率 */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-[#6B7A74]">收藏率（核心指标）</span>
                <span className="text-sm font-bold text-[#2D4B3E]">
                  {account?.total_likes ? 
                    ((account.total_collected / account.total_likes) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="text-xs text-[#9BA8A3]">小红书核心指标，建议&gt;5%</div>
            </div>

            {/* 互动率 */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-[#6B7A74]">互动率</span>
                <span className="text-sm font-bold text-[#2D4B3E]">
                  {account?.fans ? 
                    (((account.total_likes + account.total_collected) / account.fans) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="text-xs text-[#9BA8A3]">（点赞+收藏）/ 粉丝数</div>
            </div>

            {/* 粉赞比 */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-[#6B7A74]">粉赞比</span>
                <span className="text-sm font-bold text-[#2D4B3E]">
                  1:{account?.fans && account?.total_likes ? 
                    (account.total_likes / account.fans).toFixed(1) : 0}
                </span>
              </div>
              <div className="text-xs text-[#9BA8A3]">粉丝:获赞，越高说明内容质量越好</div>
            </div>

            {/* 篇均数据 */}
            <div className="pt-4 border-t border-[#2D4B3E]/5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-[#6B7A74]">篇均点赞</span>
                <span className="text-sm font-bold text-[#1A2421]">
                  {account?.notes_count && account?.total_likes ? 
                    formatNumber(Math.round(account.total_likes / account.notes_count)) : 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#6B7A74]">篇均收藏</span>
                <span className="text-sm font-bold text-[#1A2421]">
                  {account?.notes_count && account?.total_collected ? 
                    formatNumber(Math.round(account.total_collected / account.notes_count)) : 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 热门笔记 */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] p-6 border border-[#2D4B3E]/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <h2 className="text-lg font-bold text-[#1A2421] mb-5 font-serif">热门笔记 TOP5</h2>
          
          <div className="space-y-3">
            {topNotes.length > 0 ? topNotes.map((note, index) => (
              <div 
                key={note.id}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F4F6F0] transition-colors"
              >
                {/* 排名 */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  index < 3 ? 'bg-[#2D4B3E] text-white' : 'bg-[#F4F6F0] text-[#6B7A74]'
                }`}>
                  {index + 1}
                </div>
                
                {/* 封面 */}
                {note.cover_image ? (
                  <img 
                    src={note.cover_image} 
                    alt={note.title}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-[#F4F6F0] flex items-center justify-center">
                    <FileText className="w-5 h-5 text-[#9BA8A3]" />
                  </div>
                )}
                
                {/* 标题和数据 */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[#1A2421] truncate">
                    {note.title}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-[#6B7A74]">
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
                    <span className="text-[#9BA8A3]">
                      {note.type}
                    </span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center text-[#9BA8A3] py-8">
                点击"同步小红书"获取笔记数据
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 粉丝性别分布 */}
      <div className="bg-white rounded-[2rem] p-6 border border-[#2D4B3E]/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <h2 className="text-lg font-bold text-[#1A2421] mb-5 font-serif">粉丝画像</h2>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-rose-500 font-bold">女性</span>
              <span className="text-[#2D4B3E] font-bold">男性</span>
            </div>
            <div className="h-3 bg-[#F4F6F0] rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-rose-400 to-rose-500 rounded-full"
                style={{ width: `${stats?.female_ratio || 85}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-[#6B7A74] mt-2">
              <span>{stats?.female_ratio || 85}%</span>
              <span>{100 - (stats?.female_ratio || 85)}%</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-[#9BA8A3] mt-4">
          * 根据小红书平台特征估算，精准数据需通过蒲公英平台获取
        </p>
      </div>
    </div>
  )
}
