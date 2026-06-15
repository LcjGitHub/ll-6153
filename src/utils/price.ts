import rawPrices from '../mock/vegetable-prices.json';
import type { PriceTrend, VegetablePrice } from '../types/vegetable';

/** Mock 菜价数据源（不接发改委 API） */
export const vegetablePrices: VegetablePrice[] = rawPrices as VegetablePrice[];

/**
 * 按菜名查找价格条目
 * @param name - 菜品名称
 */
export function findVegetableByName(name: string): VegetablePrice | undefined {
  return vegetablePrices.find((item) => item.name === name);
}

/**
 * 获取全部菜名列表（按菜名拼音/汉字顺序排序）
 * @returns 排序后的菜名数组
 */
export function getAllVegetableNames(): string[] {
  return vegetablePrices
    .map((item) => item.name)
    .sort((a, b) => a.localeCompare(b, 'zh-CN'));
}

/**
 * 价格区间
 * @property min - 最低价，`undefined` 表示不限制下限
 * @property max - 最高价，`undefined` 表示不限制上限
 */
export interface PriceRange {
  min?: number;
  max?: number;
}

/**
 * 校验价格区间是否合法
 * @param range - 价格区间
 * @returns 错误信息，合法时返回 `null`
 */
export function validatePriceRange(range: PriceRange): string | null {
  if (range.min !== undefined && range.max !== undefined && range.min > range.max) {
    return '最低价不能大于最高价';
  }
  return null;
}

/**
 * 按价格区间过滤菜价列表（今日均价格在区间内）
 * @param list - 菜价列表
 * @param range - 价格区间，留空一侧表示不限制
 */
export function filterByPriceRange(list: VegetablePrice[], range: PriceRange): VegetablePrice[] {
  return list.filter((item) => {
    if (range.min !== undefined && item.avgPrice < range.min) {
      return false;
    }
    if (range.max !== undefined && item.avgPrice > range.max) {
      return false;
    }
    return true;
  });
}

/**
 * 将价格区间格式化为中文可读描述
 * @param range - 价格区间
 * @returns 形如 "1.00 ~ 5.00 元"、"不低于 3.00 元"、"不超过 8.00 元" 的描述，无限制时返回空字符串
 */
export function formatPriceRangeDescription(range: PriceRange): string {
  if (range.min !== undefined && range.max !== undefined) {
    return `${formatPrice(range.min)} ~ ${formatPrice(range.max)} 元`;
  }
  if (range.min !== undefined) {
    return `不低于 ${formatPrice(range.min)} 元`;
  }
  if (range.max !== undefined) {
    return `不超过 ${formatPrice(range.max)} 元`;
  }
  return '';
}

/**
 * 按关键词、品类和价格区间过滤菜价列表
 * @param keyword - 搜索关键词
 * @param category - 菜品种类，空字符串表示全部
 * @param range - 价格区间，留空一侧表示不限制
 */
export function filterVegetables(keyword: string, category?: string, range?: PriceRange): VegetablePrice[] {
  const trimmed = keyword.trim();
  let result = vegetablePrices;

  if (category) {
    result = result.filter((item) => item.category === category);
  }

  if (!trimmed) {
    result = result.filter(() => true);
  } else {
    result = result.filter((item) => item.name.includes(trimmed));
  }

  if (range && (range.min !== undefined || range.max !== undefined)) {
    result = filterByPriceRange(result, range);
  }

  return result;
}

/**
 * 计算相对前一日涨跌方向
 * @param avgPrice - 今日均价
 * @param prevPrice - 昨日均价
 */
export function getPriceTrend(avgPrice: number, prevPrice: number): PriceTrend {
  if (avgPrice > prevPrice) {
    return 'up';
  }
  if (avgPrice < prevPrice) {
    return 'down';
  }
  return 'flat';
}

/**
 * 计算涨跌幅度（元）
 * @param avgPrice - 今日均价
 * @param prevPrice - 昨日均价
 */
export function getPriceChange(avgPrice: number, prevPrice: number): number {
  return Number((avgPrice - prevPrice).toFixed(2));
}

/**
 * 格式化价格显示
 * @param price - 价格数值
 */
export function formatPrice(price: number): string {
  return price.toFixed(2);
}

/** 排行榜单项 */
export interface PriceRankingItem {
  name: string;
  avgPrice: number;
  change: number;
  trend: PriceTrend;
}

/** 涨跌排行榜 */
export interface PriceRanking {
  topGainers: PriceRankingItem[];
  topLosers: PriceRankingItem[];
}

/**
 * 获取涨跌排行榜
 * @param topN - 取前 N 名，默认 5
 */
export function getPriceRanking(topN = 5): PriceRanking {
  const ranked = vegetablePrices
    .map((item) => {
      const change = getPriceChange(item.avgPrice, item.prevPrice);
      const trend = getPriceTrend(item.avgPrice, item.prevPrice);
      return { name: item.name, avgPrice: item.avgPrice, change, trend };
    })
    .filter((item) => item.trend !== 'flat');

  const topGainers = ranked
    .filter((item) => item.trend === 'up')
    .sort((a, b) => b.change - a.change)
    .slice(0, topN);

  const topLosers = ranked
    .filter((item) => item.trend === 'down')
    .sort((a, b) => a.change - b.change)
    .slice(0, topN);

  return { topGainers, topLosers };
}

/** 排序字段 */
export type SortField = 'avgPrice' | 'prevPrice';

/** 排序方向 */
export type SortOrder = 'asc' | 'desc';

/** 排序状态 */
export interface SortState {
  field: SortField | null;
  order: SortOrder | null;
}

/**
 * 按指定字段和方向对菜价列表排序
 * @param list - 菜价列表
 * @param sortState - 排序状态，field 或 order 为 null 时返回原列表
 */
export function sortVegetables(
  list: VegetablePrice[],
  sortState: SortState,
): VegetablePrice[] {
  const { field, order } = sortState;
  if (!field || !order) {
    return list;
  }
  const sorted = [...list].sort((a, b) => {
    const diff = a[field] - b[field];
    return order === 'asc' ? diff : -diff;
  });
  return sorted;
}

/**
 * 获取下一个排序状态（默认 → 升序 → 降序 → 默认 循环）
 * @param current - 当前排序状态
 * @param targetField - 点击的目标排序字段
 */
export function getNextSortState(current: SortState, targetField: SortField): SortState {
  if (current.field !== targetField) {
    return { field: targetField, order: 'asc' };
  }
  if (current.order === null) {
    return { field: targetField, order: 'asc' };
  }
  if (current.order === 'asc') {
    return { field: targetField, order: 'desc' };
  }
  return { field: null, order: null };
}

/** 市场概览统计 */
export interface MarketOverviewStats {
  upCount: number;
  downCount: number;
  flatCount: number;
  avgPrice: number;
}

/**
 * 计算菜价列表的市场概览统计
 * @param list - 菜价列表
 */
export function getMarketOverviewStats(list: VegetablePrice[]): MarketOverviewStats {
  let upCount = 0;
  let downCount = 0;
  let flatCount = 0;
  let totalPrice = 0;

  list.forEach((item) => {
    const trend = getPriceTrend(item.avgPrice, item.prevPrice);
    if (trend === 'up') {
      upCount++;
    } else if (trend === 'down') {
      downCount++;
    } else {
      flatCount++;
    }
    totalPrice += item.avgPrice;
  });

  const avgPrice = list.length > 0 ? Number((totalPrice / list.length).toFixed(2)) : 0;

  return { upCount, downCount, flatCount, avgPrice };
}
