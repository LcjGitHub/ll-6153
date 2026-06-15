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
 * 按关键词和品类过滤菜价列表
 * @param keyword - 搜索关键词
 * @param category - 菜品种类，空字符串表示全部
 */
export interface PriceRange {
  min?: number;
  max?: number;
}

export function validatePriceRange(range: PriceRange): string | null {
  if (range.min !== undefined && range.max !== undefined && range.min > range.max) {
    return '最低价不能大于最高价';
  }
  return null;
}

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

export function formatPriceRangeDescription(range: PriceRange): string {
  if (range.min !== undefined && range.max !== undefined) {
    return `${formatPrice(range.min)} ~ ${formatPrice(range.max)} 元`;
  }
  if (range.min !== undefined) {
    return `≥ ${formatPrice(range.min)} 元`;
  }
  if (range.max !== undefined) {
    return `≤ ${formatPrice(range.max)} 元`;
  }
  return '';
}

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
