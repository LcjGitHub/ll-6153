import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconArrowDown, IconArrowUp, IconHistogram, IconStar, IconStarStroked } from '@douyinfe/semi-icons';
import { Table, Typography, Button } from '@douyinfe/semi-ui';
import type { ColumnProps } from '@douyinfe/semi-ui/lib/es/table';
import dayjs from 'dayjs';
import { FilterBar } from '../components/FilterBar';
import { FilterPresetSelector } from '../components/FilterPresetSelector';
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
import { getRecentViews, getFavorites, toggleFavorite } from '../utils/storage';
import type { RecentViewItem } from '../utils/storage';
import type { FilterPreset } from '../utils/filterPreset';

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
  const [favorites, setFavorites] = useState<string[]>([]);

  const priceRange: PriceRange = { min: minPrice, max: maxPrice };

  const refreshFavorites = () => setFavorites(getFavorites());

  useEffect(() => {
    setRecentViews(getRecentViews());
    refreshFavorites();
    const handleStorage = () => {
      setRecentViews(getRecentViews());
      refreshFavorites();
    };
    const handleFocus = () => {
      setRecentViews(getRecentViews());
      refreshFavorites();
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const handleFavoriteClick = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(name);
    refreshFavorites();
  };

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

  const handleLoadPreset = (preset: FilterPreset) => {
    setKeyword(preset.keyword);
    setCategory(preset.category);
    setTrendFilter(preset.trendFilter);
    const nextMin = preset.minPrice;
    const nextMax = preset.maxPrice;
    const nextRange: PriceRange = { min: nextMin, max: nextMax };
    const error = validatePriceRange(nextRange);
    setPriceError(error);
    setMinPrice(nextMin);
    setMaxPrice(nextMax);
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
    {
      title: '操作',
      dataIndex: 'favorite',
      width: 80,
      render: (_: unknown, record: VegetablePrice) => {
        const isFav = favorites.includes(record.name);
        return (
          <Button
            icon={isFav ? <IconStar style={{ color: '#F7BA1E' }} /> : <IconStarStroked />}
            theme="borderless"
            size="small"
            onClick={(e) => handleFavoriteClick(record.name, e as React.MouseEvent)}
          />
        );
      },
    },
  ];

  return (
    <div className="page">
      <header className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div>
            <Typography.Title heading={3}>菜市场均价公示</Typography.Title>
            <Typography.Text type="secondary">
              数据日期：{dayjs().format('YYYY-MM-DD')} · Mock 数据，仅供参考
            </Typography.Text>
          </div>
          <Button
            icon={<IconHistogram />}
            onClick={() => navigate('/品类统计')}
          >
            查看品类统计
          </Button>
          <Button
            icon={<IconStar style={{ color: '#F7BA1E' }} />}
            onClick={() => navigate('/收藏')}
          >
            我的收藏
          </Button>
        </div>
        <FilterBar
          keyword={keyword}
          onKeywordChange={setKeyword}
          category={category}
          onCategoryChange={setCategory}
          trendFilter={trendFilter}
          onTrendFilterChange={setTrendFilter}
          minPrice={minPrice}
          onMinPriceChange={handleMinPriceChange}
          maxPrice={maxPrice}
          onMaxPriceChange={handleMaxPriceChange}
          priceError={priceError}
          recentViews={recentViews}
          onNavigate={navigate}
          presetSelector={
            <FilterPresetSelector
              keyword={keyword}
              category={category}
              trendFilter={trendFilter}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onLoadPreset={handleLoadPreset}
            />
          }
        />
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
