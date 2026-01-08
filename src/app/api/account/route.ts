import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    // 尝试获取最新账号信息
    const { data, error } = await supabase
      .from('account_info')
      .select(`
        id,
        user_id,
        nickname,
        red_id,
        avatar,
        avatar_large,
        desc,
        description,
        ip_location,
        gender,
        fans,
        followers,
        follows,
        following,
        total_likes,
        total_liked,
        total_collected,
        notes_count,
        register_time_desc,
        tags,
        interactions,
        synced_at,
        updated_at
      `)
      .order('synced_at', { ascending: false, nullsFirst: false })
      .limit(1)

    if (error && error.code !== 'PGRST116') {
      console.error('[account] 查询错误:', error.message)
    }

    const account = data?.[0] || null
    
    if (!account) {
      return NextResponse.json({ account: null })
    }

    // 格式化输出，确保字段名一致
    return NextResponse.json({ 
      account: {
        ...account,
        // 确保核心字段存在
        nickname: account.nickname || '',
        red_id: account.red_id || '',
        avatar: account.avatar || account.avatar_large || '',
        desc: account.desc || account.description || '',
        ip_location: account.ip_location || '',
        followers: account.followers || account.fans || 0,
        following: account.following || account.follows || 0,
        total_liked: account.total_liked || account.total_likes || 0,
        total_collected: account.total_collected || 0,
        notes_count: account.notes_count || 0,
        synced_at: account.synced_at || account.updated_at || ''
      }
    })

  } catch (error: any) {
    console.error('[account] 错误:', error)
    return NextResponse.json({ error: error.message || '获取失败' }, { status: 500 })
  }
}
