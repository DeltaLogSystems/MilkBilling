import { useState } from "react";
import { useAlert } from "../../Hooks/useAlert";
import Alert from "../common/Alert";

function PasswordResetModal({ user, onClose, onConfirm }) {
  const { showAlert, alertConfig } = useAlert();
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [loading, setLoading] = useState(false);

  const generatePassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setNewPassword(password);
    calculateStrength(password);
  };

  const calculateStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.match(/[a-z]+/)) strength += 25;
    if (password.match(/[A-Z]+/)) strength += 25;
    if (password.match(/[0-9]+/)) strength += 15;
    if (password.match(/[$@#&!]+/)) strength += 10;
    setPasswordStrength(strength);
  };

  const handlePasswordChange = (value) => {
    setNewPassword(value);
    calculateStrength(value);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(newPassword);
      await showAlert({
        type: "success",
        title: "Copied!",
        message: "Password copied to clipboard",
      });
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleSubmit = async () => {
    if (!newPassword || newPassword.length < 6) {
      await showAlert({
        type: "error",
        title: "Invalid Password",
        message: "Password must be at least 6 characters long.",
      });
      return;
    }

    setLoading(true);
    await onConfirm(newPassword);
    setLoading(false);
  };

  const getStrengthColor = () => {
    if (passwordStrength < 40) return "bg-red-500";
    if (passwordStrength < 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthText = () => {
    if (passwordStrength < 40) return "Weak";
    if (passwordStrength < 70) return "Medium";
    return "Strong";
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full animate-[scale-in_0.2s_ease-out]">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-blue-600 text-white p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <i className="fas fa-key" />
                  Reset Password
                </h3>
                <p className="text-blue-100 text-sm mt-1">
                  For user: <strong>{user?.userName}</strong>
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition"
              >
                <i className="fas fa-times text-xl" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-4 py-3 pr-24 rounded-lg border-2 border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:border-primary transition"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-2 text-gray-500 hover:text-primary transition"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`} />
                  </button>
                  {newPassword && (
                    <button
                      type="button"
                      onClick={copyToClipboard}
                      className="p-2 text-gray-500 hover:text-primary transition"
                      title="Copy password"
                    >
                      <i className="fas fa-copy" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Password Strength Indicator */}
            {newPassword && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">Password Strength</span>
                  <span className={`font-semibold ${
                    passwordStrength < 40 ? "text-red-500" :
                    passwordStrength < 70 ? "text-yellow-500" : "text-green-500"
                  }`}>
                    {getStrengthText()}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getStrengthColor()} transition-all duration-300`}
                    style={{ width: `${passwordStrength}%` }}
                  />
                </div>
              </div>
            )}

            {/* Generate Password Button */}
            <button
              type="button"
              onClick={generatePassword}
              className="w-full py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition"
            >
              <i className="fas fa-magic" />
              Generate Strong Password
            </button>

            {/* Password Requirements */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-xs">
              <p className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                Password Requirements:
              </p>
              <ul className="space-y-1 text-blue-700 dark:text-blue-400">
                <li className="flex items-center gap-2">
                  <i className={`fas fa-check-circle ${newPassword.length >= 8 ? "text-green-500" : "text-gray-400"}`} />
                  At least 8 characters
                </li>
                <li className="flex items-center gap-2">
                  <i className={`fas fa-check-circle ${newPassword.match(/[A-Z]/) ? "text-green-500" : "text-gray-400"}`} />
                  One uppercase letter
                </li>
                <li className="flex items-center gap-2">
                  <i className={`fas fa-check-circle ${newPassword.match(/[0-9]/) ? "text-green-500" : "text-gray-400"}`} />
                  One number
                </li>
                <li className="flex items-center gap-2">
                  <i className={`fas fa-check-circle ${newPassword.match(/[$@#&!]/) ? "text-green-500" : "text-gray-400"}`} />
                  One special character (@, #, $, !, &)
                </li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 pt-0">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !newPassword || newPassword.length < 6}
              className="flex-1 py-3 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin" />
                  Resetting...
                </>
              ) : (
                <>
                  <i className="fas fa-save" />
                  Reset Password
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Alert Dialog */}
      {alertConfig && <Alert {...alertConfig} />}
    </>
  );
}

export default PasswordResetModal;
