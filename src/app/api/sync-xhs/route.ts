import { NextRequest, NextResponse } from 'next/server'
import { fetchUserInfo, fetchUserNotes, fetchNoteDetail, parseCount, XHSUserInfo, XHSNote } from '@/lib/xhs-api'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const userId = process.env.XHS_USER_ID
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: '未配置小红书用户ID (XHS_USER_ID)' 
      }, { status: 500 })
    }

    console.log('[Sync] 开始同步小红书数据, userId:', userId)

    // 1. 获取用户基础信息
    let userInfo: XHSUserInfo = {}
    try {
      userInfo = await fetchUserInfo(userId)
      console.log('[Sync] 用户信息:', JSON.stringify(userInfo, null, 2))
    } catch (e) {
      console.error('[Sync] 获取用户信息失败:', e)
    }

    // 解析用户数据
    let followers = 0
    let totalLikes = 0
    let totalCollects = 0
    
    if (userInfo.interactions) {
      for (const item of userInfo.interactions) {
        const count = parseCount(item.count)
        if (item.type === 'fans' || item.name?.includes('粉丝')) {
          followers = count
        }
        if (item.type === 'liked' || item.name?.includes('获赞')) {
          totalLikes = count
        }
        if (item.type === 'collected' || item.name?.includes('收藏')) {
          totalCollects = count
        }
      }
    }

    // 2. 获取笔记列表
    let notes: XHSNote[] = []
    try {
      const notesData = await fetchUserNotes(userId)
      notes = notesData.notes || []
      console.log(`[Sync] 获取到 ${notes.length} 篇笔记`)
    } catch (e) {
      console.error('[Sync] 获取笔记列表失败:', e)
    }

    // 3. 获取每篇笔记详情并保存
    const noteStats = {
      totalViews: 0,
      totalNoteLikes: 0,
      totalNoteCollects: 0,
      totalComments: 0
    }

    for (const note of notes.slice(0, 10)) { // 最多处理10篇，避免API调用过多
      try {
        const noteId = note.noteId || note.id
        const xsecToken = note.xsecToken || ''
        
        if (!noteId) continue

        // 获取详情（如果有xsecToken）
        let detail: XHSNote = note
        if (xsecToken) {
          try {
            detail = await fetchNoteDetail(noteId, xsecToken)
            // 避免请求过快
            await new Promise(r => setTimeout(r, 500))
          } catch (e) {
            console.error('[Sync] 获取笔记详情失败:', noteId)
          }
        }

        // 统计数据
        const likes = parseCount(detail.likedCount)
        const collects = parseCount(detail.collectedCount)
        const comments = parseCount(detail.commentCount)
        const views = parseCount(detail.viewCount)

        noteStats.totalViews += views
        noteStats.totalNoteLikes += likes
        noteStats.totalNoteCollects += collects
        noteStats.totalComments += comments

        // 保存笔记到数据库
        await supabase.from('notes').upsert({
          id: noteId,
          title: detail.title || detail.desc || '无标题',
          content: detail.desc || '',
          type: mapNoteType(detail.type),
          status: 'published',
          views: views,
          likes: likes,
          collects: collects,
          comments: comments,
        }, { onConflict: 'id' })

      } catch (e) {
        console.error('[Sync] 处理笔记失败:', e)
      }
    }

    // 4. 保存周统计数据
    const today = new Date()
    const weekStart = getWeekStart(today)
    const weekEnd = getWeekEnd(today)

    const weeklyData = {
      week_start: weekStart,
      week_end: weekEnd,
      followers: followers,
      new_followers: 0, // API不提供增量
      likes: totalLikes || noteStats.totalNoteLikes,
      saves: totalCollects || noteStats.totalNoteCollects,
      comments: noteStats.totalComments,
      views: noteStats.totalViews,
      posts_count: notes.length,
      female_ratio: 0, // 需要粉丝画像接口
    }

    await supabase.from('weekly_stats').upsert(weeklyData, { 
      onConflict: 'week_start' 
    })

    console.log('[Sync] 同步完成:', weeklyData)

    return NextResponse.json({
      success: true,
      message: '数据同步成功！',
      data: {
        nickname: userInfo.basicInfo?.nickname || '未知',
        followers,
        notesCount: notes.length,
        totalLikes: totalLikes || noteStats.totalNoteLikes,
        totalCollects: totalCollects || noteStats.totalNoteCollects,
        totalComments: noteStats.totalComments,
        totalViews: noteStats.totalViews
      }
    })

  } catch (error: unknown) {
    console.error('[Sync] 同步失败:', error)
    const message = error instanceof Error ? error.message : '同步失败'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

// 获取本周开始日期
function getWeekStart(date: Date): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return d.toISOString().split('T')[0]
}

// 获取本周结束日期
function getWeekEnd(date: Date): string {
  const start = new Date(getWeekStart(date))
  start.setDate(start.getDate() + 6)
  return start.toISOString().split('T')[0]
}

// 映射笔记类型
function mapNoteType(type?: string): string {
  if (!type) return '其他'
  if (type.includes('video')) return '视频'
  if (type.includes('normal')) return '图文'
  return '其他'
}

// GET请求用于测试配置
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    configured: {
      oneapiKey: !!process.env.ONEAPI_KEY,
      xhsUserId: !!process.env.XHS_USER_ID
    }
  })
}

