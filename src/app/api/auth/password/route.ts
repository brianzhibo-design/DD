import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

const AUTH_COOKIE_NAME = 'daodao_auth'
const AUTH_TOKEN = 'authenticated_daodao_2024'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// 获取当前密码
async function getAdminPassword(): Promise<string> {
  try {
    const { data } = await supabase
      .from('system_config')
      .select('value')
      .eq('key', 'admin_password')
      .single()
    
    return data?.value || 'daodao888'
  } catch {
    return process.env.ADMIN_PASSWORD || 'daodao888'
  }
}

export async function POST(request: NextRequest) {
  try {
    // 验证登录状态
    const cookieStore = await cookies()
    const authCookie = cookieStore.get(AUTH_COOKIE_NAME)
    
    if (authCookie?.value !== AUTH_TOKEN) {
      return NextResponse.json({ success: false, error: '请先登录' }, { status: 401 })
    }

    const { currentPassword, newPassword } = await request.json()

    // 验证参数
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ success: false, error: '请填写完整信息' }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ success: false, error: '新密码至少6位' }, { status: 400 })
    }

    // 验证当前密码
    const adminPassword = await getAdminPassword()
    if (currentPassword !== adminPassword) {
      return NextResponse.json({ success: false, error: '当前密码错误' }, { status: 400 })
    }

    // 更新密码
    const { error } = await supabase
      .from('system_config')
      .upsert({ 
        key: 'admin_password', 
        value: newPassword,
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' })

    if (error) {
      console.error('[Auth] 更新密码失败:', error)
      return NextResponse.json({ success: false, error: '更新失败' }, { status: 500 })
    }

    console.log('[Auth] 密码修改成功')
    return NextResponse.json({ success: true, message: '密码修改成功' })

  } catch (error) {
    console.error('[Auth] 修改密码错误:', error)
    return NextResponse.json({ success: false, error: '修改失败' }, { status: 500 })
  }
}

