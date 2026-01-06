import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const SYSTEM_PROMPT = `你是一位专业的小红书运营专家，专门为"小离岛岛"账号提供运营建议。

账号定位：御姐风穿搭 × 氛围感美妆 × 精致生活
目标用户：25-35岁女性，追求高级感穿搭

你的职责：
1. 提供穿搭、美妆内容的选题建议
2. 优化标题和文案
3. 分析数据，给出改进建议
4. 解答小红书运营相关问题

回答要求简洁实用，给出具体可执行的建议。`

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

    const anthropic = new Anthropic({ apiKey })

    const messages = [
      ...history.map((msg: { role: string; content: string }) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user' as const, content: message },
    ]

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
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
    apiKeyConfigured: !!process.env.ANTHROPIC_API_KEY 
  })
}
