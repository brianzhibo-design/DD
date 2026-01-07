import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !key) {
    return NextResponse.json({ success: false, error: 'Supabase 未配置', data: [] })
  }

  const supabase = createClient(url, key)

  try {
    const { data, error } = await supabase
      .from('weekly_stats')
      .select('*')
      .order('week_start', { ascending: false })
      .limit(12)

    if (error) {
      console.error('[weekly-stats] 查询失败:', error)
      return NextResponse.json({ success: false, error: error.message, data: [] })
    }

    return NextResponse.json({ success: true, data: data || [] })
  } catch (e: any) {
    console.error('[weekly-stats] 异常:', e)
    return NextResponse.json({ success: false, error: e.message, data: [] })
  }
}

