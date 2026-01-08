import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const ANALYSIS_PROMPT = `你是一个信息提取助手。用户会描述他们的猫咪，请从描述中提取结构化信息。

要求：
1. 只提取用户明确提到的信息，不要推测或编造
2. 如果某项信息用户没有提到，该字段留空字符串或空数组
3. 返回纯JSON格式，不要包含其他文字

提取字段：
- personality: 性格特点（如：高冷、粘人、调皮等）
- traits: 特征标签数组（如：["爱吃", "怕生", "会握手"]）
- appearance: 外貌描述（如：橘猫、长毛、蓝眼睛等）
- notes: 其他备注信息
- bestContentType: 基于特点推荐的最适合内容类型（一句话描述）

用户描述：`;

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY is not set');
    return NextResponse.json(
      { success: false, error: 'ANTHROPIC_API_KEY未配置' },
      { status: 500 }
    );
  }

  const anthropic = new Anthropic({ apiKey });

  try {
    const { description, catName } = await request.json();
    
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{ 
        role: "user", 
        content: ANALYSIS_PROMPT + `\n\n关于猫咪"${catName}"：${description}\n\n请返回JSON：`
      }]
    });
    
    const text = response.content[0].type === 'text' 
      ? response.content[0].text 
      : '';
    
    // 提取JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return NextResponse.json({ success: true, data: parsed });
    }
    
    return NextResponse.json({ 
      success: false, 
      error: '无法解析AI响应' 
    });
  } catch (error) {
    console.error('Analysis Error:', error);
    return NextResponse.json(
      { success: false, error: 'AI分析失败' },
      { status: 500 }
    );
  }
}

