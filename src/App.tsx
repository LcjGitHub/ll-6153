import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from '@douyinfe/semi-ui';
import { PriceListPage } from './pages/PriceListPage';
import { RankingPage } from './pages/RankingPage';
import { TrendPage } from './pages/TrendPage';
import { ComparePage } from './pages/ComparePage';

const { Content, Footer } = Layout;

export default function App() {
  return (
    <BrowserRouter>
      <Layout className="app-layout">
        <Content className="app-content">
          <Routes>
            <Route path="/" element={<PriceListPage />} />
            <Route path="/排行榜" element={<RankingPage />} />
            <Route path="/对比" element={<ComparePage />} />
            <Route path="/item/:name" element={<TrendPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Content>
        <Footer className="app-footer">
          菜市场均价 Mock 公示 · 数据来自 src/mock/vegetable-prices.json
        </Footer>
      </Layout>
    </BrowserRouter>
  );
}
