import { useEffect, useState } from "react";
import { useAlert } from "../../../Hooks/useAlert";
import { dairyInfoAPI } from "../../../services/api";
import Alert from "../../common/Alert";

function DairyInformation({ text, isOpen, onToggle }) {
  const { showAlert, alertConfig } = useAlert();
  const [loading, setLoading] = useState(false);
  const [dairyName, setDairyName] = useState("");
  const [dairyLogoFile, setDairyLogoFile] = useState(null);
  const [qrFile, setQrFile] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadDairyInfo();
    }
  }, [isOpen]);

  const loadDairyInfo = async () => {
    try {
      const response = await dairyInfoAPI.getDairyInfo();
      if (response.success && response.data) {
        setDairyName(response.data.dairyName || "");
      }
    } catch (error) {
      console.error("Error loading dairy info:", error);
    }
  };

  const handleSaveDairy = async () => {
    try {
      if (!dairyName || dairyName.trim() === "") {
        await showAlert({
          type: "warning",
          title: "Validation Error",
          message: "Dairy name is required",
        });
        return;
      }

      const formData = new FormData();
      formData.append("DairyName", dairyName.trim());

      if (dairyLogoFile) {
        formData.append("DairyLogo", dairyLogoFile);
      }

      if (qrFile) {
        formData.append("PaymentQRImage", qrFile);
      }

      setLoading(true);

      const response = await dairyInfoAPI.saveDairyInfo(formData);

      if (response.success) {
        await showAlert({
          type: "success",
          title: "Success",
          message: "Dairy information saved successfully!",
        });
      } else {
        await showAlert({
          type: "error",
          title: "Error",
          message: response.message || "Save failed",
        });
      }
    } catch (err) {
      console.error(err);
      await showAlert({
        type: "error",
        title: "Error",
        message:
          err.response?.data?.message ||
          "Upload failed (validation or server error)",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 md:p-5 shadow-sm mt-2">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base md:text-lg font-bold flex items-center gap-2 md:gap-3 text-slate-900 dark:text-white">
          <i className="fas fa-store text-primary" />
          <span>{text.dairyInformation}</span>
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
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <label className="w-full md:w-52 text-sm font-medium text-slate-700 dark:text-slate-300">
              {text.dairyName}
            </label>
            <input
              type="text"
              value={dairyName}
              onChange={(e) => setDairyName(e.target.value)}
              className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <label className="w-full md:w-52 text-sm font-medium text-slate-700 dark:text-slate-300">
              {text.dairyLogo}
            </label>
            <input
              type="file"
              accept="image/*"
              className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              onChange={(e) => setDairyLogoFile(e.target.files[0])}
            />
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <label className="w-full md:w-52 text-sm font-medium text-slate-700 dark:text-slate-300">
              {text.paymentQrImage}
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setQrFile(e.target.files[0])}
              className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2.5 text-sm text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <button
            type="button"
            disabled={loading}
            className="w-full bg-primary hover:bg-[#007aa3] text-white font-semibold py-2.5 px-3 rounded-lg text-sm transition disabled:opacity-50"
            onClick={handleSaveDairy}
          >
            {loading ? "Saving..." : text.saveDairyInfo}
          </button>
        </div>
      )}

      {/* Alert Dialog */}
      {alertConfig && <Alert {...alertConfig} />}
    </section>
  );
}

export default DairyInformation;
