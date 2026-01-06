import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('[Supabase] Missing environment variables:', {
    url: !!supabaseUrl,
    key: !!supabaseKey
  })
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// 类型定义
export interface WeeklyStat {
  id?: string
  week_start: string
  week_end: string
  followers: number
  new_followers: number
  likes: number
  saves: number
  comments: number
  views: number
  posts_count: number
  female_ratio: number
  created_at?: string
  updated_at?: string
}

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
