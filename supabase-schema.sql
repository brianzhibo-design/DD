-- =============================================
-- 小离岛岛 · 小红书运营系统 - Supabase 数据库初始化脚本
-- =============================================
-- 使用方法：
-- 1. 登录 https://supabase.com
-- 2. 创建新项目
-- 3. 进入 SQL Editor
-- 4. 复制并执行以下SQL

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

-- 插入六只猫初始数据
INSERT INTO cats (name, breed, color, gender, personality) VALUES
  ('Baby', '中华田园猫', '白色长毛', '公', '待完善'),
  ('Mini', '中华田园猫', '橘白长毛', '公', '待完善'),
  ('提莫', '中华田园猫', '灰棕色长毛', '公', '待完善'),
  ('达令', '狸花猫', '狸花', '母', '唯一的母猫'),
  ('熊崽', '缅因猫', '烟灰色长毛', '公', '体型较大'),
  ('甜心', '中华田园猫', '奶白色长毛', '公', '待完善')
ON CONFLICT DO NOTHING;

-- 启用行级安全 (RLS)
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE cats ENABLE ROW LEVEL SECURITY;

-- 创建公开访问策略（简化版，生产环境应该更严格）
-- 允许所有操作（适合个人使用的简单场景）
CREATE POLICY "Enable all for notes" ON notes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for weekly_stats" ON weekly_stats FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for cats" ON cats FOR ALL USING (true) WITH CHECK (true);

-- 创建索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_type ON notes(type);
CREATE INDEX IF NOT EXISTS idx_notes_status ON notes(status);
CREATE INDEX IF NOT EXISTS idx_weekly_stats_week_start ON weekly_stats(week_start DESC);
CREATE INDEX IF NOT EXISTS idx_cats_name ON cats(name);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER cats_updated_at
  BEFORE UPDATE ON cats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =============================================
-- 完成！接下来：
-- 1. 在 Supabase 项目设置中获取 Project URL 和 anon key
-- 2. 在 Vercel 项目设置中添加环境变量：
--    - NEXT_PUBLIC_SUPABASE_URL
--    - NEXT_PUBLIC_SUPABASE_ANON_KEY
--    - ANTHROPIC_API_KEY
-- =============================================

