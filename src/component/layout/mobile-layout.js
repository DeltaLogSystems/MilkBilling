// src/component/layout/mobile-layout.jsx
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import layoutLanguage from "../../language/layoutLanguage";

function MobileLayout() {
  const location = useLocation();
  const currentPath = location.pathname;

  const { language } = useLanguage();
  const text = layoutLanguage[language];

  const isActive = (path) => currentPath === path;
  const isReportModuleActive =
    currentPath === "/report" || currentPath === "/bill";

  const activeMobile = "text-primary";
  const inactiveMobile = "text-slate-500 dark:text-slate-400";

  return (
    <>
      {/* Mobile Bottom Navigation - Hidden on desktop by App layout */}
      <footer className="sticky bottom-0 z-10 bg-white/80 p-2 backdrop-blur-sm dark:bg-slate-900/80">
        <div className="flex justify-around">
          <Link
            to="/"
            className={`flex flex-col items-center gap-1 ${
              isActive("/") ? activeMobile : inactiveMobile
            } font-bold`}
          >
            <i className="fas fa-home text-2xl" />
            <span className="text-xs">{text.navHome}</span>
          </Link>

          <Link
            to="/dashboard"
            className={`flex flex-col items-center gap-1 ${
              isActive("/dashboard") ? activeMobile : inactiveMobile
            }`}
          >
            <i className="fas fa-chart-line text-2xl" />
            <span className="text-xs">{text.navDashboard}</span>
          </Link>

          <Link
            to="/report"
            className={`flex flex-col items-center gap-1 ${
              isReportModuleActive ? activeMobile : inactiveMobile
            }`}
          >
            <i className="fas fa-file-alt text-2xl" />
            <span className="text-xs">{text.navReport}</span>
          </Link>

          <Link
            to="/settings"
            className={`flex flex-col items-center gap-1 ${
              isActive("/settings") ? activeMobile : inactiveMobile
            }`}
          >
            <i className="fas fa-cog text-2xl" />
            <span className="text-xs">{text.navSettings}</span>
          </Link>
        </div>
      </footer>
    </>
  );
}

export default MobileLayout;
