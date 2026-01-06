import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(request: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY未配置' },
      { status: 500 }
    );
  }

  try {
    const { title, content, type = 'general' } = await request.json();

    let prompt = '';
    
    if (type === 'title') {
      prompt = `分析以下小红书标题，并给出优化建议：

标题：${title}

请从以下维度分析：
1. 吸引力评分（1-10分）
2. 关键词覆盖
3. 情绪价值
4. 优化建议（给出3个优化版本）

以JSON格式返回：
{
  "score": 数字,
  "analysis": "分析内容",
  "keywords": ["关键词数组"],
  "suggestions": ["优化标题1", "优化标题2", "优化标题3"]
}`;
    } else if (type === 'content') {
      prompt = `分析以下小红书笔记内容：

标题：${title}
正文：${content}

请从以下维度分析：
1. 内容质量评分（1-10分）
2. 结构完整性
3. 种草力度
4. 互动引导
5. 改进建议

以JSON格式返回：
{
  "score": 数字,
  "structure": "结构分析",
  "seedingPower": "种草力分析",
  "engagement": "互动引导分析",
  "suggestions": ["建议1", "建议2", "建议3"]
}`;
    } else {
      prompt = `作为小红书运营专家，分析以下内容并给出建议：

${title}
${content || ''}

给出专业分析和可执行建议。`;
    }

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20250929',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    });

    const result = response.content[0].type === 'text' 
      ? response.content[0].text 
      : '';

    // 尝试解析JSON，如果失败则返回原文
    let parsed;
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        parsed = { raw: result };
      }
    } catch {
      parsed = { raw: result };
    }

    return NextResponse.json(parsed);
  } catch (error: unknown) {
    console.error('Analyze API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: '分析请求失败', details: errorMessage },
      { status: 500 }
    );
  }
}

