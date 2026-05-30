import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MarketingPage from "./pages/MarketingPage";
import VerifyPage    from "./pages/VerifyPage";

// 等其他人的頁面好了，把 import 加在這裡：
// import FarmerDashboard from "./pages/FarmerDashboard";
// import DAOPage from "./pages/DAOPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 主頁 */}
        <Route path="/"       element={<MarketingPage />} />
        {/* 消費者查驗頁 */}
        <Route path="/verify" element={<VerifyPage />} />
        {/* 農民後台（等 wan 完成後取消註解）*/}
        {/* <Route path="/farmer" element={<FarmerDashboard />} /> */}
        {/* DAO（等謝竣倫完成後取消註解）*/}
        {/* <Route path="/dao" element={<DAOPage />} /> */}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
