/**
 * 最近浏览记录条目
 * @property name - 菜品名称
 * @property timestamp - 访问时间戳（毫秒）
 */
export interface RecentViewItem {
  name: string;
  timestamp: number;
}

/** localStorage 存储键名 */
const STORAGE_KEY = 'vegetable_recent_views';

/** 最近浏览记录最大保存数量 */
const MAX_RECENT = 5;

/**
 * 从 localStorage 读取最近浏览记录
 * @returns 按时间倒序排列的浏览记录数组，读取失败时返回空数组
 */
export function getRecentViews(): RecentViewItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('读取最近浏览记录失败:', e);
  }
  return [];
}

/**
 * 保存浏览记录到 localStorage
 * @description 若该菜品已存在记录则更新时间并移到最前，超过最大数量时删除最旧的记录
 * @param name - 菜品名称
 */
export function saveRecentView(name: string): void {
  try {
    const recent = getRecentViews();
    const filtered = recent.filter((item) => item.name !== name);
    const newItem: RecentViewItem = {
      name,
      timestamp: Date.now(),
    };
    const updated = [newItem, ...filtered].slice(0, MAX_RECENT);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('保存最近浏览记录失败:', e);
  }
}

/**
 * 清空 localStorage 中的最近浏览记录
 */
export function clearRecentViews(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('清空最近浏览记录失败:', e);
  }
}
