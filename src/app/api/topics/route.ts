import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

// Netlify Pro 支持最长26秒
export const maxDuration = 25

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ 
        success: true, 
        ...getFallbackTopics('全部'),
        fallback: true,
        error: 'API key not configured'
      })
    }

    const body = await request.json().catch(() => ({}))
    const category = body.category || '全部'
    const customPrompt = body.customPrompt || ''

    const anthropic = new Anthropic({ apiKey })
    const today = new Date().toLocaleDateString('zh-CN')

    // 构建提示
    let topicRequest = ''
    if (customPrompt) {
      topicRequest = `根据以下需求推荐5个选题：「${customPrompt}」`
    } else if (category !== '全部') {
      topicRequest = `推荐5个「${category}」类热门选题`
    } else {
      topicRequest = '推荐5个不同类别的热门选题'
    }

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2500,
      messages: [{
        role: 'user',
        content: `你是专业的小红书运营专家，精通平台算法和内容趋势。今天是${today}。

目标账号信息：
- 账号名称：小离岛岛
- 定位：精致生活、好物分享、生活方式博主
- 粉丝画像：25-35岁女性，一二线城市，追求品质生活

${topicRequest}

要求：
1. 标题要符合小红书爆款特征（数字、情绪词、悬念等）
2. 结合当前真实热点趋势
3. 给出具体可执行的创作建议

直接返回JSON格式，不要任何其他文字或代码块标记：
{
  "topics": [
    {
      "title": "具体标题（15-25字）",
      "category": "分类",
      "heat": 热度分数(60-100),
      "trend": "趋势如+15%",
      "estimatedViews": "预估曝光如50万+",
      "engagement": "互动率如8.5%",
      "tags": ["标签1", "标签2", "标签3"],
      "reason": "推荐理由（50字内）",
      "contentTips": "创作建议（80字内）",
      "bestPostTime": "最佳发布时间"
    }
  ],
  "marketInsight": "当前市场洞察（60字内）"
}`
      }]
    })

    const content = response.content[0].type === 'text' ? response.content[0].text : ''
    console.log('[Topics] Claude响应长度:', content.length)

    // 解析JSON - 多种尝试
    let data = null
    
    // 尝试1：直接解析
    try {
      data = JSON.parse(content.trim())
    } catch {
      // 尝试2：提取代码块
      const codeMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/)
      if (codeMatch) {
        try {
          data = JSON.parse(codeMatch[1].trim())
        } catch {}
      }
      
      // 尝试3：提取JSON对象
      if (!data) {
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          try {
            data = JSON.parse(jsonMatch[0])
          } catch {}
        }
      }
    }

    if (data && data.topics && data.topics.length > 0) {
      return NextResponse.json({ 
        success: true, 
        topics: data.topics,
        marketInsight: data.marketInsight || ''
      })
    }

    // 解析失败，返回备用数据
    console.log('[Topics] JSON解析失败，使用备用数据')
    return NextResponse.json({ 
      success: true, 
      ...getFallbackTopics(category),
      fallback: true
    })

  } catch (error: unknown) {
    console.error('[Topics] API Error:', error)
    
    // 返回备用数据而不是错误
    return NextResponse.json({ 
      success: true, 
      ...getFallbackTopics('全部'),
      fallback: true
    })
  }
}

// 备用话题数据 - 高质量预设
function getFallbackTopics(category: string) {
  const allTopics = [
    {
      title: "30+姐姐的高级感穿搭｜这几个细节太重要了",
      category: "生活方式",
      heat: 95,
      trend: "+22%",
      estimatedViews: "100万+",
      engagement: "9.5%",
      tags: ["轻熟风", "高级感", "30+"],
      reason: "轻熟风穿搭搜索量本周上涨40%，人设契合度高",
      contentTips: "重点展示配饰细节和面料质感，用对比图突出前后差异",
      bestPostTime: "周三 20:00",
      competitorCount: "15万+"
    },
    {
      title: "早C晚A到底怎么用？皮肤科医生朋友教我的",
      category: "好物分享",
      heat: 93,
      trend: "+18%",
      estimatedViews: "150万+",
      engagement: "8.8%",
      tags: ["护肤", "早C晚A", "成分党"],
      reason: "护肤科普内容长期高互动，专业背书更有说服力",
      contentTips: "用时间线展示使用步骤，加入产品特写",
      bestPostTime: "周日 21:00",
      competitorCount: "20万+"
    },
    {
      title: "独居第3年｜这些小习惯让生活质感翻倍",
      category: "生活方式",
      heat: 91,
      trend: "+25%",
      estimatedViews: "80万+",
      engagement: "10.2%",
      tags: ["独居生活", "精致生活", "生活习惯"],
      reason: "独居话题热度持续走高，生活方式内容易引发共鸣",
      contentTips: "分享5-7个具体习惯，配合生活场景实拍",
      bestPostTime: "周五 19:00",
      competitorCount: "12万+"
    },
    {
      title: "养猫3年｜这些冷门好物后悔没早买",
      category: "萌宠",
      heat: 89,
      trend: "+20%",
      estimatedViews: "70万+",
      engagement: "11.5%",
      tags: ["养猫", "猫咪好物", "铲屎官必备"],
      reason: "萌宠内容互动率高，好物推荐转化率好",
      contentTips: "展示猫咪使用场景，突出产品解决的痛点",
      bestPostTime: "周六 15:00",
      competitorCount: "8万+"
    },
    {
      title: "小户型餐桌布置｜一人食也要有仪式感",
      category: "家居",
      heat: 87,
      trend: "+12%",
      estimatedViews: "60万+",
      engagement: "7.8%",
      tags: ["餐桌布置", "一人食", "仪式感"],
      reason: "家居类内容转化率高，仪式感话题契合精致人设",
      contentTips: "展示餐具搭配和摆盘技巧，用俯拍角度",
      bestPostTime: "周六 11:00",
      competitorCount: "10万+"
    }
  ]

  const categoryMap: { [key: string]: string[] } = {
    '生活方式': ['生活方式'],
    '好物分享': ['好物分享'],
    '萌宠': ['萌宠'],
    '美食': ['美食'],
    '家居': ['家居'],
    '旅行': ['旅行']
  }

  let filtered = allTopics
  if (category !== '全部' && categoryMap[category]) {
    filtered = allTopics.filter(t => categoryMap[category].includes(t.category))
    if (filtered.length === 0) filtered = allTopics.slice(0, 3)
  }

  return {
    topics: filtered,
    marketInsight: `当前小红书平台流量倾斜"真实感"内容，建议多发实测类、日常分享类笔记。${category !== '全部' ? category + '类' : '综合品类'}近期互动率稳定。`
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    configured: !!process.env.ANTHROPIC_API_KEY,
    timeout: '25s'
  })
}
