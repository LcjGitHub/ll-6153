import type { VegetableCategory } from '../types/vegetable';
import type { TrendFilter } from './price';

/**
 * 筛选预设方案数据
 */
export interface FilterPreset {
  id: string;
  name: string;
  keyword: string;
  category: VegetableCategory | '';
  trendFilter: TrendFilter;
  minPrice: number | undefined;
  maxPrice: number | undefined;
  createdAt: number;
}

/** localStorage 存储键名 */
const PRESETS_KEY = 'vegetable_filter_presets';

/**
 * 从 localStorage 读取所有筛选预设
 * @returns 按创建时间倒序排列的预设数组，读取失败时返回空数组
 */
export function getFilterPresets(): FilterPreset[] {
  try {
    const stored = localStorage.getItem(PRESETS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('读取筛选预设失败:', e);
  }
  return [];
}

/**
 * 保存筛选预设到 localStorage
 * @description 若同名预设已存在则覆盖原方案
 * @param preset - 不含 id 和 createdAt 的预设数据
 * @returns 保存成功后的完整预设对象（含 id 和 createdAt）
 */
export function saveFilterPreset(
  preset: Omit<FilterPreset, 'id' | 'createdAt'>,
): FilterPreset {
  const presets = getFilterPresets();
  const newPreset: FilterPreset = {
    ...preset,
    id: `preset_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
  };

  const existingIndex = presets.findIndex((p) => p.name === preset.name);
  if (existingIndex >= 0) {
    presets[existingIndex] = { ...newPreset, id: presets[existingIndex].id };
  } else {
    presets.unshift(newPreset);
  }

  try {
    localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
  } catch (e) {
    console.error('保存筛选预设失败:', e);
  }

  return newPreset;
}

/**
 * 删除指定筛选预设
 * @param id - 预设 ID
 */
export function deleteFilterPreset(id: string): void {
  try {
    const presets = getFilterPresets();
    const updated = presets.filter((p) => p.id !== id);
    localStorage.setItem(PRESETS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('删除筛选预设失败:', e);
  }
}

/**
 * 检查预设名称是否已存在
 * @param name - 预设名称
 * @param excludeId - 排除的预设 ID（用于重命名场景）
 * @returns 是否已存在同名预设
 */
export function isPresetNameExists(name: string, excludeId?: string): boolean {
  const presets = getFilterPresets();
  return presets.some((p) => p.name === name && p.id !== excludeId);
}
