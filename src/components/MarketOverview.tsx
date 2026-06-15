import { Card, Typography } from '@douyinfe/semi-ui';
import { IconArrowUp, IconArrowDown, IconMinus, IconHistogram } from '@douyinfe/semi-icons';
import type { MarketOverviewStats } from '../utils/price';

interface MarketOverviewProps {
  stats: MarketOverviewStats;
}

const cardStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 16,
  padding: '16px 20px',
};

const iconWrapperStyle = (color: string) => ({
  width: 48,
  height: 48,
  borderRadius: 12,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: color,
  flexShrink: 0,
});

export function MarketOverview({ stats }: MarketOverviewProps) {
  const { upCount, downCount, flatCount, avgPrice } = stats;

  const cards = [
    {
      title: '涨价菜品',
      value: upCount,
      unit: '种',
      icon: IconArrowUp,
      iconBg: 'rgba(var(--semi-red-0), 0.15)',
      iconColor: 'var(--semi-color-danger)',
    },
    {
      title: '降价菜品',
      value: downCount,
      unit: '种',
      icon: IconArrowDown,
      iconBg: 'rgba(var(--semi-green-0), 0.15)',
      iconColor: 'var(--semi-color-success)',
    },
    {
      title: '持平菜品',
      value: flatCount,
      unit: '种',
      icon: IconMinus,
      iconBg: 'rgba(var(--semi-grey-1), 0.6)',
      iconColor: 'var(--semi-color-text-2)',
    },
    {
      title: '平均价格',
      value: avgPrice.toFixed(2),
      unit: '元/斤',
      icon: IconHistogram,
      iconBg: 'rgba(var(--semi-blue-0), 0.15)',
      iconColor: 'var(--semi-color-primary)',
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 16,
        marginBottom: 20,
      }}
    >
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} bodyStyle={{ padding: 0 }}>
            <div style={cardStyle}>
              <div style={iconWrapperStyle(card.iconBg)}>
                <Icon size="large" style={{ color: card.iconColor }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                  {card.title}
                </Typography.Text>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <Typography.Title heading={4} style={{ margin: 0 }}>
                    {card.value}
                  </Typography.Title>
                  <Typography.Text type="tertiary" style={{ fontSize: 12 }}>
                    {card.unit}
                  </Typography.Text>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
