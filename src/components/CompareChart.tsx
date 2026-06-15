import { useMemo } from 'react';
import { LineChart } from '@visactor/react-vchart';
import dayjs from 'dayjs';
import type { VegetablePrice } from '../types/vegetable';

const COLORS = ['#0064FA', '#FF7D00', '#00B42A'];

interface CompareChartProps {
  vegetables: VegetablePrice[];
}

/**
 * 多菜品对比折线图（VChart）
 *
 * 在同一折线图中用不同颜色曲线展示多个菜品的近 7 日均价走势。
 * 每条曲线对应一个菜品，顶部图例标明菜名，横轴为日期，纵轴为价格。
 *
 * @param vegetables - 要对比的菜品数据数组，每项需包含 name 和 history7d
 *
 * 特性说明：
 * - 使用 seriesField 按菜名区分不同系列
 * - 最多支持 3 种颜色（蓝、橙、绿），与选择上限保持一致
 * - 数据点可见，hover 时显示对应菜品的价格
 * - 横轴日期格式为 MM-DD
 */
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
