import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

// 获取历史数据摘要的函数（服务端调用Supabase）
async function getContextData() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('[Chat API] Supabase not configured, skipping context')
    return { notes: [], weeklyStats: [], cats: [] }
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  // 获取笔记数据
  const { data: notes } = await supabase
    .from('notes')
    .select('*')
    .eq('status', 'published')
    .order('publish_date', { ascending: false })
    .limit(20)

  // 获取最新周数据
  const { data: weeklyStats } = await supabase
    .from('weekly_stats')
    .select('*')
    .order('week_start', { ascending: false })
    .limit(4)

  // 获取猫咪信息
  const { data: cats } = await supabase
    .from('cats')
    .select('*')

  return { notes: notes || [], weeklyStats: weeklyStats || [], cats: cats || [] }
}

// 构建上下文提示
function buildContextPrompt(data: { notes: any[], weeklyStats: any[], cats: any[] }) {
  let context = `\n\n【账号历史数据参考】\n`

  // 周数据摘要
  if (data.weeklyStats.length > 0) {
    const latest = data.weeklyStats[0]
    context += `\n[数据] 最新运营数据（${latest.week_start}）：
- 粉丝：${latest.followers}，本周新增：${latest.new_followers}
- 互动：点赞${latest.likes}、收藏${latest.saves}、评论${latest.comments}
- 浏览量：${latest.views}
- 女粉占比：${latest.female_ratio}%\n`
  }

  // 笔记表现摘要
  if (data.notes.length > 0) {
    const byType: Record<string, number> = {}
    let totalLikes = 0, totalCollects = 0
    
    data.notes.forEach((n: any) => {
      byType[n.type] = (byType[n.type] || 0) + 1
      totalLikes += n.likes || 0
      totalCollects += n.collects || 0
    })

    context += `\n[笔记] 历史笔记分析（共${data.notes.length}篇）：
- 内容分布：${Object.entries(byType).map(([k, v]) => `${k}${v}篇`).join('、')}
- 平均点赞：${Math.round(totalLikes / data.notes.length)}
- 平均收藏：${Math.round(totalCollects / data.notes.length)}\n`

    // 表现最好的笔记
    const top = [...data.notes].sort((a, b) => (b.collects + b.likes) - (a.collects + a.likes)).slice(0, 3)
    if (top.length > 0) {
      context += `\n[热门] 表现最好的笔记：\n`
      top.forEach((n: any, i: number) => {
        context += `${i + 1}. 「${n.title}」(${n.type}) - 点赞${n.likes} 收藏${n.collects}\n`
      })
    }
  } else {
    context += `\n[笔记] 暂无历史笔记数据\n`
  }

  // 猫咪信息
  if (data.cats.length > 0) {
    context += `\n[猫咪] 猫咪档案（${data.cats.length}只）：\n`
    data.cats.forEach((cat: any) => {
      const info = [cat.name]
      if (cat.gender) info.push(`${cat.gender}`)
      if (cat.breed) info.push(cat.breed)
      if (cat.color) info.push(cat.color)
      if (cat.personality) info.push(`性格：${cat.personality}`)
      context += `- ${info.join('，')}\n`
    })
  }

  return context
}

const BASE_SYSTEM_PROMPT = `你是一位专业的小红书运营专家，专门为"小离岛岛"账号提供运营建议。

账号定位：内容创作 × 生活方式 × 精致分享
目标用户：25-35岁女性，追求品质生活
现有资产：抖音4.5万粉丝，92.8万获赞，正在拓展小红书

你的职责：
1. 根据历史数据分析内容表现，提供针对性建议
2. 结合账号数据推荐选题方向
3. 优化标题和文案
4. 解答小红书运营相关问题

回答要求：
- 基于实际数据给出建议，不要空泛
- 简洁实用，给出具体可执行的建议
- 符合账号风格定位`

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const { message, history = [] } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // 获取历史数据
    const contextData = await getContextData()
    const contextPrompt = buildContextPrompt(contextData)
    
    // 组合完整的系统提示
    const fullSystemPrompt = BASE_SYSTEM_PROMPT + contextPrompt

    const anthropic = new Anthropic({ apiKey })

    const messages = [
      ...history.map((msg: { role: string; content: string }) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user' as const, content: message },
    ]

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2048,
      system: fullSystemPrompt,
      messages,
    })

    const assistantMessage = response.content[0].type === 'text' 
      ? response.content[0].text 
      : ''

    return NextResponse.json({ message: assistantMessage })

  } catch (error: unknown) {
    console.error('Chat API Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    configured: !!process.env.ANTHROPIC_API_KEY 
  })
}
