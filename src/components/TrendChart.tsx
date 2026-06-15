import { useMemo } from 'react';
import { LineChart } from '@visactor/react-vchart';
import dayjs from 'dayjs';
import type { PriceHistoryPoint } from '../types/vegetable';

interface TrendChartProps {
  name: string;
  unit: string;
  history7d: PriceHistoryPoint[];
}

/**
 * 7 日均价折线图（VChart）
 */
export function TrendChart({ name, unit, history7d }: TrendChartProps) {
  const chartData = useMemo(
    () =>
      history7d.map((point) => ({
        date: dayjs(point.date).format('MM-DD'),
        price: point.price,
      })),
    [history7d],
  );

  const spec = useMemo(
    () => ({
      type: 'line' as const,
      data: [{ id: 'priceData', values: chartData }],
      xField: 'date',
      yField: 'price',
      title: {
        visible: true,
        text: `${name} · 近 7 日均价走势`,
        subtext: `单位：${unit}`,
      },
      point: {
        visible: true,
        style: {
          fill: '#0064FA',
        },
      },
      line: {
        style: {
          stroke: '#0064FA',
          lineWidth: 2,
        },
      },
      tooltip: {
        mark: {
          title: { visible: false },
          content: [{ key: 'date', value: 'price' }],
        },
      },
      axes: [
        {
          orient: 'left' as const,
          title: { visible: true, text: unit },
        },
        {
          orient: 'bottom' as const,
          title: { visible: true, text: '日期' },
        },
      ],
    }),
    [chartData, name, unit],
  );

  return (
    <div style={{ width: '100%', height: 420 }}>
      <LineChart spec={spec} />
    </div>
  );
}
