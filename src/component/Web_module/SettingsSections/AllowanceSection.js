import { useEffect, useState } from "react";
import { useAlert } from "../../../Hooks/useAlert";
import { allowanceAPI } from "../../../services/api";
import Alert from "../../common/Alert";
import ConfirmDialog from "../../common/ConfirmDialog";

function AllowanceSection({ text, isOpen, onToggle }) {
  const { showAlert, alertConfig, confirmConfig } = useAlert();
  const [loading, setLoading] = useState(false);
  const [allowances, setAllowances] = useState({
    transportAllowance: "",
    packingAllowance: "",
    otherAllowance: "",
  });

  useEffect(() => {
    if (isOpen) {
      loadAllowances();
    }
  }, [isOpen]);

  const loadAllowances = async () => {
    try {
      setLoading(true);
      const response = await allowanceAPI.getAllowances();
      if (response.success && response.data) {
        setAllowances({
          transportAllowance: response.data.transportAllowance || "",
          packingAllowance: response.data.packingAllowance || "",
          otherAllowance: response.data.otherAllowance || "",
        });
      }
    } catch (error) {
      console.error("Error loading allowances:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    // Only allow numbers and decimal point
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setAllowances((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSaveAllowances = async () => {
    try {
      setLoading(true);
      const response = await allowanceAPI.saveAllowances({
        transportAllowance: parseFloat(allowances.transportAllowance) || 0,
        packingAllowance: parseFloat(allowances.packingAllowance) || 0,
        otherAllowance: parseFloat(allowances.otherAllowance) || 0,
      });

      if (response.success) {
        await showAlert({
          type: "success",
          title: text.success || "Success",
          message:
            text.allowancesSavedSuccess || "Allowances saved successfully!",
        });
      } else {
        await showAlert({
          type: "error",
          title: text.error || "Error",
          message:
            response.message ||
            text.allowancesSaveFailed ||
            "Failed to save allowances.",
        });
      }
    } catch (error) {
      console.error("Error saving allowances:", error);
      await showAlert({
        type: "error",
        title: text.error || "Error",
        message: text.allowancesSaveFailed || "Error saving allowances.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 md:p-5 shadow-sm mt-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base md:text-lg font-bold flex items-center gap-2 md:gap-3 text-slate-900 dark:text-white">
            <i className="fas fa-hand-holding-usd text-primary" />
            <span>{text.allowanceSectionTitle}</span>
          </h2>
          <button
            type="button"
            className="text-primary hover:bg-primary/10 p-2 rounded-lg transition"
            onClick={onToggle}
          >
            <i
              className={`fas ${isOpen ? "fa-chevron-up" : "fa-chevron-down"}`}
            />
          </button>
        </div>

        {isOpen && (
          <div className="space-y-4">
            {/* Transport Allowance */}
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <label className="w-full md:w-52 text-sm font-medium text-slate-700 dark:text-slate-300">
                {text.transportAllowance}
              </label>
              <input
                type="text"
                value={allowances.transportAllowance}
                onChange={(e) =>
                  handleInputChange("transportAllowance", e.target.value)
                }
                placeholder="0.00"
                className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                disabled={loading}
              />
            </div>

            {/* Packing Allowance */}
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <label className="w-full md:w-52 text-sm font-medium text-slate-700 dark:text-slate-300">
                {text.packingAllowance}
              </label>
              <input
                type="text"
                value={allowances.packingAllowance}
                onChange={(e) =>
                  handleInputChange("packingAllowance", e.target.value)
                }
                placeholder="0.00"
                className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                disabled={loading}
              />
            </div>

            {/* Other Allowance */}
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <label className="w-full md:w-52 text-sm font-medium text-slate-700 dark:text-slate-300">
                {text.otherAllowance}
              </label>
              <input
                type="text"
                value={allowances.otherAllowance}
                onChange={(e) =>
                  handleInputChange("otherAllowance", e.target.value)
                }
                placeholder="0.00"
                className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                disabled={loading}
              />
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-2">
              <button
                onClick={handleSaveAllowances}
                disabled={loading}
                className="bg-primary hover:bg-[#007aa3] text-white font-semibold py-2.5 px-6 rounded-lg flex items-center gap-2 text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="fas fa-save" />
                {loading ? text.saving || "Saving..." : text.saveAllowances}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Alert and Confirm Dialogs */}
      {alertConfig && <Alert {...alertConfig} />}
      {confirmConfig && <ConfirmDialog {...confirmConfig} />}
    </>
  );
}

export default AllowanceSection;
