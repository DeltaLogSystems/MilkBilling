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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                <i className="fas fa-users-cog text-primary mr-3" />
                User Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage user accounts and subscriptions
              </p>
            </div>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 bg-slate-500 hover:bg-slate-600 text-white rounded-lg transition"
            >
              <i className="fas fa-arrow-left mr-2" />
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 mb-6">
          <div className="relative">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by username or email..."
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden">
          {loading ? (
            <div className="p-8">
              <Spinner />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-100 dark:bg-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      User ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Username
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Created Date
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Subscription
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {user.userId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <i className="fas fa-user text-primary" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {user.userName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.activeStatus
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {user.activeStatus ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 text-center">
                          {new Date(user.createdDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handleSetSubscription(user, 1)}
                              className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded transition"
                              disabled={loading}
                            >
                              1 Year
                            </button>
                            <button
                              onClick={() => handleSetSubscription(user, 2)}
                              className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white text-xs rounded transition"
                              disabled={loading}
                            >
                              2 Years
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => handleToggleActiveStatus(user)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                              user.activeStatus
                                ? "bg-red-500 hover:bg-red-600 text-white"
                                : "bg-green-500 hover:bg-green-600 text-white"
                            }`}
                            disabled={loading}
                          >
                            {user.activeStatus ? (
                              <>
                                <i className="fas fa-ban mr-2" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <i className="fas fa-check mr-2" />
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
                        className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                      >
                        <i className="fas fa-users text-4xl mb-4 block" />
                        <p>No users found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3">
                <i className="fas fa-users text-2xl text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Users
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {users.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 dark:bg-green-900/30 rounded-lg p-3">
                <i className="fas fa-user-check text-2xl text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Active Users
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {users.filter((u) => u.activeStatus).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-100 dark:bg-red-900/30 rounded-lg p-3">
                <i className="fas fa-user-times text-2xl text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Inactive Users
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {users.filter((u) => !u.activeStatus).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alert and Confirm Dialogs */}
      {alertConfig && <Alert {...alertConfig} />}
      {confirmConfig && <ConfirmDialog {...confirmConfig} />}
    </div>
  );
}

export default AdminUserManagement;
