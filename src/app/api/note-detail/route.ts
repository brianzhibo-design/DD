import { NextRequest, NextResponse } from 'next/server'

// 实时获取笔记详情（不存储，保证数据最新）
export async function POST(request: NextRequest) {
  try {
    const { noteId } = await request.json()
    
    if (!noteId) {
      return NextResponse.json({ success: false, error: 'noteId 不能为空' }, { status: 400 })
    }

    const apiKey = process.env.ONEAPI_KEY
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'API 未配置' }, { status: 500 })
    }

    const response = await fetch('https://api.getoneapi.com/api/xiaohongshu/fetch_video_detail_v6', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ noteId }),
    })

    const data = await response.json()
    
    if (data.code === 200 && data.data?.note_list?.length > 0) {
      return NextResponse.json({ 
        success: true, 
        note: data.data.note_list[0]
      })
    }
    
    return NextResponse.json({ 
      success: false, 
      error: data.message || '笔记不存在或已删除' 
    })
    
  } catch (error: any) {
    console.error('[笔记详情] 错误:', error)
    return NextResponse.json({ success: false, error: error.message || '获取失败' }, { status: 500 })
  }
}

