export interface RecentViewItem {
  name: string;
  timestamp: number;
}

const STORAGE_KEY = 'vegetable_recent_views';
const MAX_RECENT = 5;

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

export function clearRecentViews(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('清空最近浏览记录失败:', e);
  }
}
