import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const maxDuration = 60 // 增加到60秒超时

const ONEAPI_BASE = 'https://api.getoneapi.com'

// OneAPI 错误码映射
const ERROR_CODES: Record<number, string> = {
  0: '请求失败，请重试',
  401: 'API密钥无效',
  403: '账户不可用',
  404: 'API 未找到',
  301: '余额不足'
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

// 带重试的 API 请求（最多重试，只有 code=200 计费）
async function oneApiRequest(
  endpoint: string, 
  body: object, 
  options?: { maxRetries?: number; alternativeEndpoints?: string[] }
): Promise<any> {
  const apiKey = process.env.ONEAPI_KEY
  if (!apiKey) throw new Error('ONEAPI_KEY 未配置')

  const maxRetries = options?.maxRetries ?? 2
  const endpoints = [endpoint, ...(options?.alternativeEndpoints || [])]
  
  let lastError: Error | null = null

  for (const ep of endpoints) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const url = ONEAPI_BASE + ep
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify(body)
        })

        const result = await response.json()
        
        if (result.code === 200) {
          return result.data
        }

        const errorMsg = ERROR_CODES[result.code] || result.message || `错误: ${result.code}`
        
        // 401/403/301 不需要重试
        if ([401, 403, 301].includes(result.code)) {
          throw new Error(errorMsg)
        }

        lastError = new Error(errorMsg)
        
        if (attempt < maxRetries) {
          await new Promise(r => setTimeout(r, attempt * 300))
        }

      } catch (error: any) {
        lastError = error
        
        if (attempt < maxRetries) {
          await new Promise(r => setTimeout(r, attempt * 300))
        }
      }
    }
  }

  throw lastError || new Error('API 请求失败')
}

// 同步笔记详情和评论（分批处理，每次处理5篇）
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const supabase = getSupabase()
  
  if (!supabase) {
    return NextResponse.json({ success: false, error: 'Supabase 未配置' }, { status: 500 })
  }

  try {
    // 获取需要更新详情的笔记（每次只处理2篇，避免超时）
    const { data: notes, error: fetchError } = await supabase
      .from('notes')
      .select('id, title')
      .order('updated_at', { ascending: true })
      .limit(2)

    if (fetchError || !notes?.length) {
      return NextResponse.json({ 
        success: true, 
        message: '没有需要更新的笔记',
        data: { processed: 0 }
      })
    }

    console.log(`[详情同步] 处理 ${notes.length} 篇笔记`)

    let processedNotes = 0
    let savedComments = 0

    for (const note of notes) {
      const noteId = note.id
      
      // 提前检查超时（留20秒安全边界）
      if (Date.now() - startTime > 40000) {
        console.log('[详情同步] 接近超时，提前结束')
        break
      }
      
      try {
        // 获取笔记详情（不重试，快速失败）
        const detailResult = await oneApiRequest(
          '/api/xiaohongshu/fetch_video_detail_v6', 
          { noteId },
          { maxRetries: 1 }
        )
        const noteDetail = detailResult.note_list?.[0] || detailResult

        if (noteDetail) {
          const likes = parseInt(noteDetail.liked_count) || 0
          const collects = parseInt(noteDetail.collected_count) || 0
          const comments = parseInt(noteDetail.comments_count) || 0
          const shares = parseInt(noteDetail.share_count) || 0
          const title = noteDetail.title || note.title
          const desc = noteDetail.desc || ''
          const ipLocation = noteDetail.ip_location || ''
          
          let coverImage = ''
          if (noteDetail.images_list?.[0]) {
            coverImage = noteDetail.images_list[0].url || noteDetail.images_list[0].original || ''
          }

          // 更新笔记详情
          await supabase.from('notes').update({
            title: title.substring(0, 200),
            content: desc,
            likes,
            collects,
            comments,
            shares,
            cover_image: coverImage || undefined,
            ip_location: ipLocation,
            updated_at: new Date().toISOString()
          }).eq('id', noteId)

          processedNotes++

          // 如果有评论，获取评论（只获取前5条，减少处理时间）
          if (comments > 0 && Date.now() - startTime < 35000) {
            try {
              const commentsResult = await oneApiRequest(
                '/api/xiaohongshu/fetch_video_comment', 
                { noteId, sort: '1' },
                { maxRetries: 1 }
              )
              
              const commentsList = commentsResult.comments || []
              
              for (const comment of commentsList.slice(0, 5)) {
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
        }

        // 短暂延迟
        await new Promise(r => setTimeout(r, 100))

      } catch (e: any) {
        console.log(`[笔记详情] 获取 ${noteId} 失败: ${e.message}`)
        // 失败也更新时间，避免卡住
        await supabase.from('notes').update({
          updated_at: new Date().toISOString()
        }).eq('id', noteId)
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1)
    console.log(`[详情同步完成] 处理 ${processedNotes} 篇，评论 ${savedComments} 条，耗时 ${duration}s`)

    return NextResponse.json({
      success: true,
      message: `详情同步完成`,
      data: {
        processedNotes,
        savedComments,
        duration: `${duration}s`
      }
    })

  } catch (error: any) {
    console.error('[详情同步失败]', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}

// 获取同步状态
export async function GET() {
  const supabase = getSupabase()
  if (!supabase) {
    return NextResponse.json({ status: 'error', message: 'Supabase 未配置' })
  }

  try {
    // 获取笔记统计
    const { count: totalNotes } = await supabase
      .from('notes')
      .select('*', { count: 'exact', head: true })

    const { count: notesWithComments } = await supabase
      .from('notes')
      .select('*', { count: 'exact', head: true })
      .gt('comments', 0)

    const { count: totalComments } = await supabase
      .from('note_comments')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({
      status: 'ok',
      stats: {
        totalNotes: totalNotes || 0,
        notesWithComments: notesWithComments || 0,
        totalComments: totalComments || 0
      }
    })
  } catch (e: any) {
    return NextResponse.json({ status: 'error', message: e.message })
  }
}

