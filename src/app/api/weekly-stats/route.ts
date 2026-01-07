import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

// 获取周统计数据
export async function GET() {
  const supabase = getSupabase()
  if (!supabase) {
    return NextResponse.json({ success: false, error: 'Supabase 未配置', data: [] })
  }

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

// 手动录入周统计数据
export async function POST(request: NextRequest) {
  const supabase = getSupabase()
  if (!supabase) {
    return NextResponse.json({ success: false, error: 'Supabase 未配置' }, { status: 500 })
  }

  try {
    const body = await request.json()
    
    // 验证必填字段
    if (!body.week_start || !body.week_end) {
      return NextResponse.json({ success: false, error: '缺少必填字段：week_start, week_end' }, { status: 400 })
    }

    const weekData = {
      week_start: body.week_start,
      week_end: body.week_end,
      followers: parseInt(body.followers) || 0,
      new_followers: parseInt(body.new_followers) || 0,
      likes: parseInt(body.likes) || 0,
      saves: parseInt(body.saves) || 0,
      comments: parseInt(body.comments) || 0,
      shares: parseInt(body.shares) || 0,
      views: parseInt(body.views) || 0,
      posts_count: parseInt(body.posts_count) || 0,
      female_ratio: parseInt(body.female_ratio) || 85,
      updated_at: new Date().toISOString()
    }

    // 使用 upsert，以 week_start 为唯一键
    const { data, error } = await supabase
      .from('weekly_stats')
      .upsert(weekData, { onConflict: 'week_start' })
      .select()

    if (error) {
      console.error('[weekly-stats] 保存失败:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: '数据保存成功',
      data: data?.[0] || weekData
    })
  } catch (e: any) {
    console.error('[weekly-stats] POST 异常:', e)
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

