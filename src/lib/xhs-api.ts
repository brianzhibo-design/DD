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

  const response = await fetch(`${ONEAPI_BASE}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  })

  const result: ApiResponse<T> = await response.json()
  
  if (result.code !== 200) {
    console.error('[XHS API] 错误:', result)
    throw new Error(result.message || `API错误: ${result.code}`)
  }

  return result.data
}

// 用户信息类型
export interface XHSUserInfo {
  basicInfo?: {
    nickname?: string
    desc?: string
    imageb?: string
  }
  interactions?: Array<{
    type?: string
    count?: string
    name?: string
  }>
  tags?: Array<{
    name?: string
    tagType?: string
  }>
  [key: string]: unknown
}

// 笔记类型
export interface XHSNote {
  noteId?: string
  id?: string
  title?: string
  desc?: string
  type?: string
  likedCount?: number | string
  collectedCount?: number | string
  commentCount?: number | string
  shareCount?: number | string
  viewCount?: number | string
  time?: number
  xsecToken?: string
  [key: string]: unknown
}

// 获取用户信息 V4
export async function fetchUserInfo(userId: string): Promise<XHSUserInfo> {
  return apiRequest<XHSUserInfo>('/api/xiaohongshu/fetch_user_data_v4', { userId })
}

// 获取用户笔记列表
export async function fetchUserNotes(userId: string, cursor?: string): Promise<{
  notes: XHSNote[]
  cursor?: string
  hasMore?: boolean
}> {
  const data = await apiRequest<{ notes?: XHSNote[]; items?: XHSNote[]; cursor?: string; hasMore?: boolean }>(
    '/api/xiaohongshu/fetch_user_video_list', 
    { userId, cursor: cursor || '' }
  )
  
  return {
    notes: data.notes || data.items || [],
    cursor: data.cursor,
    hasMore: data.hasMore
  }
}

// 获取笔记详情 V2
export async function fetchNoteDetail(noteId: string, xsecToken: string): Promise<XHSNote> {
  return apiRequest<XHSNote>('/api/xiaohongshu/fetch_video_detail_v2', { 
    noteId, 
    xsecToken 
  })
}

// 解析数字（处理"1.2万"这种格式）
export function parseCount(value: unknown): number {
  if (typeof value === 'number') return value
  if (!value) return 0
  
  const str = String(value).trim()
  if (str.includes('万')) {
    return Math.round(parseFloat(str) * 10000)
  }
  if (str.includes('k') || str.includes('K')) {
    return Math.round(parseFloat(str) * 1000)
  }
  return parseInt(str) || 0
}

