import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconArrowLeft } from '@douyinfe/semi-icons';
import { Button, Card, Empty, Select, Typography } from '@douyinfe/semi-ui';
import dayjs from 'dayjs';
import { CompareChart } from '../components/CompareChart';
import { vegetablePrices } from '../utils/price';

const MAX_SELECT = 3;

export function ComparePage() {
  const navigate = useNavigate();
  const [selectedNames, setSelectedNames] = useState<string[]>([]);

  const options = useMemo(
    () =>
      vegetablePrices.map((item) => ({
        label: item.name,
        value: item.name,
      })),
    [],
  );

  const selectedVegetables = useMemo(
    () =>
      selectedNames
        .map((name) => vegetablePrices.find((v) => v.name === name))
        .filter((v): v is NonNullable<typeof v> => Boolean(v)),
    [selectedNames],
  );

  const handleChange = (value: any) => {
    const values = Array.isArray(value) ? (value as string[]) : [];
    if (values.length <= MAX_SELECT) {
      setSelectedNames(values);
    }
  };

  const handleClear = () => {
    setSelectedNames([]);
  };

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
            <Typography.Title heading={3}>多菜品走势对比</Typography.Title>
            <Typography.Text type="secondary">
              选择最多 {MAX_SELECT} 个菜品进行近 7 日均价走势对比 · 数据日期：
              {dayjs().format('YYYY-MM-DD')}
            </Typography.Text>
          </div>
        </div>
      </header>

      <Card>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', marginBottom: 20 }}>
          <div style={{ flex: 1 }}>
            <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
              选择菜品（最多 {MAX_SELECT} 个）
            </Typography.Text>
            <Select
              multiple
              placeholder="请选择要对比的菜品"
              value={selectedNames}
              onChange={handleChange}
              optionList={options}
              style={{ width: '100%' }}
              maxTagCount={MAX_SELECT}
            />
          </div>
          <Button onClick={handleClear} disabled={selectedNames.length === 0}>
            清空选择
          </Button>
          <Button theme="solid" type="primary" onClick={() => navigate('/')}>
            返回菜价表
          </Button>
        </div>

        {selectedVegetables.length > 0 ? (
          <CompareChart vegetables={selectedVegetables} />
        ) : (
          <Empty
            title="请选择菜品"
            description="从上方下拉框中选择要对比的菜品，最多可选 3 个"
            style={{ padding: '40px 0' }}
          />
        )}
      </Card>
    </div>
  );
}
