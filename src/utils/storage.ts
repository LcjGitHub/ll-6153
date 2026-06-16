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

export const FAVORITES_CHANGED_EVENT = 'vegetable_favorites_changed';

export function emitFavoritesChanged(): void {
  window.dispatchEvent(new CustomEvent(FAVORITES_CHANGED_EVENT));
}

/** 收藏存储键名 */
const FAVORITES_KEY = 'vegetable_favorites';

/**
 * 从 localStorage 读取收藏列表
 * @returns 收藏的菜品名称数组
 */
export function getFavorites(): string[] {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('读取收藏列表失败:', e);
  }
  return [];
}

/**
 * 切换菜品收藏状态
 * @description 若已收藏则取消收藏，未收藏则添加收藏
 * @param name - 菜品名称
 * @returns 切换后的收藏状态（true 表示已收藏）
 */
export function toggleFavorite(name: string): boolean {
  try {
    const favorites = getFavorites();
    const exists = favorites.includes(name);
    let updated: string[];
    if (exists) {
      updated = favorites.filter((item) => item !== name);
    } else {
      updated = [...favorites, name];
    }
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    emitFavoritesChanged();
    return !exists;
  } catch (e) {
    console.error('切换收藏状态失败:', e);
    return false;
  }
}

/**
 * 检查菜品是否已收藏
 * @param name - 菜品名称
 * @returns 是否已收藏
 */
export function isFavorite(name: string): boolean {
  return getFavorites().includes(name);
}

/**
 * 移除指定菜品的收藏
 * @param name - 菜品名称
 */
export function removeFavorite(name: string): void {
  try {
    const favorites = getFavorites();
    const updated = favorites.filter((item) => item !== name);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    emitFavoritesChanged();
  } catch (e) {
    console.error('移除收藏失败:', e);
  }
}
