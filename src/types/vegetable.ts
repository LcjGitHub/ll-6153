/** 菜品种类 */
export type VegetableCategory = '叶菜' | '根茎' | '瓜果' | '调味';

/** 单日价格记录 */
export interface PriceHistoryPoint {
  date: string;
  price: number;
}

/** 蔬菜价格条目 */
export interface VegetablePrice {
  name: string;
  category: VegetableCategory;
  unit: string;
  avgPrice: number;
  prevPrice: number;
  history7d: PriceHistoryPoint[];
}

/** 涨跌方向 */
export type PriceTrend = 'up' | 'down' | 'flat';
