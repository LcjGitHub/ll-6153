/** 单日价格记录 */
export interface PriceHistoryPoint {
  date: string;
  price: number;
}

/** 蔬菜价格条目 */
export interface VegetablePrice {
  name: string;
  unit: string;
  avgPrice: number;
  prevPrice: number;
  history7d: PriceHistoryPoint[];
}

/** 涨跌方向 */
export type PriceTrend = 'up' | 'down' | 'flat';
