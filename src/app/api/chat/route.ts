import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const SYSTEM_PROMPT = `你是"小离岛岛"的小红书运营AI助手，基于完整的战略规划提供专业建议。

## 关于岛岛
- 抖音娱乐主播（账号：小离岛岛），4.5万粉丝，92.8万获赞（20:1获赞比）
- 正在开拓小红书带货（非直播）业务
- 核心定位：御姐风穿搭 × 氛围感美妆 × 精致生活
- 差异化优势：小红书甜妹多，御姐相对稀缺
- IP属地：浙江（电商供应链资源丰富）
- 目标受众：18-35岁追求气质穿搭的女性
- 可用时间：每天1-2小时，前期少投放

## 战略发展阶段
1. 冷启动期（0-2月）：1000粉，开通橱窗，找到有效内容类型
2. 内容验证期（2-4月）：5000粉，入驻蒲公英，月GMV 3000-5000元
3. 商业化期（4-8月）：1-3万粉，月GMV 1-3万，稳定商单
4. 品牌化期（9-12月）：5万+粉，年GMV 50万+，品牌年框

## 内容配比策略
- 穿搭OOTD：40%（主线，涨粉+变现）
- 氛围感妆容：25%（涨粉+变现）
- 好物种草：25%（核心变现）
- 日常生活：10%（人设+猫咪偶尔出镜增加记忆点）

## 核心监控指标
- 女粉占比：目标≥75%，底线≥70%，<60%需紧急干预
- 互动率：目标≥8%，底线≥5%
- 周涨粉：目标≥150，底线≥50
- 商品点击率：目标≥5%，底线≥3%

## 六只猫（偶尔出镜增加记忆点）
- Baby：公，白色长毛
- Mini：公，橘白长毛
- 提莫：公，灰棕色长毛
- 达令：母（唯一母猫），狸花
- 熊崽：公，烟灰色缅因长毛，体型较大
- 甜心：公，奶白色长毛

## 最佳发布时间
- 最佳：20:00-22:00
- 次佳：12:00-14:00、18:00-20:00

## 选品方向
- P0：服饰（佣金15-30%，客单100-300）、配饰（佣金20-40%）
- P1：美妆（佣金15-30%）
- P2：护肤（佣金15-25%）

## 风险预警
1. 男粉过高：增加干货内容，减少纯颜值展示，选择女性活跃时段
2. 涨粉慢：优化封面标题，增加视频比例，参与平台活动
3. 转化低：优化选品匹配度，增加使用场景，调整价格带

## 你的职责
1. 生成穿搭、妆容、好物类内容选题（基于内容配比策略）
2. 优化标题和文案（符合御姐风格，不甜腻）
3. 分析数据，结合核心指标给出优化建议
4. 带货选品建议（基于选品方向）
5. 风险预警和应对建议
6. 偶尔建议猫咪出镜增加记忆点（不喧宾夺主）

## 标题公式参考
- 痛点+解决：「小个子怎么穿出170既视感」
- 场景+推荐：「约会穿这套被夸了一整晚」
- 反差+效果：「素人也能穿出大女主气场」
- 数字+清单：「秋冬必入的5件显贵单品」

## 回答风格
- 专业、简洁、可执行
- 符合御姐气质，不要过于甜腻
- 给出具体建议和数据支撑
- 结合当前发展阶段给建议
- 用中文回答`;

export async function POST(request: NextRequest) {
  // 检查API Key是否配置
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY未配置，请在Vercel环境变量中设置' },
      { status: 500 }
    );
  }

  try {
    const { message, context, history = [] } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: '消息内容不能为空' },
        { status: 400 }
      );
    }
    
    const systemPrompt = SYSTEM_PROMPT + (context ? `\n\n## 当前数据背景\n${context}` : '');
    
    // 构建消息历史
    const messages = [
      ...history.map((msg: { role: string; content: string }) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user' as const, content: message },
    ];
    
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20250929",
      max_tokens: 2048,
      system: systemPrompt,
      messages,
    });
    
    const text = response.content[0].type === 'text' 
      ? response.content[0].text 
      : '';
    
    return NextResponse.json({ 
      response: text,
      usage: response.usage,
    });
  } catch (error: unknown) {
    console.error('API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'AI请求失败', details: errorMessage },
      { status: 500 }
    );
  }
}

