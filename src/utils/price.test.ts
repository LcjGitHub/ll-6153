import type { VegetablePrice, VegetableCategory } from '../types/vegetable';
import {
  validatePriceRange,
  filterByPriceRange,
  filterVegetables,
  getPriceRanking,
  sortVegetables,
  getNextSortState,
  type PriceRange,
  type SortState,
  type SortField,
} from './price';

function createMockVegetable(
  name: string,
  category: VegetableCategory,
  avgPrice: number,
  prevPrice: number,
): VegetablePrice {
  return {
    name,
    category,
    unit: '元/500克',
    avgPrice,
    prevPrice,
    history7d: [],
  };
}

const mockList: VegetablePrice[] = [
  createMockVegetable('白菜', '叶菜', 2.5, 2.3),
  createMockVegetable('菠菜', '叶菜', 4.8, 5.0),
  createMockVegetable('土豆', '根茎', 3.2, 3.2),
  createMockVegetable('胡萝卜', '根茎', 2.8, 2.5),
  createMockVegetable('西红柿', '瓜果', 5.5, 4.8),
  createMockVegetable('黄瓜', '瓜果', 3.8, 4.2),
  createMockVegetable('大葱', '调味', 6.0, 5.5),
  createMockVegetable('生姜', '调味', 8.5, 9.0),
];

describe('validatePriceRange', () => {
  test('合法区间 - 只有最低价', () => {
    const range: PriceRange = { min: 2 };
    expect(validatePriceRange(range)).toBeNull();
  });

  test('合法区间 - 只有最高价', () => {
    const range: PriceRange = { max: 10 };
    expect(validatePriceRange(range)).toBeNull();
  });

  test('合法区间 - 最低价等于最高价', () => {
    const range: PriceRange = { min: 5, max: 5 };
    expect(validatePriceRange(range)).toBeNull();
  });

  test('合法区间 - 最低价小于最高价', () => {
    const range: PriceRange = { min: 2, max: 8 };
    expect(validatePriceRange(range)).toBeNull();
  });

  test('合法区间 - 无限制', () => {
    expect(validatePriceRange({})).toBeNull();
  });

  test('错误 - 最低价大于最高价', () => {
    const range: PriceRange = { min: 8, max: 2 };
    expect(validatePriceRange(range)).toBe('最低价不能大于最高价');
  });
});

describe('filterByPriceRange', () => {
  test('正常筛选 - 双边界', () => {
    const result = filterByPriceRange(mockList, { min: 3, max: 5 });
    const names = result.map((item) => item.name).sort();
    expect(names).toEqual(['土豆', '菠菜', '黄瓜']);
  });

  test('边界值 - 等于最低价应包含', () => {
    const result = filterByPriceRange(mockList, { min: 2.8, max: 2.8 });
    const names = result.map((item) => item.name);
    expect(names).toEqual(['胡萝卜']);
  });

  test('边界值 - 等于最高价应包含', () => {
    const result = filterByPriceRange(mockList, { min: 4.8, max: 4.8 });
    const names = result.map((item) => item.name);
    expect(names).toEqual(['菠菜']);
  });

  test('仅设置最低价', () => {
    const result = filterByPriceRange(mockList, { min: 5 });
    const names = result.map((item) => item.name).sort();
    expect(names).toEqual(['大葱', '生姜', '西红柿']);
  });

  test('仅设置最高价', () => {
    const result = filterByPriceRange(mockList, { max: 3 });
    const names = result.map((item) => item.name).sort();
    expect(names).toEqual(['白菜', '胡萝卜']);
  });

  test('无限制 - 返回全部', () => {
    const result = filterByPriceRange(mockList, {});
    expect(result).toHaveLength(mockList.length);
  });

  test('区间无匹配数据 - 返回空数组', () => {
    const result = filterByPriceRange(mockList, { min: 10, max: 20 });
    expect(result).toEqual([]);
  });
});

describe('filterVegetables', () => {
  test('关键词过滤', () => {
    const result = filterVegetables('菜', undefined, undefined, undefined, mockList);
    const names = result.map((item) => item.name).sort();
    expect(names).toEqual(['白菜', '菠菜']);
  });

  test('关键词前后空格处理', () => {
    const result = filterVegetables('  土豆  ', undefined, undefined, undefined, mockList);
    const names = result.map((item) => item.name);
    expect(names).toEqual(['土豆']);
  });

  test('按品类过滤', () => {
    const result = filterVegetables('', '叶菜', undefined, undefined, mockList);
    const names = result.map((item) => item.name).sort();
    expect(names).toEqual(['白菜', '菠菜']);
  });

  test('按涨跌过滤 - 涨价', () => {
    const result = filterVegetables('', undefined, undefined, 'up', mockList);
    const names = result.map((item) => item.name).sort();
    expect(names).toEqual(['大葱', '白菜', '胡萝卜', '西红柿']);
  });

  test('按涨跌过滤 - 降价', () => {
    const result = filterVegetables('', undefined, undefined, 'down', mockList);
    const names = result.map((item) => item.name).sort();
    expect(names).toEqual(['生姜', '菠菜', '黄瓜']);
  });

  test('按涨跌过滤 - 全部', () => {
    const result = filterVegetables('', undefined, undefined, 'all', mockList);
    expect(result).toHaveLength(mockList.length);
  });

  test('综合过滤 - 品类 + 价格区间', () => {
    const result = filterVegetables('', '叶菜', { min: 2, max: 3 }, undefined, mockList);
    const names = result.map((item) => item.name);
    expect(names).toEqual(['白菜']);
  });

  test('空关键词 + 无品类 + 无限制 - 返回全部', () => {
    const result = filterVegetables('', undefined, undefined, undefined, mockList);
    expect(result).toHaveLength(mockList.length);
  });
});

describe('getPriceRanking', () => {
  test('排行榜应排除持平菜品', () => {
    const result = getPriceRanking(10, mockList);
    const allNames = [...result.topGainers, ...result.topLosers].map((item) => item.name);
    expect(allNames).not.toContain('土豆');
  });

  test('涨幅榜按涨幅从大到小排序', () => {
    const result = getPriceRanking(10, mockList);
    const changes = result.topGainers.map((item) => item.change);
    for (let i = 1; i < changes.length; i++) {
      expect(changes[i]).toBeLessThanOrEqual(changes[i - 1]);
    }
  });

  test('跌幅榜按跌幅从小到大（最负在前）排序', () => {
    const result = getPriceRanking(10, mockList);
    const changes = result.topLosers.map((item) => item.change);
    for (let i = 1; i < changes.length; i++) {
      expect(changes[i]).toBeGreaterThanOrEqual(changes[i - 1]);
    }
  });

  test('涨幅榜只包含涨价菜品', () => {
    const result = getPriceRanking(10, mockList);
    result.topGainers.forEach((item) => {
      expect(item.trend).toBe('up');
      expect(item.change).toBeGreaterThan(0);
    });
  });

  test('跌幅榜只包含降价菜品', () => {
    const result = getPriceRanking(10, mockList);
    result.topLosers.forEach((item) => {
      expect(item.trend).toBe('down');
      expect(item.change).toBeLessThan(0);
    });
  });

  test('限制前 N 名', () => {
    const result = getPriceRanking(2, mockList);
    expect(result.topGainers).toHaveLength(2);
    expect(result.topLosers).toHaveLength(2);
  });

  test('默认取前 5 名', () => {
    const result = getPriceRanking(undefined, mockList);
    expect(result.topGainers.length).toBeLessThanOrEqual(5);
    expect(result.topLosers.length).toBeLessThanOrEqual(5);
  });
});

describe('sortVegetables', () => {
  test('排序状态为空 - 返回原列表', () => {
    const sortState: SortState = { field: null, order: null };
    const result = sortVegetables(mockList, sortState);
    expect(result).toEqual(mockList);
  });

  test('field 为 null - 返回原列表', () => {
    const sortState: SortState = { field: null, order: 'asc' };
    const result = sortVegetables(mockList, sortState);
    expect(result).toEqual(mockList);
  });

  test('order 为 null - 返回原列表', () => {
    const sortState: SortState = { field: 'avgPrice', order: null };
    const result = sortVegetables(mockList, sortState);
    expect(result).toEqual(mockList);
  });

  test('按今日均价升序排序', () => {
    const sortState: SortState = { field: 'avgPrice', order: 'asc' };
    const result = sortVegetables(mockList, sortState);
    const prices = result.map((item) => item.avgPrice);
    for (let i = 1; i < prices.length; i++) {
      expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]);
    }
  });

  test('按今日均价降序排序', () => {
    const sortState: SortState = { field: 'avgPrice', order: 'desc' };
    const result = sortVegetables(mockList, sortState);
    const prices = result.map((item) => item.avgPrice);
    for (let i = 1; i < prices.length; i++) {
      expect(prices[i]).toBeLessThanOrEqual(prices[i - 1]);
    }
  });

  test('按昨日均价升序排序', () => {
    const sortState: SortState = { field: 'prevPrice', order: 'asc' };
    const result = sortVegetables(mockList, sortState);
    const prices = result.map((item) => item.prevPrice);
    for (let i = 1; i < prices.length; i++) {
      expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]);
    }
  });

  test('排序不修改原列表', () => {
    const original = [...mockList];
    const sortState: SortState = { field: 'avgPrice', order: 'asc' };
    sortVegetables(mockList, sortState);
    expect(mockList).toEqual(original);
  });
});

describe('getNextSortState - 三态循环', () => {
  test('初始状态（null/null）点击任意字段 → 升序', () => {
    const current: SortState = { field: null, order: null };
    const target: SortField = 'avgPrice';
    const next = getNextSortState(current, target);
    expect(next).toEqual({ field: 'avgPrice', order: 'asc' });
  });

  test('点击不同字段 → 切换到该字段升序', () => {
    const current: SortState = { field: 'avgPrice', order: 'asc' };
    const target: SortField = 'prevPrice';
    const next = getNextSortState(current, target);
    expect(next).toEqual({ field: 'prevPrice', order: 'asc' });
  });

  test('升序点击同字段 → 切换为降序', () => {
    const current: SortState = { field: 'avgPrice', order: 'asc' };
    const next = getNextSortState(current, 'avgPrice');
    expect(next).toEqual({ field: 'avgPrice', order: 'desc' });
  });

  test('降序点击同字段 → 恢复默认（null/null）', () => {
    const current: SortState = { field: 'avgPrice', order: 'desc' };
    const next = getNextSortState(current, 'avgPrice');
    expect(next).toEqual({ field: null, order: null });
  });

  test('完整三态循环：默认 → 升序 → 降序 → 默认', () => {
    let state: SortState = { field: null, order: null };
    state = getNextSortState(state, 'avgPrice');
    expect(state).toEqual({ field: 'avgPrice', order: 'asc' });
    state = getNextSortState(state, 'avgPrice');
    expect(state).toEqual({ field: 'avgPrice', order: 'desc' });
    state = getNextSortState(state, 'avgPrice');
    expect(state).toEqual({ field: null, order: null });
  });

  test('不同字段各自独立循环', () => {
    let state: SortState = { field: 'avgPrice', order: 'desc' };
    state = getNextSortState(state, 'prevPrice');
    expect(state).toEqual({ field: 'prevPrice', order: 'asc' });
  });
});
