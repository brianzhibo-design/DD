import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

// Netlify Pro 函数超时配置 (最大26秒)
export const maxDuration = 25

// 获取历史数据摘要的函数（服务端调用Supabase）
async function getContextData() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('[Chat API] Supabase not configured, skipping context')
    return { notes: [], weeklyStats: [], cats: [] }
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)

    // 并行获取数据，设置超时
    const timeout = 5000 // 5秒超时
    
    const [notesResult, weeklyResult, catsResult] = await Promise.all([
      Promise.race([
        supabase.from('notes').select('*').eq('status', 'published').order('publish_date', { ascending: false }).limit(10),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), timeout))
      ]).catch(() => ({ data: [] })),
      
      Promise.race([
        supabase.from('weekly_stats').select('*').order('week_start', { ascending: false }).limit(2),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), timeout))
      ]).catch(() => ({ data: [] })),
      
      Promise.race([
        supabase.from('cats').select('name, gender, color, personality').limit(6),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), timeout))
      ]).catch(() => ({ data: [] }))
    ])

    return { 
      notes: (notesResult as any).data || [], 
      weeklyStats: (weeklyResult as any).data || [], 
      cats: (catsResult as any).data || [] 
    }
  } catch (error) {
    console.error('[Chat API] Context fetch error:', error)
    return { notes: [], weeklyStats: [], cats: [] }
  }
}

// 构建上下文提示（精简版）
function buildContextPrompt(data: { notes: any[], weeklyStats: any[], cats: any[] }) {
  let context = ''

  // 周数据摘要（仅最新一周）
  if (data.weeklyStats.length > 0) {
    const latest = data.weeklyStats[0]
    context += `\n【最新数据】粉丝${latest.followers}(+${latest.new_followers})，点赞${latest.likes}，收藏${latest.saves}，浏览${latest.views}，女粉${latest.female_ratio}%`
  }

  // 笔记摘要（精简）
  if (data.notes.length > 0) {
    const byType: Record<string, number> = {}
    data.notes.forEach((n: any) => {
      byType[n.type] = (byType[n.type] || 0) + 1
    })
    context += `\n【笔记】${data.notes.length}篇，${Object.entries(byType).map(([k, v]) => `${k}${v}`).join('/')}`
  }

  // 猫咪信息（精简）
  if (data.cats.length > 0) {
    const catNames = data.cats.map((c: any) => c.name).join('、')
    context += `\n【猫咪】${catNames}`
  }

  return context
}

const BASE_SYSTEM_PROMPT = `你是"小离岛岛"的小红书运营助手。

账号：内容创作×生活方式，目标25-35岁女性
资产：抖音4.5万粉丝，正在拓展小红书

要求：简洁实用，给具体建议，控制在200字内`

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const { message, history = [] } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // 并行：获取数据 + 准备API调用
    const contextDataPromise = getContextData()

    const anthropic = new Anthropic({ apiKey })

    // 限制历史消息数量
    const recentHistory = history.slice(-4).map((msg: { role: string; content: string }) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content.slice(0, 500), // 限制每条消息长度
    }))

    // 等待上下文数据
    const contextData = await contextDataPromise
    const contextPrompt = buildContextPrompt(contextData)
    const fullSystemPrompt = BASE_SYSTEM_PROMPT + contextPrompt

    console.log(`[Chat API] Context fetched in ${Date.now() - startTime}ms`)

    const messages = [
      ...recentHistory,
      { role: 'user' as const, content: message },
    ]

    // 使用更快的模型，减少 token 数
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024, // 减少token数加快响应
      system: fullSystemPrompt,
      messages,
    })

    const assistantMessage = response.content[0].type === 'text' 
      ? response.content[0].text 
      : ''

    console.log(`[Chat API] Total time: ${Date.now() - startTime}ms`)

    return NextResponse.json({ 
      message: assistantMessage,
      response: assistantMessage, // 兼容旧格式
    })

  } catch (error: unknown) {
    console.error('Chat API Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    // 提供更友好的错误信息
    if (errorMessage.includes('timeout') || errorMessage.includes('ETIMEDOUT')) {
      return NextResponse.json({ 
        error: '请求超时，请稍后重试',
        message: '抱歉，服务器响应较慢，请稍后重试。'
      }, { status: 504 })
    }
    
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    configured: !!process.env.ANTHROPIC_API_KEY 
  })
}
