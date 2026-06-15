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
 * 按关键词过滤菜价列表
 * @param keyword - 搜索关键词
 */
export function filterVegetables(keyword: string): VegetablePrice[] {
  const trimmed = keyword.trim();
  if (!trimmed) {
    return vegetablePrices;
  }
  return vegetablePrices.filter((item) => item.name.includes(trimmed));
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
