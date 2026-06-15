import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconArrowDown, IconArrowLeft, IconArrowUp } from '@douyinfe/semi-icons';
import { Button, Table, Typography } from '@douyinfe/semi-ui';
import type { ColumnProps } from '@douyinfe/semi-ui/lib/es/table';
import dayjs from 'dayjs';
import type { PriceRankingItem } from '../utils/price';
import { formatPrice, getPriceRanking } from '../utils/price';

function RankingTable({
  title,
  data,
  trendIcon,
  trendColor,
}: {
  title: string;
  data: PriceRankingItem[];
  trendIcon: 'up' | 'down';
  trendColor: string;
}) {
  const Icon = trendIcon === 'up' ? IconArrowUp : IconArrowDown;

  const columns: ColumnProps<PriceRankingItem>[] = [
    {
      title: '排名',
      width: 70,
      render: (_v: unknown, _r: PriceRankingItem, index: number) => (
        <Typography.Text strong>{index + 1}</Typography.Text>
      ),
    },
    {
      title: '菜名',
      dataIndex: 'name',
      width: 120,
      render: (name: string) => <Typography.Text strong>{name}</Typography.Text>,
    },
    {
      title: '今日均价（元/斤）',
      dataIndex: 'avgPrice',
      width: 160,
      render: (price: number) => formatPrice(price),
    },
    {
      title: '涨跌金额（元）',
      dataIndex: 'change',
      width: 150,
      render: (change: number) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: trendColor }}>
          <Icon size="small" />
          {Math.abs(change).toFixed(2)}
        </span>
      ),
    },
    {
      title: '方向',
      width: 80,
      render: () => (
        <Icon style={{ color: trendColor }} size="default" />
      ),
    },
  ];

  return (
    <div className="ranking-section">
      <Typography.Title heading={5} style={{ marginBottom: 12 }}>
        {title}
      </Typography.Title>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="name"
        pagination={false}
        size="small"
      />
    </div>
  );
}

export function RankingPage() {
  const navigate = useNavigate();
  const { topGainers, topLosers } = useMemo(() => getPriceRanking(5), []);

  return (
    <div className="page">
      <header className="page-header">
        <div className="page-header-row">
          <Button
            icon={<IconArrowLeft />}
            theme="borderless"
            onClick={() => navigate('/')}
          >
            返回菜价表
          </Button>
          <div>
            <Typography.Title heading={3}>菜价涨跌排行榜</Typography.Title>
            <Typography.Text type="secondary">
              今日相对昨日涨跌幅度排行 · 更新至 {dayjs().format('YYYY-MM-DD')}
            </Typography.Text>
          </div>
        </div>
      </header>

      <RankingTable
        title="🔥 涨价幅度前五"
        data={topGainers}
        trendIcon="up"
        trendColor="var(--semi-color-danger)"
      />

      <RankingTable
        title="💧 降价幅度前五"
        data={topLosers}
        trendIcon="down"
        trendColor="var(--semi-color-success)"
      />
    </div>
  );
}
