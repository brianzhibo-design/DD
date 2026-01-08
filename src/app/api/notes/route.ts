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
    const limit = parseInt(searchParams.get('limit') || '100')
    const type = searchParams.get('type')

    let query = supabase
      .from('notes')
      .select('*')
      .order(sort, { ascending: false })
      .limit(limit)

    if (type && type !== 'all') {
      query = query.eq('type', type)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ notes: data || [] })

  } catch (error: any) {
    return NextResponse.json({ error: error.message || '获取失败', notes: [] }, { status: 500 })
  }
}
