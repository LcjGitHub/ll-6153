import { useNavigate } from 'react-router-dom';
import { IconArrowLeft } from '@douyinfe/semi-icons';
import { Button, Card, List, Typography } from '@douyinfe/semi-ui';
import { guideSections, guidePageConfig } from '../config/guide';

export function GuidePage() {
  const navigate = useNavigate();

  return (
    <div className="page">
      <header className="page-header">
        <div className="page-header-row">
          <Button
            icon={<IconArrowLeft />}
            theme="borderless"
            onClick={() => navigate('/')}
          >
            返回菜价表
          </Button>
          <div>
            <Typography.Title heading={3}>{guidePageConfig.title}</Typography.Title>
            <Typography.Text type="secondary">
              {guidePageConfig.subtitle}
            </Typography.Text>
          </div>
        </div>
      </header>

      <div style={{ display: 'grid', gap: 16 }}>
        {guideSections.map((section) => (
          <Card key={section.id}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
              <span style={{ fontSize: 28 }}>{section.icon}</span>
              <div style={{ flex: 1 }}>
                <Typography.Title heading={5} style={{ margin: 0, marginBottom: 6 }}>
                  {section.title}
                </Typography.Title>
                <Typography.Text type="secondary">
                  {section.description}
                </Typography.Text>
              </div>
            </div>

            <List
              size="small"
              dataSource={section.tips}
              renderItem={(tip) => (
                <List.Item>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{ color: 'var(--semi-color-primary)', flexShrink: 0 }}>
                      •
                    </span>
                    <Typography.Text>{tip}</Typography.Text>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        ))}
      </div>

      <Typography.Text type="tertiary" className="page-hint">
        {guidePageConfig.footerText}
      </Typography.Text>
    </div>
  );
}
