import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const ONEAPI_KEY = process.env.ONEAPI_KEY

// 格式化笔记响应
function formatNoteResponse(note: any, fromDetail?: any) {
  const detail = fromDetail || note.raw_detail_data || {}
  
  return {
    id: note.id,
    title: note.display_title || note.title || detail.title || '',
    desc: note.desc || detail.desc || '',
    type: note.type || '',
    ip_location: note.ip_location || detail.ip_location || '',
    
    // 互动数据（优先使用详情数据）
    liked_count: detail.liked_count || note.likes || 0,
    collected_count: detail.collected_count || note.collects || 0,
    comments_count: detail.comments_count || note.comments || 0,
    share_count: detail.share_count || note.shares || 0,
    
    // 媒体
    cover_url: note.cover_url || note.cover_image || '',
    images_list: detail.images_list || note.images_list || [],
    video: detail.video || null,
    video_url: note.video_url || '',
    
    // 标签
    hash_tags: detail.hash_tag || note.hash_tags || [],
    
    // 用户
    user: detail.user || note.user_info || {},
    
    // 时间
    time: note.publish_time,
    time_desc: note.time_desc || '',
    last_update_time: detail.last_update_time || 0,
    
    // 同步状态
    detail_synced_at: note.detail_synced_at
  }
}

// POST: 获取最新详情并更新数据库
export async function POST(request: NextRequest) {
  try {
    const { noteId } = await request.json()
    
    if (!noteId) {
      return NextResponse.json({ error: 'noteId required' }, { status: 400 })
    }

    // 先从数据库获取缓存数据
    const { data: cachedNote } = await supabase
      .from('notes')
      .select('*')
      .eq('id', noteId)
      .single()

    // 调用 OneAPI 获取最新详情
    let detailNote = null
    let apiError = null
    
    try {
      const response = await fetch('https://api.getoneapi.com/api/xiaohongshu/fetch_video_detail_v6', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ONEAPI_KEY}`,
        },
        body: JSON.stringify({ note_id: noteId }),
      })

      const result = await response.json()
      
      if (result.code === 200 && result.data?.note_list?.[0]) {
        detailNote = result.data.note_list[0]
      } else {
        apiError = result.message || 'API返回错误'
      }
    } catch (e: any) {
      apiError = e.message
      console.error('[note-detail] API调用失败:', e.message)
    }

    // 如果API获取成功，更新数据库
    if (detailNote) {
      const now = new Date().toISOString()
      
      const updateData = {
        // 更新互动数据
        likes: detailNote.liked_count || 0,
        collects: detailNote.collected_count || 0,
        comments: detailNote.comments_count || 0,
        shares: detailNote.share_count || 0,
        
        // 更新详情特有数据
        ip_location: detailNote.ip_location || '',
        hash_tags: detailNote.hash_tag || [],
        images_list: detailNote.images_list || [],
        
        // 保存完整原始数据
        raw_detail_data: detailNote,
        
        // 更新时间
        detail_synced_at: now,
        updated_at: now
      }

      await supabase.from('notes').update(updateData).eq('id', noteId)

      return NextResponse.json({ 
        success: true, 
        fromCache: false,
        note: formatNoteResponse(cachedNote || {}, detailNote)
      })
    }

    // 如果API获取失败但有缓存，返回缓存数据
    if (cachedNote) {
      return NextResponse.json({ 
        success: true, 
        fromCache: true,
        note: formatNoteResponse(cachedNote)
      })
    }

    return NextResponse.json({ error: apiError || '笔记不存在' }, { status: 404 })

  } catch (error: any) {
    console.error('[note-detail] 错误:', error)
    return NextResponse.json({ error: '获取失败' }, { status: 500 })
  }
}

// GET: 直接从数据库读取（不调用API）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const noteId = searchParams.get('noteId')
    
    if (!noteId) {
      return NextResponse.json({ error: 'noteId required' }, { status: 400 })
    }

    const { data: note, error } = await supabase
      .from('notes')
      .select('*')
      .eq('id', noteId)
      .single()

    if (error || !note) {
      return NextResponse.json({ error: '笔记不存在' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      fromCache: true,
      note: formatNoteResponse(note)
    })

  } catch (error: any) {
    return NextResponse.json({ error: '获取失败' }, { status: 500 })
  }
}
