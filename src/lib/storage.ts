// 数据访问层 - 从Supabase读取数据用于AI上下文
// 注意：这些函数是同步的，用于AI对话时获取缓存的上下文
// 实际数据操作使用 db.ts 中的异步函数

import { WeeklyStat, CatRecord } from './supabase'

// 缓存数据（由页面加载时更新）
let cachedWeeklyStats: WeeklyStat[] = []
let cachedCats: CatRecord[] = []

// 更新缓存（由页面组件调用）
export function updateWeeklyStatsCache(stats: WeeklyStat[]) {
  cachedWeeklyStats = stats
}

export function updateCatsCache(cats: CatRecord[]) {
  cachedCats = cats
}

// 获取分析上下文（用于AI）- 同步函数
export function getAnalyticsContext(): string {
  const latest = cachedWeeklyStats[0]
  if (!latest) return '暂无运营数据，请先在数据分析页面录入本周数据'
  
  const totalInteractions = latest.likes + latest.saves + latest.comments
  const interactionRate = latest.views > 0 ? ((totalInteractions / latest.views) * 100).toFixed(1) : '0'
  const saveRate = latest.views > 0 ? ((latest.saves / latest.views) * 100).toFixed(1) : '0'
  
  return `
本周数据（${latest.week_start} - ${latest.week_end}）：
- 新增粉丝：${latest.new_followers}
- 总粉丝数：${latest.followers}
- 点赞数：${latest.likes}
- 收藏数：${latest.saves}
- 评论数：${latest.comments}
- 浏览量：${latest.views}
- 发布笔记：${latest.posts_count}篇
- 女性粉丝占比：${latest.female_ratio}%
- 收藏率：${saveRate}%
- 互动率：${interactionRate}%
  `.trim()
}

// 获取猫咪出镜上下文
export function getCatAppearanceContext(): string {
  if (cachedCats.length === 0) {
    return '暂无猫咪数据'
  }
  
  const sorted = [...cachedCats].sort((a, b) => (b.appearance_count || 0) - (a.appearance_count || 0))
  
  if (sorted.every(cat => (cat.appearance_count || 0) === 0)) {
    return '暂无猫咪出镜数据'
  }
  
  return `
猫咪出镜统计：
${sorted.map(cat => `- ${cat.name}: ${cat.appearance_count || 0}次`).join('\n')}
  `.trim()
}

// 获取猫咪档案上下文
export function getCatProfilesContext(): string {
  if (cachedCats.length === 0) {
    return '猫咪档案尚未加载'
  }
  
  return cachedCats.map(cat => {
    const info = [`${cat.name}`]
    if (cat.gender) info.push(`(${cat.gender})`)
    if (cat.breed) info.push(`品种：${cat.breed}`)
    if (cat.color) info.push(`毛色：${cat.color}`)
    if (cat.personality) info.push(`性格：${cat.personality}`)
    if (cat.traits?.length) info.push(`特点：${cat.traits.join('、')}`)
    return info.join(' | ')
  }).join('\n')
}

// 获取完整的AI上下文
export function getFullContext(): string {
  return `
${getAnalyticsContext()}

${getCatAppearanceContext()}

猫咪档案：
${getCatProfilesContext()}
  `.trim()
}
