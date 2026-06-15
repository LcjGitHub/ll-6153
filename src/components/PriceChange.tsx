import { IconArrowDown, IconArrowUp, IconMinus } from '@douyinfe/semi-icons';
import { Typography } from '@douyinfe/semi-ui';
import type { PriceTrend } from '../types/vegetable';
import { formatPrice, getPriceChange } from '../utils/price';

interface PriceChangeProps {
  avgPrice: number;
  prevPrice: number;
}

const trendConfig: Record<
  PriceTrend,
  { color: string; Icon: typeof IconArrowUp | typeof IconArrowDown | typeof IconMinus }
> = {
  up: { color: 'var(--semi-color-danger)', Icon: IconArrowUp },
  down: { color: 'var(--semi-color-success)', Icon: IconArrowDown },
  flat: { color: 'var(--semi-color-text-2)', Icon: IconMinus },
};

/**
 * 展示均价及相对昨日涨跌箭头
 */
export function PriceChange({ avgPrice, prevPrice }: PriceChangeProps) {
  const change = getPriceChange(avgPrice, prevPrice);
  const trend: PriceTrend =
    change > 0 ? 'up' : change < 0 ? 'down' : 'flat';
  const { color, Icon } = trendConfig[trend];

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <Typography.Text strong>{formatPrice(avgPrice)}</Typography.Text>
      <Icon style={{ color }} size="small" />
      {trend !== 'flat' && (
        <Typography.Text style={{ color, fontSize: 12 }}>
          {Math.abs(change).toFixed(2)}
        </Typography.Text>
      )}
    </span>
  );
}
