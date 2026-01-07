import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const maxDuration = 25

const ONEAPI_BASE = 'https://api.getoneapi.com'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

async function oneApiRequest(endpoint: string, body: object) {
  const apiKey = process.env.ONEAPI_KEY
  if (!apiKey) throw new Error('ONEAPI_KEY 未配置')

  const response = await fetch(`${ONEAPI_BASE}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  })

  const result = await response.json()
  
  if (result.code !== 200) {
    throw new Error(result.message || `OneAPI错误: ${result.code}`)
  }

  return result.data
}

export async function POST(request: NextRequest) {
  const supabase = getSupabase()
  if (!supabase) {
    return NextResponse.json({ success: false, error: 'Supabase 未配置' }, { status: 500 })
  }

  try {
    const userId = process.env.XHS_USER_ID
    if (!userId) {
      return NextResponse.json({ success: false, error: '未配置 XHS_USER_ID' }, { status: 500 })
    }

    console.log('[同步开始] userId:', userId)

    // ========== 1. 获取用户信息 ==========
    const userResult = await oneApiRequest('/api/xiaohongshu/fetch_user_data_v4', { userId })
    const userData = userResult.data || userResult
    
    const accountInfo = {
      id: 'main',
      nickname: userData.nickname || '未知',
      red_id: userData.red_id || '',
      avatar: userData.images || '',
      description: userData.desc || '',
      ip_location: userData.ip_location || '',
      fans: parseInt(userData.fans) || 0,
      follows: parseInt(userData.follows) || 0,
      total_likes: parseInt(userData.liked) || 0,
      total_collected: parseInt(userData.collected) || 0,
      notes_count: parseInt(userData.ndiscovery) || 0,
      updated_at: new Date().toISOString()
    }

    await supabase.from('account_info').upsert(accountInfo, { onConflict: 'id' })
    console.log(`[用户信息] ${accountInfo.nickname} | 粉丝:${accountInfo.fans} | 获赞:${accountInfo.total_likes}`)

    // ========== 2. 获取笔记列表 ==========
    const notesResult = await oneApiRequest('/api/xiaohongshu/fetch_user_video_list', { userId })
    const notes = notesResult.notes || []
    console.log(`[笔记列表] 获取到 ${notes.length} 篇笔记`)

    // ========== 3. 获取每篇笔记的详情和评论 ==========
    let totalLikes = 0
    let totalCollects = 0
    let totalComments = 0
    let totalShares = 0
    let savedNotes = 0
    let savedComments = 0

    for (const note of notes) {
      const noteId = note.id || note.note_id || note.cursor
      if (!noteId) continue

      let likes = parseInt(note.likes) || parseInt(note.liked_count) || 0
      let collects = parseInt(note.collected_count) || parseInt(note.collects) || 0
      let comments = parseInt(note.comments_count) || parseInt(note.comments) || 0
      let shares = parseInt(note.share_count) || 0
      let title = note.display_title || note.title || note.desc?.substring(0, 50) || '无标题'
      let desc = note.desc || ''
      let coverImage = note.images_list?.[0]?.url_size_large || 
                       note.images_list?.[0]?.url || 
                       note.cover?.url_default ||
                       note.cover?.url || ''
      let ipLocation = ''

      // 尝试获取笔记详情（前10篇）
      if (savedNotes < 10) {
        try {
          const detailResult = await oneApiRequest('/api/xiaohongshu/fetch_video_detail_v6', { noteId })
          const noteDetail = detailResult.note_list?.[0] || detailResult

          if (noteDetail) {
            likes = parseInt(noteDetail.liked_count) || likes
            collects = parseInt(noteDetail.collected_count) || collects
            comments = parseInt(noteDetail.comments_count) || comments
            shares = parseInt(noteDetail.share_count) || shares
            title = noteDetail.title || title
            desc = noteDetail.desc || desc
            ipLocation = noteDetail.ip_location || ''
            
            if (noteDetail.images_list?.[0]) {
              coverImage = noteDetail.images_list[0].url || noteDetail.images_list[0].original || coverImage
            }
          }

          // 获取评论（前5篇热门笔记）
          if (savedNotes < 5 && comments > 0) {
            try {
              const commentsResult = await oneApiRequest('/api/xiaohongshu/fetch_video_comment', { 
                noteId, 
                sort: '1'
              })
              
              const commentsList = commentsResult.comments || []
              
              for (const comment of commentsList.slice(0, 10)) {
                const { error: commentError } = await supabase.from('note_comments').upsert({
                  id: comment.id,
                  note_id: noteId,
                  user_id: comment.user?.userid || comment.user?.user_id,
                  user_nickname: comment.user?.nickname,
                  user_avatar: comment.user?.images || comment.user?.image,
                  content: comment.content,
                  like_count: parseInt(comment.like_count) || 0,
                  sub_comment_count: parseInt(comment.sub_comment_count) || 0,
                  ip_location: comment.ip_location || '',
                  created_at: comment.time ? new Date(comment.time * 1000).toISOString() : null,
                  updated_at: new Date().toISOString()
                }, { onConflict: 'id' })

                if (!commentError) savedComments++
              }
            } catch (e) {
              console.log(`[评论] 获取笔记 ${noteId} 评论失败`)
            }
          }

          await new Promise(r => setTimeout(r, 100))
        } catch (e) {
          console.log(`[笔记详情] 获取 ${noteId} 失败，使用列表数据`)
        }
      }

      totalLikes += likes
      totalCollects += collects
      totalComments += comments
      totalShares += shares

      // 保存笔记
      const { error: noteError } = await supabase.from('notes').upsert({
        id: noteId,
        title: title.substring(0, 200),
        content: desc,
        type: note.type === 'video' ? '视频' : '图文',
        status: 'published',
        likes,
        collects,
        comments,
        shares,
        views: 0,
        cover_image: coverImage,
        ip_location: ipLocation,
        publish_date: note.time_desc || null,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' })

      if (!noteError) savedNotes++
    }

    console.log(`[笔记保存] 成功 ${savedNotes} 篇，评论 ${savedComments} 条`)

    // ========== 4. 保存周统计数据 ==========
    const weekStart = getWeekStart(new Date())
    const weekEnd = getWeekEnd(new Date())

    const { data: lastWeekData } = await supabase
      .from('weekly_stats')
      .select('*')
      .lt('week_start', weekStart)
      .order('week_start', { ascending: false })
      .limit(1)
      .single()

    const lastFollowers = lastWeekData?.followers || accountInfo.fans
    const newFollowers = Math.max(0, accountInfo.fans - lastFollowers)

    await supabase.from('weekly_stats').upsert({
      week_start: weekStart,
      week_end: weekEnd,
      followers: accountInfo.fans,
      new_followers: newFollowers,
      likes: accountInfo.total_likes,
      saves: accountInfo.total_collected,
      comments: totalComments,
      shares: totalShares,
      views: 0,
      posts_count: accountInfo.notes_count,
      female_ratio: 85
    }, { onConflict: 'week_start' })

    console.log('[同步完成]')

    return NextResponse.json({
      success: true,
      message: '数据同步成功！',
      data: {
        account: accountInfo,
        stats: {
          notesCount: notes.length,
          savedNotes,
          savedComments,
          totalLikes,
          totalCollects,
          totalComments,
          totalShares
        }
      }
    })

  } catch (error: any) {
    console.error('[同步失败]', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}

function getWeekStart(date: Date): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return d.toISOString().split('T')[0]
}

function getWeekEnd(date: Date): string {
  const start = new Date(getWeekStart(new Date()))
  start.setDate(start.getDate() + 6)
  return start.toISOString().split('T')[0]
}

export async function GET() {
  const supabase = getSupabase()
  if (!supabase) {
    return NextResponse.json({ status: 'ok', data: null })
  }

  try {
    const { data: account } = await supabase
      .from('account_info')
      .select('*')
      .eq('id', 'main')
      .single()

    const { data: latestStats } = await supabase
      .from('weekly_stats')
      .select('*')
      .order('week_start', { ascending: false })
      .limit(1)
      .single()

    const { data: topNotes } = await supabase
      .from('notes')
      .select('*')
      .order('likes', { ascending: false })
      .limit(5)

    const { data: recentComments } = await supabase
      .from('note_comments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    return NextResponse.json({ 
      status: 'ok',
      data: {
        account,
        latestStats,
        topNotes,
        recentComments
      },
      config: {
        ONEAPI_KEY: process.env.ONEAPI_KEY ? '已配置' : '未配置',
        XHS_USER_ID: process.env.XHS_USER_ID || '未配置'
      }
    })
  } catch (e) {
    return NextResponse.json({ status: 'ok', data: null })
  }
}
