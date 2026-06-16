import { IconSearch } from '@douyinfe/semi-icons';
import { Button, Input, InputNumber, Radio, Select, Tag, Typography } from '@douyinfe/semi-ui';
import dayjs from 'dayjs';
import type { VegetableCategory } from '../types/vegetable';
import type { TrendFilter } from '../utils/price';
import type { RecentViewItem } from '../utils/storage';

const CATEGORY_OPTIONS = [
  { label: '全部', value: '' },
  { label: '叶菜', value: '叶菜' },
  { label: '根茎', value: '根茎' },
  { label: '瓜果', value: '瓜果' },
  { label: '调味', value: '调味' },
];

const TREND_FILTER_OPTIONS: { label: string; value: TrendFilter }[] = [
  { label: '看全部', value: 'all' },
  { label: '只看涨价', value: 'up' },
  { label: '只看降价', value: 'down' },
];

export interface FilterBarProps {
  keyword: string;
  onKeywordChange: (value: string) => void;
  category: VegetableCategory | '';
  onCategoryChange: (value: VegetableCategory | '') => void;
  trendFilter: TrendFilter;
  onTrendFilterChange: (value: TrendFilter) => void;
  minPrice: number | undefined;
  onMinPriceChange: (value: number | string | null | undefined) => void;
  maxPrice: number | undefined;
  onMaxPriceChange: (value: number | string | null | undefined) => void;
  priceError: string | null;
  recentViews: RecentViewItem[];
  onNavigate: (path: string) => void;
  presetSelector?: React.ReactNode;
}

export function FilterBar({
  keyword,
  onKeywordChange,
  category,
  onCategoryChange,
  trendFilter,
  onTrendFilterChange,
  minPrice,
  onMinPriceChange,
  maxPrice,
  onMaxPriceChange,
  priceError,
  recentViews,
  onNavigate,
  presetSelector,
}: FilterBarProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <Button onClick={() => onNavigate('/排行榜')}>
          查看涨跌排行榜
        </Button>
        <Button onClick={() => onNavigate('/对比')}>
          多菜品走势对比
        </Button>
        {presetSelector}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
        <span style={{ fontSize: 14, color: 'var(--semi-color-text-2)', whiteSpace: 'nowrap' }}>品类</span>
        <Select
          value={category}
          onChange={(value) => onCategoryChange(value as VegetableCategory | '')}
          optionList={CATEGORY_OPTIONS}
          style={{ width: 120 }}
        />
        <Input
          prefix={<IconSearch />}
          placeholder="按菜名搜索"
          value={keyword}
          onChange={onKeywordChange}
          showClear
          style={{ width: 260 }}
        />
        <Radio.Group
          type="button"
          value={trendFilter}
          onChange={(e) => onTrendFilterChange(e.target.value as TrendFilter)}
          options={TREND_FILTER_OPTIONS}
        />
        <span style={{ fontSize: 14, color: 'var(--semi-color-text-2)', whiteSpace: 'nowrap' }}>最低价</span>
        <InputNumber
          min={0}
          placeholder="不限"
          value={minPrice}
          onChange={onMinPriceChange}
          style={{ width: 100 }}
          innerButtons
        />
        <span style={{ fontSize: 14, color: 'var(--semi-color-text-2)', whiteSpace: 'nowrap' }}>最高价</span>
        <InputNumber
          min={0}
          placeholder="不限"
          value={maxPrice}
          onChange={onMaxPriceChange}
          style={{ width: 100 }}
          innerButtons
        />
        {priceError && (
          <Typography.Text type="danger" size="small" style={{ whiteSpace: 'nowrap' }}>
            {priceError}
          </Typography.Text>
        )}
      </div>

      {recentViews.length > 0 && (
        <div className="recent-views-section" style={{ alignSelf: 'stretch', marginTop: 4 }}>
          <Typography.Text type="secondary" size="small" style={{ marginRight: 8 }}>
            最近浏览：
          </Typography.Text>
          {recentViews.map((item) => (
            <Tag
              key={item.name}
              color="white"
              size="small"
              style={{ cursor: 'pointer', marginBottom: 4 }}
              onClick={() => onNavigate(`/item/${encodeURIComponent(item.name)}`)}
            >
              {item.name}
              <Typography.Text type="tertiary" style={{ marginLeft: 4, fontSize: 11 }}>
                {dayjs(item.timestamp).format('HH:mm')}
              </Typography.Text>
            </Tag>
          ))}
        </div>
      )}
    </div>
  );
}
