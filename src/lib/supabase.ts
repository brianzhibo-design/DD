import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 调试：打印配置状态
if (typeof window !== 'undefined') {
  console.log('[Supabase Config]', {
    urlConfigured: !!supabaseUrl,
    keyConfigured: !!supabaseAnonKey,
    url: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'NOT SET'
  })
}

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

// 创建Supabase客户端（如果配置了环境变量）
export const supabase: SupabaseClient | null = 
  supabaseUrl && supabaseAnonKey 
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null

// 检查Supabase是否可用
export const isSupabaseConfigured = (): boolean => {
  return supabase !== null
}

// 数据库表结构（用于在Supabase SQL编辑器中执行）
export const DB_SCHEMA = `
-- 笔记数据表
CREATE TABLE IF NOT EXISTS notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  type TEXT DEFAULT '穿搭',
  status TEXT DEFAULT 'draft',
  publish_date DATE,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  collects INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  gmv DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 周数据统计表
CREATE TABLE IF NOT EXISTS weekly_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  new_followers INTEGER DEFAULT 0,
  total_followers INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  total_interactions INTEGER DEFAULT 0,
  interaction_rate DECIMAL(5,2) DEFAULT 0,
  female_ratio DECIMAL(5,2) DEFAULT 0,
  gmv DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 猫咪档案表
CREATE TABLE IF NOT EXISTS cats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  breed TEXT,
  color TEXT,
  gender TEXT,
  age TEXT,
  personality TEXT,
  traits TEXT[],
  photo_url TEXT,
  appearance_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 插入猫咪初始数据
INSERT INTO cats (name, breed, color, gender, personality) VALUES
  ('Baby', '中华田园猫', '白色长毛', '公', '待完善'),
  ('Mini', '中华田园猫', '橘白长毛', '公', '待完善'),
  ('提莫', '中华田园猫', '灰棕色长毛', '公', '待完善'),
  ('达令', '狸花猫', '狸花', '母', '唯一的母猫'),
  ('熊崽', '缅因猫', '烟灰色长毛', '公', '体型较大'),
  ('甜心', '中华田园猫', '奶白色长毛', '公', '待完善')
ON CONFLICT DO NOTHING;

-- 创建RLS策略
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE cats ENABLE ROW LEVEL SECURITY;

-- 允许匿名读写
CREATE POLICY "Allow all" ON notes FOR ALL USING (true);
CREATE POLICY "Allow all" ON weekly_stats FOR ALL USING (true);
CREATE POLICY "Allow all" ON cats FOR ALL USING (true);
`

