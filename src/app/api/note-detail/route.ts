import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// 格式化笔记响应
function formatNoteResponse(note: any) {
  return {
    id: note.id,
    title: note.display_title || note.title || '',
    desc: note.desc || '',
    type: note.type || '',
    ip_location: note.ip_location || '',
    
    // 互动数据（来自列表同步）
    liked_count: note.likes || 0,
    collected_count: note.collects || 0,
    comments_count: note.comments || 0,
    share_count: note.shares || 0,
    
    // 媒体
    cover_url: note.cover_url || note.cover_image || '',
    images_list: note.images_list || note.raw_list_data?.images_list || [],
    video_url: note.video_url || '',
    
    // 标签
    hash_tags: note.hash_tags || note.raw_list_data?.hash_tag || [],
    
    // 用户
    user: note.user_info || note.raw_list_data?.user || {},
    
    // 时间
    time: note.publish_time,
    time_desc: note.time_desc || '',
    
    // 同步信息
    synced_at: note.list_synced_at
  }
}

// POST: 直接从数据库读取，不调用外部API（毫秒级响应）
export async function POST(request: NextRequest) {
  try {
    const { noteId } = await request.json()
    
    if (!noteId) {
      return NextResponse.json({ error: 'noteId required' }, { status: 400 })
    }

    // 从数据库获取笔记数据
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
      note: formatNoteResponse(note)
    })

  } catch (error: any) {
    console.error('[note-detail] 错误:', error)
    return NextResponse.json({ error: '获取失败' }, { status: 500 })
  }
}

// GET: 同样从数据库读取
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
      note: formatNoteResponse(note)
    })

  } catch (error: any) {
    return NextResponse.json({ error: '获取失败' }, { status: 500 })
  }
}
