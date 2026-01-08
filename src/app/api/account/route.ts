import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    // 尝试按 synced_at 排序（新表结构）
    let { data, error } = await supabase
      .from('account_info')
      .select('*')
      .order('synced_at', { ascending: false })
      .limit(1)

    // 如果失败，尝试按 updated_at 排序（旧表结构）
    if (error) {
      const result = await supabase
        .from('account_info')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
      data = result.data
      error = result.error
    }

    if (error && error.code !== 'PGRST116') {
      console.error('[account] 查询错误:', error.message)
    }

    const account = data?.[0] || null
    
    // 兼容新旧字段名
    if (account) {
      return NextResponse.json({ 
        account: {
          ...account,
          // 确保字段名兼容
          followers: account.followers || account.fans || 0,
          following: account.following || account.follows || 0,
          total_liked: account.total_liked || account.total_likes || 0,
          total_collected: account.total_collected || 0,
          synced_at: account.synced_at || account.updated_at || ''
        }
      })
    }

    return NextResponse.json({ account: null })

  } catch (error: any) {
    console.error('[account] 错误:', error)
    return NextResponse.json({ error: error.message || '获取失败' }, { status: 500 })
  }
}
