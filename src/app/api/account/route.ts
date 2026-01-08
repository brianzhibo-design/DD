import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('account_info')
      .select('*')
      .order('synced_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') throw error

    return NextResponse.json({ account: data || null })

  } catch (error: any) {
    return NextResponse.json({ error: error.message || '获取失败' }, { status: 500 })
  }
}
