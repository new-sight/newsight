import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import DashboardPage from "./features/dashboard/DashboardPage.tsx";
import PredictionPage from "./features/prediction/PredictionPage.tsx";
import NewsPage from "./features/news/NewsPage.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<App />}>
          <Route index element={<DashboardPage />} />
          <Route path="prediction" element={<PredictionPage />} />
          <Route path="news" element={<NewsPage />} />
          <Route path="news/:stockCode" element={<NewsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
