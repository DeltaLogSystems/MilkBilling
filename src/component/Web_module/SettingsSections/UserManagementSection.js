import { useNavigate } from "react-router-dom";
import { authAPI } from "../../../services/api";

function UserManagementSection({ text }) {
  const navigate = useNavigate();
  const currentUser = authAPI.getCurrentUser();

  // Only show this section for admin users
  if (!currentUser || (currentUser.userId !== 1 && currentUser.userName?.toLowerCase() !== 'admin')) {
    return null;
  }

  const handleNavigateToUserManagement = () => {
    navigate("/admin/users");
  };

  return (
    <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 md:p-5 shadow-sm mt-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base md:text-lg font-bold flex items-center gap-2 md:gap-3 text-slate-900 dark:text-white">
          <i className="fas fa-users-cog text-primary" />
          <span>{text.userManagementTitle}</span>
        </h2>
      </div>

      <div className="space-y-3">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {text.userManagementDescription}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Features List */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
              <i className="fas fa-check-circle text-green-500 text-xs" />
              <span>{text.viewAllUsers}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
              <i className="fas fa-check-circle text-green-500 text-xs" />
              <span>{text.activateDeactivateUsers}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
              <i className="fas fa-check-circle text-green-500 text-xs" />
              <span>{text.resetPasswords}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
              <i className="fas fa-check-circle text-green-500 text-xs" />
              <span>{text.manageSubscriptions}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleNavigateToUserManagement}
          className="w-full bg-primary hover:bg-[#007aa3] text-white font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 text-sm transition"
        >
          <i className="fas fa-users-cog" />
          {text.openUserManagement}
        </button>
      </div>
    </section>
  );
}

export default UserManagementSection;
