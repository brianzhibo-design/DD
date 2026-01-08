'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Users, Heart, Bookmark, MessageCircle, FileText, 
  RefreshCw, ArrowUpRight, MapPin, Clock, Settings,
  Sparkles
} from 'lucide-react'
import NoteDetailModal from '@/components/NoteDetailModal'

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
  note_id: string
  title: string
  type: string
  likes: number
  collects: number
  comments: number
  cover: string
  publish_time: string
}


export default function HomePage() {
  const [account, setAccount] = useState<AccountInfo | null>(null)
  const [stats, setStats] = useState<WeeklyStats | null>(null)
  const [topNotes, setTopNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)

  const loadData = async () => {
    try {
      const res = await fetch('/api/sync-xhs')
      const data = await res.json()
      if (data.data) {
        setAccount(data.data.account)
        setStats(data.data.latestStats)
        setTopNotes(data.data.topNotes || [])
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
        const duration = data.data?.duration || ''
        const fans = data.data?.account?.fans || 0
        const notes = data.data?.stats?.savedNotes || 0
        alert(`✅ 同步成功！${duration ? `(${duration})` : ''}\n\n粉丝: ${formatNum(fans)}\n笔记: ${notes} 篇`)
      } else {
        alert('❌ 同步失败: ' + data.error)
      }
    } catch (e: any) {
      alert('❌ 同步失败: ' + e.message)
    }
    setSyncing(false)
  }

  useEffect(() => { loadData() }, [])

  const formatNum = (num: number) => {
    if (!num) return '0'
    if (num >= 10000) return (num / 10000).toFixed(1) + '万'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
    return num.toString()
  }

  const formatTime = (str: string) => {
    if (!str) return ''
    return new Date(str).toLocaleString('zh-CN', { 
      month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    })
  }

  const collectRate = account?.total_likes 
    ? ((account.total_collected / account.total_likes) * 100).toFixed(1) 
    : '0'

  const interactRate = account?.fans 
    ? (((account.total_likes + account.total_collected) / account.fans) * 100).toFixed(0) 
    : '0'

  const fanLikeRatio = account?.fans && account?.total_likes 
    ? (account.total_likes / account.fans).toFixed(1) 
    : '0'

  const avgLikes = account?.notes_count && account?.total_likes 
    ? Math.round(account.total_likes / account.notes_count) 
    : 0
  const avgCollects = account?.notes_count && account?.total_collected 
    ? Math.round(account.total_collected / account.notes_count) 
    : 0

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#6B7A74]">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>加载中...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-5 pb-24 lg:pb-8">
      
      {/* 移动端顶部栏 */}
      <div className="flex items-center justify-between lg:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2D4B3E] flex items-center justify-center shadow-lg shadow-[#2D4B3E]/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-[#2D4B3E] font-serif">小离岛岛</h1>
            <p className="text-[10px] text-[#6B7A74]">内容运营系统</p>
          </div>
        </div>
        <Link 
          href="/settings"
          className="p-2.5 rounded-xl text-[#6B7A74] hover:text-[#2D4B3E] hover:bg-[#F4F6F0] transition-all"
        >
          <Settings size={22} />
        </Link>
      </div>

      {/* 账号信息卡片 */}
      <div className="bg-white rounded-[2rem] p-5 md:p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#2D4B3E]/5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          
          <div className="flex items-center gap-4">
            <div className="p-0.5 rounded-full bg-gradient-to-tr from-[#2D4B3E] via-[#426B5A] to-[#C5A267] flex-shrink-0">
              {account?.avatar ? (
                <img 
                  src={account.avatar} 
                  alt={account.nickname}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover bg-white border-2 border-white"
                />
              ) : (
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#F4F6F0] flex items-center justify-center border-2 border-white">
                  <Sparkles className="w-6 h-6 text-[#2D4B3E]" />
                </div>
              )}
            </div>
            
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl md:text-2xl font-bold text-[#1A2421] font-serif truncate">
                  {account?.nickname || '小红书账号'}
                </h2>
                <span className="hidden sm:inline-block px-2 py-0.5 bg-[#2D4B3E] text-white text-[10px] font-bold rounded-full">
                  创作者
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-[#6B7A74]">
                <span>{account?.red_id || '-'}</span>
                {account?.ip_location && (
                  <>
                    <span className="text-[#9BA8A3]">·</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {account.ip_location}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {account?.updated_at && (
              <span className="text-xs text-[#9BA8A3] hidden md:flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTime(account.updated_at)}
              </span>
            )}
            <button
              onClick={syncData}
              disabled={syncing}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#2D4B3E] text-white rounded-full hover:bg-[#3D6654] disabled:opacity-50 transition-all text-sm font-bold shadow-lg shadow-[#2D4B3E]/20"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? '同步中...' : '同步'}
            </button>
          </div>
        </div>
      </div>

      {/* 核心数据卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 粉丝数 */}
        <div className="bg-[#2D4B3E] rounded-[2rem] p-5 text-white relative overflow-hidden shadow-lg shadow-[#2D4B3E]/20">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <Users className="w-4 h-4 text-white/80" />
              </div>
              <span className="text-xs text-white/60 font-bold uppercase tracking-wider">粉丝总数</span>
            </div>
            <div className="text-3xl font-black font-serif mb-1">
              {formatNum(account?.fans || 0)}
            </div>
            {stats?.new_followers && stats.new_followers > 0 ? (
              <div className="flex items-center gap-1 text-emerald-300 text-xs">
                <ArrowUpRight className="w-3.5 h-3.5" />
                本周 +{formatNum(stats.new_followers)}
              </div>
            ) : (
              <div className="text-xs text-white/40">关注 {account?.follows || 0}</div>
            )}
          </div>
        </div>

        {/* 获赞数 */}
        <div className="bg-white rounded-[2rem] p-5 border border-[#2D4B3E]/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
              <Heart className="w-4 h-4 text-rose-500" fill="currentColor" />
            </div>
            <span className="text-xs text-[#6B7A74] font-bold uppercase tracking-wider">获赞总数</span>
          </div>
          <div className="text-3xl font-black text-[#1A2421] font-serif mb-1">
            {formatNum(account?.total_likes || 0)}
          </div>
          <div className="text-xs text-[#9BA8A3]">
            篇均 <span className="text-[#6B7A74] font-medium">{formatNum(avgLikes)}</span>
          </div>
        </div>

        {/* 收藏数 */}
        <div className="bg-white rounded-[2rem] p-5 border border-[#2D4B3E]/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#C5A267]/10 flex items-center justify-center">
              <Bookmark className="w-4 h-4 text-[#C5A267]" />
            </div>
            <span className="text-xs text-[#6B7A74] font-bold uppercase tracking-wider">被收藏数</span>
          </div>
          <div className="text-3xl font-black text-[#1A2421] font-serif mb-1">
            {formatNum(account?.total_collected || 0)}
          </div>
          <div className="text-xs text-[#9BA8A3]">
            篇均 <span className="text-[#6B7A74] font-medium">{formatNum(avgCollects)}</span>
          </div>
        </div>

        {/* 笔记数 */}
        <div className="bg-white rounded-[2rem] p-5 border border-[#2D4B3E]/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#2D4B3E]/5 flex items-center justify-center">
              <FileText className="w-4 h-4 text-[#2D4B3E]" />
            </div>
            <span className="text-xs text-[#6B7A74] font-bold uppercase tracking-wider">笔记总数</span>
          </div>
          <div className="text-3xl font-black text-[#1A2421] font-serif mb-1">
            {account?.notes_count || 0}
          </div>
          <div className="text-xs text-[#9BA8A3]">持续创作中</div>
        </div>
      </div>

      {/* 关键指标 + 热门笔记 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* 关键指标 */}
        <div className="lg:col-span-4 bg-white rounded-[2rem] p-5 border border-[#2D4B3E]/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <h2 className="text-base font-bold text-[#1A2421] mb-4 font-serif">关键指标</h2>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-[#6B7A74]">收藏率（核心指标）</span>
                <span className="text-base font-bold text-[#2D4B3E]">{collectRate}%</span>
              </div>
              <div className="h-2 bg-[#F4F6F0] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#2D4B3E] rounded-full"
                  style={{ width: `${Math.min(100, parseFloat(collectRate) * 10)}%` }}
                />
              </div>
              <p className="text-[10px] text-[#9BA8A3] mt-1">收藏/点赞，建议 &gt; 5%</p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-[#6B7A74]">互动率</span>
                <span className="text-base font-bold text-[#2D4B3E]">{interactRate}%</span>
              </div>
              <p className="text-[10px] text-[#9BA8A3]">（点赞+收藏）/ 粉丝</p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-[#6B7A74]">粉赞比</span>
                <span className="text-base font-bold text-[#2D4B3E]">1 : {fanLikeRatio}</span>
              </div>
              <p className="text-[10px] text-[#9BA8A3]">粉丝 : 获赞，越高内容质量越好</p>
            </div>

            <div className="border-t border-[#2D4B3E]/5 pt-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-[#F4F6F0] rounded-xl">
                  <p className="text-xl font-bold text-[#1A2421]">{formatNum(avgLikes)}</p>
                  <p className="text-[10px] text-[#6B7A74] mt-1">篇均点赞</p>
                </div>
                <div className="text-center p-3 bg-[#F4F6F0] rounded-xl">
                  <p className="text-xl font-bold text-[#1A2421]">{formatNum(avgCollects)}</p>
                  <p className="text-[10px] text-[#6B7A74] mt-1">篇均收藏</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 热门笔记 */}
        <div className="lg:col-span-8 bg-white rounded-[2rem] p-5 border border-[#2D4B3E]/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[#1A2421] font-serif">热门笔记 TOP5</h2>
            <Link href="/analytics" className="text-xs text-[#6B7A74] hover:text-[#2D4B3E]">
              查看全部 →
            </Link>
          </div>
          
          <div className="space-y-2">
            {topNotes.length > 0 ? topNotes.slice(0, 5).map((note, index) => (
              <div 
                key={note.note_id}
                onClick={() => setSelectedNoteId(note.note_id)}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#F4F6F0] transition-colors cursor-pointer"
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  index < 3 ? 'bg-[#2D4B3E] text-white' : 'bg-[#F4F6F0] text-[#6B7A74]'
                }`}>
                  {index + 1}
                </div>
                
                <div className="w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 bg-[#F4F6F0]">
                  {note.cover ? (
                    <img src={note.cover} alt={note.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FileText className="w-5 h-5 text-[#9BA8A3]" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1A2421] truncate">{note.title || '无标题'}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-[#6B7A74]">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3 text-rose-400" fill="currentColor" />
                      {formatNum(note.likes)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Bookmark className="w-3 h-3 text-[#C5A267]" />
                      {formatNum(note.collects)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3 text-[#2D4B3E]" />
                      {note.comments}
                    </span>
                  </div>
                </div>
                
                <span className={`text-[10px] px-2 py-0.5 rounded-full hidden sm:block ${
                  note.type === '视频' ? 'bg-purple-50 text-purple-600' : 'bg-[#2D4B3E]/5 text-[#2D4B3E]'
                }`}>
                  {note.type}
                </span>
              </div>
            )) : (
              <div className="text-center py-10 text-[#9BA8A3]">
                <FileText className="w-10 h-10 mx-auto mb-3 text-[#F4F6F0]" />
                <p className="text-sm">点击"同步"获取笔记数据</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 粉丝画像 */}
      <div className="bg-white rounded-[2rem] p-5 border border-[#2D4B3E]/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <h2 className="text-base font-bold text-[#1A2421] mb-4 font-serif">粉丝画像</h2>
        
        <div className="max-w-xl">
          <div className="flex justify-between text-xs mb-2">
            <span className="text-rose-500 font-bold">女性</span>
            <span className="text-[#2D4B3E] font-bold">男性</span>
          </div>
          <div className="h-3 bg-[#F4F6F0] rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-rose-400 to-rose-500 rounded-full"
              style={{ width: `${stats?.female_ratio || 85}%` }}
            />
          </div>
          <div className="flex justify-between text-xs font-bold mt-2">
            <span className="text-rose-500">{stats?.female_ratio || 85}%</span>
            <span className="text-[#2D4B3E]">{100 - (stats?.female_ratio || 85)}%</span>
          </div>
        </div>
        
        <p className="text-[10px] text-[#9BA8A3] mt-4">
          * 根据小红书平台特征估算，精准数据需通过蒲公英后台获取
        </p>
      </div>

      {/* 笔记详情弹窗 */}
      <NoteDetailModal 
        noteId={selectedNoteId} 
        onClose={() => setSelectedNoteId(null)} 
      />
    </div>
  )
}
