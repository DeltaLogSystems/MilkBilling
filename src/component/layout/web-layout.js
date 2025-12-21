// src/component/layout/web-layout.jsx
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import layoutLanguage from '../../language/layoutLanguage';

export default function WebLayout() {
  const location = useLocation();
  const currentPath = location.pathname;

  const { language } = useLanguage();
  const text = layoutLanguage[language];

  const isActive = (path) => currentPath === path;
  const isReportModuleActive = currentPath === '/report' || currentPath === '/bill';

  const activeClass = 'sidebar-icon-item active';
  const inactiveClass = 'sidebar-icon-item';

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="web-sidebar">
        <div className="app-logo mb-6">
          <img
            src="/images/logo.png"
            alt={text.appTitle}
            width="80"
            height="70"
            className="mx-auto"
          />
        </div>

        <h1 className="page-title text-xl font-bold text-slate-900 dark:text-white mb-4 text-center">
          {text.appTitle}
        </h1>

        <div className="stats-container mb-8">
          <div className="stats-title">{text.totalCustomersTitle}</div>
          <div className="stats-value">5</div>
        </div>

        <nav className="space-y-2">
          <Link
            to="/"
            className={`${isActive('/') ? activeClass : inactiveClass}`}
          >
            <i className="fas fa-home" />
            <span>{text.navHome}</span>
          </Link>

          <Link
            to="/dashboard"
            className={isActive('/dashboard') ? activeClass : inactiveClass}
          >
            <i className="fas fa-chart-line" />
            <span>{text.navDashboard}</span>
          </Link>

          <Link
            to="/report"
            className={isReportModuleActive ? activeClass : inactiveClass}
          >
            <i className="fas fa-file-alt" />
            <span>{text.navReport}</span>
          </Link>

          <Link
            to="/settings"
            className={isActive('/settings') ? activeClass : inactiveClass}
          >
            <i className="fas fa-cog" />
            <span>{text.navSettings}</span>
          </Link>
        </nav>
      </div>
    </>
  );
}
