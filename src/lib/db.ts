import { supabase, isSupabaseConfigured, Note, WeeklyStat, CatRecord } from './supabase'

// ============ 笔记相关 ============

export async function getNotes(): Promise<Note[]> {
  if (!supabase) {
    console.error('[DB] Supabase not configured!')
    throw new Error('Supabase未配置')
  }
  
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('[DB] getNotes error:', error)
    throw error
  }
  
  console.log('[DB] Got notes from Supabase:', data?.length || 0)
  return data || []
}

export async function createNote(note: Omit<Note, 'id' | 'created_at' | 'updated_at'>): Promise<Note> {
  if (!supabase) {
    console.error('[DB] Supabase not configured!')
    throw new Error('Supabase未配置')
  }
  
  const { data, error } = await supabase
    .from('notes')
    .insert(note)
    .select()
    .single()
  
  if (error) {
    console.error('[DB] createNote error:', error)
    throw error
  }
  
  console.log('[DB] Created note in Supabase:', data.id)
  return data
}

export async function updateNote(id: string, updates: Partial<Note>): Promise<Note> {
  if (!supabase) {
    console.error('[DB] Supabase not configured!')
    throw new Error('Supabase未配置')
  }
  
  const { data, error } = await supabase
    .from('notes')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('[DB] updateNote error:', error)
    throw error
  }
  
  return data
}

export async function deleteNote(id: string): Promise<void> {
  if (!supabase) {
    console.error('[DB] Supabase not configured!')
    throw new Error('Supabase未配置')
  }
  
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('[DB] deleteNote error:', error)
    throw error
  }
}

// ============ 周数据相关 ============

export async function getWeeklyStats(): Promise<WeeklyStat[]> {
  if (!supabase) {
    console.error('[DB] Supabase not configured!')
    throw new Error('Supabase未配置')
  }
  
  const { data, error } = await supabase
    .from('weekly_stats')
    .select('*')
    .order('week_start', { ascending: false })
  
  if (error) {
    console.error('[DB] getWeeklyStats error:', error)
    throw error
  }
  
  console.log('[DB] Got weekly_stats from Supabase:', data?.length || 0)
  return data || []
}

export async function createWeeklyStat(stat: Omit<WeeklyStat, 'id' | 'created_at'>): Promise<WeeklyStat> {
  if (!supabase) {
    console.error('[DB] Supabase not configured!')
    throw new Error('Supabase未配置')
  }
  
  console.log('[DB] Creating weekly_stat in Supabase:', stat)
  
  const { data, error } = await supabase
    .from('weekly_stats')
    .insert(stat)
    .select()
    .single()
  
  if (error) {
    console.error('[DB] createWeeklyStat error:', error)
    throw error
  }
  
  console.log('[DB] Created weekly_stat in Supabase:', data.id)
  return data
}

export async function getLatestWeeklyStat(): Promise<WeeklyStat | null> {
  const stats = await getWeeklyStats()
  return stats.length > 0 ? stats[0] : null
}

// ============ 猫咪相关 ============

export async function getCats(): Promise<CatRecord[]> {
  if (!supabase) {
    console.error('[DB] Supabase not configured!')
    throw new Error('Supabase未配置')
  }
  
  const { data, error } = await supabase
    .from('cats')
    .select('*')
    .order('name')
  
  if (error) {
    console.error('[DB] getCats error:', error)
    throw error
  }
  
  console.log('[DB] Got cats from Supabase:', data?.length || 0)
  return data || []
}

export async function updateCat(id: string, updates: Partial<CatRecord>): Promise<CatRecord> {
  if (!supabase) {
    console.error('[DB] Supabase not configured!')
    throw new Error('Supabase未配置')
  }
  
  const { data, error } = await supabase
    .from('cats')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('[DB] updateCat error:', error)
    throw error
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
  console.log('[DB] isSupabaseConfigured:', isSupabaseConfigured())
  
  if (!supabase) {
    return { success: false, message: 'Supabase客户端未初始化' }
  }
  
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
