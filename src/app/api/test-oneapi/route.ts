import { NextResponse } from 'next/server'

const ONEAPI_BASE = 'https://api.getoneapi.com'

// 公开测试端点 - 仅用于验证 OneAPI 配置
export async function GET() {
  const apiKey = process.env.ONEAPI_KEY
  const userId = process.env.XHS_USER_ID

  if (!apiKey) {
    return NextResponse.json({ 
      success: false, 
      error: 'ONEAPI_KEY 未配置',
      config: { hasApiKey: false, hasUserId: !!userId }
    })
  }

  if (!userId) {
    return NextResponse.json({ 
      success: false, 
      error: 'XHS_USER_ID 未配置',
      config: { hasApiKey: true, hasUserId: false }
    })
  }

  try {
    // 测试1：获取用户信息
    const userRes = await fetch(`${ONEAPI_BASE}/api/xiaohongshu/fetch_user_data_v4`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({ userId })
    })
    const userData = await userRes.json()

    if (userData.code !== 200) {
      return NextResponse.json({
        success: false,
        error: `用户信息API失败: ${userData.message || userData.code}`,
        response: userData
      })
    }

    const user = userData.data?.data || userData.data || {}

    // 测试2：获取笔记列表（取第一篇）
    const listRes = await fetch(`${ONEAPI_BASE}/api/xiaohongshu/fetch_user_video_list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({ userId })
    })
    const listData = await listRes.json()

    if (listData.code !== 200) {
      return NextResponse.json({
        success: false,
        error: `笔记列表API失败: ${listData.message || listData.code}`,
        userInfo: {
          nickname: user.nickname,
          fans: user.fans
        }
      })
    }

    const notes = listData.data?.notes || []
    const firstNote = notes[0]

    if (!firstNote) {
      return NextResponse.json({
        success: false,
        error: '没有找到笔记',
        userInfo: {
          nickname: user.nickname,
          fans: user.fans,
          notesCount: notes.length
        }
      })
    }

    const noteId = firstNote.id || firstNote.note_id || firstNote.cursor

    // 测试3：获取笔记详情
    const detailRes = await fetch(`${ONEAPI_BASE}/api/xiaohongshu/fetch_video_detail_v6`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({ noteId })
    })
    const detailData = await detailRes.json()

    let noteDetail = null
    if (detailData.code === 200) {
      noteDetail = detailData.data?.note_list?.[0] || detailData.data
    }

    // 测试4：获取评论
    let comments = []
    if (noteDetail?.comments_count > 0 || parseInt(firstNote.comments) > 0) {
      const commentRes = await fetch(`${ONEAPI_BASE}/api/xiaohongshu/fetch_video_comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({ noteId, sort: '1' })
      })
      const commentData = await commentRes.json()
      if (commentData.code === 200) {
        comments = commentData.data?.comments?.slice(0, 3) || []
      }
    }

    return NextResponse.json({
      success: true,
      message: 'OneAPI 测试成功！',
      results: {
        userInfo: {
          nickname: user.nickname,
          fans: user.fans,
          liked: user.liked,
          collected: user.collected,
          notes_count: user.ndiscovery
        },
        notesList: {
          total: notes.length,
          firstNote: {
            id: noteId,
            title: firstNote.display_title || firstNote.title,
            likes: firstNote.likes || firstNote.liked_count
          }
        },
        noteDetail: noteDetail ? {
          title: noteDetail.title,
          liked_count: noteDetail.liked_count,
          collected_count: noteDetail.collected_count,
          comments_count: noteDetail.comments_count,
          ip_location: noteDetail.ip_location,
          has_detail: true
        } : {
          has_detail: false,
          raw_code: detailData.code,
          raw_message: detailData.message
        },
        comments: {
          count: comments.length,
          sample: comments.map((c: any) => ({
            user: c.user?.nickname,
            content: c.content?.substring(0, 30)
          }))
        }
      }
    })

  } catch (e: any) {
    return NextResponse.json({
      success: false,
      error: e.message
    })
  }
}

