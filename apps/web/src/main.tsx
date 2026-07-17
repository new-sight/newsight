import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import DashboardPage from "./features/dashboard/DashboardPage.tsx";
import PredictionsPage from "./features/prediction/PredictionsPage.tsx";
import DetailPage from "./features/detail/DetailPage.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<App />}>
          <Route index element={<DashboardPage />} />
          <Route path="predictions" element={<PredictionsPage />} />
          <Route path="detail" element={<DetailPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
