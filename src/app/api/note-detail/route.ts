import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const ONEAPI_KEY = process.env.ONEAPI_KEY

export async function POST(request: NextRequest) {
  try {
    const { noteId } = await request.json()
    
    if (!noteId) {
      return NextResponse.json({ error: 'noteId required' }, { status: 400 })
    }

    // 调用 OneAPI 获取详情
    const response = await fetch('https://api.getoneapi.com/api/xiaohongshu/fetch_video_detail_v6', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ONEAPI_KEY}`,
      },
      body: JSON.stringify({ note_id: noteId }),
    })

    const result = await response.json()
    
    if (result.code !== 200 || !result.data?.note_list?.[0]) {
      return NextResponse.json({ error: '笔记不存在' }, { status: 404 })
    }

    const note = result.data.note_list[0]

    // 更新数据库中的详情数据
    await supabase.from('notes').update({
      likes: note.liked_count || 0,
      collects: note.collected_count || 0,
      comments: note.comments_count || 0,
      shares: note.share_count || 0,
      detail_data: note,
      detail_synced_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }).eq('id', noteId)

    return NextResponse.json({ 
      success: true, 
      note: {
        id: noteId,
        title: note.title || note.desc?.slice(0, 50),
        desc: note.desc,
        liked_count: note.liked_count,
        collected_count: note.collected_count,
        comments_count: note.comments_count,
        share_count: note.share_count,
        images: note.images_list,
        video: note.video,
        hash_tags: note.hash_tag,
        user: note.user,
        time: note.time
      }
    })

  } catch (error: any) {
    console.error('[note-detail] 错误:', error)
    return NextResponse.json({ error: '获取失败' }, { status: 500 })
  }
}
