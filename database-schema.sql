-- ============================================
-- 小红书运营系统 - 数据库表结构
-- 在 Supabase SQL Editor 中执行
-- ============================================

-- 删除旧表（如果需要重建）
-- DROP TABLE IF EXISTS notes CASCADE;
-- DROP TABLE IF EXISTS account_info CASCADE;
-- DROP TABLE IF EXISTS weekly_stats CASCADE;

-- ============================================
-- 1. 账号信息表
-- ============================================
CREATE TABLE IF NOT EXISTS account_info (
  -- 主键
  id TEXT PRIMARY KEY DEFAULT 'main',
  user_id VARCHAR(50),
  
  -- 基础信息
  nickname VARCHAR(100),
  red_id VARCHAR(50),
  avatar TEXT,
  avatar_large TEXT,
  
  -- 简介（兼容多个字段名）
  "desc" TEXT,
  description TEXT,
  
  -- 位置
  ip_location VARCHAR(50),
  
  -- 性别 (0=未知, 1=男, 2=女)
  gender INT DEFAULT 0,
  
  -- 粉丝数据（兼容新旧字段名）
  fans INT DEFAULT 0,
  followers INT DEFAULT 0,
  follows INT DEFAULT 0,
  following INT DEFAULT 0,
  
  -- 互动数据
  total_likes INT DEFAULT 0,
  total_liked INT DEFAULT 0,
  total_collected INT DEFAULT 0,
  notes_count INT DEFAULT 0,
  
  -- 扩展信息
  register_time_desc VARCHAR(50),
  tags JSONB DEFAULT '[]',
  interactions JSONB DEFAULT '[]',
  
  -- 原始数据（保存完整API响应）
  raw_data JSONB,
  
  -- 时间戳（兼容新旧字段名）
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. 笔记表
-- ============================================
CREATE TABLE IF NOT EXISTS notes (
  -- 主键（笔记ID）
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50),
  
  -- 基础信息
  title TEXT,
  display_title TEXT,
  "desc" TEXT,
  type VARCHAR(20) DEFAULT '图文',
  
  -- 封面和媒体（兼容多个字段名）
  cover_url TEXT,
  cover_image TEXT,
  cover_width INT DEFAULT 0,
  cover_height INT DEFAULT 0,
  video_url TEXT,
  video_duration INT DEFAULT 0,
  images_list JSONB DEFAULT '[]',
  
  -- 互动数据
  likes INT DEFAULT 0,
  collects INT DEFAULT 0,
  comments INT DEFAULT 0,
  shares INT DEFAULT 0,
  views INT DEFAULT 0,
  
  -- 时间（兼容多种格式）
  publish_time BIGINT,
  publish_date TEXT,
  time_desc VARCHAR(50),
  
  -- 状态
  sticky BOOLEAN DEFAULT FALSE,
  ip_location VARCHAR(50),
  
  -- 标签
  hash_tags JSONB DEFAULT '[]',
  
  -- 用户信息
  user_info JSONB DEFAULT '{}',
  
  -- 扩展数据
  xsec_token TEXT,
  cursor_id VARCHAR(100),
  widgets_context JSONB,
  
  -- 原始数据（保存完整API响应）
  raw_list_data JSONB,      -- 列表API返回的原始数据
  raw_detail_data JSONB,    -- 详情API返回的原始数据
  
  -- 同步时间
  list_synced_at TIMESTAMP WITH TIME ZONE,
  detail_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. 周统计表
-- ============================================
CREATE TABLE IF NOT EXISTS weekly_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- 周期
  week_start DATE NOT NULL UNIQUE,
  week_end DATE NOT NULL,
  
  -- 粉丝数据
  followers INT DEFAULT 0,
  new_followers INT DEFAULT 0,
  
  -- 互动数据
  total_likes INT DEFAULT 0,
  total_collects INT DEFAULT 0,
  likes INT DEFAULT 0,
  saves INT DEFAULT 0,
  comments INT DEFAULT 0,
  shares INT DEFAULT 0,
  views INT DEFAULT 0,
  
  -- 发布数据
  posts_count INT DEFAULT 0,
  
  -- 粉丝画像
  female_ratio DECIMAL(5,2) DEFAULT 85,
  
  -- 原始数据
  raw_data JSONB,
  
  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. 关闭 Row Level Security (RLS)
-- ============================================
ALTER TABLE account_info DISABLE ROW LEVEL SECURITY;
ALTER TABLE notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_stats DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. 创建索引（提升查询性能）
-- ============================================

-- 笔记表索引
CREATE INDEX IF NOT EXISTS idx_notes_likes ON notes(likes DESC);
CREATE INDEX IF NOT EXISTS idx_notes_collects ON notes(collects DESC);
CREATE INDEX IF NOT EXISTS idx_notes_publish_time ON notes(publish_time DESC);
CREATE INDEX IF NOT EXISTS idx_notes_type ON notes(type);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_detail_synced ON notes(detail_synced_at);
CREATE INDEX IF NOT EXISTS idx_notes_updated ON notes(updated_at DESC);

-- 账号表索引
CREATE INDEX IF NOT EXISTS idx_account_synced ON account_info(synced_at DESC);
CREATE INDEX IF NOT EXISTS idx_account_updated ON account_info(updated_at DESC);

-- 周统计表索引
CREATE INDEX IF NOT EXISTS idx_weekly_stats_week ON weekly_stats(week_start DESC);

-- ============================================
-- 6. 插入初始数据（可选）
-- ============================================

-- 确保有一条默认账号记录
INSERT INTO account_info (id) 
VALUES ('main') 
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 完成！
-- ============================================
-- 执行完成后，点击"同步"按钮即可获取数据

