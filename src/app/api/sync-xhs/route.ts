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

      const accountData = {
        user_id: userId,
        nickname: user.nickname || '未知',
        avatar: user.images || '',
        followers: parseInt(user.fans) || 0,
        following: parseInt(user.follows) || 0,
        total_likes: parseInt(user.liked) || 0,
        total_collects: parseInt(user.collected) || 0,
        notes_count: parseInt(user.ndiscovery) || 0,
        synced_at: now
      }

      const { error } = await supabase.from('account_info').insert(accountData)
      if (!error) accountSaved = true
      
      console.log(`[账号信息] ${accountData.nickname} | 粉丝:${accountData.followers}`)
    } catch (e: any) {
      console.error('[账号信息] 获取失败:', e.message)
    }

    // ========== 2. 获取笔记列表 ==========
    try {
      const notesData = await oneApiRequest('/api/xiaohongshu/fetch_user_video_list', { userId })
      const notes = notesData.notes || []
      
      console.log(`[笔记列表] 获取到 ${notes.length} 篇笔记`)

      if (notes.length > 0) {
        const notesInsert = notes.map((note: any) => ({
          note_id: note.cursor || note.id || note.note_id,
          title: note.display_title || note.title || note.desc?.substring(0, 100) || '',
          cover: note.images_list?.[0]?.url_size_large || 
                 note.images_list?.[0]?.url || 
                 note.cover?.url_default || '',
          likes: parseInt(note.likes) || parseInt(note.liked_count) || 0,
          collects: parseInt(note.collected_count) || 0,
          comments: parseInt(note.comments_count) || 0,
          type: note.type === 'video' ? '视频' : '图文',
          publish_time: note.time ? new Date(note.time * 1000).toISOString() : null,
          synced_at: now
        }))

        const { error } = await supabase.from('notes').upsert(notesInsert, { 
          onConflict: 'note_id',
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

    return NextResponse.json({ 
      success: true, 
      message: '同步完成',
      data: {
        accountSaved,
        notesSaved,
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

    return NextResponse.json({
      configured: !!(process.env.ONEAPI_KEY && process.env.XHS_USER_ID),
      data: {
        account: accountRes.data?.[0] || null,
        topNotes: notesRes.data || [],
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
