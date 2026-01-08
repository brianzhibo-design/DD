import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

// 获取笔记列表（从数据库读取，支持排序和分页）
export async function GET(request: NextRequest) {
  const supabase = getSupabase()
  
  if (!supabase) {
    return NextResponse.json({ success: false, data: [], error: 'Supabase 未配置' })
  }

  try {
    const { searchParams } = new URL(request.url)
    const sort = searchParams.get('sort') || 'likes'
    const order = searchParams.get('order') || 'desc'
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // 验证排序字段
    const validSortFields = ['likes', 'collects', 'comments', 'publish_time', 'synced_at']
    const sortField = validSortFields.includes(sort) ? sort : 'likes'

    const { data, error, count } = await supabase
      .from('notes')
      .select('*', { count: 'exact' })
      .order(sortField, { ascending: order === 'asc' })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return NextResponse.json({ 
      success: true, 
      data: data || [],
      total: count || 0,
      limit,
      offset
    })

  } catch (error: any) {
    console.error('[笔记列表] 获取失败:', error)
    return NextResponse.json({ 
      success: false, 
      data: [], 
      error: error.message 
    })
  }
}
