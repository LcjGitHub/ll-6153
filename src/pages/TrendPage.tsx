import { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { IconArrowLeft } from '@douyinfe/semi-icons';
import { Button, Card, Empty, Typography } from '@douyinfe/semi-ui';
import dayjs from 'dayjs';
import { TrendChart } from '../components/TrendChart';
import { PriceChange } from '../components/PriceChange';
import { findVegetableByName } from '../utils/price';

/**
 * 单品 7 日走势页
 */
export function TrendPage() {
  const navigate = useNavigate();
  const { name: encodedName } = useParams<{ name: string }>();
  const name = encodedName ? decodeURIComponent(encodedName) : '';

  const vegetable = useMemo(() => findVegetableByName(name), [name]);

  if (!vegetable) {
    return (
      <div className="page">
        <Empty
          title="未找到该菜品"
          description={`「${name}」不在 Mock 菜价列表中`}
        >
          <Link to="/">
            <Button theme="solid" type="primary">
              返回菜价表
            </Button>
          </Link>
        </Empty>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page-header">
        <div className="page-header-row">
          <Button
            icon={<IconArrowLeft />}
            theme="borderless"
            onClick={() => navigate(-1)}
          >
            返回
          </Button>
          <div>
            <Typography.Title heading={3}>{vegetable.name}</Typography.Title>
            <Typography.Text type="secondary">
              近 7 日均价走势 · 更新至 {dayjs().format('YYYY-MM-DD')}
            </Typography.Text>
          </div>
        </div>
      </header>

      <Card className="summary-card">
        <div className="summary-item">
          <Typography.Text type="secondary">今日均价</Typography.Text>
          <PriceChange
            avgPrice={vegetable.avgPrice}
            prevPrice={vegetable.prevPrice}
          />
        </div>
        <div className="summary-item">
          <Typography.Text type="secondary">单位</Typography.Text>
          <Typography.Text strong>{vegetable.unit}</Typography.Text>
        </div>
        <div className="summary-item">
          <Typography.Text type="secondary">7 日最高</Typography.Text>
          <Typography.Text strong>
            {Math.max(...vegetable.history7d.map((p) => p.price)).toFixed(2)}
          </Typography.Text>
        </div>
        <div className="summary-item">
          <Typography.Text type="secondary">7 日最低</Typography.Text>
          <Typography.Text strong>
            {Math.min(...vegetable.history7d.map((p) => p.price)).toFixed(2)}
          </Typography.Text>
        </div>
      </Card>

      <Card>
        <TrendChart
          name={vegetable.name}
          unit={vegetable.unit}
          history7d={vegetable.history7d}
        />
      </Card>
    </div>
  );
}
