import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 增加超时时间以支持分页获取全部笔记
export const maxDuration = 60

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const ONEAPI_BASE = 'https://api.getoneapi.com'
const ONEAPI_KEY = process.env.ONEAPI_KEY
const XHS_USER_ID = process.env.XHS_USER_ID

async function oneApiRequest(endpoint: string, body: object) {
  if (!ONEAPI_KEY) throw new Error('ONEAPI_KEY 未配置')

  const response = await fetch(`${ONEAPI_BASE}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ONEAPI_KEY}`
    },
    body: JSON.stringify(body)
  })

  const result = await response.json()
  
  if (result.code !== 200) {
    throw new Error(result.message || `API错误: ${result.code}`)
  }

  return result.data
}

export async function POST() {
  const startTime = Date.now()
  
  try {
    if (!XHS_USER_ID) {
      return NextResponse.json({ error: '未配置 XHS_USER_ID' }, { status: 500 })
    }

    const now = new Date().toISOString()

    // ========== 1. 获取用户信息 ==========
    const userResult = await oneApiRequest('/api/xiaohongshu/fetch_user_data_v4', { 
      userId: XHS_USER_ID 
    })
    
    const userData = userResult.data || userResult
    
    // 保存账号信息
    const accountData = {
      id: 'main',
      user_id: XHS_USER_ID,
      nickname: userData.nickname || '',
      red_id: userData.red_id || '',
      avatar: userData.images || userData.image || '',
      description: userData.desc || '',
      ip_location: userData.ip_location || '',
      fans: parseInt(userData.fans) || 0,
      followers: parseInt(userData.fans) || 0,
      follows: parseInt(userData.follows) || 0,
      following: parseInt(userData.follows) || 0,
      total_likes: parseInt(userData.liked) || 0,
      total_liked: parseInt(userData.liked) || 0,
      total_collected: parseInt(userData.collected) || 0,
      notes_count: parseInt(userData.ndiscovery) || 0,
      raw_data: userData,
      updated_at: now,
      synced_at: now
    }

    const { error: accountError } = await supabase.from('account_info').upsert(accountData, { onConflict: 'id' })
    if (accountError) {
      console.error('[sync-xhs] 账号保存失败:', accountError.message)
    }

    // ========== 2. 获取笔记列表（分页获取，最多3页=60条） ==========
    let allNotes: any[] = []
    let cursor = ''
    let pageCount = 0
    const maxPages = 3
    
    while (pageCount < maxPages) {
      const params: any = { userId: XHS_USER_ID }
      if (cursor) params.cursor = cursor
      
      console.log(`[sync-xhs] 第 ${pageCount + 1} 页, cursor: ${cursor || '无'}`)
      
      const notesResult = await oneApiRequest('/api/xiaohongshu/fetch_user_video_list', params)
      const pageNotes = notesResult.notes || []
      
      console.log(`[sync-xhs] 获取 ${pageNotes.length} 条, has_more: ${notesResult.has_more}`)
      
      if (pageNotes.length === 0) break
      
      allNotes = allNotes.concat(pageNotes)
      pageCount++
      
      // 使用最后一条笔记的 cursor 作为下一页参数
      const lastNote = pageNotes[pageNotes.length - 1]
      const nextCursor = lastNote?.cursor || lastNote?.id
      
      // hasMore !== false 表示还有更多数据
      if (notesResult.has_more !== false && nextCursor && pageNotes.length >= 20) {
        cursor = nextCursor
      } else {
        break
      }
      
      await new Promise(r => setTimeout(r, 100))
    }
    
    const notes = allNotes
    console.log(`[sync-xhs] 总共获取 ${notes.length} 篇笔记，共 ${pageCount} 页`)
    
    // 保存笔记数据
    const notesData = notes.map((note: any) => {
      const coverUrl = note.images_list?.[0]?.url_size_large || 
                       note.images_list?.[0]?.url || 
                       note.cover?.url || ''
      
      return {
        id: note.cursor || note.id || note.note_id,
        user_id: XHS_USER_ID,
        title: note.title || '',
        display_title: note.display_title || '',
        type: note.type === 'video' ? '视频' : '图文',
        cover_url: coverUrl,
        cover_image: coverUrl,
        likes: parseInt(note.likes) || parseInt(note.liked_count) || 0,
        collects: parseInt(note.collected_count) || 0,
        comments: parseInt(note.comments_count) || 0,
        shares: parseInt(note.share_count) || 0,
        publish_time: note.time || null,
        time_desc: note.time_desc || '',
        raw_list_data: note,
        list_synced_at: now,
        updated_at: now
      }
    })

    console.log(`[sync-xhs] 准备保存 ${notesData.length} 条笔记`)

    if (notesData.length > 0) {
      const { error: notesError } = await supabase.from('notes').upsert(notesData, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      })
      if (notesError) {
        console.error('[sync-xhs] 笔记保存失败:', notesError.message, notesError.details, notesError.hint)
      } else {
        console.log(`[sync-xhs] 笔记保存成功`)
      }
    }

    // ========== 3. 更新周统计 ==========
    const weekStart = getWeekStart(new Date())
    const weekEnd = getWeekEnd(new Date())

    await supabase.from('weekly_stats').upsert({
      week_start: weekStart,
      week_end: weekEnd,
      followers: accountData.followers,
      total_likes: accountData.total_liked,
      total_collects: accountData.total_collected,
      posts_count: notes.length
    }, { onConflict: 'week_start' })

    const duration = ((Date.now() - startTime) / 1000).toFixed(1)

    return NextResponse.json({
      success: true,
      data: {
        nickname: accountData.nickname,
        followers: accountData.followers,
        totalLikes: accountData.total_liked,
        totalCollects: accountData.total_collected,
        notesCount: notes.length,
        duration: `${duration}s`
      }
    })

  } catch (error: any) {
    console.error('[sync-xhs] 错误:', error)
    return NextResponse.json({ error: error.message || '同步失败' }, { status: 500 })
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
  const start = new Date(getWeekStart(date))
  start.setDate(start.getDate() + 6)
  return start.toISOString().split('T')[0]
}

export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    config: {
      ONEAPI_KEY: ONEAPI_KEY ? '已配置' : '未配置',
      XHS_USER_ID: XHS_USER_ID || '未配置'
    }
  })
}
