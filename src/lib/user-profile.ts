// 用户资料管理（Supabase 存储）
import { supabase } from './supabase'

const PROFILE_ID = 'default_user' // 单用户系统使用固定ID
const CACHE_KEY = 'daodao_user_profile_cache'

export interface UserProfile {
  id?: string
  avatar?: string  // base64 图片
  nickname?: string
  updated_at?: string
}

// 内存缓存
let profileCache: UserProfile | null = null

// 获取用户资料（优先从缓存读取）
export function getUserProfile(): UserProfile {
  // 先返回缓存
  if (profileCache) return profileCache
  
  // 尝试从 localStorage 缓存读取
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) {
        profileCache = JSON.parse(cached)
        return profileCache || {}
      }
    } catch {
      // ignore
    }
  }
  
  return {}
}

// 异步从 Supabase 加载用户资料
export async function loadUserProfile(): Promise<UserProfile> {
  try {
    const { data, error } = await supabase
      .from('user_profile')
      .select('*')
      .eq('id', PROFILE_ID)
      .single()
    
    if (error && error.code !== 'PGRST116') {
      console.error('[Profile] Load error:', error)
      return getUserProfile() // 返回缓存
    }
    
    if (data) {
      profileCache = data
      // 同步到 localStorage 缓存
      if (typeof window !== 'undefined') {
        localStorage.setItem(CACHE_KEY, JSON.stringify(data))
      }
      return data
    }
    
    return {}
  } catch (error) {
    console.error('[Profile] Load failed:', error)
    return getUserProfile()
  }
}

// 保存用户资料到 Supabase
export async function saveUserProfile(profile: Partial<UserProfile>): Promise<boolean> {
  try {
    const updated = {
      id: PROFILE_ID,
      ...profile,
      updated_at: new Date().toISOString()
    }
    
    const { error } = await supabase
      .from('user_profile')
      .upsert(updated, { onConflict: 'id' })
    
    if (error) {
      console.error('[Profile] Save error:', error)
      return false
    }
    
    // 更新缓存
    profileCache = { ...profileCache, ...updated }
    if (typeof window !== 'undefined') {
      localStorage.setItem(CACHE_KEY, JSON.stringify(profileCache))
    }
    
    console.log('[Profile] Saved to Supabase')
    return true
  } catch (error) {
    console.error('[Profile] Save failed:', error)
    return false
  }
}

// 压缩并转换图片为 base64
export function compressImage(file: File, maxSize: number = 150): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const { width, height } = img

        // 计算缩放比例，保持正方形
        const size = Math.min(width, height)
        const offsetX = (width - size) / 2
        const offsetY = (height - size) / 2

        canvas.width = maxSize
        canvas.height = maxSize
        const ctx = canvas.getContext('2d')
        
        // 裁剪为正方形并缩放
        ctx?.drawImage(img, offsetX, offsetY, size, size, 0, 0, maxSize, maxSize)
        
        // 输出为 JPEG 格式
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      }
      img.onerror = reject
      img.src = e.target?.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

