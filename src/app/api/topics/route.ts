import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

// Netlify Pro 超时配置
export const maxDuration = 25

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured', topics: [] }, { status: 500 })
    }

    const body = await request.json()
    const { category = '全部' } = body

    console.log('[Topics API] Request:', { category })

    const today = new Date().toLocaleDateString('zh-CN', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    })

    const systemPrompt = `你是小红书内容策划专家，精通平台算法和热门趋势。

当前日期：${today}

账号信息：
- 名称：小离岛岛
- 定位：精致生活、好物分享、生活方式
- 粉丝：25-35岁女性，一二线城市，追求品质生活
- 风格：高级感、实用性、真实分享

请推荐5个选题，直接返回JSON对象（不要代码块标记）：
{
  "topics": [
    {
      "title": "爆款标题（使用数字/情绪词/悬念）",
      "category": "分类",
      "heat": 热度1-100,
      "trend": "+15%",
      "estimatedViews": "预估曝光如50万+",
      "engagement": "互动率如8.5%",
      "tags": ["标签1", "标签2", "标签3"],
      "reason": "推荐理由（结合市场热度和账号定位）",
      "contentTips": "创作建议（拍摄角度、文案要点）",
      "bestPostTime": "最佳发布时间",
      "competitorCount": "竞争笔记数如10万+"
    }
  ],
  "marketInsight": "当前市场洞察（50字内）"
}`

    const userPrompt = category && category !== '全部'
      ? `推荐5个「${category}」类选题`
      : '推荐5个适合账号的热门选题，覆盖不同类别'

    const anthropic = new Anthropic({ apiKey })

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const content = response.content[0].type === 'text' ? response.content[0].text : ''
    console.log('[Topics API] Response time:', Date.now() - startTime, 'ms')
    
    // 解析JSON
    let data = { topics: [], marketInsight: '' }
    try {
      // 尝试匹配完整JSON对象
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        data = JSON.parse(jsonMatch[0])
      } else {
        // 尝试匹配数组
        const arrayMatch = content.match(/\[[\s\S]*\]/)
        if (arrayMatch) {
          data.topics = JSON.parse(arrayMatch[0])
        }
      }
      console.log('[Topics API] Parsed topics:', data.topics?.length || 0)
    } catch (e) {
      console.error('[Topics API] JSON解析失败')
      // 返回空数组而不是错误
      return NextResponse.json({ 
        success: true,
        topics: [],
        marketInsight: '暂时无法获取市场洞察',
        error: '解析失败，请重试'
      })
    }

    return NextResponse.json({ 
      success: true,
      topics: data.topics || [],
      marketInsight: data.marketInsight || ''
    })

  } catch (error: unknown) {
    console.error('[Topics API] Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ 
      success: false,
      error: errorMessage, 
      topics: [] 
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    configured: !!process.env.ANTHROPIC_API_KEY
  })
}
