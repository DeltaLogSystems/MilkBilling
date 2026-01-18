import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import MobileLayout from "./component/layout/mobile-layout";
import WebLayout from "./component/layout/web-layout";
import Bill from "./component/Web_module/Bill";
import Dashboard from "./component/Web_module/Dashboard";
import HomePage from "./component/Web_module/Home";
import Login from "./component/Web_module/Login";
import ProtectedRoute from "./component/Web_module/ProtectedRoute";
import Register from "./component/Web_module/Register";
import Report from "./component/Web_module/Report";
import Settings from "./component/Web_module/Setting";
import AdminUserManagement from "./component/Web_module/AdminUserManagement";
import { LanguageProvider } from "./context/LanguageContext";
import useIsMobile from "./Hooks/useIsMobile";
import { authAPI } from "./services/api";

function App() {
  const isMobile = useIsMobile(768);
  const isAuthenticated = authAPI.isAuthenticated();

  useEffect(() => {
    const setVhCssVar = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };
    setVhCssVar();
    window.addEventListener("resize", setVhCssVar);
    window.addEventListener("orientationchange", setVhCssVar);

    return () => {
      window.removeEventListener("resize", setVhCssVar);
      window.removeEventListener("orientationchange", setVhCssVar);
    };
  }, []);

  return (
    <LanguageProvider>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Register />
            )
          }
        />

        {/* Protected Routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              {isMobile ? (
                <div className="mobile-layout">
                  <div className="mobile-scroll-area">
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/report" element={<Report />} />
                      <Route path="/bill" element={<Bill />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/admin/users" element={<AdminUserManagement />} />
                    </Routes>
                  </div>
                  <MobileLayout />
                </div>
              ) : (
                <div className="web-layout h-screen overflow-hidden flex">
                  <WebLayout />
                  <div className="web-main flex-1 flex flex-col overflow-hidden">
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/report" element={<Report />} />
                      <Route path="/bill" element={<Bill />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/admin/users" element={<AdminUserManagement />} />
                    </Routes>
                  </div>
                </div>
              )}
            </ProtectedRoute>
          }
        />
      </Routes>
    </LanguageProvider>
  );
}

export default App;
