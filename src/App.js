// src/App.js
import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import MobileLayout from "./component/layout/mobile-layout";
import WebLayout from "./component/layout/web-layout";
import Bill from "./component/Web_module/Bill";
import Dashboard from "./component/Web_module/Dashboard";
import HomePage from "./component/Web_module/Home";
import Report from "./component/Web_module/Report";
import Settings from "./component/Web_module/Setting";
import { LanguageProvider } from "./context/LanguageContext";
import useIsMobile from "./Hooks/useIsMobile";
import { authAPI } from "./services/api"; // <-- import authAPI

function App() {
  const isMobile = useIsMobile(768);

  const [loading, setLoading] = useState(true);

  // Auto Login Hardcoded
  const autoLogin = async () => {
    const stored = localStorage.getItem("milkBillingUser");

    // Already logged in
    if (stored) {
      setLoading(false);
      return;
    }

    // Login with hardcoded values
    try {
      const res = await authAPI.login("Admin", "admin123");
      console.log("Auto Login Response:", res);
    } catch (err) {
      console.error("Auto Login Failed:", err);
    }

    setLoading(false);
  };

  useEffect(() => {
    autoLogin(); // <-- Auto login before rendering UI

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

  // Show nothing until login completes
  if (loading) return <div className="text-center p-5">Authenticating...</div>;

  return (
    <LanguageProvider>
      {isMobile ? (
        <div className="mobile-layout">
          <div className="mobile-scroll-area">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/report" element={<Report />} />
              <Route path="/bill" element={<Bill />} />
              <Route path="/settings" element={<Settings />} />
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
            </Routes>
          </div>
        </div>
      )}
    </LanguageProvider>
  );
}

export default App;
