import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const maxDuration = 30

const ONEAPI_BASE = 'https://api.getoneapi.com'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

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
    throw new Error(result.message || `API错误: ${result.code}`)
  }

  return result.data
}

// 同步账号信息 + 笔记列表（快速，2-3秒完成）
export async function POST() {
  const startTime = Date.now()
  const supabase = getSupabase()
  
  if (!supabase) {
    return NextResponse.json({ success: false, error: 'Supabase 未配置' }, { status: 500 })
  }

  const userId = process.env.XHS_USER_ID
  if (!userId) {
    return NextResponse.json({ success: false, error: 'XHS_USER_ID 未配置' }, { status: 500 })
  }

  try {
    const now = new Date().toISOString()
    let accountSaved = false
    let notesSaved = 0

    // ========== 1. 获取账号信息 ==========
    try {
      const userData = await oneApiRequest('/api/xiaohongshu/fetch_user_data_v4', { userId })
      const user = userData.data || userData

      // 使用旧表结构字段名
      const accountData = {
        id: 'main',  // 使用固定 ID 方便 upsert
        nickname: user.nickname || '未知',
        avatar: user.images || '',
        red_id: user.red_id || '',
        description: user.desc || '',
        ip_location: user.ip_location || '',
        fans: parseInt(user.fans) || 0,
        follows: parseInt(user.follows) || 0,
        total_likes: parseInt(user.liked) || 0,
        total_collected: parseInt(user.collected) || 0,
        notes_count: parseInt(user.ndiscovery) || 0,
        updated_at: now
      }

      const { error } = await supabase.from('account_info').upsert(accountData, { onConflict: 'id' })
      if (error) {
        console.error('[账号信息] 保存失败:', error.message, error.details, error.hint)
      } else {
        accountSaved = true
        console.log(`[账号信息] 保存成功: ${accountData.nickname} | 粉丝:${accountData.fans}`)
      }
    } catch (e: any) {
      console.error('[账号信息] 获取失败:', e.message)
    }

    // ========== 2. 获取笔记列表 ==========
    try {
      const notesData = await oneApiRequest('/api/xiaohongshu/fetch_user_video_list', { userId })
      const notes = notesData.notes || []
      
      console.log(`[笔记列表] 获取到 ${notes.length} 篇笔记`)

      if (notes.length > 0) {
        // 使用旧表结构字段名
        const notesInsert = notes.map((note: any) => ({
          id: note.cursor || note.id || note.note_id,
          title: note.display_title || note.title || note.desc?.substring(0, 100) || '',
          cover_image: note.images_list?.[0]?.url_size_large || 
                       note.images_list?.[0]?.url || 
                       note.cover?.url_default || '',
          likes: parseInt(note.likes) || parseInt(note.liked_count) || 0,
          collects: parseInt(note.collected_count) || 0,
          comments: parseInt(note.comments_count) || 0,
          type: note.type === 'video' ? '视频' : '图文',
          publish_date: note.time_desc || null,
          updated_at: now
        }))

        const { error } = await supabase.from('notes').upsert(notesInsert, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        })
        
        if (!error) {
          notesSaved = notes.length
        } else {
          console.error('[笔记保存] 错误:', error.message)
        }
      }
    } catch (e: any) {
      console.error('[笔记列表] 获取失败:', e.message)
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1)
    console.log(`[同步完成] 耗时:${duration}s`)

    // 同步后获取最新账号信息
    const { data: latestAccount } = await supabase
      .from('account_info')
      .select('*')
      .order('synced_at', { ascending: false })
      .limit(1)
    
    const dbAccount = latestAccount?.[0]
    const account = dbAccount ? {
      nickname: dbAccount.nickname,
      fans: dbAccount.followers,
      total_likes: dbAccount.total_likes,
      total_collected: dbAccount.total_collects,
      notes_count: dbAccount.notes_count
    } : null

    return NextResponse.json({ 
      success: true, 
      message: '同步完成',
      data: {
        account,
        stats: {
          savedNotes: notesSaved
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

// 获取最新数据
export async function GET() {
  const supabase = getSupabase()
  
  if (!supabase) {
    return NextResponse.json({ 
      configured: false,
      error: 'Supabase 未配置' 
    })
  }

  try {
    // 并行获取账号和笔记
    const [accountRes, notesRes, statsRes] = await Promise.all([
      supabase
        .from('account_info')
        .select('*')
        .order('synced_at', { ascending: false })
        .limit(1),
      supabase
        .from('notes')
        .select('*')
        .order('likes', { ascending: false })
        .limit(10),
      supabase
        .from('weekly_stats')
        .select('*')
        .order('week_start', { ascending: false })
        .limit(1)
    ])

    // 调试日志
    console.log('[GET] account_info:', accountRes.error?.message || `找到 ${accountRes.data?.length || 0} 条`)
    console.log('[GET] notes:', notesRes.error?.message || `找到 ${notesRes.data?.length || 0} 条`)

    // 直接使用数据库返回的数据（旧表结构）
    const account = accountRes.data?.[0] || null

    // 转换笔记数据字段名以匹配前端
    const topNotes = (notesRes.data || []).map((note: any) => ({
      note_id: note.id,
      title: note.title || '',
      type: note.type || '图文',
      likes: note.likes || 0,
      collects: note.collects || 0,
      comments: note.comments || 0,
      cover: note.cover_image || '',
      publish_time: note.publish_date || ''
    }))

    return NextResponse.json({
      configured: !!(process.env.ONEAPI_KEY && process.env.XHS_USER_ID),
      data: {
        account,
        topNotes,
        latestStats: statsRes.data?.[0] || null
      }
    })
  } catch (e: any) {
    return NextResponse.json({ 
      configured: false,
      error: e.message 
    })
  }
}
