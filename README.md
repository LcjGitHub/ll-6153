# 菜市场均价 Mock 公示与走势

React 18 + Vite + TypeScript 实现的菜市场均价 Mock 公示页，含今日菜价表与 7 日走势折线图。

## 技术栈

- React 18 + Vite + TypeScript
- React Router 6
- Semi Design（Table、Input、Card 等）
- @visactor/react-vchart（折线图）
- dayjs

## 功能

- **/** — 今日菜价表：均价、涨跌箭头，支持按菜名搜索
- **/item/:name** — 点击菜品查看近 7 日 VChart 折线走势

Mock 数据：`src/mock/vegetable-prices.json`（17 种蔬菜，含 `history7d[]`），不接发改委 API。

## 启动

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
npm run preview
```
