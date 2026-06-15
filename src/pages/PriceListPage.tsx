import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconArrowDown, IconArrowUp, IconSearch } from '@douyinfe/semi-icons';
import { Button, Input, InputNumber, Radio, Select, Table, Tag, Typography } from '@douyinfe/semi-ui';
import type { ColumnProps } from '@douyinfe/semi-ui/lib/es/table';
import dayjs from 'dayjs';
import { PriceChange } from '../components/PriceChange';
import { MarketOverview } from '../components/MarketOverview';
import type { VegetableCategory, VegetablePrice } from '../types/vegetable';
import {
  filterVegetables,
  formatPriceRangeDescription,
  formatTrendFilterDescription,
  getMarketOverviewStats,
  getNextSortState,
  sortVegetables,
  validatePriceRange,
} from '../utils/price';
import type { PriceRange, SortField, SortState, TrendFilter } from '../utils/price';
import { getRecentViews } from '../utils/storage';
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

/**
 * 今日菜价公示页
 */
export function PriceListPage() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState<VegetableCategory | ''>('');
  const [trendFilter, setTrendFilter] = useState<TrendFilter>('all');
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [sortState, setSortState] = useState<SortState>({ field: null, order: null });
  const [recentViews, setRecentViews] = useState<RecentViewItem[]>([]);

  const priceRange: PriceRange = { min: minPrice, max: maxPrice };

  useEffect(() => {
    setRecentViews(getRecentViews());
    const handleStorage = () => setRecentViews(getRecentViews());
    const handleFocus = () => setRecentViews(getRecentViews());
    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const handleSortClick = (field: SortField) => {
    setSortState((prev) => getNextSortState(prev, field));
  };

  const handleMinPriceChange = (value: number | string | null | undefined) => {
    const num = value === null || value === undefined || value === '' ? undefined : Number(value);
    const nextRange: PriceRange = { min: num, max: maxPrice };
    const error = validatePriceRange(nextRange);
    setPriceError(error);
    setMinPrice(num);
  };

  const handleMaxPriceChange = (value: number | string | null | undefined) => {
    const num = value === null || value === undefined || value === '' ? undefined : Number(value);
    const nextRange: PriceRange = { min: minPrice, max: num };
    const error = validatePriceRange(nextRange);
    setPriceError(error);
    setMaxPrice(num);
  };

  const filtered = useMemo(
    () => (priceError ? [] : filterVegetables(keyword, category, priceRange, trendFilter)),
    [keyword, category, priceRange, priceError, trendFilter],
  );
  const dataSource = useMemo(() => sortVegetables(filtered, sortState), [filtered, sortState]);
  const overviewStats = useMemo(() => getMarketOverviewStats(dataSource), [dataSource]);

  const renderSortIcon = (field: SortField) => {
    const sortIconStyle: React.CSSProperties = {
      marginLeft: 4,
      color: 'var(--semi-color-primary)',
    };
    if (sortState.field !== field) {
      return null;
    }
    if (sortState.order === 'asc') {
      return <IconArrowUp size="small" style={sortIconStyle} />;
    }
    if (sortState.order === 'desc') {
      return <IconArrowDown size="small" style={sortIconStyle} />;
    }
    return null;
  };

  const sortableHeaderCell = (field: SortField) => ({
    onClick: () => handleSortClick(field),
    style: { cursor: 'pointer' as const, userSelect: 'none' as const },
  });

  const columns: ColumnProps<VegetablePrice>[] = [
    {
      title: '菜品',
      dataIndex: 'name',
      width: 140,
      render: (name: string) => <Typography.Text strong>{name}</Typography.Text>,
    },
    {
      title: (
        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
          今日均价
          {renderSortIcon('avgPrice')}
        </span>
      ),
      dataIndex: 'avgPrice',
      width: 180,
      onHeaderCell: () => sortableHeaderCell('avgPrice'),
      render: (_price: number, record: VegetablePrice) => (
        <PriceChange avgPrice={record.avgPrice} prevPrice={record.prevPrice} />
      ),
    },
    {
      title: '单位',
      dataIndex: 'unit',
      width: 100,
    },
    {
      title: (
        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
          昨日均价
          {renderSortIcon('prevPrice')}
        </span>
      ),
      dataIndex: 'prevPrice',
      width: 120,
      onHeaderCell: () => sortableHeaderCell('prevPrice'),
      render: (price: number) => price.toFixed(2),
    },
  ];

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <Typography.Title heading={3}>菜市场均价公示</Typography.Title>
          <Typography.Text type="secondary">
            数据日期：{dayjs().format('YYYY-MM-DD')} · Mock 数据，仅供参考
          </Typography.Text>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button onClick={() => navigate('/排行榜')}>
              查看涨跌排行榜
            </Button>
            <Button onClick={() => navigate('/对比')}>
              多菜品走势对比
            </Button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
            <span style={{ fontSize: 14, color: 'var(--semi-color-text-2)', whiteSpace: 'nowrap' }}>品类</span>
            <Select
              value={category}
              onChange={(value) => setCategory(value as VegetableCategory | '')}
              optionList={CATEGORY_OPTIONS}
              style={{ width: 120 }}
            />
            <Input
              prefix={<IconSearch />}
              placeholder="按菜名搜索"
              value={keyword}
              onChange={setKeyword}
              showClear
              style={{ width: 260 }}
            />
            <Radio.Group
              type="button"
              value={trendFilter}
              onChange={(e) => setTrendFilter(e.target.value as TrendFilter)}
              options={TREND_FILTER_OPTIONS}
            />
            <span style={{ fontSize: 14, color: 'var(--semi-color-text-2)', whiteSpace: 'nowrap' }}>最低价</span>
            <InputNumber
              min={0}
              placeholder="不限"
              value={minPrice}
              onChange={handleMinPriceChange}
              style={{ width: 100 }}
              innerButtons
            />
            <span style={{ fontSize: 14, color: 'var(--semi-color-text-2)', whiteSpace: 'nowrap' }}>最高价</span>
            <InputNumber
              min={0}
              placeholder="不限"
              value={maxPrice}
              onChange={handleMaxPriceChange}
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
                  onClick={() => navigate(`/item/${encodeURIComponent(item.name)}`)}
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
      </header>

      <section>
        <Typography.Title heading={5} style={{ marginBottom: 12 }}>
          今日市场概览
        </Typography.Title>
        <MarketOverview stats={overviewStats} />
      </section>

      <Table
        columns={columns}
        dataSource={dataSource}
        rowKey="name"
        pagination={false}
        onRow={(record) => ({
          onClick: () => {
            if (record) {
              navigate(`/item/${encodeURIComponent(record.name)}`);
            }
          },
          style: { cursor: 'pointer' },
        })}
        empty={
          <Typography.Text type="secondary">
            {(() => {
              const trendDesc = formatTrendFilterDescription(trendFilter);
              const rangeDesc =
                (minPrice !== undefined || maxPrice !== undefined) && !priceError
                  ? formatPriceRangeDescription(priceRange)
                  : '';
              const parts: string[] = [];
              if (category) parts.push(`${category}品类下`);
              const conditions: string[] = [];
              if (keyword.trim()) conditions.push(`「${keyword.trim()}」`);
              if (trendDesc) conditions.push(trendDesc);
              if (rangeDesc) conditions.push(`均价${rangeDesc}`);
              const condStr = conditions.length > 0 ? conditions.join('且') : '';
              if (parts.length === 0 && condStr === '') return '暂无菜品数据';
              if (condStr === '') return `${parts.join('')}暂无菜品`;
              return `${parts.join('')}未找到${condStr}的菜品`;
            })()}
          </Typography.Text>
        }
      />

      <Typography.Text type="tertiary" className="page-hint">
        点击表格行查看该菜品近 7 日走势
      </Typography.Text>
    </div>
  );
}
