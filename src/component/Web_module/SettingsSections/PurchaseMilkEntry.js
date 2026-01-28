import { useState, useEffect } from "react";
import { purchaseMilkAPI } from "../../../services/api";
import { useAlert } from "../../../Hooks/useAlert";
import Alert from "../../common/Alert";
import ConfirmDialog from "../../common/ConfirmDialog";

function PurchaseMilkEntry({ text, isOpen, onToggle }) {
  const { showAlert, showConfirm, alertConfig, confirmConfig } = useAlert();
  const [loading, setLoading] = useState(false);

  // Purchase entry states
  const [purchaseEntryId, setPurchaseEntryId] = useState(0);
  const [purchaseMilkType, setPurchaseMilkType] = useState(0);
  const [purchaseQty, setPurchaseQty] = useState("");
  const [purchaseRate, setPurchaseRate] = useState("");
  const [purchaseEntryDate, setPurchaseEntryDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [purchaseEntries, setPurchaseEntries] = useState([]);

  useEffect(() => {
    if (isOpen) {
      loadPurchaseEntries();
    }
  }, [isOpen]);

  const loadPurchaseEntries = async () => {
    try {
      const response = await purchaseMilkAPI.getLast5DaysEntries();
      if (response.success) {
        setPurchaseEntries(response.data || []);
      }
    } catch (error) {
      console.error("Error loading purchase entries:", error);
    }
  };

  const resetPurchaseForm = () => {
    setPurchaseEntryId(0);
    setPurchaseMilkType(0);
    setPurchaseQty("");
    setPurchaseRate("");
    setPurchaseEntryDate(new Date().toISOString().split("T")[0]);
  };

  const handleSavePurchase = async () => {
    try {
      if (!purchaseQty || !purchaseRate) {
        await showAlert({
          type: "warning",
          title: "Validation Error",
          message: "Please enter quantity and rate",
        });
        return;
      }

      setLoading(true);

      const purchaseData = {
        purchaseEntryId: purchaseEntryId,
        milkType: purchaseMilkType,
        purchaseQtyLiters: parseFloat(purchaseQty),
        purchaseRate: parseFloat(purchaseRate),
        entryDate: purchaseEntryDate,
      };

      let response;
      if (purchaseEntryId === 0) {
        response = await purchaseMilkAPI.savePurchaseEntry(purchaseData);
      } else {
        response = await purchaseMilkAPI.updatePurchaseEntry(purchaseData);
      }

      if (response.success) {
        await showAlert({
          type: "success",
          title: "Success",
          message: purchaseEntryId === 0
            ? "Purchase entry saved successfully!"
            : "Purchase entry updated successfully!",
        });
        resetPurchaseForm();
        await loadPurchaseEntries();
      } else {
        await showAlert({
          type: "error",
          title: "Error",
          message: "Failed to save purchase entry.",
        });
      }
    } catch (error) {
      console.error("Error saving purchase:", error);
      await showAlert({
        type: "error",
        title: "Error",
        message: "Error saving purchase entry.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditPurchaseEntry = (entry) => {
    setPurchaseEntryId(entry.purchaseEntryId);
    setPurchaseMilkType(entry.milkType);
    setPurchaseQty(entry.purchaseQtyLiters.toString());
    setPurchaseRate(entry.purchaseRate.toString());
    setPurchaseEntryDate(new Date(entry.entryDate).toISOString().split("T")[0]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeletePurchaseEntry = async (entry) => {
    const confirmed = await showConfirm({
      type: "error",
      title: "Delete Purchase Entry",
      message: "Are you sure you want to delete this purchase entry? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);
      const response = await purchaseMilkAPI.deletePurchaseEntry(entry.purchaseEntryId);

      if (response.success) {
        await showAlert({
          type: "success",
          title: "Success",
          message: "Purchase entry deleted successfully!",
        });
        await loadPurchaseEntries();
      } else {
        await showAlert({
          type: "error",
          title: "Error",
          message: response.message || "Failed to delete purchase entry.",
        });
      }
    } catch (error) {
      console.error("Error deleting purchase entry:", error);
      await showAlert({
        type: "error",
        title: "Error",
        message: "Error deleting purchase entry.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 md:p-5 shadow-sm mt-2">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base md:text-lg font-bold flex items-center gap-2 md:gap-3 text-slate-900 dark:text-white">
          <i className="fas fa-truck text-primary" />
          <span>{text.purchaseMilkEntry}</span>
        </h2>
        <button
          type="button"
          className="text-primary hover:bg-primary/10 p-2 rounded-lg transition"
          onClick={onToggle}
        >
          <i
            className={`fas ${
              isOpen ? "fa-chevron-up" : "fa-chevron-down"
            }`}
          />
        </button>
      </div>

      {isOpen && (
        <div className="space-y-4">
          {/* Form */}
          <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <label className="w-full md:w-52 text-sm font-medium text-slate-700 dark:text-slate-300">
                {text.purchaseMilkType || "Milk Type"}
              </label>
              <select
                value={purchaseMilkType}
                onChange={(e) =>
                  setPurchaseMilkType(parseInt(e.target.value))
                }
                className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value={0}>{text.milkTypeCow || "Cow"}</option>
                <option value={1}>
                  {text.milkTypeBuffalo || "Buffalo"}
                </option>
              </select>
            </div>

            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <label className="w-full md:w-52 text-sm font-medium text-slate-700 dark:text-slate-300">
                {text.purchaseLiterQty || "Quantity (Liters)"}
              </label>
              <input
                type="number"
                step="0.1"
                value={purchaseQty}
                onChange={(e) => setPurchaseQty(e.target.value)}
                className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <label className="w-full md:w-52 text-sm font-medium text-slate-700 dark:text-slate-300">
                {text.purchaseRate || "Rate (₹/Liter)"}
              </label>
              <input
                type="number"
                step="0.01"
                value={purchaseRate}
                onChange={(e) => setPurchaseRate(e.target.value)}
                className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <label className="w-full md:w-52 text-sm font-medium text-slate-700 dark:text-slate-300">
                Entry Date
              </label>
              <input
                type="date"
                value={purchaseEntryDate}
                onChange={(e) => setPurchaseEntryDate(e.target.value)}
                className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={loading}
                className="flex-1 bg-primary hover:bg-[#007aa3] text-white font-semibold py-2.5 px-3 rounded-lg text-sm transition disabled:opacity-50"
                onClick={handleSavePurchase}
              >
                {loading
                  ? "Saving..."
                  : purchaseEntryId === 0
                  ? text.savePurchaseEntry || "Save Entry"
                  : "Update Entry"}
              </button>
              {purchaseEntryId > 0 && (
                <button
                  type="button"
                  className="px-4 py-2.5 bg-slate-500 hover:bg-slate-600 text-white rounded-lg text-sm font-semibold transition"
                  onClick={resetPurchaseForm}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* Last 5 Days Entries Table */}
          {purchaseEntries.length > 0 && (
            <div className="overflow-x-auto">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Last 5 Days Purchase Entries
              </h3>
              <table className="w-full text-sm border border-slate-200 dark:border-slate-600 rounded-lg">
                <thead className="bg-slate-100 dark:bg-slate-700">
                  <tr>
                    <th className="px-3 py-2 text-center text-slate-700 dark:text-slate-300">
                      Actions
                    </th>
                    <th className="px-3 py-2 text-left text-slate-700 dark:text-slate-300">
                      Date
                    </th>
                    <th className="px-3 py-2 text-left text-slate-700 dark:text-slate-300">
                      Type
                    </th>
                    <th className="px-3 py-2 text-right text-slate-700 dark:text-slate-300">
                      Qty (L)
                    </th>
                    <th className="px-3 py-2 text-right text-slate-700 dark:text-slate-300">
                      Rate (₹)
                    </th>
                    <th className="px-3 py-2 text-right text-slate-700 dark:text-slate-300">
                      Total (₹)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseEntries.map((entry) => (
                    <tr
                      key={entry.purchaseEntryId}
                      className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      <td className="px-3 py-2 text-center">
                        <button
                          type="button"
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                          onClick={() => handleEditPurchaseEntry(entry)}
                          title="Edit"
                        >
                          <i className="fas fa-edit" />
                        </button>
                        <button
                          type="button"
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          onClick={() => handleDeletePurchaseEntry(entry)}
                          title="Delete"
                        >
                          <i className="fas fa-trash" />
                        </button>
                      </td>
                      <td className="px-3 py-2 text-slate-900 dark:text-white">
                        {new Date(entry.entryDate).toLocaleDateString(
                          "en-IN"
                        )}
                      </td>
                      <td className="px-3 py-2 text-slate-900 dark:text-white">
                        {entry.milkType === 0 ? "Cow" : "Buffalo"}
                      </td>
                      <td className="px-3 py-2 text-right text-slate-900 dark:text-white">
                        {entry.purchaseQtyLiters.toFixed(2)}
                      </td>
                      <td className="px-3 py-2 text-right text-slate-900 dark:text-white">
                        {entry.purchaseRate.toFixed(2)}
                      </td>
                      <td className="px-3 py-2 text-right text-slate-900 dark:text-white font-semibold">
                        {(
                          entry.purchaseQtyLiters * entry.purchaseRate
                        ).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Alert and Confirm Dialogs */}
      {alertConfig && <Alert {...alertConfig} />}
      {confirmConfig && <ConfirmDialog {...confirmConfig} />}
    </section>
  );
}

export default PurchaseMilkEntry;
