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

// OneAPI请求函数
async function oneApiRequest(endpoint: string, body: object) {
  const apiKey = process.env.ONEAPI_KEY
  if (!apiKey) {
    throw new Error('ONEAPI_KEY 未配置')
  }

  console.log(`[OneAPI] 请求: ${endpoint}`, JSON.stringify(body))

  const response = await fetch(`${ONEAPI_BASE}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  })

  const result = await response.json()
  console.log(`[OneAPI] 响应: code=${result.code}, message=${result.message}`)

  if (result.code !== 200) {
    throw new Error(result.message || `OneAPI错误: ${result.code}`)
  }

  return result.data
}

// 解析数字
function parseCount(value: any): number {
  if (value === null || value === undefined) return 0
  if (typeof value === 'number') return value
  
  const str = String(value).trim().replace(/,/g, '')
  
  if (str.includes('万')) {
    return Math.round(parseFloat(str) * 10000)
  }
  if (str.toLowerCase().includes('k')) {
    return Math.round(parseFloat(str) * 1000)
  }
  
  const num = parseInt(str)
  return isNaN(num) ? 0 : num
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const userId = process.env.XHS_USER_ID
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: '未配置 XHS_USER_ID 环境变量' 
      }, { status: 500 })
    }

    if (!process.env.ONEAPI_KEY) {
      return NextResponse.json({ 
        success: false, 
        error: '未配置 ONEAPI_KEY 环境变量' 
      }, { status: 500 })
    }

    const supabase = getSupabase()
    if (!supabase) {
      return NextResponse.json({ 
        success: false, 
        error: 'Supabase 未配置' 
      }, { status: 500 })
    }

    console.log('[同步开始] userId:', userId)

    // ============ 1. 获取用户信息 ============
    let userInfo: any = null
    let followers = 0
    let nickname = '未知'

    try {
      userInfo = await oneApiRequest('/api/xiaohongshu/fetch_user_data_v4', { 
        userId 
      })
      console.log('[用户信息] 原始数据:', JSON.stringify(userInfo).substring(0, 500))

      if (userInfo) {
        // 尝试多种字段名
        nickname = userInfo.nickname || 
                   userInfo.basicInfo?.nickname || 
                   userInfo.user?.nickname ||
                   userInfo.name ||
                   '未知'

        // 粉丝数可能在不同字段
        followers = parseCount(
          userInfo.fansCount || 
          userInfo.fans || 
          userInfo.followerCount ||
          userInfo.basicInfo?.fansCount ||
          userInfo.interactions?.find((i: any) => i.type === 'fans' || i.name?.includes('粉丝'))?.count ||
          0
        )

        console.log(`[用户信息] 昵称: ${nickname}, 粉丝: ${followers}`)
      }
    } catch (e: any) {
      console.error('[用户信息] 获取失败:', e.message)
    }

    // ============ 2. 获取笔记列表 ============
    let notes: any[] = []
    
    try {
      const notesData = await oneApiRequest('/api/xiaohongshu/fetch_user_video_list', { 
        userId 
      })
      console.log('[笔记列表] 原始数据结构:', Object.keys(notesData || {}))

      // 尝试多种字段名
      notes = notesData?.notes || 
              notesData?.items || 
              notesData?.list ||
              notesData?.data?.notes ||
              []

      console.log(`[笔记列表] 获取到 ${notes.length} 篇笔记`)
    } catch (e: any) {
      console.error('[笔记列表] 获取失败:', e.message)
    }

    // ============ 3. 统计笔记数据 ============
    let totalLikes = 0
    let totalCollects = 0
    let totalComments = 0
    let totalViews = 0
    let savedNotes = 0

    for (const note of notes.slice(0, 15)) { // 最多处理15篇
      try {
        const noteId = note.noteId || note.id || note.note_id
        
        if (!noteId) {
          console.log('[笔记] 跳过：无noteId')
          continue
        }

        // 从列表数据中提取
        const likes = parseCount(note.likedCount || note.likes || note.likeCount || 0)
        const collects = parseCount(note.collectedCount || note.collects || note.collectCount || 0)
        const comments = parseCount(note.commentCount || note.comments || 0)
        const views = parseCount(note.viewCount || note.views || note.readCount || 0)

        totalLikes += likes
        totalCollects += collects
        totalComments += comments
        totalViews += views

        // 保存到数据库
        const noteTitle = note.title || note.desc || note.displayTitle || '无标题'
        
        const { error: upsertError } = await supabase.from('notes').upsert({
          id: noteId,
          title: noteTitle.substring(0, 200),
          content: note.desc || '',
          type: note.type === 'video' ? '视频' : '图文',
          status: 'published',
          views: views,
          likes: likes,
          collects: collects,
          comments: comments,
          updated_at: new Date().toISOString()
        }, { 
          onConflict: 'id' 
        })

        if (upsertError) {
          console.error('[笔记] 保存失败:', noteId, upsertError.message)
        } else {
          savedNotes++
        }

      } catch (e: any) {
        console.error('[笔记] 处理失败:', e.message)
      }
    }

    console.log(`[笔记统计] 点赞:${totalLikes} 收藏:${totalCollects} 评论:${totalComments} 浏览:${totalViews}`)

    // ============ 4. 保存周统计 ============
    const today = new Date()
    const weekStart = getWeekStart(today)
    const weekEnd = getWeekEnd(today)

    const weeklyData = {
      week_start: weekStart,
      week_end: weekEnd,
      followers: followers,
      new_followers: 0,
      likes: totalLikes,
      saves: totalCollects,
      comments: totalComments,
      views: totalViews,
      posts_count: notes.length,
      female_ratio: 0
    }

    const { error: statsError } = await supabase
      .from('weekly_stats')
      .upsert(weeklyData, { onConflict: 'week_start' })

    if (statsError) {
      console.error('[周统计] 保存失败:', statsError.message)
    } else {
      console.log('[周统计] 保存成功')
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1)
    console.log(`[同步完成] 耗时: ${duration}s`)

    return NextResponse.json({
      success: true,
      message: '数据同步成功！',
      data: {
        nickname,
        followers,
        notesCount: notes.length,
        savedNotes,
        totalLikes,
        totalCollects,
        totalComments,
        totalViews,
        duration: `${duration}s`
      }
    })

  } catch (error: any) {
    console.error('[同步失败]', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message || '同步失败'
    }, { status: 500 })
  }
}

// 获取本周开始日期（周一）
function getWeekStart(date: Date): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return d.toISOString().split('T')[0]
}

// 获取本周结束日期（周日）
function getWeekEnd(date: Date): string {
  const start = new Date(getWeekStart(date))
  start.setDate(start.getDate() + 6)
  return start.toISOString().split('T')[0]
}

// 测试接口
export async function GET() {
  const hasApiKey = !!process.env.ONEAPI_KEY
  const hasUserId = !!process.env.XHS_USER_ID
  
  return NextResponse.json({ 
    status: 'ok',
    config: {
      ONEAPI_KEY: hasApiKey ? '已配置' : '未配置',
      XHS_USER_ID: hasUserId ? process.env.XHS_USER_ID : '未配置'
    }
  })
}
