import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import settingsLanguage from "../../language/settingsLanguage";
import {
  customerAPI,
  dairyInfoAPI,
  milkRateAPI,
  purchaseMilkAPI,
} from "../../services/api";

function Settings() {
  const { language, setLanguage } = useLanguage();
  const text = settingsLanguage[language];

  const [customerMode, setCustomerMode] = useState("buttons");
  const [milkType, setMilkType] = useState("Both");
  const [useMasterRate, setUseMasterRate] = useState(true);
  const [loading, setLoading] = useState(false);

  // Customer form states
  const [customerName, setCustomerName] = useState("");
  const [whatsAppNo, setWhatsAppNo] = useState("");
  const [cowRate, setCowRate] = useState(55);
  const [buffaloRate, setBuffaloRate] = useState(65);
  const [cowDefaultLiters, setCowDefaultLiters] = useState(1);
  const [buffaloDefaultLiters, setBuffaloDefaultLiters] = useState(0.5);

  // Delete customer states
  const [deleteSearch, setDeleteSearch] = useState("");
  const [deleteCustomers, setDeleteCustomers] = useState([]);

  // Collapsible sections
  const [rateOpen, setRateOpen] = useState(false);
  const [dairyOpen, setDairyOpen] = useState(false);
  const [purchaseOpen, setPurchaseOpen] = useState(false);

  // Milk rate states
  const [masterCowRate, setMasterCowRate] = useState(55);
  const [masterBuffaloRate, setMasterBuffaloRate] = useState(65);

  // Dairy info states
  const [dairyName, setDairyName] = useState("");

  // Purchase entry states
  const [purchaseMilkType, setPurchaseMilkType] = useState(0);
  const [purchaseQty, setPurchaseQty] = useState("");
  const [purchaseRate, setPurchaseRate] = useState("");

  useEffect(() => {
    loadMilkRates();
    loadDairyInfo();
  }, []);

  const loadMilkRates = async () => {
    try {
      const response = await milkRateAPI.getMilkRates();
      if (response.success) {
        setMasterCowRate(response.data.cowRate);
        setMasterBuffaloRate(response.data.buffaloRate);
        setCowRate(response.data.cowRate);
        setBuffaloRate(response.data.buffaloRate);
      }
    } catch (error) {
      console.error("Error loading milk rates:", error);
    }
  };

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

  const loadDeleteCustomers = async () => {
    try {
      const response = await customerAPI.getCustomers();
      if (response.success) {
        setDeleteCustomers(
          response.data.map((c) => ({
            id: c.customerId,
            name: c.customerName,
            milkType:
              c.milkType === 0
                ? "Cow"
                : c.milkType === 1
                ? "Buffalo"
                : "Cow + Buffalo",
            pending: c.pendingAmount,
          }))
        );
      }
    } catch (error) {
      console.error("Error loading customers:", error);
    }
  };

  useEffect(() => {
    if (customerMode === "delete") {
      loadDeleteCustomers();
    }
  }, [customerMode]);

  const filteredDeleteCustomers = useMemo(
    () =>
      deleteCustomers.filter((c) =>
        c.name.toLowerCase().includes(deleteSearch.toLowerCase())
      ),
    [deleteSearch, deleteCustomers]
  );

  const handleSaveCustomer = async () => {
    try {
      setLoading(true);

      const milkTypeEnum =
        milkType === "Cow" ? 0 : milkType === "Buffalo" ? 1 : 2;

      const customerData = {
        customerName,
        whatsAppNo: whatsAppNo || null,
        milkType: milkTypeEnum,
        cowRate: useMasterRate ? null : cowRate,
        buffaloRate: useMasterRate ? null : buffaloRate,
        cowDefaultLiters:
          milkType === "Cow" || milkType === "Both" ? cowDefaultLiters : null,
        buffaloDefaultLiters:
          milkType === "Buffalo" || milkType === "Both"
            ? buffaloDefaultLiters
            : null,
        useMasterRate,
      };

      const response = await customerAPI.addCustomer(customerData);

      if (response.success) {
        alert("Customer added successfully!");
        // Reset form
        setCustomerName("");
        setWhatsAppNo("");
        setMilkType("Both");
        setUseMasterRate(true);
        setCustomerMode("buttons");
      } else {
        alert("Failed to add customer. Please try again.");
      }
    } catch (error) {
      console.error("Error adding customer:", error);
      alert("Error adding customer. Please check your input.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCustomer = async (customer) => {
    if (!window.confirm(`Are you sure you want to delete ${customer.name}?`)) {
      return;
    }

    try {
      setLoading(true);
      const response = await customerAPI.deleteCustomer(customer.id);

      if (response.success) {
        alert("Customer deleted successfully!");
        loadDeleteCustomers();
      } else {
        alert("Failed to delete customer.");
      }
    } catch (error) {
      console.error("Error deleting customer:", error);
      alert("Error deleting customer.");
    } finally {
      setLoading(false);
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

  const handleSaveDairy = async () => {
    try {
      setLoading(true);
      const response = await dairyInfoAPI.saveDairyInfo({
        dairyName,
        dairyLogo: null,
        paymentQRImage: null,
      });

      if (response.success) {
        alert("Dairy information saved successfully!");
      } else {
        alert("Failed to save dairy information.");
      }
    } catch (error) {
      console.error("Error saving dairy info:", error);
      alert("Error saving dairy information.");
    } finally {
      setLoading(false);
    }
  };

  const handleSavePurchase = async () => {
    try {
      setLoading(true);

      const purchaseData = {
        milkType: purchaseMilkType,
        purchaseQtyLiters: parseFloat(purchaseQty),
        purchaseRate: parseFloat(purchaseRate),
        entryDate: new Date().toISOString().split("T")[0],
      };

      const response = await purchaseMilkAPI.savePurchaseEntry(purchaseData);

      if (response.success) {
        alert("Purchase entry saved successfully!");
        setPurchaseQty("");
        setPurchaseRate("");
      } else {
        alert("Failed to save purchase entry.");
      }
    } catch (error) {
      console.error("Error saving purchase:", error);
      alert("Error saving purchase entry.");
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  return (
    <>
      <header className="sticky top-0 z-10 bg-background-light p-4 pb-2 dark:bg-background-dark md:static md:p-6 md:pb-3">
        <div className="flex items-center justify-between md:justify-start">
          <div className="flex items-center gap-2 md:hidden">
            <img
              src="/images/logo.png"
              alt={text.pageTitle}
              width={40}
              height={32}
            />
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">
              {text.pageTitle}
            </h1>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 pt-0 pb-24 md:p-6 md:pt-0 md:pb-6">
        {/* Language Section */}
        <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 md:p-5 shadow-sm mt-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base md:text-lg font-bold flex items-center gap-2 md:gap-3 text-slate-900 dark:text-white">
              <i className="fas fa-language text-primary" />
              <span>{text.languageSectionTitle}</span>
            </h2>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <label className="w-full md:w-52 text-sm font-medium text-slate-700 dark:text-slate-300">
              {text.languageSelectLabel}
            </label>
            <select
              value={language}
              onChange={handleLanguageChange}
              className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="en">{text.languageEnglish}</option>
              <option value="mr">{text.languageMarathi}</option>
            </select>
          </div>
        </section>

        {/* Customer Management */}
        <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 md:p-5 shadow-sm mt-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base md:text-lg font-bold flex items-center gap-2 md:gap-3 text-slate-900 dark:text-white">
              <i className="fas fa-users text-primary" />
              <span>{text.customerManagementTitle}</span>
            </h2>
          </div>

          {customerMode === "buttons" && (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="bg-primary hover:bg-[#007aa3] text-white font-semibold py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 text-sm transition"
                onClick={() => setCustomerMode("add")}
              >
                <i className="fas fa-plus" />
                <span>{text.addCustomer}</span>
              </button>
              <button
                type="button"
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 text-sm transition"
                onClick={() => setCustomerMode("delete")}
              >
                <i className="fas fa-trash" />
                <span>{text.deleteCustomer}</span>
              </button>
            </div>
          )}

          {customerMode === "add" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col md:flex-row md:items-center gap-2">
                  <label className="w-full md:w-40 text-sm font-medium text-slate-700 dark:text-slate-300">
                    {text.customerName}
                  </label>
                  <input
                    type="text"
                    placeholder={text.customerName}
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="flex flex-col md:flex-row md:items-center gap-2">
                  <label className="w-full md:w-40 text-sm font-medium text-slate-700 dark:text-slate-300">
                    {text.whatsappNo}
                  </label>
                  <input
                    type="tel"
                    placeholder={text.whatsappNo}
                    value={whatsAppNo}
                    onChange={(e) => setWhatsAppNo(e.target.value)}
                    className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col md:flex-row md:items-center gap-2">
                  <label className="w-full md:w-40 text-sm font-medium text-slate-700 dark:text-slate-300">
                    {text.milkType}
                  </label>
                  <select
                    className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    value={milkType}
                    onChange={(e) => setMilkType(e.target.value)}
                  >
                    <option value="Cow">{text.milkTypeCow}</option>
                    <option value="Buffalo">{text.milkTypeBuffalo}</option>
                    <option value="Both">{text.milkTypeBoth}</option>
                  </select>
                </div>

                <div className="flex flex-col md:flex-row md:items-center gap-2">
                  <div className="hidden md:block md:w-40" />
                  <label className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 dark:border-slate-500"
                      checked={useMasterRate}
                      onChange={(e) => setUseMasterRate(e.target.checked)}
                    />
                    <span>{text.useMasterRate}</span>
                  </label>
                </div>
              </div>

              {(milkType === "Cow" || milkType === "Both") && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {!useMasterRate && (
                    <div className="flex flex-col md:flex-row md:items-center gap-2">
                      <label className="w-full md:w-40 text-sm font-medium text-slate-700 dark:text-slate-300">
                        {text.cowRate}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={cowRate}
                        onChange={(e) => setCowRate(parseFloat(e.target.value))}
                        className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  )}

                  <div className="flex flex-col md:flex-row md:items-center gap-2">
                    <label className="w-full md:w-40 text-sm font-medium text-slate-700 dark:text-slate-300">
                      {text.cowDefaultLiters}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={cowDefaultLiters}
                      onChange={(e) =>
                        setCowDefaultLiters(parseFloat(e.target.value))
                      }
                      className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              )}

              {(milkType === "Buffalo" || milkType === "Both") && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {!useMasterRate && (
                    <div className="flex flex-col md:flex-row md:items-center gap-2">
                      <label className="w-full md:w-40 text-sm font-medium text-slate-700 dark:text-slate-300">
                        {text.buffaloRate}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={buffaloRate}
                        onChange={(e) =>
                          setBuffaloRate(parseFloat(e.target.value))
                        }
                        className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  )}

                  <div className="flex flex-col md:flex-row md:items-center gap-2">
                    <label className="w-full md:w-40 text-sm font-medium text-slate-700 dark:text-slate-300">
                      {text.buffaloDefaultLiters}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={buffaloDefaultLiters}
                      onChange={(e) =>
                        setBuffaloDefaultLiters(parseFloat(e.target.value))
                      }
                      className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={loading}
                  className="flex-1 bg-primary hover:bg-[#007aa3] text-white font-semibold py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 text-sm transition disabled:opacity-50"
                  onClick={handleSaveCustomer}
                >
                  {loading ? "Saving..." : text.saveCustomer}
                </button>
                <button
                  type="button"
                  className="flex-1 bg-slate-500 hover:bg-slate-600 text-white font-semibold py-2.5 px-3 rounded-lg text-sm transition"
                  onClick={() => setCustomerMode("buttons")}
                >
                  {text.cancel}
                </button>
              </div>
            </div>
          )}

          {customerMode === "delete" && (
            <div className="space-y-3">
              <div className="relative">
                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder={text.customerName}
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  value={deleteSearch}
                  onChange={(e) => setDeleteSearch(e.target.value)}
                />
              </div>

              <div className="space-y-3">
                {filteredDeleteCustomers.map((c) => (
                  <div
                    key={c.id}
                    className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3 text-sm"
                  >
                    <div className="flex justify-between">
                      <strong className="text-slate-900 dark:text-white">
                        {c.name}
                      </strong>
                      <small className="text-slate-600 dark:text-slate-300">
                        {c.milkType}
                      </small>
                    </div>
                    <div className="flex justify-between mt-2">
                      <span
                        className={`font-bold ${
                          c.pending > 0 ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        ₹{c.pending} {text.pendingSuffix}
                      </span>
                      <button
                        type="button"
                        disabled={loading}
                        className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition disabled:opacity-50"
                        onClick={() => handleDeleteCustomer(c)}
                      >
                        {text.delete}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="w-full bg-slate-500 hover:bg-slate-600 text-white font-semibold py-2.5 px-3 rounded-lg text-sm transition"
                onClick={() => setCustomerMode("buttons")}
              >
                {text.cancel}
              </button>
            </div>
          )}
        </section>

        {/* Milk Rate Master */}
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

        {/* Dairy Information */}
        <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 md:p-5 shadow-sm mt-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base md:text-lg font-bold flex items-center gap-2 md:gap-3 text-slate-900 dark:text-white">
              <i className="fas fa-store text-primary" />
              <span>{text.dairyInformation}</span>
            </h2>
            <button
              type="button"
              className="text-primary hover:bg-primary/10 p-2 rounded-lg transition"
              onClick={() => setDairyOpen((v) => !v)}
            >
              <i
                className={`fas ${
                  dairyOpen ? "fa-chevron-up" : "fa-chevron-down"
                }`}
              />
            </button>
          </div>

          {dairyOpen && (
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
                />
              </div>

              <div className="flex flex-col md:flex-row md:items-center gap-2">
                <label className="w-full md:w-52 text-sm font-medium text-slate-700 dark:text-slate-300">
                  {text.paymentQrImage}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
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
        </section>

        {/* Purchase Milk Entry */}
        <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 md:p-5 shadow-sm mt-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base md:text-lg font-bold flex items-center gap-2 md:gap-3 text-slate-900 dark:text-white">
              <i className="fas fa-truck text-primary" />
              <span>{text.purchaseMilkEntry}</span>
            </h2>
            <button
              type="button"
              className="text-primary hover:bg-primary/10 p-2 rounded-lg transition"
              onClick={() => setPurchaseOpen((v) => !v)}
            >
              <i
                className={`fas ${
                  purchaseOpen ? "fa-chevron-up" : "fa-chevron-down"
                }`}
              />
            </button>
          </div>

          {purchaseOpen && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center gap-2">
                <label className="w-full md:w-52 text-sm font-medium text-slate-700 dark:text-slate-300">
                  {text.purchaseMilkType}
                </label>
                <select
                  value={purchaseMilkType}
                  onChange={(e) =>
                    setPurchaseMilkType(parseInt(e.target.value))
                  }
                  className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value={0}>{text.milkTypeCow}</option>
                  <option value={1}>{text.milkTypeBuffalo}</option>
                </select>
              </div>

              <div className="flex flex-col md:flex-row md:items-center gap-2">
                <label className="w-full md:w-52 text-sm font-medium text-slate-700 dark:text-slate-300">
                  {text.purchaseLiterQty}
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
                  {text.purchaseRate}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={purchaseRate}
                  onChange={(e) => setPurchaseRate(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <button
                type="button"
                disabled={loading}
                className="w-full bg-primary hover:bg-[#007aa3] text-white font-semibold py-2.5 px-3 rounded-lg text-sm transition disabled:opacity-50"
                onClick={handleSavePurchase}
              >
                {loading ? "Saving..." : text.savePurchaseEntry}
              </button>
            </div>
          )}
        </section>
      </main>
    </>
  );
}

export default Settings;
