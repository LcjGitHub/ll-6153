import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Typography, Button } from '@douyinfe/semi-ui';
import { IconArrowLeft, IconGift, IconLayers, IconBox, IconMore } from '@douyinfe/semi-icons';
import dayjs from 'dayjs';
import { CategoryBarChart } from '../components/CategoryBarChart';
import { getCategoryStats } from '../utils/price';
import type { CategoryStat } from '../utils/price';
import type { VegetableCategory } from '../types/vegetable';

const categoryIcons: Record<VegetableCategory, typeof IconGift> = {
  叶菜: IconGift,
  根茎: IconLayers,
  瓜果: IconBox,
  调味: IconMore,
};

const categoryColors: Record<VegetableCategory, { bg: string; color: string }> = {
  叶菜: { bg: 'rgba(0, 180, 42, 0.12)', color: 'var(--semi-color-success)' },
  根茎: { bg: 'rgba(255, 140, 0, 0.12)', color: '#FF8C00' },
  瓜果: { bg: 'rgba(255, 77, 79, 0.12)', color: 'var(--semi-color-danger)' },
  调味: { bg: 'rgba(136, 78, 189, 0.12)', color: '#884EBD' },
};

const cardStyle = {
  padding: '20px 24px',
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 12,
};

const iconWrapperStyle = (bgColor: string) => ({
  width: 56,
  height: 56,
  borderRadius: 14,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: bgColor,
  flexShrink: 0,
});

export function CategoryStatsPage() {
  const navigate = useNavigate();
  const stats = useMemo(() => getCategoryStats(), []);
  const statList = useMemo(() => Object.values(stats) as CategoryStat[], [stats]);

  return (
    <div className="page">
      <header className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Button
            icon={<IconArrowLeft />}
            theme="borderless"
            onClick={() => navigate('/')}
          />
          <div>
            <Typography.Title heading={3}>品类均价汇总</Typography.Title>
            <Typography.Text type="secondary">
              数据日期：{dayjs().format('YYYY-MM-DD')} · 按叶菜、根茎、瓜果、调味分类统计
            </Typography.Text>
          </div>
        </div>
      </header>

      <section>
        <Typography.Title heading={5} style={{ marginBottom: 12 }}>
          各品类统计概览
        </Typography.Title>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 16,
            marginBottom: 24,
          }}
        >
          {statList.map((stat) => {
            const Icon = categoryIcons[stat.category];
            const colors = categoryColors[stat.category];
            return (
              <Card
                key={stat.category}
                bodyStyle={{ padding: 0 }}
                style={{ flex: '1 1 260px', minWidth: 240 }}
              >
                <div style={cardStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={iconWrapperStyle(colors.bg)}>
                      <Icon size="large" style={{ color: colors.color }} />
                    </div>
                    <Typography.Text strong style={{ fontSize: 16 }}>
                      {stat.category}
                    </Typography.Text>
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 1fr',
                      gap: 12,
                      paddingTop: 8,
                      borderTop: '1px solid var(--semi-color-border)',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                        菜品数量
                      </Typography.Text>
                      <Typography.Title heading={5} style={{ margin: 0 }}>
                        {stat.count}
                        <Typography.Text type="tertiary" style={{ fontSize: 12, fontWeight: 'normal' }}>
                          {' '}种
                        </Typography.Text>
                      </Typography.Title>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                        平均价格
                      </Typography.Text>
                      <Typography.Title heading={5} style={{ margin: 0 }}>
                        {stat.avgPrice.toFixed(2)}
                        <Typography.Text type="tertiary" style={{ fontSize: 12, fontWeight: 'normal' }}>
                          {' '}元
                        </Typography.Text>
                      </Typography.Title>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                        涨价占比
                      </Typography.Text>
                      <Typography.Title heading={5} style={{ margin: 0, color: 'var(--semi-color-danger)' }}>
                        {stat.upRatio}
                        <Typography.Text type="tertiary" style={{ fontSize: 12, fontWeight: 'normal' }}>
                          {' '}%
                        </Typography.Text>
                      </Typography.Title>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <section>
        <Typography.Title heading={5} style={{ marginBottom: 12 }}>
          均价对比
        </Typography.Title>
        <Card bodyStyle={{ padding: 16 }}>
          <CategoryBarChart stats={statList} />
        </Card>
      </section>
    </div>
  );
}
