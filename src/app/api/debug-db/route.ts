import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 公开调试端点 - 检查数据库状态
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !key) {
    return NextResponse.json({ 
      success: false, 
      error: 'Supabase 未配置',
      config: { hasUrl: !!url, hasKey: !!key }
    })
  }

  const supabase = createClient(url, key)

  try {
    // 检查各表数据量
    const results: Record<string, any> = {}

    // 检查 account_info
    const { data: accountData, error: accountError } = await supabase
      .from('account_info')
      .select('*')
      .limit(1)
    results.account_info = {
      exists: !accountError,
      error: accountError?.message,
      data: accountData?.[0] || null
    }

    // 检查 weekly_stats
    const { data: weeklyData, error: weeklyError } = await supabase
      .from('weekly_stats')
      .select('*')
      .order('week_start', { ascending: false })
      .limit(3)
    results.weekly_stats = {
      exists: !weeklyError,
      error: weeklyError?.message,
      count: weeklyData?.length || 0,
      data: weeklyData || []
    }

    // 检查 notes
    const { data: notesData, error: notesError, count: notesCount } = await supabase
      .from('notes')
      .select('id, title, likes', { count: 'exact' })
      .order('likes', { ascending: false })
      .limit(5)
    results.notes = {
      exists: !notesError,
      error: notesError?.message,
      count: notesCount || notesData?.length || 0,
      sample: notesData || []
    }

    // 检查 note_comments
    const { data: commentsData, error: commentsError, count: commentsCount } = await supabase
      .from('note_comments')
      .select('id, content', { count: 'exact' })
      .limit(3)
    results.note_comments = {
      exists: !commentsError,
      error: commentsError?.message,
      count: commentsCount || commentsData?.length || 0
    }

    return NextResponse.json({
      success: true,
      message: '数据库检查完成',
      supabase_url: url.substring(0, 30) + '...',
      tables: results
    })

  } catch (e: any) {
    return NextResponse.json({
      success: false,
      error: e.message
    })
  }
}

