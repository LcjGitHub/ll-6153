import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Checkbox, Empty, Toast, Typography } from '@douyinfe/semi-ui';
import dayjs from 'dayjs';
import { CompareChart } from '../components/CompareChart';
import { getVegetableNamesGroupedByCategory, vegetablePrices } from '../utils/price';

const MAX_SELECT = 3;

/**
 * 多菜品走势对比页
 *
 * 功能说明：
 * 1. 以勾选框列表形式展示全部菜品，供用户选择
 * 2. 最多可勾选 3 个菜品，超过时弹出 Toast 提示
 * 3. 在同一折线图中用不同颜色曲线展示各菜品近 7 日均价
 * 4. 提供「清空选择」和「返回菜价表」操作按钮
 */
export function ComparePage() {
  const navigate = useNavigate();
  const [selectedNames, setSelectedNames] = useState<string[]>([]);

  const groupedVegetables = useMemo(() => getVegetableNamesGroupedByCategory(), []);

  const selectedVegetables = useMemo(
    () =>
      selectedNames
        .map((name) => vegetablePrices.find((v) => v.name === name))
        .filter((v): v is NonNullable<typeof v> => Boolean(v)),
    [selectedNames],
  );

  const handleCheckboxChange = (name: string, checked: boolean) => {
    if (checked) {
      if (selectedNames.length >= MAX_SELECT) {
        Toast.warning('最多只能选择三种菜品');
        return;
      }
      setSelectedNames([...selectedNames, name]);
    } else {
      setSelectedNames(selectedNames.filter((n) => n !== name));
    }
  };

  const handleClear = () => {
    setSelectedNames([]);
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <Typography.Title heading={3}>多菜品走势对比</Typography.Title>
          <Typography.Text type="secondary">
            勾选最多 {MAX_SELECT} 个菜品进行近 7 日均价走势对比 · 数据日期：
            {dayjs().format('YYYY-MM-DD')}
          </Typography.Text>
        </div>
      </header>

      <Card>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
          <Typography.Text type="secondary">
            选择菜品（最多 {MAX_SELECT} 个）：
          </Typography.Text>
          <Button onClick={handleClear} disabled={selectedNames.length === 0}>
            清空选择
          </Button>
          <Button theme="solid" type="primary" onClick={() => navigate('/')}>
            返回菜价表
          </Button>
        </div>

        <Card style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {groupedVegetables.map((group) => (
              <div key={group.category}>
                <Typography.Title heading={6} style={{ marginBottom: 12, color: 'var(--semi-color-text-2)' }}>
                  {group.category}
                </Typography.Title>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12 }}>
                  {group.names.map((name) => (
                    <Checkbox
                      key={name}
                      checked={selectedNames.includes(name)}
                      onChange={(e) => handleCheckboxChange(name, e.target.checked ?? false)}
                    >
                      {name}
                    </Checkbox>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {selectedVegetables.length > 0 ? (
          <CompareChart vegetables={selectedVegetables} />
        ) : (
          <Empty
            title="请选择菜品"
            description="从上方勾选框中选择要对比的菜品，最多可选 3 个"
            style={{ padding: '40px 0' }}
          />
        )}
      </Card>
    </div>
  );
}
