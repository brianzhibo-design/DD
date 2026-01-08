import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sort = searchParams.get('sort') || 'likes'
    const order = searchParams.get('order') || 'desc'
    const limit = parseInt(searchParams.get('limit') || '100')
    const type = searchParams.get('type')

    // 选择需要的字段（避免返回过大的原始数据）
    let query = supabase
      .from('notes')
      .select(`
        id,
        title,
        display_title,
        desc,
        type,
        cover_url,
        cover_image,
        likes,
        collects,
        comments,
        shares,
        views,
        publish_time,
        publish_date,
        time_desc,
        ip_location,
        user_info,
        hash_tags,
        detail_synced_at,
        updated_at
      `)
      .order(sort, { ascending: order === 'asc' })
      .limit(limit)

    if (type && type !== 'all') {
      query = query.eq('type', type)
    }

    const { data, error } = await query

    if (error) throw error

    // 格式化输出，确保字段名一致
    const notes = (data || []).map(note => ({
      id: note.id,
      title: note.display_title || note.title || '',
      desc: note.desc || '',
      type: note.type || '图文',
      cover_url: note.cover_url || note.cover_image || '',
      likes: note.likes || 0,
      collects: note.collects || 0,
      comments: note.comments || 0,
      shares: note.shares || 0,
      views: note.views || 0,
      publish_time: note.publish_time,
      time_desc: note.time_desc || note.publish_date || '',
      ip_location: note.ip_location || '',
      user_info: note.user_info,
      hash_tags: note.hash_tags || [],
      detail_synced_at: note.detail_synced_at,
      updated_at: note.updated_at
    }))

    return NextResponse.json({ notes })

  } catch (error: any) {
    console.error('[notes] 错误:', error)
    return NextResponse.json({ error: error.message || '获取失败', notes: [] }, { status: 500 })
  }
}
