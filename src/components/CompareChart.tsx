import { useMemo } from 'react';
import { LineChart } from '@visactor/react-vchart';
import dayjs from 'dayjs';
import type { VegetablePrice } from '../types/vegetable';

const COLORS = ['#0064FA', '#FF7D00', '#00B42A'];

interface CompareChartProps {
  vegetables: VegetablePrice[];
}

export function CompareChart({ vegetables }: CompareChartProps) {
  const chartData = useMemo(() => {
    const data: Array<{ date: string; price: number; name: string }> = [];
    vegetables.forEach((veg) => {
      veg.history7d.forEach((point) => {
        data.push({
          date: dayjs(point.date).format('MM-DD'),
          price: point.price,
          name: veg.name,
        });
      });
    });
    return data;
  }, [vegetables]);

  const spec = useMemo(
    () => ({
      type: 'line' as const,
      data: [{ id: 'compareData', values: chartData }],
      xField: 'date',
      yField: 'price',
      seriesField: 'name',
      title: {
        visible: true,
        text: '多菜品近 7 日均价走势对比',
        subtext: `共 ${vegetables.length} 个菜品`,
      },
      point: {
        visible: true,
      },
      line: {
        style: {
          lineWidth: 2,
        },
      },
      color: COLORS.slice(0, vegetables.length),
      legend: {
        visible: true,
        position: 'top' as const,
      },
      tooltip: {
        mark: {
          title: { visible: false },
          content: [{ key: 'name', value: 'price' }],
        },
      },
      axes: [
        {
          orient: 'left' as const,
          title: { visible: true, text: '元/斤' },
        },
        {
          orient: 'bottom' as const,
          title: { visible: true, text: '日期' },
        },
      ],
    }),
    [chartData, vegetables.length],
  );

  return (
    <div style={{ width: '100%', height: 420 }}>
      <LineChart spec={spec} />
    </div>
  );
}
