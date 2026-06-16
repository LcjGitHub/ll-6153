import { useMemo } from 'react';
import { BarChart } from '@visactor/react-vchart';
import type { ISpec } from '@visactor/vchart';
import type { CategoryStat } from '../utils/price';

interface CategoryBarChartProps {
  stats: CategoryStat[];
}

/**
 * 品类均价对比柱状图（VChart）
 */
export function CategoryBarChart({ stats }: CategoryBarChartProps) {
  const chartData = useMemo(
    () =>
      stats.map((stat) => ({
        category: stat.category,
        avgPrice: stat.avgPrice,
      })),
    [stats],
  );

  const spec = useMemo<ISpec>(
    () =>
      ({
        type: 'bar',
        data: [{ id: 'barData', values: chartData }],
        xField: 'category',
        yField: 'avgPrice',
        title: {
          visible: true,
          text: '四类菜品均价对比',
          subtext: '单位：元/斤',
        },
        bar: {
          style: {
            fill: '#0064FA',
            radius: [4, 4, 0, 0],
          },
        },
        label: {
          visible: true,
          position: 'top',
          style: {
            fill: 'var(--semi-color-text-0)',
            fontSize: 12,
          },
          formatMethod: (_text, datum) => {
            const d = datum as { avgPrice: number } | undefined;
            if (d && d.avgPrice !== undefined) {
              return `${d.avgPrice.toFixed(2)} 元`;
            }
            return '';
          },
        },
        tooltip: {
          mark: {
            title: { visible: false },
            content: [{ key: 'category', value: 'avgPrice' }],
          },
        },
        axes: [
          {
            orient: 'left',
            title: { visible: true, text: '均价（元/斤）' },
          },
          {
            orient: 'bottom',
            title: { visible: true, text: '品类' },
          },
        ],
      }) as ISpec,
    [chartData],
  );

  return (
    <div style={{ width: '100%', height: 360 }}>
      <BarChart spec={spec} />
    </div>
  );
}
