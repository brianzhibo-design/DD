import { supabase, Note, WeeklyStat, CatRecord, isSupabaseConfigured } from './supabase'

// ============ 笔记相关 ============

export async function getNotes(): Promise<Note[]> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Supabase getNotes error:', error)
      throw error
    }
    return data || []
  }
  
  // localStorage 降级
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem('daodao_notes')
  return stored ? JSON.parse(stored) : []
}

export async function createNote(note: Omit<Note, 'id' | 'created_at' | 'updated_at'>): Promise<Note> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('notes')
      .insert(note)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
  
  // localStorage 降级
  const notes = await getNotes()
  const newNote: Note = {
    ...note,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  notes.unshift(newNote)
  localStorage.setItem('daodao_notes', JSON.stringify(notes))
  return newNote
}

export async function updateNote(id: string, updates: Partial<Note>): Promise<Note> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('notes')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
  
  // localStorage 降级
  const notes = await getNotes()
  const index = notes.findIndex(n => n.id === id)
  if (index !== -1) {
    notes[index] = { ...notes[index], ...updates, updated_at: new Date().toISOString() }
    localStorage.setItem('daodao_notes', JSON.stringify(notes))
    return notes[index]
  }
  throw new Error('Note not found')
}

export async function deleteNote(id: string): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return
  }
  
  // localStorage 降级
  const notes = await getNotes()
  const filtered = notes.filter(n => n.id !== id)
  localStorage.setItem('daodao_notes', JSON.stringify(filtered))
}

// ============ 周数据相关 ============

export async function getWeeklyStats(): Promise<WeeklyStat[]> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('weekly_stats')
      .select('*')
      .order('week_start', { ascending: false })
    
    if (error) throw error
    return data || []
  }
  
  // localStorage 降级
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem('daodao_weekly_stats')
  return stored ? JSON.parse(stored) : []
}

export async function createWeeklyStat(stat: Omit<WeeklyStat, 'id' | 'created_at'>): Promise<WeeklyStat> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('weekly_stats')
      .insert(stat)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
  
  // localStorage 降级
  const stats = await getWeeklyStats()
  const newStat: WeeklyStat = {
    ...stat,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  }
  stats.unshift(newStat)
  localStorage.setItem('daodao_weekly_stats', JSON.stringify(stats))
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
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('cats')
      .select('*')
      .order('name')
    
    if (error) throw error
    return data || []
  }
  
  // localStorage 降级
  if (typeof window === 'undefined') return DEFAULT_CATS
  const stored = localStorage.getItem('daodao_cats')
  if (stored) return JSON.parse(stored)
  
  localStorage.setItem('daodao_cats', JSON.stringify(DEFAULT_CATS))
  return DEFAULT_CATS
}

export async function updateCat(id: string, updates: Partial<CatRecord>): Promise<CatRecord> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('cats')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
  
  // localStorage 降级
  const cats = await getCats()
  const index = cats.findIndex(c => c.id === id)
  if (index !== -1) {
    cats[index] = { ...cats[index], ...updates, updated_at: new Date().toISOString() }
    localStorage.setItem('daodao_cats', JSON.stringify(cats))
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

// 将localStorage数据迁移到Supabase
export async function migrateToSupabase(): Promise<{ success: boolean; message: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { success: false, message: 'Supabase未配置' }
  }
  
  try {
    // 迁移笔记
    const localNotes = localStorage.getItem('daodao_notes')
    if (localNotes) {
      const notes = JSON.parse(localNotes)
      if (notes.length > 0) {
        const { error } = await supabase.from('notes').upsert(notes)
        if (error) throw error
      }
    }
    
    // 迁移周数据
    const localStats = localStorage.getItem('daodao_weekly_stats')
    if (localStats) {
      const stats = JSON.parse(localStats)
      if (stats.length > 0) {
        const { error } = await supabase.from('weekly_stats').upsert(stats)
        if (error) throw error
      }
    }
    
    // 迁移猫咪数据
    const localCats = localStorage.getItem('daodao_cats')
    if (localCats) {
      const cats = JSON.parse(localCats)
      if (cats.length > 0) {
        const { error } = await supabase.from('cats').upsert(cats)
        if (error) throw error
      }
    }
    
    return { success: true, message: '数据迁移成功' }
  } catch (error) {
    console.error('Migration error:', error)
    return { success: false, message: `迁移失败: ${error}` }
  }
}

