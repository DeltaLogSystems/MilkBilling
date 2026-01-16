import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../../../services/api";

function LogoutSection({ text }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    if (window.confirm(text.logoutConfirmMessage)) {
      try {
        setLoading(true);
        await authAPI.logout();
        window.location.href = "/login";
      } catch (error) {
        console.error("Logout failed:", error);
        alert("Logout failed. Please try again.");
        setLoading(false);
      }
    }
  };

  return (
    <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 md:p-5 shadow-sm mt-2">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base md:text-lg font-bold flex items-center gap-2 md:gap-3 text-slate-900 dark:text-white">
          <i className="fas fa-user-circle text-primary" />
          <span>{text.logoutSectionTitle}</span>
        </h2>
      </div>
      <button
        type="button"
        disabled={loading}
        className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleLogout}
      >
        <i className="fas fa-sign-out-alt" />
        <span>{text.logoutButton}</span>
      </button>
    </section>
  );
}

export default LogoutSection;
