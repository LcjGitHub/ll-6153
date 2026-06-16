import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconArrowLeft, IconArrowDown, IconArrowUp, IconMinus } from '@douyinfe/semi-icons';
import { Table, Typography, Button } from '@douyinfe/semi-ui';
import type { ColumnProps } from '@douyinfe/semi-ui/lib/es/table';
import type { VegetablePrice } from '../types/vegetable';
import { findVegetableByName, formatPrice, getPriceChange, getPriceTrend } from '../utils/price';
import type { PriceTrend } from '../types/vegetable';
import { getFavorites, removeFavorite } from '../utils/storage';

export function FavoritesPage() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<string[]>([]);

  const refreshFavorites = () => setFavorites(getFavorites());

  useEffect(() => {
    refreshFavorites();
    const handleStorage = () => refreshFavorites();
    const handleFocus = () => refreshFavorites();
    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const dataSource = useMemo(() => {
    return favorites
      .map((name) => findVegetableByName(name))
      .filter((item): item is VegetablePrice => item !== undefined);
  }, [favorites]);

  const handleRemoveFavorite = (name: string) => {
    removeFavorite(name);
    refreshFavorites();
  };

  const trendConfig: Record<
    PriceTrend,
    { color: string; Icon: typeof IconArrowUp | typeof IconArrowDown | typeof IconMinus }
  > = {
    up: { color: 'var(--semi-color-danger)', Icon: IconArrowUp },
    down: { color: 'var(--semi-color-success)', Icon: IconArrowDown },
    flat: { color: 'var(--semi-color-text-2)', Icon: IconMinus },
  };

  const columns: ColumnProps<VegetablePrice>[] = [
    {
      title: '菜名',
      dataIndex: 'name',
      width: 140,
      render: (name: string) => <Typography.Text strong>{name}</Typography.Text>,
    },
    {
      title: '今日均价',
      dataIndex: 'avgPrice',
      width: 140,
      render: (price: number) => `${formatPrice(price)} 元`,
    },
    {
      title: '涨跌金额',
      dataIndex: 'change',
      width: 140,
      render: (_: unknown, record: VegetablePrice) => {
        const change = getPriceChange(record.avgPrice, record.prevPrice);
        const trend = getPriceTrend(record.avgPrice, record.prevPrice);
        const { color, Icon } = trendConfig[trend];
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Icon style={{ color }} size="small" />
            <Typography.Text style={{ color }}>
              {trend === 'up' ? '+' : ''}
              {change.toFixed(2)} 元
            </Typography.Text>
          </span>
        );
      },
    },
    {
      title: '操作',
      dataIndex: 'action',
      width: 120,
      render: (_: unknown, record: VegetablePrice) => (
        <Button
          type="danger"
          theme="borderless"
          size="small"
          onClick={() => handleRemoveFavorite(record.name)}
        >
          取消收藏
        </Button>
      ),
    },
  ];

  return (
    <div className="page">
      <header className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Button
            icon={<IconArrowLeft />}
            onClick={() => navigate('/')}
          >
            返回菜价表
          </Button>
          <div>
            <Typography.Title heading={3}>我的收藏</Typography.Title>
            <Typography.Text type="secondary">
              共收藏 {dataSource.length} 道菜品
            </Typography.Text>
          </div>
        </div>
      </header>

      <Table
        columns={columns}
        dataSource={dataSource}
        rowKey="name"
        pagination={false}
        empty={
          <Typography.Text type="secondary">
            暂无收藏菜品，快去菜价表点击星星收藏喜欢的菜品吧～
          </Typography.Text>
        }
      />
    </div>
  );
}
