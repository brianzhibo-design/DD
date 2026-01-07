import { supabase, WeeklyStat, Note, CatRecord } from './supabase'

// 重新导出类型供页面使用
export type { WeeklyStat, Note, CatRecord }

// ============ 周数据统计 ============

// 获取所有周统计数据
export async function getWeeklyStats(): Promise<WeeklyStat[]> {
  console.log('[DB] getWeeklyStats - fetching from Supabase')
  
  const { data, error } = await supabase
    .from('weekly_stats')
    .select('*')
    .order('week_start', { ascending: false })

  if (error) {
    console.error('[DB] getWeeklyStats error:', error)
    return []
  }
  
  console.log('[DB] getWeeklyStats - got', data?.length || 0, 'records')
  return data || []
}

// 获取最新一条数据
export async function getLatestWeeklyStat(): Promise<WeeklyStat | null> {
  const { data, error } = await supabase
    .from('weekly_stats')
    .select('*')
    .order('week_start', { ascending: false })
    .limit(1)

  // 表为空时不是错误，只是没有数据
  if (error) {
    console.error('[DB] getLatestWeeklyStat error:', error)
    return null
  }
  
  // 返回第一条数据，如果没有则返回null
  return data && data.length > 0 ? data[0] : null
}

// 保存周统计数据
export async function saveWeeklyStat(stat: Omit<WeeklyStat, 'id' | 'created_at'>): Promise<WeeklyStat | null> {
  console.log('[DB] saveWeeklyStat - saving to Supabase:', stat)
  
  const { data, error } = await supabase
    .from('weekly_stats')
    .insert(stat)
    .select()
    .single()

  if (error) {
    console.error('[DB] saveWeeklyStat error:', error)
    return null
  }
  
  console.log('[DB] saveWeeklyStat - saved:', data)
  return data
}

// 更新周统计数据
export async function updateWeeklyStat(id: string, stat: Partial<WeeklyStat>): Promise<WeeklyStat | null> {
  const { data, error } = await supabase
    .from('weekly_stats')
    .update({ ...stat, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('[DB] updateWeeklyStat error:', error)
    return null
  }
  return data
}

// 删除周统计数据
export async function deleteWeeklyStat(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('weekly_stats')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('[DB] deleteWeeklyStat error:', error)
    return false
  }
  return true
}

// ============ 笔记相关 ============

export async function getNotes(): Promise<Note[]> {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('[DB] getNotes error:', error)
    return []
  }
  return data || []
}

// 获取已发布的笔记（用于AI分析）
export async function getPublishedNotes(limit: number = 20): Promise<Note[]> {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('status', 'published')
    .order('publish_date', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('[DB] getPublishedNotes error:', error)
    return []
  }
  return data || []
}

// 获取笔记统计摘要（用于AI上下文）
export async function getNotesSummary(): Promise<{
  total: number
  byType: Record<string, number>
  avgLikes: number
  avgCollects: number
  topPerforming: Note[]
}> {
  const notes = await getNotes()
  const published = notes.filter(n => n.status === 'published')
  
  // 按类型统计
  const byType: Record<string, number> = {}
  published.forEach(n => {
    byType[n.type] = (byType[n.type] || 0) + 1
  })
  
  // 计算平均值
  const avgLikes = published.length 
    ? published.reduce((sum, n) => sum + n.likes, 0) / published.length 
    : 0
  const avgCollects = published.length 
    ? published.reduce((sum, n) => sum + n.collects, 0) / published.length 
    : 0
  
  // 找出表现最好的笔记（按收藏+点赞排序）
  const topPerforming = [...published]
    .sort((a, b) => (b.collects + b.likes) - (a.collects + a.likes))
    .slice(0, 5)

  return {
    total: published.length,
    byType,
    avgLikes: Math.round(avgLikes),
    avgCollects: Math.round(avgCollects),
    topPerforming
  }
}

export async function createNote(note: Omit<Note, 'id' | 'created_at' | 'updated_at'>): Promise<Note | null> {
  const { data, error } = await supabase
    .from('notes')
    .insert(note)
    .select()
    .single()
  
  if (error) {
    console.error('[DB] createNote error:', error)
    return null
  }
  return data
}

export async function updateNote(id: string, updates: Partial<Note>): Promise<Note | null> {
  const { data, error } = await supabase
    .from('notes')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('[DB] updateNote error:', error)
    return null
  }
  return data
}

export async function deleteNote(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('[DB] deleteNote error:', error)
    return false
  }
  return true
}

// ============ 猫咪相关 ============

export async function getCats(): Promise<CatRecord[]> {
  const { data, error } = await supabase
    .from('cats')
    .select('*')
    .order('name')
  
  if (error) {
    console.error('[DB] getCats error:', error)
    return []
  }
  return data || []
}

export async function updateCat(idOrName: string, updates: Partial<CatRecord>): Promise<CatRecord | null> {
  console.log('[DB] updateCat - updating:', idOrName, updates)
  
  // 先尝试通过名字查找（更可靠）
  const catName = updates.name || idOrName
  
  // 使用 upsert：如果存在则更新，不存在则插入
  const { data, error } = await supabase
    .from('cats')
    .upsert(
      { 
        name: catName,
        ...updates, 
        updated_at: new Date().toISOString() 
      },
      { 
        onConflict: 'name',  // 通过名字匹配
        ignoreDuplicates: false 
      }
    )
    .select()
    .single()
  
  if (error) {
    console.error('[DB] updateCat error:', error)
    // 如果 upsert 失败，尝试直接 insert
    const { data: insertData, error: insertError } = await supabase
      .from('cats')
      .insert({ 
        name: catName,
        ...updates, 
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString() 
      })
      .select()
      .single()
    
    if (insertError) {
      console.error('[DB] updateCat insert fallback error:', insertError)
      return null
    }
    return insertData
  }
  
  console.log('[DB] updateCat - success:', data)
  return data
}

export async function incrementCatAppearance(catName: string): Promise<void> {
  const cats = await getCats()
  const cat = cats.find(c => c.name === catName)
  if (cat && cat.id) {
    await updateCat(cat.id, { 
      appearance_count: (cat.appearance_count || 0) + 1 
    })
  }
}

// ============ 测试连接 ============

export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  console.log('[DB] Testing Supabase connection...')
  
  try {
    const { data, error } = await supabase.from('cats').select('name').limit(1)
    if (error) {
      return { success: false, message: `连接失败: ${error.message}` }
    }
    return { success: true, message: `连接成功! 获取到: ${JSON.stringify(data)}` }
  } catch (err) {
    return { success: false, message: `异常: ${err}` }
  }
}
