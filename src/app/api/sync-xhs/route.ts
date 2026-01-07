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

  console.log(`[OneAPI] 请求: ${endpoint}`)

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
    
    // 解析用户数据 - 数据可能在 data.data 或直接在 data 里
    const userData = userResult.data || userResult
    
    const nickname = userData.nickname || '未知'
    const fans = parseInt(userData.fans) || 0
    const follows = parseInt(userData.follows) || 0
    const liked = parseInt(userData.liked) || 0  // 总获赞数
    const collected = parseInt(userData.collected) || 0  // 总被收藏数
    const ndiscovery = parseInt(userData.ndiscovery) || 0  // 笔记数
    const ipLocation = userData.ip_location || ''
    const redId = userData.red_id || ''

    console.log(`[用户信息] 昵称:${nickname} 粉丝:${fans} 获赞:${liked} 收藏:${collected} 笔记:${ndiscovery}`)

    // ====== 2. 获取笔记列表 ======
    const notesResult = await oneApiRequest('/api/xiaohongshu/fetch_user_video_list', { userId })
    const notes = notesResult.notes || []
    
    console.log(`[笔记列表] 获取到 ${notes.length} 篇笔记`)

    // ====== 3. 处理所有笔记数据 ======
    let totalNoteLikes = 0
    let totalNoteCollects = 0
    let totalNoteComments = 0
    let totalNoteViews = 0
    let savedNotes = 0

    // 处理所有笔记（不限制数量）
    for (const note of notes) {
      const noteId = note.note_id || note.id || note.cursor
      
      // 提取笔记数据
      const likeCount = parseInt(note.liked_count) || parseInt(note.likedCount) || 0
      const collectCount = parseInt(note.collected_count) || parseInt(note.collectedCount) || 0
      const commentCount = parseInt(note.comment_count) || parseInt(note.commentCount) || 0
      const viewCount = parseInt(note.view_count) || parseInt(note.viewCount) || 0
      
      const title = note.display_title || note.title || note.desc || ''
      const noteType = note.type === 'video' ? '视频' : '图文'
      const cover = note.cover?.url_default || note.cover?.url || ''

      totalNoteLikes += likeCount
      totalNoteCollects += collectCount
      totalNoteComments += commentCount
      totalNoteViews += viewCount

      // 保存到数据库
      if (noteId) {
        const { error } = await supabase.from('notes').upsert({
          id: noteId,
          title: title.substring(0, 200),
          type: noteType,
          status: 'published',
          likes: likeCount,
          collects: collectCount,
          comments: commentCount,
          views: viewCount,
          cover_url: cover,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' })

        if (!error) {
          savedNotes++
        } else {
          console.error(`[笔记保存失败] ${noteId}:`, error.message)
        }
      }
    }

    console.log(`[笔记统计] 点赞:${totalNoteLikes} 收藏:${totalNoteCollects} 评论:${totalNoteComments} 浏览:${totalNoteViews}`)
    console.log(`[笔记保存] 成功保存 ${savedNotes}/${notes.length} 篇`)

    // ====== 4. 获取上周数据计算增量 ======
    const today = new Date()
    const weekStart = getWeekStart(today)
    const weekEnd = getWeekEnd(today)

    // 查询上周数据
    const { data: lastWeekData } = await supabase
      .from('weekly_stats')
      .select('followers')
      .lt('week_start', weekStart)
      .order('week_start', { ascending: false })
      .limit(1)
      .single()

    const lastFollowers = lastWeekData?.followers || fans
    const newFollowers = Math.max(0, fans - lastFollowers)

    console.log(`[增量计算] 上周粉丝:${lastFollowers} 本周粉丝:${fans} 新增:${newFollowers}`)

    // ====== 5. 保存周统计 ======
    const weeklyData = {
      week_start: weekStart,
      week_end: weekEnd,
      followers: fans,
      new_followers: newFollowers,
      likes: liked,           // 用户总获赞
      saves: collected,       // 用户总被收藏
      comments: totalNoteComments,  // 笔记评论总和
      views: totalNoteViews,        // 笔记浏览总和（如果API没返回则为0）
      posts_count: ndiscovery || notes.length,
      female_ratio: 85  // 默认值，需要从其他渠道获取
    }

    console.log('[周统计数据]', JSON.stringify(weeklyData))

    const { error: statsError } = await supabase
      .from('weekly_stats')
      .upsert(weeklyData, { onConflict: 'week_start' })

    if (statsError) {
      console.error('[周统计保存失败]', statsError)
    } else {
      console.log('[周统计保存成功]')
    }

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
        savedNotes,
        newFollowers,
        noteStats: {
          likes: totalNoteLikes,
          collects: totalNoteCollects,
          comments: totalNoteComments,
          views: totalNoteViews
        }
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
