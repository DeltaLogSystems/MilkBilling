import { useState, useEffect } from "react";
import { milkRateAPI } from "../../../services/api";

function MilkRateMaster({ text }) {
  const [rateOpen, setRateOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [masterCowRate, setMasterCowRate] = useState(0);
  const [masterBuffaloRate, setMasterBuffaloRate] = useState(0);

  useEffect(() => {
    loadMilkRates();
  }, []);

  const loadMilkRates = async () => {
    try {
      const response = await milkRateAPI.getMilkRates();
      if (response.success) {
        setMasterCowRate(response.data.cowRate);
        setMasterBuffaloRate(response.data.buffaloRate);
      }
    } catch (error) {
      console.error("Error loading milk rates:", error);
    }
  };

  const handleSaveRates = async () => {
    try {
      setLoading(true);
      const response = await milkRateAPI.updateMilkRates(
        masterCowRate,
        masterBuffaloRate
      );

      if (response.success) {
        alert("Milk rates updated successfully!");
      } else {
        alert("Failed to update rates.");
      }
    } catch (error) {
      console.error("Error updating rates:", error);
      alert("Error updating rates.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 md:p-5 shadow-sm mt-2">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base md:text-lg font-bold flex items-center gap-2 md:gap-3 text-slate-900 dark:text-white">
          <i className="fas fa-rupee-sign text-primary" />
          <span>{text.milkRateMaster}</span>
        </h2>
        <button
          type="button"
          className="text-primary hover:bg-primary/10 p-2 rounded-lg transition"
          onClick={() => setRateOpen((v) => !v)}
        >
          <i
            className={`fas ${
              rateOpen ? "fa-chevron-up" : "fa-chevron-down"
            }`}
          />
        </button>
      </div>

      {rateOpen && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <label className="w-full md:w-52 text-sm font-medium text-slate-700 dark:text-slate-300">
              {text.cowMilkRateMaster}
            </label>
            <input
              type="number"
              step="0.01"
              value={masterCowRate}
              onChange={(e) => setMasterCowRate(parseFloat(e.target.value))}
              className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <label className="w-full md:w-52 text-sm font-medium text-slate-700 dark:text-slate-300">
              {text.buffaloMilkRateMaster}
            </label>
            <input
              type="number"
              step="0.01"
              value={masterBuffaloRate}
              onChange={(e) =>
                setMasterBuffaloRate(parseFloat(e.target.value))
              }
              className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <button
            type="button"
            disabled={loading}
            className="w-full bg-primary hover:bg-[#007aa3] text-white font-semibold py-2.5 px-3 rounded-lg text-sm transition disabled:opacity-50"
            onClick={handleSaveRates}
          >
            {loading ? "Saving..." : text.saveRates}
          </button>
        </div>
      )}
    </section>
  );
}

export default MilkRateMaster;
