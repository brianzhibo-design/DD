import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const SYSTEM_PROMPT = `你是小红书内容策划专家，为"小离岛岛"账号提供选题。
账号定位：御姐风穿搭 × 氛围感美妆 × 精致生活
目标用户：25-35岁女性

生成5个爆款选题，直接返回JSON数组，不要任何其他文字。`

export const maxDuration = 60 // 设置最大执行时间为60秒

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const body = await request.json()
    const { category = '穿搭', season = '通用' } = body

    console.log('[Topics API] Request:', { category, season })

    const anthropic = new Anthropic({ apiKey })

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [{ 
        role: 'user', 
        content: `生成5个${category}类小红书选题，季节：${season}。

直接返回JSON数组，格式如下，不要任何其他文字：
[
  {
    "title": "标题（带emoji）",
    "tags": ["标签1", "标签2"],
    "difficulty": "简单",
    "potential": "高",
    "reason": "推荐理由",
    "outline": ["要点1", "要点2", "要点3"]
  }
]` 
      }],
    })

    const content = response.content[0].type === 'text' ? response.content[0].text : ''
    console.log('[Topics API] Raw response length:', content.length)
    
    // 提取JSON数组
    let topics = []
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        topics = JSON.parse(jsonMatch[0])
        console.log('[Topics API] Parsed topics:', topics.length)
      }
    } catch (e) {
      console.error('[Topics API] JSON解析失败:', e)
      console.error('[Topics API] 原始内容:', content.substring(0, 500))
      return NextResponse.json({ 
        error: 'JSON解析失败',
        topics: [],
        raw: content.substring(0, 1000)
      }, { status: 200 })
    }

    return NextResponse.json({ topics })

  } catch (error: unknown) {
    console.error('[Topics API] Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: errorMessage, topics: [] }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    apiKeyConfigured: !!process.env.ANTHROPIC_API_KEY
  })
}
