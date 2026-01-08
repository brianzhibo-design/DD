import { NextRequest, NextResponse } from 'next/server'

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

    console.log('[笔记详情] 获取:', noteId)

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
      const note = data.data.note_list[0]
      console.log('[笔记详情] 成功:', note.title || note.desc?.slice(0, 20))
      return NextResponse.json({ 
        success: true, 
        note: note
      })
    }
    
    console.log('[笔记详情] 失败:', data.code, data.message)
    return NextResponse.json({ 
      success: false, 
      error: data.message || '笔记不存在或已删除' 
    })
    
  } catch (error: any) {
    console.error('[笔记详情] 错误:', error)
    return NextResponse.json({ success: false, error: error.message || '获取失败' }, { status: 500 })
  }
}

