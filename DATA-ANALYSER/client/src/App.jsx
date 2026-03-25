import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import HistoryPage from "./pages/HistoryPage";
import Upload from "./components/Upload";
import Sidebar from "./components/Sidebar";

function PrivateLayout({ children }) {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  if (!user) return <Navigate to="/login" replace />;
  return (
    <div className="flex min-h-screen bg-stone-100">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <main className={`flex-1 transition-all duration-300 overflow-y-auto ${collapsed ? "ml-16" : "ml-60"}`}>
        {children}
      </main>
    </div>
  );
}

function GuestRoute({ children }) {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"     element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/register"  element={<GuestRoute><Register /></GuestRoute>} />
          <Route path="/dashboard" element={<PrivateLayout><Upload /></PrivateLayout>} />
          <Route path="/history"   element={<PrivateLayout><HistoryPage /></PrivateLayout>} />
          <Route path="*"          element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
