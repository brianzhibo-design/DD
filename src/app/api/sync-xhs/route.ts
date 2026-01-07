import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const maxDuration = 25

const ONEAPI_BASE = 'https://api.getoneapi.com'

// 获取 Supabase 客户端
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

// OneAPI请求
async function oneApiRequest(endpoint: string, body: object) {
  const apiKey = process.env.ONEAPI_KEY
  if (!apiKey) throw new Error('ONEAPI_KEY 未配置')

  const response = await fetch(`${ONEAPI_BASE}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  })

  const result = await response.json()
  
  if (result.code !== 200) {
    throw new Error(result.message || `OneAPI错误: ${result.code}`)
  }

  return result.data
}

export async function POST(request: NextRequest) {
  try {
    const userId = process.env.XHS_USER_ID
    if (!userId) {
      return NextResponse.json({ success: false, error: '未配置 XHS_USER_ID' }, { status: 500 })
    }

    const supabase = getSupabase()
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Supabase 未配置' }, { status: 500 })
    }

    console.log('[同步开始] userId:', userId)

    // ====== 1. 获取用户信息 ======
    const userResult = await oneApiRequest('/api/xiaohongshu/fetch_user_data_v4', { userId })
    
    // 解析用户数据 - 数据在 data.data 里
    const userData = userResult.data || userResult
    
    const nickname = userData.nickname || '未知'
    const fans = userData.fans || 0
    const follows = userData.follows || 0
    const liked = userData.liked || 0  // 获赞数
    const collected = userData.collected || 0  // 被收藏数
    const ndiscovery = userData.ndiscovery || 0  // 笔记数
    const ipLocation = userData.ip_location || ''
    const redId = userData.red_id || ''

    // 从interactions中获取数据（备用）
    let interactionLikes = 0
    if (userData.interactions) {
      const interactionItem = userData.interactions.find((i: any) => i.type === 'interaction')
      if (interactionItem) {
        interactionLikes = interactionItem.count || 0
      }
    }

    console.log(`[用户信息] 昵称:${nickname} 粉丝:${fans} 获赞:${liked} 笔记:${ndiscovery}`)

    // ====== 2. 获取笔记列表 ======
    const notesResult = await oneApiRequest('/api/xiaohongshu/fetch_user_video_list', { userId })
    const notes = notesResult.notes || []
    
    console.log(`[笔记列表] 获取到 ${notes.length} 篇笔记`)

    // ====== 3. 处理笔记数据 ======
    let totalLikes = 0
    let totalCollects = 0
    let savedNotes = 0

    for (const note of notes.slice(0, 20)) {
      const noteId = note.note_id || note.id || note.cursor
      const likeCount = note.liked_count || note.likedCount || 0
      const collectCount = note.collected_count || note.collectedCount || 0
      const title = note.display_title || note.title || note.desc || ''
      const noteType = note.type === 'video' ? '视频' : '图文'

      totalLikes += likeCount
      totalCollects += collectCount

      // 保存到数据库
      if (noteId) {
        const { error } = await supabase.from('notes').upsert({
          id: noteId,
          title: title.substring(0, 200),
          type: noteType,
          status: 'published',
          likes: likeCount,
          collects: collectCount,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' })

        if (!error) savedNotes++
      }
    }

    // ====== 4. 保存周统计 ======
    const today = new Date()
    const weekStart = getWeekStart(today)
    const weekEnd = getWeekEnd(today)

    await supabase.from('weekly_stats').upsert({
      week_start: weekStart,
      week_end: weekEnd,
      followers: fans,
      new_followers: 0,
      likes: liked || interactionLikes,
      saves: collected,
      comments: 0,
      views: 0,
      posts_count: ndiscovery || notes.length,
      female_ratio: 0
    }, { onConflict: 'week_start' })

    console.log('[同步完成]')

    return NextResponse.json({
      success: true,
      message: '同步成功！',
      data: {
        nickname,
        redId,
        ipLocation,
        followers: fans,
        following: follows,
        totalLikes: liked,
        totalCollected: collected,
        notesCount: ndiscovery || notes.length,
        savedNotes
      }
    })

  } catch (error: any) {
    console.error('[同步失败]', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}

function getWeekStart(date: Date): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return d.toISOString().split('T')[0]
}

function getWeekEnd(date: Date): string {
  const start = new Date(getWeekStart(new Date()))
  start.setDate(start.getDate() + 6)
  return start.toISOString().split('T')[0]
}

export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    config: {
      ONEAPI_KEY: process.env.ONEAPI_KEY ? '已配置' : '未配置',
      XHS_USER_ID: process.env.XHS_USER_ID || '未配置'
    }
  })
}
