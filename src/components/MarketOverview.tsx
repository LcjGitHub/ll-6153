import { Card, Typography } from '@douyinfe/semi-ui';
import { IconArrowUp, IconArrowDown, IconMinus, IconHistogram } from '@douyinfe/semi-icons';
import type { MarketOverviewStats } from '../utils/price';

interface MarketOverviewProps {
  stats: MarketOverviewStats;
  onSavePreset?: () => void;
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

/**
 * 今日市场概览卡片组
 *
 * 用四个卡片分别展示当前菜价列表中的：
 * - 涨价菜品数量（图标红色上箭头）
 * - 降价菜品数量（图标绿色下箭头）
 * - 持平菜品数量（图标灰色横线）
 * - 可见菜品的平均价格（图标蓝色柱图）
 *
 * 卡片采用响应式弹性布局，窄屏下会自动换行，
 * 数据随传入的 stats 联动更新。
 */
export function MarketOverview({ stats, onSavePreset }: MarketOverviewProps) {
  const { upCount, downCount, flatCount, avgPrice } = stats;

  const cards = [
    {
      title: '涨价菜品',
      value: upCount,
      unit: '种',
      icon: IconArrowUp,
      iconBg: 'rgba(255, 77, 79, 0.12)',
      iconColor: 'var(--semi-color-danger)',
    },
    {
      title: '降价菜品',
      value: downCount,
      unit: '种',
      icon: IconArrowDown,
      iconBg: 'rgba(0, 180, 42, 0.12)',
      iconColor: 'var(--semi-color-success)',
    },
    {
      title: '持平菜品',
      value: flatCount,
      unit: '种',
      icon: IconMinus,
      iconBg: 'rgba(118, 121, 128, 0.15)',
      iconColor: 'var(--semi-color-text-2)',
    },
    {
      title: '平均价格',
      value: avgPrice.toFixed(2),
      unit: '元/斤',
      icon: IconHistogram,
      iconBg: 'rgba(22, 93, 255, 0.12)',
      iconColor: 'var(--semi-color-primary)',
    },
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 4,
      }}
    >
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card
            key={card.title}
            bodyStyle={{ padding: 0 }}
            style={{ flex: '1 1 240px', minWidth: 220 }}
          >
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
                {onSavePreset && (
                  <Typography.Text
                    link={{
                      onClick: onSavePreset,
                    }}
                    style={{ fontSize: 12, marginTop: 2 }}
                  >
                    保存为方案
                  </Typography.Text>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
