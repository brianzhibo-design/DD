import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const { image } = await request.json()
    
    if (!image) {
      return NextResponse.json({ error: '请上传图片' }, { status: 400 })
    }

    // 提取base64数据
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '')
    const mediaType = image.match(/^data:(image\/\w+);/)?.[1] || 'image/png'

    const anthropic = new Anthropic({ apiKey })

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType as 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp',
              data: base64Data
            }
          },
          {
            type: 'text',
            text: `这是小红书创作者后台的数据截图，请仔细识别并提取以下数据。

需要提取的字段：
- followers: 总粉丝数
- new_followers: 新增粉丝数（涨粉数）
- likes: 点赞数（获赞数）
- saves: 收藏数
- comments: 评论数
- views: 浏览量/阅读量/观看数
- posts_count: 笔记数/作品数
- female_ratio: 女性粉丝占比（0-100的数字）

注意事项：
1. 数字可能带有"万"或"k"，请转换为实际数字（如1.2万=12000）
2. 百分比请转换为数字（如85%=85）
3. 只返回能确定识别到的字段
4. 如果是粉丝画像页面，重点提取female_ratio

请直接返回JSON对象，不要任何其他文字：
{"followers": 数字, "new_followers": 数字, "likes": 数字, "saves": 数字, "comments": 数字, "views": 数字, "posts_count": 数字, "female_ratio": 数字}

如果完全无法识别任何数据，返回：{"error": "无法识别该图片中的数据"}`
          }
        ]
      }]
    })

    const content = response.content[0].type === 'text' ? response.content[0].text : ''
    console.log('[Screenshot] AI识别结果:', content)

    try {
      // 提取JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0])
        if (data.error) {
          return NextResponse.json({ success: false, error: data.error, data: null })
        }
        return NextResponse.json({ success: true, data })
      }
    } catch (e) {
      console.error('[Screenshot] JSON解析失败:', content)
    }

    return NextResponse.json({ success: false, error: '识别失败，请重试', data: null })

  } catch (error: unknown) {
    console.error('[Screenshot] API Error:', error)
    const message = error instanceof Error ? error.message : '识别失败'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

