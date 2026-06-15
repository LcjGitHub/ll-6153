import { useState } from 'react';
import { IconDownload } from '@douyinfe/semi-icons';
import { Button, Toast } from '@douyinfe/semi-ui';
import dayjs from 'dayjs';
import type { RefObject } from 'react';
import type { VChart as VChartType } from '@visactor/vchart';

interface ChartExportButtonProps {
  chartRef: RefObject<VChartType | null>;
  dishName: string;
}

export function ChartExportButton({ chartRef, dishName }: ChartExportButtonProps) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    const chart = chartRef.current;
    if (!chart) {
      Toast.warning('图表尚未加载完成');
      return;
    }

    setExporting(true);
    try {
      const dateStr = dayjs().format('YYYY-MM-DD');
      const fileName = `${dishName}_走势_${dateStr}`;
      await chart.exportImg(fileName);
      Toast.success('图片已保存');
    } catch (error) {
      console.error('Export failed:', error);
      Toast.error('导出失败，请重试');
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button
      icon={<IconDownload />}
      theme="borderless"
      loading={exporting}
      onClick={handleExport}
    >
      保存图片
    </Button>
  );
}
