import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const AUTH_COOKIE_NAME = 'daodao_auth'
const AUTH_TOKEN = 'authenticated_daodao_2024'

// 不需要认证的路径
const publicPaths = ['/login', '/api/auth', '/api/test-oneapi', '/api/debug-db']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 检查是否是公开路径
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path))
  
  // 公开路径直接放行
  if (isPublicPath) {
    return NextResponse.next()
  }
  
  // API 路由需要认证
  if (pathname.startsWith('/api/')) {
    const authCookie = request.cookies.get(AUTH_COOKIE_NAME)
    if (authCookie?.value !== AUTH_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.next()
  }

  // 静态资源放行
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // 检查认证
  const authCookie = request.cookies.get(AUTH_COOKIE_NAME)
  const isAuthenticated = authCookie?.value === AUTH_TOKEN

  // 未认证则重定向到登录页
  if (!isAuthenticated) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * 匹配所有路径除了：
     * - _next/static
     * - _next/image
     * - favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}

