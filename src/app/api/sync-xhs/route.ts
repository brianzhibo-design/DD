import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const maxDuration = 60 // 增加到60秒超时

const ONEAPI_BASE = 'https://api.getoneapi.com'

// OneAPI 错误码映射
const ERROR_CODES: Record<number, string> = {
  0: '请求失败，请重试',
  401: 'API密钥无效，请检查 ONEAPI_KEY',
  403: '账户不可用，请联系 OneAPI',
  404: 'API 未找到或不可用',
  301: '余额不足，请充值'
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

// 带重试的 API 请求（最多重试，只有 code=200 计费）
async function oneApiRequest(
  endpoint: string, 
  body: object, 
  options?: { 
    maxRetries?: number
    alternativeEndpoints?: string[]
  }
): Promise<any> {
  const apiKey = process.env.ONEAPI_KEY
  if (!apiKey) throw new Error('ONEAPI_KEY 未配置')

  const maxRetries = options?.maxRetries ?? 3
  const endpoints = [endpoint, ...(options?.alternativeEndpoints || [])]
  
  let lastError: Error | null = null

  for (const ep of endpoints) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const url = ONEAPI_BASE + ep

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify(body)
        })

        const result = await response.json()
        
        // 成功
        if (result.code === 200) {
          return result.data
        }

        // 处理特定错误码
        const errorMsg = ERROR_CODES[result.code] || result.message || `OneAPI错误: ${result.code}`
        
        // 401/403/301 不需要重试
        if ([401, 403, 301].includes(result.code)) {
          throw new Error(errorMsg)
        }

        // 其他错误可以重试
        lastError = new Error(errorMsg)
        console.warn(`[OneAPI] ${ep} 尝试 ${attempt}/${maxRetries} 失败: ${errorMsg}`)
        
        // 等待后重试（递增延迟）
        if (attempt < maxRetries) {
          await new Promise(r => setTimeout(r, attempt * 500))
        }

      } catch (error: any) {
        lastError = error
        console.warn(`[OneAPI] ${ep} 尝试 ${attempt}/${maxRetries} 异常:`, error.message)
        
        if (attempt < maxRetries) {
          await new Promise(r => setTimeout(r, attempt * 500))
        }
      }
    }
    console.log(`[OneAPI] 切换到备用接口...`)
  }

  throw lastError || new Error('API 请求失败')
}

// ============ 主同步接口（快速） ============
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const supabase = getSupabase()
  
  if (!supabase) {
    return NextResponse.json({ success: false, error: 'Supabase 未配置' }, { status: 500 })
  }

  try {
    const userId = process.env.XHS_USER_ID
    if (!userId) {
      return NextResponse.json({ success: false, error: '未配置 XHS_USER_ID' }, { status: 500 })
    }

    console.log('[同步开始] userId:', userId)

    // ========== 1. 获取用户信息（约2秒） ==========
    const userResult = await oneApiRequest('/api/xiaohongshu/fetch_user_data_v4', { userId })
    const userData = userResult.data || userResult
    
    const accountInfo = {
      id: 'main',
      nickname: userData.nickname || '未知',
      red_id: userData.red_id || '',
      avatar: userData.images || '',
      description: userData.desc || '',
      ip_location: userData.ip_location || '',
      fans: parseInt(userData.fans) || 0,
      follows: parseInt(userData.follows) || 0,
      total_likes: parseInt(userData.liked) || 0,
      total_collected: parseInt(userData.collected) || 0,
      notes_count: parseInt(userData.ndiscovery) || 0,
      updated_at: new Date().toISOString()
    }

    // 保存账号信息
    await supabase.from('account_info').upsert(accountInfo, { onConflict: 'id' })
    console.log(`[用户信息] ${accountInfo.nickname} | 粉丝:${accountInfo.fans} | 耗时:${Date.now() - startTime}ms`)

    // ========== 2. 获取笔记列表（约3秒） ==========
    const notesResult = await oneApiRequest('/api/xiaohongshu/fetch_user_video_list', { userId })
    const notes = notesResult.notes || []
    console.log(`[笔记列表] 获取到 ${notes.length} 篇 | 耗时:${Date.now() - startTime}ms`)

    // ========== 3. 快速保存笔记基础数据 ==========
    let savedNotes = 0
    let totalLikes = 0
    let totalCollects = 0
    let totalComments = 0

    for (const note of notes) {
      const noteId = note.id || note.note_id || note.cursor
      if (!noteId) continue

      const likes = parseInt(note.likes) || parseInt(note.liked_count) || 0
      const collects = parseInt(note.collected_count) || parseInt(note.collects) || 0
      const comments = parseInt(note.comments_count) || parseInt(note.comments) || 0
      const shares = parseInt(note.share_count) || 0
      const title = note.display_title || note.title || note.desc?.substring(0, 50) || '无标题'
      const coverImage = note.images_list?.[0]?.url_size_large || 
                         note.images_list?.[0]?.url || 
                         note.cover?.url_default ||
                         note.cover?.url || ''

      totalLikes += likes
      totalCollects += collects
      totalComments += comments

      // 保存笔记（不调用详情API，直接用列表数据）
      const { error } = await supabase.from('notes').upsert({
        id: noteId,
        title: title.substring(0, 200),
        content: note.desc || '',
        type: note.type === 'video' ? '视频' : '图文',
        status: 'published',
        likes,
        collects,
        comments,
        shares,
        views: 0,
        cover_image: coverImage,
        publish_date: note.time_desc || null,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' })

      if (error) {
        console.error(`[笔记保存失败] ${noteId}: ${error.message}`)
      } else {
        savedNotes++
      }
    }

    console.log(`[笔记保存] 成功 ${savedNotes} 篇 | 耗时:${Date.now() - startTime}ms`)

    // ========== 4. 保存周统计数据 ==========
    const weekStart = getWeekStart(new Date())
    const weekEnd = getWeekEnd(new Date())

    // 获取上周数据计算增长
    const { data: lastWeekList } = await supabase
      .from('weekly_stats')
      .select('followers')
      .lt('week_start', weekStart)
      .order('week_start', { ascending: false })
      .limit(1)

    const lastFollowers = lastWeekList?.[0]?.followers || accountInfo.fans
    const newFollowers = Math.max(0, accountInfo.fans - lastFollowers)

    const weeklyData = {
      week_start: weekStart,
      week_end: weekEnd,
      followers: accountInfo.fans,
      new_followers: newFollowers,
      likes: accountInfo.total_likes,
      saves: accountInfo.total_collected,
      comments: totalComments,
      shares: 0,
      views: 0,
      posts_count: accountInfo.notes_count,
      female_ratio: 85
    }
    console.log('[周统计数据]', JSON.stringify(weeklyData))
    
    const { error: weeklyError } = await supabase.from('weekly_stats').upsert(weeklyData, { onConflict: 'week_start' })
    if (weeklyError) {
      console.error('[周统计保存失败]', weeklyError.message, weeklyError.details)
    } else {
      console.log('[周统计保存成功]')
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1)
    console.log(`[同步完成] 耗时:${duration}s`)

    return NextResponse.json({
      success: true,
      message: '数据同步成功！',
      data: {
        account: accountInfo,
        stats: {
          notesCount: notes.length,
          savedNotes,
          newFollowers
        },
        duration: `${duration}s`
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

// ============ 获取已存储的数据 ============
export async function GET() {
  const configured = !!(process.env.ONEAPI_KEY && process.env.XHS_USER_ID)
  
  const supabase = getSupabase()
  if (!supabase) {
    return NextResponse.json({ status: 'ok', configured, data: null })
  }

  try {
    // 并行获取所有数据
    const [accountRes, statsRes, notesRes, commentsRes] = await Promise.all([
      supabase.from('account_info').select('*').eq('id', 'main').limit(1),
      supabase.from('weekly_stats').select('*').order('week_start', { ascending: false }).limit(1),
      supabase.from('notes').select('*').order('likes', { ascending: false }).limit(10),
      supabase.from('note_comments').select('*').order('created_at', { ascending: false }).limit(10)
    ])

    return NextResponse.json({ 
      status: 'ok',
      configured: !!(process.env.ONEAPI_KEY && process.env.XHS_USER_ID),
      data: {
        account: accountRes.data?.[0] || null,
        latestStats: statsRes.data?.[0] || null,
        topNotes: notesRes.data || [],
        recentComments: commentsRes.data || []
      },
      config: {
        ONEAPI_KEY: process.env.ONEAPI_KEY ? '已配置' : '未配置',
        XHS_USER_ID: process.env.XHS_USER_ID || '未配置'
      }
    })
  } catch (e) {
    return NextResponse.json({ status: 'ok', configured, data: null })
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
