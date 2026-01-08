'use client'
import { useState, useEffect } from 'react'
import { X, Heart, Bookmark, MessageCircle, Share2, MapPin, Calendar, Eye } from 'lucide-react'

interface NoteDetailModalProps {
  noteId: string | null
  onClose: () => void
}

interface NoteDetail {
  id: string
  title: string
  desc: string
  liked_count: number
  collected_count: number
  comments_count: number
  share_count?: number
  type: string
  time: number
  time_desc?: string
  ip_location?: string
  cover_url?: string
  images_list?: Array<{
    url?: string
    original?: string
    url_size_large?: string
  }>
  video?: {
    image?: {
      thumbnail?: string
    }
  }
  video_url?: string
  hash_tags?: Array<{
    name?: string
    id?: string
  }>
  user?: {
    nickname: string
    images: string
  }
  detail_synced_at?: string
}

export default function NoteDetailModal({ noteId, onClose }: NoteDetailModalProps) {
  const [loading, setLoading] = useState(true)
  const [note, setNote] = useState<NoteDetail | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!noteId) return
    
    const fetchDetail = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/note-detail', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ noteId })
        })
        const data = await res.json()
        if (data.success && data.note) {
          setNote(data.note)
        } else {
          setError(data.error || '获取失败')
        }
      } catch (err) {
        setError('网络错误')
      }
      setLoading(false)
    }
    
    fetchDetail()
  }, [noteId])

  if (!noteId) return null

  const formatNumber = (num: number) => {
    if (!num) return '0'
    if (num >= 10000) return (num / 10000).toFixed(1) + '万'
    return num.toLocaleString()
  }

  const formatDate = (timestamp: number) => {
    if (!timestamp) return ''
    const date = new Date(timestamp * 1000)
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-bold text-lg text-[#2D4B3E]">笔记详情</h3>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        
        {/* 内容 */}
        <div className="p-5 overflow-y-auto max-h-[calc(90vh-80px)]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-3 border-[#2D4B3E] border-t-transparent"></div>
              <span className="mt-4 text-gray-500">加载中...</span>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">😕</div>
              <p className="text-gray-500">{error}</p>
            </div>
          ) : note ? (
            <div className="space-y-5">
              {/* 用户信息 */}
              {note.user && (
                <div className="flex items-center gap-3">
                  <img 
                    src={note.user.images} 
                    alt={note.user.nickname}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{note.user.nickname}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      {note.ip_location && (
                        <span className="flex items-center gap-1">
                          <MapPin size={12} />
                          {note.ip_location}
                        </span>
                      )}
                      {note.time && (
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDate(note.time)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 标题 */}
              <h2 className="text-xl font-bold text-gray-900">
                {note.title || note.desc?.slice(0, 50) || '无标题'}
              </h2>
              
              {/* 数据统计 */}
              <div className="flex flex-wrap gap-4 p-4 bg-[#F4F6F0] rounded-2xl">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
                    <Heart size={16} className="text-rose-500" fill="currentColor" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">{formatNumber(note.liked_count)}</p>
                    <p className="text-xs text-gray-500">点赞</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                    <Bookmark size={16} className="text-amber-500" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">{formatNumber(note.collected_count)}</p>
                    <p className="text-xs text-gray-500">收藏</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <MessageCircle size={16} className="text-blue-500" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">{formatNumber(note.comments_count)}</p>
                    <p className="text-xs text-gray-500">评论</p>
                  </div>
                </div>
                {note.share_count !== undefined && note.share_count > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                      <Share2 size={16} className="text-purple-500" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">{formatNumber(note.share_count)}</p>
                      <p className="text-xs text-gray-500">分享</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* 图片展示 */}
              {note.images_list && note.images_list.length > 0 && (
                <div className={`grid gap-2 ${note.images_list.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                  {note.images_list.slice(0, 4).map((img, idx) => (
                    <img 
                      key={idx} 
                      src={img.original || img.url || img.url_size_large} 
                      alt={`图片${idx + 1}`}
                      className="rounded-xl w-full h-48 object-cover bg-gray-100"
                    />
                  ))}
                  {note.images_list.length > 4 && (
                    <div className="rounded-xl w-full h-48 bg-gray-100 flex items-center justify-center text-gray-500">
                      +{note.images_list.length - 4} 张图片
                    </div>
                  )}
                </div>
              )}

              {/* 视频缩略图 */}
              {(note.video?.image?.thumbnail || (note.type === '视频' && note.cover_url)) && (
                <div className="relative">
                  <img 
                    src={note.video?.image?.thumbnail || note.cover_url}
                    alt="视频封面"
                    className="rounded-xl w-full h-64 object-cover bg-gray-100"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center">
                      <div className="w-0 h-0 border-l-[24px] border-l-white border-y-[14px] border-y-transparent ml-1"></div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* 话题标签 */}
              {note.hash_tags && note.hash_tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {note.hash_tags.slice(0, 10).map((tag: any, idx: number) => (
                    <span key={idx} className="px-3 py-1 bg-[#2D4B3E]/5 text-[#2D4B3E] text-sm rounded-full">
                      #{typeof tag === 'string' ? tag : (tag.name || '')}
                    </span>
                  ))}
                </div>
              )}
              
              {/* 描述 */}
              {note.desc && (
                <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {note.desc}
                </div>
              )}

              {/* 收藏率计算 */}
              {note.liked_count > 0 && (
                <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">收藏率（核心指标）</span>
                    <span className="text-lg font-bold text-emerald-600">
                      {((note.collected_count / note.liked_count) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 bg-white rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full"
                      style={{ width: `${Math.min(100, (note.collected_count / note.liked_count) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

