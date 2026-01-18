import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { userManagementAPI, authAPI } from "../../services/api";
import { useAlert } from "../../Hooks/useAlert";
import Alert from "../common/Alert";
import ConfirmDialog from "../common/ConfirmDialog";
import Spinner from "../common/Spinner";

function AdminUserManagement() {
  const navigate = useNavigate();
  const { showAlert, showConfirm, alertConfig, confirmConfig } = useAlert();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    checkAdminAccess();
    loadUsers();
  }, []);

  const checkAdminAccess = () => {
    const user = authAPI.getCurrentUser();
    setCurrentUser(user);

    // Check if user is admin (assuming userId 1 is admin, or check username)
    if (!user || (user.userId !== 1 && user.userName?.toLowerCase() !== 'admin')) {
      showAlert({
        type: "error",
        title: "Access Denied",
        message: "You don't have permission to access this page.",
      }).then(() => {
        navigate("/dashboard");
      });
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userManagementAPI.getAllUsers();
      if (response.success) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error("Error loading users:", error);
      await showAlert({
        type: "error",
        title: "Error",
        message: "Failed to load users.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActiveStatus = async (user) => {
    const action = user.activeStatus ? "deactivate" : "activate";
    const confirmed = await showConfirm({
      type: "warning",
      title: `${action === "activate" ? "Activate" : "Deactivate"} User`,
      message: `Are you sure you want to ${action} user "${user.userName}"?`,
      confirmText: action === "activate" ? "Activate" : "Deactivate",
      cancelText: "Cancel",
    });

    if (!confirmed) return;

    try {
      setLoading(true);
      const response = await userManagementAPI.toggleUserStatus(
        user.userId,
        !user.activeStatus
      );

      if (response.success) {
        await showAlert({
          type: "success",
          title: "Success",
          message: `User ${action}d successfully!`,
        });
        await loadUsers();
      } else {
        await showAlert({
          type: "error",
          title: "Error",
          message: response.message || `Failed to ${action} user.`,
        });
      }
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
      await showAlert({
        type: "error",
        title: "Error",
        message: `Error ${action}ing user.`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSetSubscription = async (user, years) => {
    const confirmed = await showConfirm({
      type: "info",
      title: "Set Subscription",
      message: `Set ${years} year subscription for user "${user.userName}"?`,
      confirmText: "Confirm",
      cancelText: "Cancel",
    });

    if (!confirmed) return;

    try {
      setLoading(true);
      const response = await userManagementAPI.setSubscription(
        user.userId,
        years
      );

      if (response.success) {
        await showAlert({
          type: "success",
          title: "Success",
          message: `${years} year subscription set successfully!`,
        });
        await loadUsers();
      } else {
        await showAlert({
          type: "error",
          title: "Error",
          message: response.message || "Failed to set subscription.",
        });
      }
    } catch (error) {
      console.error("Error setting subscription:", error);
      await showAlert({
        type: "error",
        title: "Error",
        message: "Error setting subscription.",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.userName?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-3 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Search */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-4 mb-4">
          {/* Title and Back Button */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <i className="fas fa-users-cog text-primary text-xl" />
              <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">
                User Management
              </h1>
            </div>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-3 py-1.5 md:px-4 md:py-2 bg-slate-500 hover:bg-slate-600 text-white text-sm rounded-lg transition flex items-center gap-2"
            >
              <i className="fas fa-arrow-left" />
              <span className="hidden md:inline">Back to Dashboard</span>
            </button>
          </div>

          {/* Subtitle */}
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Manage user accounts and subscriptions
          </p>

          {/* Search */}
          <div className="relative">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by username or email..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-3">
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-2 inline-flex mb-2">
                <i className="fas fa-users text-lg text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {users.length}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-3">
            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-2 inline-flex mb-2">
                <i className="fas fa-user-check text-lg text-green-600 dark:text-green-400" />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Active</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {users.filter((u) => u.activeStatus).length}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-3">
            <div className="text-center">
              <div className="bg-red-100 dark:bg-red-900/30 rounded-lg p-2 inline-flex mb-2">
                <i className="fas fa-user-times text-lg text-red-600 dark:text-red-400" />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Inactive</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {users.filter((u) => !u.activeStatus).length}
              </p>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-8">
              <Spinner />
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[calc(100vh-400px)] overflow-y-auto">
              <table className="w-full">
                <thead className="bg-slate-100 dark:bg-slate-700 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                      User ID
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                      Username
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                      Email
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                      Status
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                      Created Date
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                      Subscription
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr
                        key={user.userId}
                        className="hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                      >
                        <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {user.userId}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="flex-shrink-0 h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <i className="fas fa-user text-primary text-xs" />
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.userName}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {user.email}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-center">
                          <span
                            className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${
                              user.activeStatus
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {user.activeStatus ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-600 dark:text-gray-400 text-center">
                          {new Date(user.createdDate).toLocaleDateString()}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-center">
                          <div className="flex gap-1 justify-center">
                            <button
                              onClick={() => handleSetSubscription(user, 1)}
                              className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded transition"
                              disabled={loading}
                            >
                              1 Year
                            </button>
                            <button
                              onClick={() => handleSetSubscription(user, 2)}
                              className="px-2 py-1 bg-purple-500 hover:bg-purple-600 text-white text-xs rounded transition"
                              disabled={loading}
                            >
                              2 Years
                            </button>
                          </div>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-center">
                          <button
                            onClick={() => handleToggleActiveStatus(user)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                              user.activeStatus
                                ? "bg-red-500 hover:bg-red-600 text-white"
                                : "bg-green-500 hover:bg-green-600 text-white"
                            }`}
                            disabled={loading}
                          >
                            {user.activeStatus ? (
                              <>
                                <i className="fas fa-ban mr-1" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <i className="fas fa-check mr-1" />
                                Activate
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-3 py-8 text-center text-gray-500 dark:text-gray-400"
                      >
                        <i className="fas fa-users text-3xl mb-3 block" />
                        <p className="text-sm">No users found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Alert and Confirm Dialogs */}
      {alertConfig && <Alert {...alertConfig} />}
      {confirmConfig && <ConfirmDialog {...confirmConfig} />}
    </div>
  );
}

export default AdminUserManagement;
