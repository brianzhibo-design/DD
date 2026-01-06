import { supabase, WeeklyStat, Note, CatRecord } from './supabase'

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
    .single()

  if (error) {
    console.error('[DB] getLatestWeeklyStat error:', error)
    return null
  }
  return data
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

export async function updateCat(id: string, updates: Partial<CatRecord>): Promise<CatRecord | null> {
  const { data, error } = await supabase
    .from('cats')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('[DB] updateCat error:', error)
    return null
  }
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
