import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { IconArrowLeft, IconStar, IconStarStroked } from '@douyinfe/semi-icons';
import { Button, Card, Empty, Tag, Typography } from '@douyinfe/semi-ui';
import dayjs from 'dayjs';
import { TrendChart } from '../components/TrendChart';
import { PriceChange } from '../components/PriceChange';
import { ChartExportButton } from '../components/ChartExportButton';
import { findVegetableByName, getAllVegetableNames } from '../utils/price';
import { FAVORITES_CHANGED_EVENT, getFavorites, getRecentViews, saveRecentView, toggleFavorite } from '../utils/storage';
import type { RecentViewItem } from '../utils/storage';
import type { VChart as VChartType } from '@visactor/vchart';

/**
 * 单品 7 日走势页
 */
export function TrendPage() {
  const navigate = useNavigate();
  const { name: encodedName } = useParams<{ name: string }>();
  const name = encodedName ? decodeURIComponent(encodedName) : '';

  const vegetable = useMemo(() => findVegetableByName(name), [name]);
  const allNames = useMemo(() => getAllVegetableNames(), []);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<VChartType | null>(null);
  const activeName = vegetable?.name ?? name;
  const [recentViews, setRecentViews] = useState<RecentViewItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  const refreshFavorites = () => setFavorites(getFavorites());

  const handleVegetableClick = (targetName: string) => {
    if (targetName === activeName) {
      return;
    }
    navigate(`/item/${encodeURIComponent(targetName)}`);
  };

  const handleFavoriteClick = () => {
    if (activeName) {
      toggleFavorite(activeName);
      refreshFavorites();
    }
  };

  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl || !activeName) {
      return;
    }
    const activeEl = scrollEl.querySelector<HTMLButtonElement>(
      `[data-name="${activeName}"]`,
    );
    if (activeEl) {
      const containerWidth = scrollEl.clientWidth;
      const elLeft = activeEl.offsetLeft;
      const elWidth = activeEl.offsetWidth;
      scrollEl.scrollTo({
        left: elLeft - containerWidth / 2 + elWidth / 2,
        behavior: 'smooth',
      });
    }
  }, [activeName]);

  useEffect(() => {
    if (activeName) {
      saveRecentView(activeName);
      setRecentViews(getRecentViews());
    }
  }, [activeName]);

  useEffect(() => {
    refreshFavorites();
    const handleStorage = () => {
      setRecentViews(getRecentViews());
      refreshFavorites();
    };
    const handleFavoritesChanged = () => refreshFavorites();
    window.addEventListener('storage', handleStorage);
    window.addEventListener(FAVORITES_CHANGED_EVENT, handleFavoritesChanged);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(FAVORITES_CHANGED_EVENT, handleFavoritesChanged);
    };
  }, []);

  const switcher = (
    <div className="vegetable-switcher">
      <div className="vegetable-switcher-scroll" ref={scrollRef}>
        {allNames.map((itemName) => (
          <button
            key={itemName}
            data-name={itemName}
            className={`vegetable-switcher-item${itemName === activeName ? ' active' : ''}`}
            onClick={() => handleVegetableClick(itemName)}
            type="button"
          >
            {itemName}
          </button>
        ))}
      </div>
    </div>
  );

  if (!vegetable) {
    return (
      <div className="page">
        <Empty
          title="未找到该菜品"
          description={`「${name}」不在 Mock 菜价列表中，请选择其他菜品查看`}
        >
          <Link to="/">
            <Button theme="solid" type="primary">
              返回菜价表
            </Button>
          </Link>
        </Empty>
        {switcher}

        {recentViews.length > 0 && (
          <Card className="recent-views-card">
            <Typography.Title heading={6} style={{ marginBottom: 12 }}>
              最近浏览
            </Typography.Title>
            <div className="recent-views-list">
              {recentViews.map((item) => (
                <Tag
                  key={item.name}
                  color="white"
                  size="large"
                  style={{ cursor: 'pointer', marginBottom: 8 }}
                  onClick={() => navigate(`/item/${encodeURIComponent(item.name)}`)}
                >
                  {favorites.includes(item.name) && (
                    <IconStar style={{ color: '#F7BA1E', marginRight: 4 }} size="small" />
                  )}
                  {item.name}
                  <Typography.Text type="tertiary" style={{ marginLeft: 6, fontSize: 12 }}>
                    {dayjs(item.timestamp).format('HH:mm')}
                  </Typography.Text>
                </Tag>
              ))}
            </div>
          </Card>
        )}
      </div>
    );
  }

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
            <Typography.Title heading={3}>{vegetable.name}</Typography.Title>
            <Typography.Text type="secondary">
              近 7 日均价走势 · 更新至 {dayjs().format('YYYY-MM-DD')}
            </Typography.Text>
          </div>
        </div>
        <Button
          icon={
            favorites.includes(vegetable.name) ? (
              <IconStar style={{ color: '#F7BA1E' }} />
            ) : (
              <IconStarStroked />
            )
          }
          theme="borderless"
          size="large"
          onClick={handleFavoriteClick}
        />
      </header>

      {switcher}

      <Card className="summary-card">
        <div className="summary-item">
          <Typography.Text type="secondary">今日均价</Typography.Text>
          <PriceChange
            avgPrice={vegetable.avgPrice}
            prevPrice={vegetable.prevPrice}
          />
        </div>
        <div className="summary-item">
          <Typography.Text type="secondary">单位</Typography.Text>
          <Typography.Text strong>{vegetable.unit}</Typography.Text>
        </div>
        <div className="summary-item">
          <Typography.Text type="secondary">7 日最高</Typography.Text>
          <Typography.Text strong>
            {Math.max(...vegetable.history7d.map((p) => p.price)).toFixed(2)}
          </Typography.Text>
        </div>
        <div className="summary-item">
          <Typography.Text type="secondary">7 日最低</Typography.Text>
          <Typography.Text strong>
            {Math.min(...vegetable.history7d.map((p) => p.price)).toFixed(2)}
          </Typography.Text>
        </div>
      </Card>

      <Card style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 1 }}>
          <ChartExportButton chartRef={chartRef} dishName={vegetable.name} />
        </div>
        <TrendChart
          ref={chartRef}
          name={vegetable.name}
          unit={vegetable.unit}
          history7d={vegetable.history7d}
        />
      </Card>

      {recentViews.length > 0 && (
        <Card className="recent-views-card">
          <Typography.Title heading={6} style={{ marginBottom: 12 }}>
            最近浏览
          </Typography.Title>
          <div className="recent-views-list">
            {recentViews.map((item) => (
              <Tag
                key={item.name}
                color={item.name === activeName ? 'blue' : 'white'}
                size="large"
                style={{
                  cursor: item.name === activeName ? 'default' : 'pointer',
                  marginBottom: 8,
                }}
                onClick={() => {
                  if (item.name !== activeName) {
                    navigate(`/item/${encodeURIComponent(item.name)}`);
                  }
                }}
              >
                {favorites.includes(item.name) && (
                  <IconStar style={{ color: '#F7BA1E', marginRight: 4 }} size="small" />
                )}
                {item.name}
                <Typography.Text type="tertiary" style={{ marginLeft: 6, fontSize: 12 }}>
                  {dayjs(item.timestamp).format('HH:mm')}
                </Typography.Text>
              </Tag>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
