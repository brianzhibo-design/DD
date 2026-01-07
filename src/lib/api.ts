/**
 * 前端API调用封装
 * 所有AI相关请求都通过这里发送，API Key安全存储在服务端
 */

// API基础路径
const API_BASE = '/api'

// ============ 类型定义 ============

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatResponse {
  response: string
  usage?: {
    input_tokens: number
    output_tokens: number
  }
  error?: string
}

export interface AnalyzeResponse {
  score?: number
  analysis?: string
  keywords?: string[]
  suggestions?: string[]
  structure?: string
  seedingPower?: string
  engagement?: string
  raw?: string
  error?: string
}

export interface Topic {
  title: string
  type: string
  cats?: string[]
  tags: string[]
  difficulty: string
  potential: string
  outline?: string
  reason: string
}

export interface TopicsResponse {
  topics: Topic[]
  usage?: {
    input_tokens: number
    output_tokens: number
  }
  error?: string
}

// ============ AI对话 ============

export async function sendChat(
  message: string, 
  context?: string,
  history: ChatMessage[] = []
): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, context, history }),
  })
  
  const data = await res.json()
  
  if (!res.ok) {
    throw new Error(data.error || 'Chat request failed')
  }
  
  return data
}

// ============ 内容分析 ============

export async function analyzeTitle(title: string): Promise<AnalyzeResponse> {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, type: 'title' }),
  })
  
  const data = await res.json()
  
  if (!res.ok) {
    throw new Error(data.error || 'Analyze request failed')
  }
  
  return data
}

export async function analyzeContent(
  title: string, 
  content: string
): Promise<AnalyzeResponse> {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content, type: 'content' }),
  })
  
  const data = await res.json()
  
  if (!res.ok) {
    throw new Error(data.error || 'Analyze request failed')
  }
  
  return data
}

export async function analyzeGeneral(text: string): Promise<AnalyzeResponse> {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: text, type: 'general' }),
  })
  
  const data = await res.json()
  
  if (!res.ok) {
    throw new Error(data.error || 'Analyze request failed')
  }
  
  return data
}

// ============ 话题推荐 ============

export async function getTopicSuggestions(
  category: string = '生活方式', 
  count: number = 5,
  context?: string
): Promise<Topic[]> {
  const res = await fetch(`${API_BASE}/topics`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category, count, context }),
  })
  
  const data: TopicsResponse = await res.json()
  
  if (!res.ok) {
    throw new Error(data.error || 'Topics request failed')
  }
  
  return data.topics
}

// ============ 猫咪分析 ============

export async function analyzeCatDescription(
  description: string,
  catName: string
): Promise<{ success: boolean; data?: Record<string, unknown>; error?: string }> {
  const res = await fetch(`${API_BASE}/analyze-cat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description, catName }),
  })
  
  return res.json()
}

// ============ 健康检查 ============

export async function checkAPIHealth(): Promise<{ status: 'ok' | 'error'; message: string }> {
  try {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '测试连接' }),
    })
    
    if (res.ok) {
      return { status: 'ok', message: 'API连接正常' }
    } else {
      const data = await res.json()
      return { status: 'error', message: data.error || 'API连接失败' }
    }
  } catch (error) {
    return { status: 'error', message: `网络错误: ${error}` }
  }
}

