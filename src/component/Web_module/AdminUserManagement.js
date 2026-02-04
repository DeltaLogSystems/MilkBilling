import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { userManagementAPI, authAPI } from "../../services/api";
import { useAlert } from "../../Hooks/useAlert";
import Alert from "../common/Alert";
import ConfirmDialog from "../common/ConfirmDialog";
import Spinner from "../common/Spinner";
import PasswordResetModal from "./PasswordResetModal";

function AdminUserManagement() {
  const navigate = useNavigate();
  const { showAlert, showConfirm, alertConfig, confirmConfig } = useAlert();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

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

      console.log("Frontend received response:", response);

      // Backend returns: { success: true, data: { users: [...], totalCount: 10 }, message: "..." }
      if (response && response.success && response.data) {
        if (response.data.users && Array.isArray(response.data.users)) {
          console.log("Setting users from response.data.users:", response.data.users);
          setUsers(response.data.users);
        } else if (Array.isArray(response.data)) {
          console.log("Setting users from response.data (array):", response.data);
          setUsers(response.data);
        } else {
          console.log("No users array found in response");
          setUsers([]);
        }
      } else if (response && response.users && Array.isArray(response.users)) {
        // Direct format: { users: [...], totalCount: 10 }
        console.log("Setting users from response.users:", response.users);
        setUsers(response.users);
      } else {
        console.log("Unrecognized response format:", response);
        setUsers([]);
      }
    } catch (error) {
      console.error("Error loading users:", error);
      await showAlert({
        type: "error",
        title: "Error",
        message: error.response?.data?.message || "Failed to load users.",
      });
      setUsers([]);
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

      // Handle response - API might return success directly or in response.success
      if (response === true || response.success === true || response.success) {
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
        message: error.response?.data?.message || `Error ${action}ing user.`,
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

      // Handle response - API might return success directly or in response.success
      if (response === true || response.success === true || response.success) {
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
        message: error.response?.data?.message || "Error setting subscription.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = (user) => {
    setSelectedUser(user);
    setShowPasswordModal(true);
  };

  const handlePasswordConfirm = async (newPassword) => {
    try {
      setLoading(true);
      const response = await userManagementAPI.resetPassword(
        selectedUser.userId,
        newPassword
      );

      // Handle response
      if (response === true || response.success === true || response.success) {
        await showAlert({
          type: "success",
          title: "Success",
          message: `Password reset successfully for user "${selectedUser.userName}"!`,
        });
        setShowPasswordModal(false);
        setSelectedUser(null);
      } else {
        await showAlert({
          type: "error",
          title: "Error",
          message: response.message || "Failed to reset password.",
        });
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      await showAlert({
        type: "error",
        title: "Error",
        message: error.response?.data?.message || "Error resetting password.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false);
    setSelectedUser(null);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.userName?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase())
  ).filter((user) =>
    // Exclude admin user from the list
    user.userId !== 1 && user.userName?.toLowerCase() !== 'admin'
  );

  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="p-3 md:p-4 space-y-3">
        {/* Header Section */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-3 md:p-4">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
            {/* Left: Title and Search */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <i className="fas fa-users-cog text-primary text-lg" />
                <h1 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white">
                  User Management
                </h1>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Manage user accounts and subscriptions
              </p>
            </div>

            {/* Right: Stats and Back Button */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* Mini Stats */}
              <div className="flex gap-2 md:gap-3">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded px-2 py-1 text-center min-w-[50px]">
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                    {users.length}
                  </p>
                  <p className="text-[10px] text-gray-600 dark:text-gray-400">Total</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded px-2 py-1 text-center min-w-[50px]">
                  <p className="text-xs text-green-600 dark:text-green-400 font-semibold">
                    {users.filter((u) => u.activeStatus).length}
                  </p>
                  <p className="text-[10px] text-gray-600 dark:text-gray-400">Active</p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 rounded px-2 py-1 text-center min-w-[50px]">
                  <p className="text-xs text-red-600 dark:text-red-400 font-semibold">
                    {users.filter((u) => !u.activeStatus).length}
                  </p>
                  <p className="text-[10px] text-gray-600 dark:text-gray-400">Inactive</p>
                </div>
              </div>

              {/* Back Button */}
              <button
                onClick={() => navigate("/dashboard")}
                className="px-3 py-1.5 bg-slate-500 hover:bg-slate-600 text-white text-xs rounded-lg transition whitespace-nowrap flex items-center gap-1.5"
              >
                <i className="fas fa-arrow-left text-xs" />
                <span className="hidden sm:inline">Back</span>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mt-3">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by username or email..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8">
              <Spinner />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="max-h-[calc(100vh-280px)] overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-slate-100 dark:bg-slate-700 sticky top-0 z-10">
                    <tr>
                      <th className="px-2 md:px-3 py-2 text-left text-[10px] md:text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                        ID
                      </th>
                      <th className="px-2 md:px-3 py-2 text-left text-[10px] md:text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                        Username
                      </th>
                      <th className="px-2 md:px-3 py-2 text-left text-[10px] md:text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase hidden md:table-cell">
                        Email
                      </th>
                      <th className="px-2 md:px-3 py-2 text-center text-[10px] md:text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase hidden lg:table-cell">
                        Password
                      </th>
                      <th className="px-2 md:px-3 py-2 text-center text-[10px] md:text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                        Status
                      </th>
                      <th className="px-2 md:px-3 py-2 text-center text-[10px] md:text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase hidden lg:table-cell">
                        Created
                      </th>
                      <th className="px-2 md:px-3 py-2 text-center text-[10px] md:text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                        Subscription
                      </th>
                      <th className="px-2 md:px-3 py-2 text-center text-[10px] md:text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
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
                          <td className="px-2 md:px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900 dark:text-white">
                            {user.userId}
                          </td>
                          <td className="px-2 md:px-3 py-2 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <div className="flex-shrink-0 h-6 w-6 bg-primary/10 rounded-full flex items-center justify-center">
                                <i className="fas fa-user text-primary text-[10px]" />
                              </div>
                              <span className="text-xs font-medium text-gray-900 dark:text-white">
                                {user.userName}
                              </span>
                            </div>
                          </td>
                          <td className="px-2 md:px-3 py-2 whitespace-nowrap text-xs text-gray-600 dark:text-gray-400 hidden md:table-cell">
                            {user.email}
                          </td>
                          <td className="px-2 md:px-3 py-2 whitespace-nowrap text-center hidden lg:table-cell">
                            <button
                              onClick={() => handleResetPassword(user)}
                              className="px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-[10px] rounded-md transition-all shadow-md hover:shadow-lg"
                              disabled={loading}
                              title="Reset Password"
                            >
                              <i className="fas fa-key mr-1" />
                              <span className="hidden xl:inline">Reset</span>
                              <i className="fas fa-key xl:hidden" />
                            </button>
                          </td>
                          <td className="px-2 md:px-3 py-2 whitespace-nowrap text-center">
                            <span
                              className={`px-1.5 py-0.5 inline-flex text-[10px] font-semibold rounded-full ${
                                user.activeStatus
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {user.activeStatus ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-2 md:px-3 py-2 whitespace-nowrap text-[10px] text-gray-600 dark:text-gray-400 text-center hidden lg:table-cell">
                            {new Date(user.createdDate).toLocaleDateString()}
                          </td>
                          <td className="px-2 md:px-3 py-2 whitespace-nowrap text-center">
                            <div className="flex gap-1 justify-center flex-wrap">
                              <button
                                onClick={() => handleSetSubscription(user, 1)}
                                className="px-1.5 py-0.5 bg-blue-500 hover:bg-blue-600 text-white text-[10px] rounded transition"
                                disabled={loading}
                                title="Set 1 Year Subscription"
                              >
                                1Y
                              </button>
                              <button
                                onClick={() => handleSetSubscription(user, 2)}
                                className="px-1.5 py-0.5 bg-purple-500 hover:bg-purple-600 text-white text-[10px] rounded transition"
                                disabled={loading}
                                title="Set 2 Years Subscription"
                              >
                                2Y
                              </button>
                            </div>
                          </td>
                          <td className="px-2 md:px-3 py-2 whitespace-nowrap text-center">
                            <button
                              onClick={() => handleToggleActiveStatus(user)}
                              className={`px-2 py-1 rounded text-[10px] font-semibold transition ${
                                user.activeStatus
                                  ? "bg-red-500 hover:bg-red-600 text-white"
                                  : "bg-green-500 hover:bg-green-600 text-white"
                              }`}
                              disabled={loading}
                              title={user.activeStatus ? "Deactivate User" : "Activate User"}
                            >
                              <i className={`fas ${user.activeStatus ? "fa-ban" : "fa-check"}`} />
                              <span className="hidden xl:inline ml-1">
                                {user.activeStatus ? "Deactivate" : "Activate"}
                              </span>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="8"
                          className="px-3 py-12 text-center text-gray-500 dark:text-gray-400"
                        >
                          <i className="fas fa-users text-4xl mb-3 block opacity-50" />
                          <p className="text-sm">No users found</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Alert and Confirm Dialogs */}
      {alertConfig && <Alert {...alertConfig} />}
      {confirmConfig && <ConfirmDialog {...confirmConfig} />}

      {/* Password Reset Modal */}
      {showPasswordModal && selectedUser && (
        <PasswordResetModal
          user={selectedUser}
          onClose={handleClosePasswordModal}
          onConfirm={handlePasswordConfirm}
        />
      )}
    </div>
  );
}

export default AdminUserManagement;
