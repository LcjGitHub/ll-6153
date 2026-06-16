import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconArrowLeft } from '@douyinfe/semi-icons';
import { Button, Table, Typography } from '@douyinfe/semi-ui';
import type { ColumnProps } from '@douyinfe/semi-ui/lib/es/table';
import dayjs from 'dayjs';
import type { FluctuationRankingItem } from '../utils/price';
import { formatPrice, getFluctuationRanking } from '../utils/price';

function FluctuationTable({
  title,
  data,
}: {
  title: string;
  data: FluctuationRankingItem[];
}) {
  const columns: ColumnProps<FluctuationRankingItem>[] = [
    {
      title: '菜名',
      dataIndex: 'name',
      render: (name: string) => <Typography.Text strong>{name}</Typography.Text>,
    },
    {
      title: '波动幅度（元）',
      dataIndex: 'fluctuation',
      render: (fluctuation: number) => formatPrice(fluctuation),
    },
    {
      title: '今日均价（元/斤）',
      dataIndex: 'avgPrice',
      render: (price: number) => formatPrice(price),
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

export function FluctuationRankingPage() {
  const navigate = useNavigate();
  const { mostFluctuated, mostStable } = useMemo(() => getFluctuationRanking(5), []);

  return (
    <div className="page">
      <header className="page-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 12 }}>
        <Button
          icon={<IconArrowLeft />}
          theme="borderless"
          onClick={() => navigate('/')}
        >
          返回菜价表
        </Button>
        <div>
          <Typography.Title heading={3}>价格波动排行榜</Typography.Title>
          <Typography.Text type="secondary">
            近七日价格波动幅度排行 · 更新至 {dayjs().format('YYYY-MM-DD')}
          </Typography.Text>
        </div>
      </header>

      <FluctuationTable
        title="🌊 波动最大前五"
        data={mostFluctuated}
      />

      <FluctuationTable
        title="⚖️ 最稳定前五"
        data={mostStable}
      />
    </div>
  );
}
