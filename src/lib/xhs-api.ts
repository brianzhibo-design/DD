const ONEAPI_BASE = 'https://api.getoneapi.com'

interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

// 通用请求函数
async function apiRequest<T>(endpoint: string, body: object): Promise<T> {
  const apiKey = process.env.ONEAPI_KEY
  if (!apiKey) {
    throw new Error('ONEAPI_KEY 未配置')
  }

  console.log('[OneAPI] 请求:', endpoint, JSON.stringify(body))

  const response = await fetch(`${ONEAPI_BASE}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  })

  const result: ApiResponse<T> = await response.json()
  console.log('[OneAPI] 响应:', result.code, result.message)
  
  if (result.code !== 200) {
    throw new Error(result.message || `API错误: ${result.code}`)
  }

  return result.data
}

// 用户信息类型
export interface XHSUserInfo {
  nickname?: string
  fansCount?: number | string
  basicInfo?: {
    nickname?: string
    fansCount?: number | string
  }
  interactions?: Array<{
    type?: string
    name?: string
    count?: number | string
  }>
  [key: string]: any
}

// 笔记类型
export interface XHSNote {
  id?: string
  noteId?: string
  note_id?: string
  xsecToken?: string
  xsec_token?: string
  title?: string
  desc?: string
  displayTitle?: string
  type?: string
  likedCount?: number | string
  likes?: number | string
  likeCount?: number | string
  collectedCount?: number | string
  collects?: number | string
  collectCount?: number | string
  commentCount?: number | string
  comments?: number | string
  viewCount?: number | string
  views?: number | string
  readCount?: number | string
  [key: string]: any
}

// 获取用户信息 - 使用V4版本
export async function fetchUserInfo(userId: string): Promise<XHSUserInfo> {
  return apiRequest<XHSUserInfo>('/api/xiaohongshu/fetch_user_data_v4', { 
    userId 
  })
}

// 获取用户笔记列表
export async function fetchUserNotes(userId: string, cursor?: string): Promise<{ notes?: XHSNote[], items?: XHSNote[], list?: XHSNote[] }> {
  return apiRequest<any>('/api/xiaohongshu/fetch_user_video_list', { 
    userId,
    cursor: cursor || ''
  })
}

// 获取笔记详情V2
export async function fetchNoteDetail(noteId: string, xsecToken: string): Promise<XHSNote> {
  return apiRequest<XHSNote>('/api/xiaohongshu/fetch_video_detail_v2', { 
    noteId,
    xsecToken
  })
}

// 解析数字（处理"1.2万"格式）
export function parseCount(value: any): number {
  if (value === null || value === undefined) return 0
  if (typeof value === 'number') return value
  
  const str = String(value).trim().replace(/,/g, '')
  
  if (str.includes('万')) {
    return Math.round(parseFloat(str) * 10000)
  }
  if (str.toLowerCase().includes('k')) {
    return Math.round(parseFloat(str) * 1000)
  }
  
  const num = parseInt(str)
  return isNaN(num) ? 0 : num
}
