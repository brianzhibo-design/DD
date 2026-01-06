import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Supabase配置
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// 类型定义
export interface Note {
  id?: string
  title: string
  content?: string
  type: string
  status: 'draft' | 'published' | 'scheduled'
  publish_date?: string
  views: number
  likes: number
  collects: number
  comments: number
  gmv: number
  created_at?: string
  updated_at?: string
}

export interface WeeklyStat {
  id?: string
  week_start: string
  week_end: string
  new_followers: number
  total_followers: number
  posts_count: number
  total_interactions: number
  interaction_rate: number
  female_ratio: number
  gmv: number
  created_at?: string
}

export interface CatRecord {
  id?: string
  name: string
  breed?: string
  color?: string
  gender?: string
  age?: string
  personality?: string
  traits?: string[]
  photo_url?: string
  appearance_count?: number
  created_at?: string
  updated_at?: string
}

// 创建Supabase客户端
export const supabase: SupabaseClient | null = SUPABASE_URL && SUPABASE_KEY 
  ? createClient(SUPABASE_URL, SUPABASE_KEY)
  : null

// 检查是否配置
export const isSupabaseConfigured = (): boolean => {
  const configured = !!(SUPABASE_URL && SUPABASE_KEY && supabase)
  if (typeof window !== 'undefined') {
    console.log('[Supabase]', {
      configured,
      urlSet: !!SUPABASE_URL,
      keySet: !!SUPABASE_KEY,
      url: SUPABASE_URL ? SUPABASE_URL.substring(0, 40) + '...' : 'NOT SET'
    })
  }
  return configured
}
