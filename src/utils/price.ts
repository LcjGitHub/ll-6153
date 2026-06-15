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
export function filterVegetables(keyword: string, category?: string): VegetablePrice[] {
  const trimmed = keyword.trim();
  let result = vegetablePrices;

  if (category) {
    result = result.filter((item) => item.category === category);
  }

  if (!trimmed) {
    return result;
  }
  return result.filter((item) => item.name.includes(trimmed));
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
