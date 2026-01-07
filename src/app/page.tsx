'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Users, Heart, Bookmark, MessageCircle, FileText, 
  RefreshCw, ArrowUpRight, MapPin, Clock, Settings,
  Sparkles
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

interface Comment {
  id: string
  user_nickname: string
  user_avatar: string
  content: string
  like_count: number
  ip_location: string
  created_at: string
}

export default function HomePage() {
  const [account, setAccount] = useState<AccountInfo | null>(null)
  const [stats, setStats] = useState<WeeklyStats | null>(null)
  const [topNotes, setTopNotes] = useState<Note[]>([])
  const [recentComments, setRecentComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  const loadData = async () => {
    try {
      const res = await fetch('/api/sync-xhs')
      const data = await res.json()
      if (data.data) {
        setAccount(data.data.account)
        setStats(data.data.latestStats)
        setTopNotes(data.data.topNotes || [])
        setRecentComments(data.data.recentComments || [])
      }
    } catch (e) {
      console.error('加载失败:', e)
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
        alert(`✅ 同步成功！(${data.data.duration})\n\n粉丝: ${formatNum(data.data.account.fans)}\n笔记: ${data.data.stats.savedNotes} 篇`)
      } else {
        alert('❌ 同步失败: ' + data.error)
      }
    } catch (e: any) {
      alert('❌ 同步失败: ' + e.message)
    }
    setSyncing(false)
  }

  useEffect(() => { loadData() }, [])

  // 格式化数字
  const formatNum = (num: number) => {
    if (!num) return '0'
    if (num >= 10000) return (num / 10000).toFixed(1) + '万'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
    return num.toString()
  }

  // 格式化时间
  const formatTime = (str: string) => {
    if (!str) return ''
    return new Date(str).toLocaleString('zh-CN', { 
      month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    })
  }

  // 计算收藏率
  const collectRate = account?.total_likes 
    ? ((account.total_collected / account.total_likes) * 100).toFixed(1) 
    : '0'

  // 计算互动率
  const interactRate = account?.fans 
    ? (((account.total_likes + account.total_collected) / account.fans) * 100).toFixed(0) 
    : '0'

  // 计算粉赞比
  const fanLikeRatio = account?.fans && account?.total_likes 
    ? (account.total_likes / account.fans).toFixed(1) 
    : '0'

  // 篇均数据
  const avgLikes = account?.notes_count && account?.total_likes 
    ? Math.round(account.total_likes / account.notes_count) 
    : 0
  const avgCollects = account?.notes_count && account?.total_collected 
    ? Math.round(account.total_collected / account.notes_count) 
    : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-orange-50/30 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>加载中...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-orange-50/30 pb-24 lg:pb-0">
      <div className="max-w-7xl mx-auto px-4 py-6 md:px-8 md:py-10">
        
        {/* 移动端顶部栏 */}
        <div className="flex items-center justify-between mb-5 lg:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900">小离岛岛</h1>
              <p className="text-[10px] text-gray-500">内容运营系统</p>
            </div>
          </div>
          <Link 
            href="/settings"
            className="p-2.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
          >
            <Settings size={22} />
          </Link>
        </div>

        {/* ========== 账号信息卡片 ========== */}
        <div className="bg-white rounded-3xl p-5 md:p-8 shadow-sm border border-gray-100/80 mb-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            
            {/* 左侧：头像和信息 */}
            <div className="flex items-center gap-4 md:gap-5">
              {/* 头像 - 渐变边框 */}
              <div className="p-0.5 md:p-1 rounded-full bg-gradient-to-tr from-rose-500 via-orange-400 to-amber-400 flex-shrink-0">
                {account?.avatar ? (
                  <img 
                    src={account.avatar} 
                    alt={account.nickname}
                    className="w-16 h-16 md:w-24 md:h-24 rounded-full object-cover bg-white border-2 border-white"
                  />
                ) : (
                  <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-rose-100 to-orange-100 flex items-center justify-center border-2 border-white">
                    <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-rose-400" />
                  </div>
                )}
              </div>
              
              {/* 账号信息 */}
              <div className="min-w-0">
                <div className="flex items-center gap-2 md:gap-3 mb-1">
                  <h2 className="text-xl md:text-3xl font-bold text-gray-900 truncate">
                    {account?.nickname || '小红书账号'}
                  </h2>
                  <span className="hidden sm:inline-block px-2.5 py-0.5 bg-gradient-to-r from-rose-500 to-orange-400 text-white text-xs font-medium rounded-full shadow-sm flex-shrink-0">
                    创作者
                  </span>
                </div>
                
                <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-gray-500 mb-1">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {account?.red_id || '-'}
                  </span>
                  {account?.ip_location && (
                    <>
                      <span className="text-gray-300">·</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {account.ip_location}
                      </span>
                    </>
                  )}
                </div>
                
                {account?.description && (
                  <p className="text-xs md:text-sm text-gray-400 max-w-md line-clamp-1 hidden sm:block">
                    {account.description}
                  </p>
                )}
              </div>
            </div>
            
            {/* 右侧：同步按钮 */}
            <div className="flex items-center gap-3 md:gap-4">
              {account?.updated_at && (
                <div className="text-right hidden md:block">
                  <p className="text-xs text-gray-400">上次同步</p>
                  <p className="text-sm text-gray-600 font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {formatTime(account.updated_at)}
                  </p>
                </div>
              )}
              <button
                onClick={syncData}
                disabled={syncing}
                className="group flex items-center gap-2 px-5 md:px-6 py-2.5 md:py-3 bg-gray-900 text-white rounded-2xl hover:bg-gray-800 disabled:opacity-60 transition-all shadow-lg shadow-gray-900/20 font-medium text-sm md:text-base"
              >
                <RefreshCw className={`w-4 h-4 md:w-5 md:h-5 transition-transform duration-500 ${syncing ? 'animate-spin' : 'group-hover:rotate-180'}`} />
                {syncing ? '同步中...' : '同步数据'}
              </button>
            </div>
          </div>
        </div>

        {/* ========== 核心数据卡片 ========== */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 mb-5">
          
          {/* 粉丝数 - 深色主卡片 */}
          <div className="bg-gray-900 rounded-2xl md:rounded-3xl p-4 md:p-6 text-white relative overflow-hidden group hover:shadow-xl hover:shadow-gray-900/20 transition-all">
            <div className="absolute top-0 right-0 w-24 md:w-32 h-24 md:h-32 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3 md:mb-4">
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-white/10 flex items-center justify-center">
                  <Users className="w-4 h-4 text-white/80" />
                </div>
                <span className="text-xs md:text-sm text-white/60">粉丝总数</span>
              </div>
              <div className="text-2xl md:text-4xl font-bold mb-1 md:mb-2">
                {formatNum(account?.fans || 0)}
              </div>
              {stats?.new_followers && stats.new_followers > 0 ? (
                <div className="flex items-center gap-1 text-emerald-400 text-xs md:text-sm">
                  <ArrowUpRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  本周 +{formatNum(stats.new_followers)}
                </div>
              ) : (
                <div className="text-xs md:text-sm text-white/40">本周暂无新增</div>
              )}
            </div>
          </div>

          {/* 获赞数 */}
          <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 border border-gray-100 hover:shadow-lg hover:shadow-gray-100 transition-all">
            <div className="flex items-center gap-2 mb-3 md:mb-4">
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-rose-50 flex items-center justify-center">
                <Heart className="w-4 h-4 text-rose-500" fill="currentColor" />
              </div>
              <span className="text-xs md:text-sm text-gray-500">获赞总数</span>
            </div>
            <div className="text-2xl md:text-4xl font-bold text-gray-900 mb-1 md:mb-2">
              {formatNum(account?.total_likes || 0)}
            </div>
            <div className="text-xs md:text-sm text-gray-400">
              篇均 <span className="text-gray-600 font-medium">{formatNum(avgLikes)}</span>
            </div>
          </div>

          {/* 收藏数 */}
          <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 border border-gray-100 hover:shadow-lg hover:shadow-gray-100 transition-all">
            <div className="flex items-center gap-2 mb-3 md:mb-4">
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                <Bookmark className="w-4 h-4 text-amber-500" />
              </div>
              <span className="text-xs md:text-sm text-gray-500">被收藏数</span>
            </div>
            <div className="text-2xl md:text-4xl font-bold text-gray-900 mb-1 md:mb-2">
              {formatNum(account?.total_collected || 0)}
            </div>
            <div className="text-xs md:text-sm text-gray-400">
              篇均 <span className="text-gray-600 font-medium">{formatNum(avgCollects)}</span>
            </div>
          </div>

          {/* 笔记数 */}
          <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 border border-gray-100 hover:shadow-lg hover:shadow-gray-100 transition-all">
            <div className="flex items-center gap-2 mb-3 md:mb-4">
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                <FileText className="w-4 h-4 text-blue-500" />
              </div>
              <span className="text-xs md:text-sm text-gray-500">笔记总数</span>
            </div>
            <div className="text-2xl md:text-4xl font-bold text-gray-900 mb-1 md:mb-2">
              {account?.notes_count || 0}
            </div>
            <div className="text-xs md:text-sm text-gray-400">
              关注 <span className="text-gray-600 font-medium">{account?.follows || 0}</span>
            </div>
          </div>
        </div>

        {/* ========== 关键指标 + 热门笔记 ========== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-6 mb-5">
          
          {/* 关键指标 */}
          <div className="lg:col-span-4 bg-white rounded-2xl md:rounded-3xl p-5 md:p-6 border border-gray-100">
            <h2 className="text-base md:text-lg font-bold text-gray-900 mb-4 md:mb-5 flex items-center gap-2">
              <span className="text-lg md:text-xl">📊</span> 关键指标
            </h2>
            
            <div className="space-y-4 md:space-y-5">
              {/* 收藏率 */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs md:text-sm text-gray-600">收藏率（核心指标）</span>
                  <span className="text-base md:text-lg font-bold text-rose-500">{collectRate}%</span>
                </div>
                <div className="h-2 md:h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-rose-400 to-rose-500 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(100, parseFloat(collectRate) * 10)}%` }}
                  />
                </div>
                <p className="text-[10px] md:text-xs text-gray-400 mt-1.5">收藏/点赞，建议 &gt; 5%</p>
              </div>

              {/* 互动率 */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs md:text-sm text-gray-600">互动率</span>
                  <span className="text-base md:text-lg font-bold text-blue-500">{interactRate}%</span>
                </div>
                <div className="h-2 md:h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full transition-all duration-1000"
                    style={{ width: '100%' }}
                  />
                </div>
                <p className="text-[10px] md:text-xs text-gray-400 mt-1.5">（点赞+收藏）/ 粉丝</p>
              </div>

              {/* 粉赞比 */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs md:text-sm text-gray-600">粉赞比</span>
                  <span className="text-base md:text-lg font-bold text-emerald-500">1 : {fanLikeRatio}</span>
                </div>
                <p className="text-[10px] md:text-xs text-gray-400">粉丝 : 获赞，越高内容质量越好</p>
              </div>

              {/* 篇均数据 */}
              <div className="border-t border-gray-100 pt-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 md:p-3.5 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl">
                    <p className="text-xl md:text-2xl font-bold text-gray-900">{formatNum(avgLikes)}</p>
                    <p className="text-[10px] md:text-xs text-gray-500 mt-1">篇均点赞</p>
                  </div>
                  <div className="text-center p-3 md:p-3.5 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl">
                    <p className="text-xl md:text-2xl font-bold text-gray-900">{formatNum(avgCollects)}</p>
                    <p className="text-[10px] md:text-xs text-gray-500 mt-1">篇均收藏</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 热门笔记 TOP5 */}
          <div className="lg:col-span-8 bg-white rounded-2xl md:rounded-3xl p-5 md:p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4 md:mb-5">
              <h2 className="text-base md:text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="text-lg md:text-xl">🔥</span> 热门笔记
              </h2>
              <Link href="/analytics" className="text-xs md:text-sm text-gray-400 hover:text-gray-600 transition-colors">
                查看全部 →
              </Link>
            </div>
            
            <div className="space-y-1 md:space-y-2">
              {topNotes.length > 0 ? topNotes.slice(0, 5).map((note, index) => (
                <div 
                  key={note.id}
                  className="flex items-center gap-3 md:gap-4 p-2.5 md:p-3 rounded-xl md:rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer group"
                >
                  {/* 排名 */}
                  <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-bold flex-shrink-0 ${
                    index < 3 
                      ? 'bg-gray-900 text-white' 
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {index + 1}
                  </div>
                  
                  {/* 封面 */}
                  <div className="w-11 h-11 md:w-14 md:h-14 rounded-lg md:rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                    {note.cover_image ? (
                      <img 
                        src={note.cover_image} 
                        alt={note.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText className="w-5 h-5 md:w-6 md:h-6 text-gray-300" />
                      </div>
                    )}
                  </div>
                  
                  {/* 标题和数据 */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm md:text-base font-medium text-gray-900 truncate group-hover:text-gray-700">
                      {note.title || '无标题'}
                    </p>
                    <div className="flex items-center gap-3 md:gap-4 mt-1 md:mt-1.5 text-xs md:text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3 md:w-3.5 md:h-3.5 text-rose-400" fill="currentColor" />
                        {formatNum(note.likes)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Bookmark className="w-3 h-3 md:w-3.5 md:h-3.5 text-amber-400" />
                        {formatNum(note.collects)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3 md:w-3.5 md:h-3.5 text-blue-400" />
                        {note.comments}
                      </span>
                    </div>
                  </div>
                  
                  {/* 类型标签 */}
                  <div className="flex-shrink-0 hidden sm:block">
                    <span className={`text-xs px-2 md:px-2.5 py-0.5 md:py-1 rounded-full ${
                      note.type === '视频' 
                        ? 'bg-purple-50 text-purple-600' 
                        : 'bg-blue-50 text-blue-600'
                    }`}>
                      {note.type}
                    </span>
                  </div>
                </div>
              )) : (
                <div className="text-center py-10 md:py-12 text-gray-400">
                  <FileText className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 text-gray-200" />
                  <p className="text-sm">点击"同步数据"获取笔记</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========== 最新评论 ========== */}
        {recentComments.length > 0 && (
          <div className="bg-white rounded-2xl md:rounded-3xl p-5 md:p-6 border border-gray-100 mb-5">
            <h2 className="text-base md:text-lg font-bold text-gray-900 mb-4 md:mb-5 flex items-center gap-2">
              <span className="text-lg md:text-xl">💬</span> 最新评论
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {recentComments.slice(0, 6).map((comment) => (
                <div 
                  key={comment.id}
                  className="flex gap-3 p-3 md:p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/30 hover:from-gray-100/50 hover:to-gray-100/50 transition-colors"
                >
                  {comment.user_avatar ? (
                    <img 
                      src={comment.user_avatar} 
                      alt={comment.user_nickname}
                      className="w-9 h-9 md:w-10 md:h-10 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gray-200 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 md:mb-1">
                      <span className="text-xs md:text-sm font-medium text-gray-900 truncate">
                        {comment.user_nickname}
                      </span>
                      {comment.ip_location && (
                        <span className="text-[10px] md:text-xs text-gray-400">{comment.ip_location}</span>
                      )}
                    </div>
                    <p className="text-xs md:text-sm text-gray-600 line-clamp-2">
                      {comment.content}
                    </p>
                    {comment.created_at && (
                      <p className="text-[10px] md:text-xs text-gray-400 mt-1 md:mt-1.5">
                        {formatTime(comment.created_at)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========== 粉丝画像 ========== */}
        <div className="bg-white rounded-2xl md:rounded-3xl p-5 md:p-6 border border-gray-100">
          <h2 className="text-base md:text-lg font-bold text-gray-900 mb-4 md:mb-5 flex items-center gap-2">
            <span className="text-lg md:text-xl">👥</span> 粉丝画像
          </h2>
          
          <div className="max-w-xl">
            <div className="flex justify-between text-xs md:text-sm mb-2 md:mb-3">
              <span className="text-rose-500 font-medium">👩 女性</span>
              <span className="text-blue-500 font-medium">👨 男性</span>
            </div>
            <div className="h-3 md:h-4 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-rose-400 to-rose-500 rounded-full transition-all duration-1000"
                style={{ width: `${stats?.female_ratio || 85}%` }}
              />
            </div>
            <div className="flex justify-between text-xs md:text-sm font-bold mt-2">
              <span className="text-rose-500">{stats?.female_ratio || 85}%</span>
              <span className="text-blue-500">{100 - (stats?.female_ratio || 85)}%</span>
            </div>
          </div>
          
          <p className="text-[10px] md:text-xs text-gray-400 mt-3 md:mt-4">
            * 根据小红书平台特征估算，精准数据需通过蒲公英后台获取
          </p>
        </div>

      </div>
    </div>
  )
}
