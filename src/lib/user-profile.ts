// 用户资料管理（localStorage 存储）
const PROFILE_KEY = 'daodao_user_profile'

export interface UserProfile {
  avatar?: string  // base64 图片
  nickname?: string
  updatedAt?: string
}

// 获取用户资料
export function getUserProfile(): UserProfile {
  if (typeof window === 'undefined') return {}
  
  try {
    const data = localStorage.getItem(PROFILE_KEY)
    return data ? JSON.parse(data) : {}
  } catch {
    return {}
  }
}

// 保存用户资料
export function saveUserProfile(profile: Partial<UserProfile>): void {
  if (typeof window === 'undefined') return
  
  try {
    const current = getUserProfile()
    const updated = {
      ...current,
      ...profile,
      updatedAt: new Date().toISOString()
    }
    localStorage.setItem(PROFILE_KEY, JSON.stringify(updated))
  } catch (error) {
    console.error('[Profile] Save failed:', error)
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
        let { width, height } = img

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

