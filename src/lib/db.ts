import { supabase, isSupabaseConfigured, Note, WeeklyStat, CatRecord } from './supabase'

// ============ localStorage 辅助函数 ============

function getFromLocalStorage<T>(key: string, defaultValue: T[] = []): T[] {
  if (typeof window === 'undefined') return defaultValue
  const stored = localStorage.getItem(`daodao_${key}`)
  return stored ? JSON.parse(stored) : defaultValue
}

function saveToLocalStorage<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(`daodao_${key}`, JSON.stringify(data))
}

// ============ 笔记相关 ============

export async function getNotes(): Promise<Note[]> {
  console.log('[DB] getNotes - Supabase:', isSupabaseConfigured())
  
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('[DB] Supabase getNotes error:', error)
        return getFromLocalStorage<Note>('notes')
      }
      console.log('[DB] Got notes from Supabase:', data?.length || 0)
      return data || []
    } catch (err) {
      console.error('[DB] Supabase exception:', err)
      return getFromLocalStorage<Note>('notes')
    }
  }
  
  console.log('[DB] Using localStorage for notes')
  return getFromLocalStorage<Note>('notes')
}

export async function createNote(note: Omit<Note, 'id' | 'created_at' | 'updated_at'>): Promise<Note> {
  console.log('[DB] createNote - Supabase:', isSupabaseConfigured())
  
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('notes')
        .insert(note)
        .select()
        .single()
      
      if (error) {
        console.error('[DB] Supabase createNote error:', error)
        throw error
      }
      console.log('[DB] Created note in Supabase:', data.id)
      return data
    } catch (err) {
      console.error('[DB] Supabase exception:', err)
    }
  }
  
  // localStorage 降级
  console.log('[DB] Creating note in localStorage')
  const notes = getFromLocalStorage<Note>('notes')
  const newNote: Note = {
    ...note,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  notes.unshift(newNote)
  saveToLocalStorage('notes', notes)
  return newNote
}

export async function updateNote(id: string, updates: Partial<Note>): Promise<Note> {
  console.log('[DB] updateNote - Supabase:', isSupabaseConfigured())
  
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('notes')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      
      if (error) {
        console.error('[DB] Supabase updateNote error:', error)
        throw error
      }
      return data
    } catch (err) {
      console.error('[DB] Supabase exception:', err)
    }
  }
  
  // localStorage 降级
  const notes = getFromLocalStorage<Note>('notes')
  const index = notes.findIndex(n => n.id === id)
  if (index !== -1) {
    notes[index] = { ...notes[index], ...updates, updated_at: new Date().toISOString() }
    saveToLocalStorage('notes', notes)
    return notes[index]
  }
  throw new Error('Note not found')
}

export async function deleteNote(id: string): Promise<void> {
  console.log('[DB] deleteNote - Supabase:', isSupabaseConfigured())
  
  if (supabase) {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)
      
      if (error) {
        console.error('[DB] Supabase deleteNote error:', error)
        throw error
      }
      return
    } catch (err) {
      console.error('[DB] Supabase exception:', err)
    }
  }
  
  // localStorage 降级
  const notes = getFromLocalStorage<Note>('notes')
  const filtered = notes.filter(n => n.id !== id)
  saveToLocalStorage('notes', filtered)
}

// ============ 周数据相关 ============

export async function getWeeklyStats(): Promise<WeeklyStat[]> {
  console.log('[DB] getWeeklyStats - Supabase:', isSupabaseConfigured())
  
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('weekly_stats')
        .select('*')
        .order('week_start', { ascending: false })
      
      if (error) {
        console.error('[DB] Supabase getWeeklyStats error:', error)
        return getFromLocalStorage<WeeklyStat>('weekly_stats')
      }
      console.log('[DB] Got weekly_stats from Supabase:', data?.length || 0)
      return data || []
    } catch (err) {
      console.error('[DB] Supabase exception:', err)
      return getFromLocalStorage<WeeklyStat>('weekly_stats')
    }
  }
  
  console.log('[DB] Using localStorage for weekly_stats')
  return getFromLocalStorage<WeeklyStat>('weekly_stats')
}

export async function createWeeklyStat(stat: Omit<WeeklyStat, 'id' | 'created_at'>): Promise<WeeklyStat> {
  console.log('[DB] createWeeklyStat - Supabase:', isSupabaseConfigured())
  
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('weekly_stats')
        .insert(stat)
        .select()
        .single()
      
      if (error) {
        console.error('[DB] Supabase createWeeklyStat error:', error)
        throw error
      }
      console.log('[DB] Created weekly_stat in Supabase:', data.id)
      return data
    } catch (err) {
      console.error('[DB] Supabase exception:', err)
    }
  }
  
  // localStorage 降级
  console.log('[DB] Creating weekly_stat in localStorage')
  const stats = getFromLocalStorage<WeeklyStat>('weekly_stats')
  const newStat: WeeklyStat = {
    ...stat,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  }
  stats.unshift(newStat)
  saveToLocalStorage('weekly_stats', stats)
  return newStat
}

export async function getLatestWeeklyStat(): Promise<WeeklyStat | null> {
  const stats = await getWeeklyStats()
  return stats.length > 0 ? stats[0] : null
}

// ============ 猫咪相关 ============

const DEFAULT_CATS: CatRecord[] = [
  { id: '1', name: 'Baby', color: '白色长毛', gender: '公', personality: '待完善', appearance_count: 0 },
  { id: '2', name: 'Mini', color: '橘白长毛', gender: '公', personality: '待完善', appearance_count: 0 },
  { id: '3', name: '提莫', color: '灰棕色长毛', gender: '公', personality: '待完善', appearance_count: 0 },
  { id: '4', name: '达令', color: '狸花', gender: '母', personality: '唯一的母猫', appearance_count: 0 },
  { id: '5', name: '熊崽', breed: '缅因猫', color: '烟灰色长毛', gender: '公', personality: '体型较大', appearance_count: 0 },
  { id: '6', name: '甜心', color: '奶白色长毛', gender: '公', personality: '待完善', appearance_count: 0 },
]

export async function getCats(): Promise<CatRecord[]> {
  console.log('[DB] getCats - Supabase:', isSupabaseConfigured())
  
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('cats')
        .select('*')
        .order('name')
      
      if (error) {
        console.error('[DB] Supabase getCats error:', error)
        return getFromLocalStorage<CatRecord>('cats', DEFAULT_CATS)
      }
      console.log('[DB] Got cats from Supabase:', data?.length || 0)
      return data || []
    } catch (err) {
      console.error('[DB] Supabase exception:', err)
      return getFromLocalStorage<CatRecord>('cats', DEFAULT_CATS)
    }
  }
  
  // localStorage 降级
  console.log('[DB] Using localStorage for cats')
  const stored = getFromLocalStorage<CatRecord>('cats')
  if (stored.length > 0) return stored
  
  saveToLocalStorage('cats', DEFAULT_CATS)
  return DEFAULT_CATS
}

export async function updateCat(id: string, updates: Partial<CatRecord>): Promise<CatRecord> {
  console.log('[DB] updateCat - Supabase:', isSupabaseConfigured())
  
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('cats')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      
      if (error) {
        console.error('[DB] Supabase updateCat error:', error)
        throw error
      }
      return data
    } catch (err) {
      console.error('[DB] Supabase exception:', err)
    }
  }
  
  // localStorage 降级
  const cats = await getCats()
  const index = cats.findIndex(c => c.id === id)
  if (index !== -1) {
    cats[index] = { ...cats[index], ...updates, updated_at: new Date().toISOString() }
    saveToLocalStorage('cats', cats)
    return cats[index]
  }
  throw new Error('Cat not found')
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

// ============ 数据迁移工具 ============

export async function migrateToSupabase(): Promise<{ success: boolean; message: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { success: false, message: 'Supabase未配置' }
  }
  
  try {
    // 迁移笔记
    const localNotes = getFromLocalStorage<Note>('notes')
    if (localNotes.length > 0) {
      console.log('[DB] Migrating', localNotes.length, 'notes to Supabase')
      const { error } = await supabase.from('notes').upsert(localNotes)
      if (error) throw error
    }
    
    // 迁移周数据
    const localStats = getFromLocalStorage<WeeklyStat>('weekly_stats')
    if (localStats.length > 0) {
      console.log('[DB] Migrating', localStats.length, 'weekly_stats to Supabase')
      const { error } = await supabase.from('weekly_stats').upsert(localStats)
      if (error) throw error
    }
    
    // 迁移猫咪数据
    const localCats = getFromLocalStorage<CatRecord>('cats')
    if (localCats.length > 0) {
      console.log('[DB] Migrating', localCats.length, 'cats to Supabase')
      const { error } = await supabase.from('cats').upsert(localCats)
      if (error) throw error
    }
    
    return { success: true, message: '数据迁移成功' }
  } catch (error) {
    console.error('[DB] Migration error:', error)
    return { success: false, message: `迁移失败: ${error}` }
  }
}

// ============ 测试连接 ============

export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  console.log('[DB] Testing Supabase connection...')
  
  if (!isSupabaseConfigured() || !supabase) {
    return { success: false, message: 'Supabase未配置' }
  }
  
  try {
    const { data, error } = await supabase.from('cats').select('count')
    if (error) {
      return { success: false, message: `连接失败: ${error.message}` }
    }
    return { success: true, message: `连接成功，数据: ${JSON.stringify(data)}` }
  } catch (err) {
    return { success: false, message: `异常: ${err}` }
  }
}
