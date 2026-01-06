// 使用localStorage存储数据（MVP阶段）
import { Cat } from '@/data/cats';

export interface WeeklyData {
  weekId: string;        // YYYY-WW 格式
  startDate: string;
  endDate: string;
  followers: number;
  likes: number;
  saves: number;
  comments: number;
  views: number;
  femaleRatio: number;
  topNotes: string[];
}

export interface NoteData {
  id: string;
  title: string;
  type: 'cat' | 'product' | 'lifestyle' | 'outfit';
  publishDate: string;
  cats: string[];
  likes: number;
  saves: number;
  comments: number;
  views: number;
}

const STORAGE_KEYS = {
  WEEKLY_DATA: 'daodao_weekly_data',
  NOTES: 'daodao_notes',
  CAT_APPEARANCES: 'daodao_cat_appearances',
  CAT_PROFILES: 'daodao_cat_profiles',
};

// 检查是否在浏览器环境
const isBrowser = typeof window !== 'undefined';

// 周数据
export function saveWeeklyData(data: WeeklyData) {
  if (!isBrowser) return;
  const existing = getWeeklyDataList();
  const index = existing.findIndex(d => d.weekId === data.weekId);
  if (index >= 0) {
    existing[index] = data;
  } else {
    existing.push(data);
  }
  localStorage.setItem(STORAGE_KEYS.WEEKLY_DATA, JSON.stringify(existing));
}

export function getWeeklyDataList(): WeeklyData[] {
  if (!isBrowser) return [];
  const data = localStorage.getItem(STORAGE_KEYS.WEEKLY_DATA);
  return data ? JSON.parse(data) : [];
}

export function getLatestWeeklyData(): WeeklyData | null {
  const list = getWeeklyDataList();
  return list.length > 0 ? list[list.length - 1] : null;
}

// 笔记数据
export function saveNote(note: NoteData) {
  if (!isBrowser) return;
  const notes = getNotes();
  notes.push(note);
  localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  
  // 更新猫咪出镜统计
  note.cats.forEach(catName => {
    incrementCatAppearance(catName);
  });
}

export function getNotes(): NoteData[] {
  if (!isBrowser) return [];
  const data = localStorage.getItem(STORAGE_KEYS.NOTES);
  return data ? JSON.parse(data) : [];
}

// 猫咪出镜统计
export function getCatAppearances(): Record<string, number> {
  if (!isBrowser) return { Baby: 0, Mini: 0, 提莫: 0, 达令: 0, 熊崽: 0, 甜心: 0 };
  const data = localStorage.getItem(STORAGE_KEYS.CAT_APPEARANCES);
  return data ? JSON.parse(data) : {
    Baby: 0, Mini: 0, 提莫: 0, 达令: 0, 熊崽: 0, 甜心: 0
  };
}

export function incrementCatAppearance(catName: string) {
  if (!isBrowser) return;
  const appearances = getCatAppearances();
  appearances[catName] = (appearances[catName] || 0) + 1;
  localStorage.setItem(STORAGE_KEYS.CAT_APPEARANCES, JSON.stringify(appearances));
}

// 猫咪档案存储
export function saveCatProfile(cat: Cat) {
  if (!isBrowser) return;
  const profiles = getCatProfiles();
  const index = profiles.findIndex(c => c.id === cat.id);
  if (index >= 0) {
    profiles[index] = { ...cat, updatedAt: new Date() };
  } else {
    profiles.push({ ...cat, createdAt: new Date(), updatedAt: new Date() });
  }
  localStorage.setItem(STORAGE_KEYS.CAT_PROFILES, JSON.stringify(profiles));
}

export function getCatProfiles(): Cat[] {
  if (!isBrowser) return [];
  const data = localStorage.getItem(STORAGE_KEYS.CAT_PROFILES);
  return data ? JSON.parse(data) : [];
}

export function getCatProfile(catId: number): Cat | null {
  const profiles = getCatProfiles();
  return profiles.find(c => c.id === catId) || null;
}

// 获取分析上下文（用于AI）
export function getAnalyticsContext(): string {
  const latest = getLatestWeeklyData();
  if (!latest) return '暂无运营数据，请先录入本周数据';
  
  return `
本周数据（${latest.startDate} - ${latest.endDate}）：
- 新增粉丝：${latest.followers}
- 点赞数：${latest.likes}
- 收藏数：${latest.saves}
- 评论数：${latest.comments}
- 浏览量：${latest.views}
- 女性粉丝占比：${latest.femaleRatio}%
- 收藏率：${latest.views > 0 ? ((latest.saves / latest.views) * 100).toFixed(1) : 0}%
  `.trim();
}

export function getCatAppearanceContext(): string {
  const appearances = getCatAppearances();
  const sorted = Object.entries(appearances)
    .sort((a, b) => b[1] - a[1]);
  
  if (sorted.every(([, count]) => count === 0)) {
    return '暂无猫咪出镜数据';
  }
  
  return `
猫咪出镜统计：
${sorted.map(([name, count]) => `- ${name}: ${count}次`).join('\n')}
  `.trim();
}

export function getCatProfilesContext(): string {
  const profiles = getCatProfiles();
  if (profiles.length === 0) {
    return '猫咪档案尚未完善，请通过录入功能补充猫咪信息';
  }
  
  return profiles.map(cat => {
    const info = [`${cat.name}`];
    if (cat.personality) info.push(`性格：${cat.personality}`);
    if (cat.traits?.length) info.push(`特点：${cat.traits.join('、')}`);
    if (cat.appearance) info.push(`外貌：${cat.appearance}`);
    return info.join(' | ');
  }).join('\n');
}

