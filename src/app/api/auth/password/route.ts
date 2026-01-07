import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

const AUTH_COOKIE_NAME = 'daodao_auth'
const AUTH_TOKEN = 'authenticated_daodao_2024'
const DEFAULT_PASSWORD = 'daodao888'

// 获取 Supabase 客户端
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !key) {
    return null
  }
  
  return createClient(url, key)
}

// 获取当前密码
async function getAdminPassword(): Promise<string> {
  const supabase = getSupabase()
  
  if (!supabase) {
    console.log('[Auth] Supabase未配置，使用默认密码')
    return process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD
  }

  try {
    const { data, error } = await supabase
      .from('system_config')
      .select('value')
      .eq('key', 'admin_password')
      .single()
    
    if (error) {
      console.log('[Auth] 获取密码失败:', error.message)
      // 表不存在或无数据，使用环境变量或默认密码
      return process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD
    }
    
    return data?.value || DEFAULT_PASSWORD
  } catch (e) {
    console.log('[Auth] 密码查询异常')
    return process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD
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

    // 更新密码到 Supabase
    const supabase = getSupabase()
    
    if (!supabase) {
      // 如果没有 Supabase，只能提示用户设置环境变量
      return NextResponse.json({ 
        success: false, 
        error: '请在环境变量中设置 ADMIN_PASSWORD' 
      }, { status: 500 })
    }

    // 先尝试更新
    const { error: updateError } = await supabase
      .from('system_config')
      .update({ 
        value: newPassword,
        updated_at: new Date().toISOString()
      })
      .eq('key', 'admin_password')

    if (updateError) {
      // 如果更新失败（可能是表不存在或记录不存在），尝试插入
      console.log('[Auth] 更新失败，尝试插入:', updateError.message)
      
      const { error: insertError } = await supabase
        .from('system_config')
        .insert({ 
          key: 'admin_password', 
          value: newPassword,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (insertError) {
        console.error('[Auth] 插入密码失败:', insertError)
        
        // 如果是表不存在的错误
        if (insertError.message.includes('relation') || insertError.code === '42P01') {
          return NextResponse.json({ 
            success: false, 
            error: '请先在 Supabase 创建 system_config 表' 
          }, { status: 500 })
        }
        
        return NextResponse.json({ success: false, error: '保存失败' }, { status: 500 })
      }
    }

    console.log('[Auth] 密码修改成功')
    return NextResponse.json({ success: true, message: '密码修改成功' })

  } catch (error) {
    console.error('[Auth] 修改密码错误:', error)
    return NextResponse.json({ success: false, error: '修改失败' }, { status: 500 })
  }
}
