import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

// Netlify Pro 函数超时配置 (最大26秒)
export const maxDuration = 25

// 获取账号真实数据
async function getAccountData() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('[Chat API] Supabase not configured')
    return { notes: [], weeklyStats: [], cats: [] }
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    const timeout = 4000

    const [notesResult, weeklyResult, catsResult] = await Promise.all([
      Promise.race([
        supabase.from('notes').select('*').order('publish_date', { ascending: false }).limit(15),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), timeout))
      ]).catch(() => ({ data: [] })),
      
      Promise.race([
        supabase.from('weekly_stats').select('*').order('week_start', { ascending: false }).limit(4),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), timeout))
      ]).catch(() => ({ data: [] })),
      
      Promise.race([
        supabase.from('cats').select('*').limit(10),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), timeout))
      ]).catch(() => ({ data: [] }))
    ])

    return { 
      notes: (notesResult as any).data || [], 
      weeklyStats: (weeklyResult as any).data || [], 
      cats: (catsResult as any).data || [] 
    }
  } catch (error) {
    console.error('[Chat API] Data fetch error:', error)
    return { notes: [], weeklyStats: [], cats: [] }
  }
}

// 构建详细上下文
function buildContext(data: { notes: any[], weeklyStats: any[], cats: any[] }) {
  let context = `

【账号信息】
- 账号：小离岛岛
- 定位：精致生活、好物分享、生活方式博主
- 目标人群：25-35岁追求品质生活的都市女性
`

  // 运营数据分析
  if (data.weeklyStats.length > 0) {
    const latest = data.weeklyStats[0]
    context += `
【最新运营数据】（${latest.week_start || '本周'}）
- 粉丝总数：${latest.followers?.toLocaleString() || '未记录'}
- 本周新增：${latest.new_followers?.toLocaleString() || '未记录'}
- 总点赞：${latest.likes?.toLocaleString() || '未记录'}
- 总收藏：${latest.saves?.toLocaleString() || '未记录'}
- 总评论：${latest.comments?.toLocaleString() || '未记录'}
- 总浏览：${latest.views?.toLocaleString() || '未记录'}
- 女粉占比：${latest.female_ratio || '未记录'}%
`

    // 周环比
    if (data.weeklyStats.length > 1) {
      const prev = data.weeklyStats[1]
      const changes: string[] = []
      
      if (latest.followers && prev.followers) {
        const growth = ((latest.followers - prev.followers) / prev.followers * 100).toFixed(1)
        changes.push(`粉丝${growth}%`)
      }
      if (latest.likes && prev.likes) {
        const growth = ((latest.likes - prev.likes) / prev.likes * 100).toFixed(1)
        changes.push(`点赞${growth}%`)
      }
      if (latest.views && prev.views) {
        const growth = ((latest.views - prev.views) / prev.views * 100).toFixed(1)
        changes.push(`浏览${growth}%`)
      }
      
      if (changes.length > 0) {
        context += `【周环比】${changes.join('，')}\n`
      }
    }
  }

  // 笔记分析
  if (data.notes.length > 0) {
    const byType: Record<string, number> = {}
    let totalLikes = 0, totalCollects = 0, totalComments = 0
    
    data.notes.forEach((n: any) => {
      byType[n.type || '其他'] = (byType[n.type || '其他'] || 0) + 1
      totalLikes += n.likes || 0
      totalCollects += n.collects || 0
      totalComments += n.comments || 0
    })

    const avgLikes = Math.round(totalLikes / data.notes.length)
    const avgCollects = Math.round(totalCollects / data.notes.length)

    context += `
【内容分析】（${data.notes.length}篇笔记）
- 分类：${Object.entries(byType).map(([k, v]) => `${k}${v}篇`).join('，')}
- 平均点赞：${avgLikes}，平均收藏：${avgCollects}
`

    // Top 笔记
    const top = [...data.notes].sort((a, b) => 
      ((b.likes || 0) + (b.collects || 0)) - ((a.likes || 0) + (a.collects || 0))
    ).slice(0, 3)

    if (top.length > 0) {
      context += `【表现最好】\n`
      top.forEach((n: any, i: number) => {
        context += `${i + 1}. 「${n.title || '未命名'}」- 点赞${n.likes || 0}/收藏${n.collects || 0}\n`
      })
    }
  }

  // 猫咪信息
  if (data.cats.length > 0) {
    context += `
【猫咪档案】
${data.cats.map((c: any) => {
  const info = [c.name]
  if (c.color) info.push(c.color)
  if (c.personality) info.push(`性格${c.personality}`)
  return `- ${info.join('，')}`
}).join('\n')}
`
  }

  return context
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const { message, history = [] } = await request.json()

    if (!message) {
      return NextResponse.json({ error: '消息不能为空' }, { status: 400 })
    }

    // 获取账号数据
    const accountData = await getAccountData()
    const contextInfo = buildContext(accountData)

    console.log(`[Chat API] Data fetched in ${Date.now() - startTime}ms`)

    const anthropic = new Anthropic({ apiKey })

    const today = new Date().toLocaleDateString('zh-CN')
    
    const systemPrompt = `你是"小离岛岛"的专属AI运营助手，名叫"岛助理"。
${contextInfo}
【你的职责】
1. 数据分析：分析账号数据，发现问题和机会
2. 内容策划：推荐选题，优化标题文案
3. 运营顾问：制定增长策略，提升互动率
4. 创意伙伴：提供拍摄创意和封面建议

【回答风格】
- 专业但亲切，像一个懂行的朋友
- 基于真实数据给建议，不说空话
- 给出具体可执行的方案
- 简洁有力，控制在300字内

当前日期：${today}`

    // 限制历史消息
    const recentHistory = history.slice(-4).map((h: any) => ({
      role: h.role as 'user' | 'assistant',
      content: h.content.slice(0, 400)
    }))

    const messages = [
      ...recentHistory,
      { role: 'user' as const, content: message }
    ]

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1200,
      system: systemPrompt,
      messages
    })

    const content = response.content[0].type === 'text' ? response.content[0].text : ''

    console.log(`[Chat API] Total: ${Date.now() - startTime}ms`)

    return NextResponse.json({ 
      success: true,
      message: content,
      response: content // 兼容旧格式
    })

  } catch (error: unknown) {
    console.error('Chat API Error:', error)
    const errorMessage = error instanceof Error ? error.message : '服务暂时不可用'
    
    if (errorMessage.includes('timeout') || errorMessage.includes('ETIMEDOUT')) {
      return NextResponse.json({ 
        success: false,
        error: '请求超时',
        message: '抱歉，服务响应较慢，请稍后重试'
      }, { status: 504 })
    }
    
    return NextResponse.json({ 
      success: false,
      error: errorMessage,
      message: '抱歉，遇到了一些问题，请稍后再试'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    configured: !!process.env.ANTHROPIC_API_KEY
  })
}
