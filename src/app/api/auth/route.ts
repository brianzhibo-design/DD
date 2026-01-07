import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

const AUTH_COOKIE_NAME = 'daodao_auth'
const AUTH_TOKEN = 'authenticated_daodao_2024'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// 获取密码
async function getAdminPassword(): Promise<string> {
  try {
    const { data } = await supabase
      .from('system_config')
      .select('value')
      .eq('key', 'admin_password')
      .single()
    
    if (data?.value) return data.value
  } catch (e) {
    console.log('[Auth] 从数据库获取密码失败，使用默认值')
  }
  
  return process.env.ADMIN_PASSWORD || 'daodao888'
}

// 登录
export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()
    const adminPassword = await getAdminPassword()

    if (password === adminPassword) {
      const response = NextResponse.json({ success: true })
      response.cookies.set(AUTH_COOKIE_NAME, AUTH_TOKEN, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7天
        path: '/'
      })
      return response
    }

    return NextResponse.json({ success: false, error: '密码错误' }, { status: 401 })
  } catch (error) {
    console.error('[Auth] 登录错误:', error)
    return NextResponse.json({ success: false, error: '验证失败' }, { status: 500 })
  }
}

// 检查登录状态
export async function GET() {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get(AUTH_COOKIE_NAME)
  const isAuthenticated = authCookie?.value === AUTH_TOKEN
  return NextResponse.json({ authenticated: isAuthenticated })
}

// 登出
export async function DELETE() {
  const response = NextResponse.json({ success: true })
  // 通过设置过期时间为过去来删除 cookie
  response.cookies.set(AUTH_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/'
  })
  return response
}

