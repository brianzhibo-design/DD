import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

// 获取最新账号信息
export async function GET() {
  const supabase = getSupabase()
  
  if (!supabase) {
    return NextResponse.json({ account: null, error: 'Supabase 未配置' })
  }

  try {
    const { data, error } = await supabase
      .from('account_info')
      .select('*')
      .order('synced_at', { ascending: false })
      .limit(1)

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return NextResponse.json({ account: data?.[0] || null })

  } catch (error: any) {
    console.error('[账号信息] 获取失败:', error)
    return NextResponse.json({ account: null, error: error.message })
  }
}

// 获取账号历史数据（用于趋势分析）
export async function POST() {
  const supabase = getSupabase()
  
  if (!supabase) {
    return NextResponse.json({ history: [], error: 'Supabase 未配置' })
  }

  try {
    const { data, error } = await supabase
      .from('account_info')
      .select('*')
      .order('synced_at', { ascending: false })
      .limit(30) // 最近30条记录

    if (error) throw error

    return NextResponse.json({ history: data || [] })

  } catch (error: any) {
    console.error('[账号历史] 获取失败:', error)
    return NextResponse.json({ history: [], error: error.message })
  }
}

