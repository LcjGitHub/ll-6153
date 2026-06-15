import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconSearch } from '@douyinfe/semi-icons';
import { Button, Input, Select, Table, Typography } from '@douyinfe/semi-ui';
import type { ColumnProps } from '@douyinfe/semi-ui/lib/es/table';
import dayjs from 'dayjs';
import { PriceChange } from '../components/PriceChange';
import { MarketOverview } from '../components/MarketOverview';
import type { VegetableCategory, VegetablePrice } from '../types/vegetable';
import { filterVegetables, getMarketOverviewStats } from '../utils/price';

const CATEGORY_OPTIONS = [
  { label: '全部', value: '' },
  { label: '叶菜', value: '叶菜' },
  { label: '根茎', value: '根茎' },
  { label: '瓜果', value: '瓜果' },
  { label: '调味', value: '调味' },
];

/**
 * 今日菜价公示页
 */
export function PriceListPage() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState<VegetableCategory | ''>('');

  const dataSource = useMemo(() => filterVegetables(keyword, category), [keyword, category]);
  const overviewStats = useMemo(() => getMarketOverviewStats(dataSource), [dataSource]);

  const columns: ColumnProps<VegetablePrice>[] = [
    {
      title: '菜品',
      dataIndex: 'name',
      width: 140,
      render: (name: string) => <Typography.Text strong>{name}</Typography.Text>,
    },
    {
      title: '今日均价',
      dataIndex: 'avgPrice',
      width: 180,
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
      title: '昨日均价',
      dataIndex: 'prevPrice',
      width: 120,
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Button onClick={() => navigate('/排行榜')}>
            查看涨跌排行榜
          </Button>
          <Button onClick={() => navigate('/对比')}>
            多菜品走势对比
          </Button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            <span style={{ fontSize: 14, color: 'var(--semi-color-text-2)', whiteSpace: 'nowrap', paddingRight: 6 }}>品类</span>
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
          </div>
        </div>
      </header>

      <MarketOverview stats={overviewStats} />

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
            {category && keyword.trim()
              ? `${category}品类下未找到「${keyword.trim()}」相关菜品`
              : category
                ? `${category}品类下暂无菜品`
                : keyword.trim()
                  ? `未找到「${keyword.trim()}」相关菜品`
                  : '暂无菜品数据'}
          </Typography.Text>
        }
      />

      <Typography.Text type="tertiary" className="page-hint">
        点击表格行查看该菜品近 7 日走势
      </Typography.Text>
    </div>
  );
}
