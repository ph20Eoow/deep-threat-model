import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./components/pages/MainLayout";

function App() {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      <Routes>
        <Route path="/*" element={<MainLayout />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
