import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY is not set');
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY未配置' },
      { status: 500 }
    );
  }

  const anthropic = new Anthropic({ apiKey });

  try {
    const { category = '穿搭', count = 5, context = '' } = await request.json();

    const prompt = `作为小红书运营专家，为"小离岛岛"账号推荐${count}个${category}类选题。

账号定位：御姐风穿搭 × 氛围感美妆 × 精致生活
目标用户：25-35岁女性，追求高级感穿搭
${context ? `\n当前数据背景：\n${context}` : ''}

要求：
1. 符合御姐风格，高级感，不甜腻
2. 有爆款潜力，结合当前热点
3. 适合带货变现
4. 给出完整标题（小红书风格）
5. 如果是生活类，可考虑猫咪出镜增加记忆点

以JSON数组格式返回：
[
  {
    "title": "完整的笔记标题",
    "type": "内容类型（穿搭/妆容/好物/生活）",
    "cats": ["如有猫咪出镜，填写猫咪名字，否则为空数组"],
    "tags": ["标签1", "标签2", "标签3"],
    "difficulty": "制作难度（简单/中等/复杂）",
    "potential": "爆款潜力（高/中/低）",
    "outline": "内容大纲，3-5点，用换行分隔",
    "reason": "推荐理由"
  }
]

只返回JSON数组，不要其他内容。`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });

    const result = response.content[0].type === 'text' 
      ? response.content[0].text 
      : '';

    // 解析JSON数组
    let topics = [];
    try {
      const jsonMatch = result.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        topics = JSON.parse(jsonMatch[0]);
      }
    } catch {
      topics = [{ raw: result }];
    }

    return NextResponse.json({ 
      topics,
      usage: response.usage,
    });
  } catch (error: unknown) {
    console.error('Topics API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: '话题推荐请求失败', details: errorMessage },
      { status: 500 }
    );
  }
}

