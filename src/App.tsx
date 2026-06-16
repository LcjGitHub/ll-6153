import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from '@douyinfe/semi-ui';
import { PriceListPage } from './pages/PriceListPage';
import { RankingPage } from './pages/RankingPage';
import { TrendPage } from './pages/TrendPage';
import { ComparePage } from './pages/ComparePage';
import { FavoritesPage } from './pages/FavoritesPage';
import { CategoryStatsPage } from './pages/CategoryStatsPage';
import { FluctuationRankingPage } from './pages/FluctuationRankingPage';
import { GuidePage } from './pages/GuidePage';

const { Content, Footer } = Layout;

export default function App() {
  return (
    <BrowserRouter>
      <Layout className="app-layout">
        <Content className="app-content">
          <Routes>
            <Route path="/" element={<PriceListPage />} />
            <Route path="/品类统计" element={<CategoryStatsPage />} />
            <Route path="/收藏" element={<FavoritesPage />} />
            <Route path="/排行榜" element={<RankingPage />} />
            <Route path="/对比" element={<ComparePage />} />
            <Route path="/波动榜" element={<FluctuationRankingPage />} />
            <Route path="/说明" element={<GuidePage />} />
            <Route path="/item/:name" element={<TrendPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Content>
        <Footer className="app-footer">
          <div className="app-footer-content">
            <span>菜市场均价 Mock 公示 · 数据来自 src/mock/vegetable-prices.json</span>
            <Link to="/说明" className="app-footer-link">使用说明</Link>
          </div>
        </Footer>
      </Layout>
    </BrowserRouter>
  );
}
