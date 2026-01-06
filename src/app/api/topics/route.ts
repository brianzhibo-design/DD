import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const SYSTEM_PROMPT = `你是小红书内容策划专家，为"小离岛岛"账号提供选题。
账号定位：御姐风穿搭 × 氛围感美妆 × 精致生活
目标用户：25-35岁女性，追求高级感穿搭

生成5个爆款选题，每个包含：标题、标签、难度、潜力、理由、大纲
严格返回JSON数组格式。`

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      console.error('[Topics API] ANTHROPIC_API_KEY not configured')
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const { category = '穿搭', season = '通用' } = await request.json()
    console.log('[Topics API] Generating topics for:', { category, season })
    
    const anthropic = new Anthropic({ apiKey })

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2500,
      system: SYSTEM_PROMPT,
      messages: [{ 
        role: 'user', 
        content: `生成5个${category}类选题，季节：${season}。返回JSON数组：[{"title":"标题","tags":["标签"],"difficulty":"简单/中等/复杂","potential":"高/中/低","reason":"理由","outline":["要点1","要点2"]}]` 
      }],
    })

    const content = response.content[0].type === 'text' ? response.content[0].text : ''
    console.log('[Topics API] Raw response:', content.substring(0, 200))
    
    const jsonMatch = content.match(/\[[\s\S]*\]/)
    const topics = jsonMatch ? JSON.parse(jsonMatch[0]) : []

    return NextResponse.json({ topics })
  } catch (error: unknown) {
    console.error('[Topics API] Error:', error)
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
