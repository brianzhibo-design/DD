import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const ONEAPI_KEY = process.env.ONEAPI_KEY

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder()
  
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      try {
        // 获取需要更新的笔记（按更新时间排序，取最旧的）
        const { data: notes } = await supabase
          .from('notes')
          .select('id')
          .order('detail_synced_at', { ascending: true, nullsFirst: true })
          .limit(5)

        if (!notes || notes.length === 0) {
          send({ done: true, message: '没有需要更新的笔记' })
          controller.close()
          return
        }

        send({ total: notes.length, message: '开始更新...' })

        let success = 0
        let failed = 0

        for (const note of notes) {
          try {
            const response = await fetch('https://api.getoneapi.com/api/xiaohongshu/fetch_video_detail_v6', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ONEAPI_KEY}`,
              },
              body: JSON.stringify({ note_id: note.id }),
            })

            const result = await response.json()
            
            if (result.code === 200 && result.data?.note_list?.[0]) {
              const detail = result.data.note_list[0]
              
              await supabase.from('notes').update({
                likes: detail.liked_count || 0,
                collects: detail.collected_count || 0,
                comments: detail.comments_count || 0,
                detail_data: detail,
                detail_synced_at: new Date().toISOString()
              }).eq('id', note.id)

              success++
              send({ 
                progress: success + failed, 
                total: notes.length,
                noteId: note.id,
                status: 'success',
                likes: detail.liked_count
              })
            } else {
              failed++
              send({ progress: success + failed, noteId: note.id, status: 'failed' })
            }

            // 请求间隔
            await new Promise(r => setTimeout(r, 300))

          } catch (e) {
            failed++
            send({ progress: success + failed, noteId: note.id, status: 'error' })
          }
        }

        send({ done: true, success, failed })
        controller.close()

      } catch (error: any) {
        send({ error: error.message })
        controller.close()
      }
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}

