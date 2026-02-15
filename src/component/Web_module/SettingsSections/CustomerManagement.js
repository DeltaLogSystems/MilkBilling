import { useEffect, useMemo, useState } from "react";
import { useAlert } from "../../../Hooks/useAlert";
import { customerAPI, milkRateAPI } from "../../../services/api";
import Alert from "../../common/Alert";
import ConfirmDialog from "../../common/ConfirmDialog";

function CustomerManagement({ text }) {
  const { showAlert, showConfirm, alertConfig, confirmConfig } = useAlert();
  const [customerMode, setCustomerMode] = useState("buttons");
  const [milkType, setMilkType] = useState("Cow");
  const [useMasterRate, setUseMasterRate] = useState(true);
  const [loading, setLoading] = useState(false);

  // Customer form states
  const [customerId, setCustomerId] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [whatsAppNo, setWhatsAppNo] = useState("");
  const [cowRate, setCowRate] = useState(55);
  const [buffaloRate, setBuffaloRate] = useState(65);
  const [cowDefaultLiters, setCowDefaultLiters] = useState(1);
  const [buffaloDefaultLiters, setBuffaloDefaultLiters] = useState(0.5);

  // Delete customer states
  const [deleteSearch, setDeleteSearch] = useState("");
  const [deleteCustomers, setDeleteCustomers] = useState([]);

  // Add customer list for table display
  const [customerList, setCustomerList] = useState([]);
  const [customerSearch, setCustomerSearch] = useState("");

  // Milk rate states
  const [masterCowRate, setMasterCowRate] = useState(55);
  const [masterBuffaloRate, setMasterBuffaloRate] = useState(65);

  const [nameError, setNameError] = useState("");
  const [whatsappError, setWhatsappError] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadMilkRates();
  }, []);

  // Clear name error when user types valid name
  useEffect(() => {
    if (customerName && customerName.trim().length >= 2) {
      // Check if it's not a duplicate
      const isDuplicate = customerList.some(
        (c) =>
          c.customerName.toLowerCase() === customerName.toLowerCase().trim() &&
          c.customerId !== customerId,
      );

      if (!isDuplicate) {
        setNameError("");
        setErrorMessage("");
      } else {
        setNameError("Customer with this name already exists");
      }
    } else if (customerName && customerName.trim().length < 2) {
      setNameError("Customer name must be at least 2 characters");
    } else if (!customerName || !customerName.trim()) {
      setNameError("Customer name is required");
    }
  }, [customerName, customerList, customerId]);

  // Clear whatsapp error when user types valid number
  useEffect(() => {
    if (whatsAppNo) {
      const whatsappRegex = /^[6-9]\d{9}$/;
      const cleanNumber = whatsAppNo.replace(/\D/g, "");

      if (whatsappRegex.test(cleanNumber)) {
        setWhatsappError("");
        setErrorMessage("");
      } else if (cleanNumber.length > 0) {
        setWhatsappError(
          "Enter valid 10-digit WhatsApp number (starting with 6-9)",
        );
      }
    } else {
      setWhatsappError(""); // Clear error if field is empty (optional field)
    }
  }, [whatsAppNo]);

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
                  : "Cow", // "Cow + Buffalo" option removed
            pending: c.pendingAmount,
          })),
        );
      }
    } catch (error) {
      console.error("Error loading customers:", error);
    }
  };

  const loadCustomerList = async () => {
    try {
      const response = await customerAPI.getCustomers();
      if (response.success) {
        setCustomerList(response.data);
      }
    } catch (error) {
      console.error("Error loading customer list:", error);
    }
  };

  useEffect(() => {
    if (customerMode === "delete") {
      loadDeleteCustomers();
    } else if (customerMode === "add") {
      loadCustomerList();
    }
  }, [customerMode]);

  const filteredDeleteCustomers = useMemo(
    () =>
      deleteCustomers.filter((c) =>
        c.name.toLowerCase().includes(deleteSearch.toLowerCase()),
      ),
    [deleteSearch, deleteCustomers],
  );

  const filteredCustomerList = useMemo(
    () =>
      customerList.filter(
        (c) =>
          c.customerName.toLowerCase().includes(customerSearch.toLowerCase()) ||
          (c.whatsAppNo && c.whatsAppNo.includes(customerSearch)),
      ),
    [customerSearch, customerList],
  );

  const resetCustomerForm = () => {
    setCustomerId(0);
    setCustomerName("");
    setWhatsAppNo("");
    setMilkType("Cow");
    setCowRate(0);
    setBuffaloRate(0);
    setCowDefaultLiters(1);
    setBuffaloDefaultLiters(1);
    setUseMasterRate(true);

    // Clear validation errors
    setNameError("");
    setWhatsappError("");
    setErrorMessage("");
  };

  const handleEditCustomer = (customer) => {
    setCustomerId(customer.customerId);
    setCustomerName(customer.customerName);
    setWhatsAppNo(customer.whatsAppNo || "");
    setMilkType(
      customer.milkType === 0
        ? "Cow"
        : customer.milkType === 1
          ? "Buffalo"
          : "Cow", // "Both" option removed, defaulting to "Cow"
    );
    setUseMasterRate(customer.useMasterRate);
    setCowRate(customer.cowRate || masterCowRate);
    setBuffaloRate(customer.buffaloRate || masterBuffaloRate);
    setCowDefaultLiters(customer.cowDefaultLiters || 1);
    setBuffaloDefaultLiters(customer.buffaloDefaultLiters || 0.5);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSaveCustomer = async () => {
    try {
      // Clear previous errors
      setNameError("");
      setWhatsappError("");
      setErrorMessage("");

      // Client-side validation - Customer Name
      if (!customerName?.trim()) {
        setNameError("Customer name is required");
        return;
      }
      if (customerName.trim().length < 2) {
        setNameError("Customer name must be at least 2 characters");
        return;
      }

      // Client-side validation - WhatsApp Number
      if (whatsAppNo) {
        const whatsappRegex = /^[6-9]\d{9}$/;
        const cleanNumber = whatsAppNo.replace(/\D/g, "");
        if (!whatsappRegex.test(cleanNumber)) {
          setWhatsappError(
            "Enter valid 10-digit WhatsApp number (starting with 6-9)",
          );
          return;
        }
      }

      // Check for duplicate customer name (excluding current customer during edit)
      const existingCustomer = customerList.find(
        (c) =>
          c.customerName.toLowerCase() === customerName.toLowerCase().trim() &&
          c.customerId !== customerId,
      );
      if (existingCustomer) {
        setNameError("Customer with this name already exists");
        return;
      }

      setLoading(true);

      const milkTypeEnum =
        milkType === "Cow" ? 0 : milkType === "Buffalo" ? 1 : 2;

      const customerData = {
        customerId,
        customerName: customerName.trim(),
        whatsAppNo: whatsAppNo?.trim() || null,
        milkType: milkTypeEnum,
        cowRate: useMasterRate ? null : cowRate,
        buffaloRate: useMasterRate ? null : buffaloRate,
        cowDefaultLiters:
          milkType === "Cow" /* || milkType === "Both" */ ? cowDefaultLiters : null,
        buffaloDefaultLiters:
          milkType === "Buffalo" /* || milkType === "Both" */
            ? buffaloDefaultLiters
            : null,
        useMasterRate,
      };

      let response;
      if (customerId === 0) {
        response = await customerAPI.addCustomer(customerData);
        if (response.success) {
          await showAlert({
            type: "success",
            title: "Success",
            message: "Customer added successfully!",
          });
          resetCustomerForm();
          await loadCustomerList();
          setCustomerMode("buttons");
        } else {
          setErrorMessage(response.message || "Failed to add customer");
        }
      } else {
        response = await customerAPI.updateCustomer(customerData);
        if (response.success) {
          await showAlert({
            type: "success",
            title: "Success",
            message: "Customer updated successfully!",
          });
          resetCustomerForm();
          await loadCustomerList();
          setCustomerMode("buttons");
        } else {
          setErrorMessage(response.message || "Failed to update customer");
        }
      }
    } catch (error) {
      console.error("Error saving customer:", error);

      // Handle server validation errors
      if (error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage(
          `Error ${
            customerId === 0 ? "adding" : "updating"
          } customer. Please check your input.`,
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCustomer = async (customer) => {
    const confirmed = await showConfirm({
      type: "error",
      title: "Delete Customer",
      message: `Are you sure you want to delete ${customer.name}? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);
      const response = await customerAPI.deleteCustomer(customer.id);

      if (response.success) {
        await showAlert({
          type: "success",
          title: "Success",
          message: "Customer deleted successfully!",
        });
        await loadDeleteCustomers();
        await loadCustomerList(); // Refresh main customer list too
      } else {
        await showAlert({
          type: "error",
          title: "Error",
          message: response.message || "Failed to delete customer",
        });
      }
    } catch (error) {
      console.error("Error deleting customer:", error);
      await showAlert({
        type: "error",
        title: "Error",
        message:
          "Error deleting customer: " +
          (error.response?.data?.message || error.message),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerSearchChange = (e) => {
    setCustomerSearch(e.target.value);
  };

  return (
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
            onClick={() => {
              setCustomerMode("add");
              resetCustomerForm();
            }}
          >
            <i className="fas fa-plus" />
            <span>{text.addCustomer}</span>
          </button>
          <button
            type="button"
            className="bg-slate-600 hover:bg-slate-700 text-white font-semibold py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 text-sm transition"
            onClick={() => {
              setCustomerMode("delete");
              loadCustomerList();
            }}
          >
            <i className="fas fa-edit" />
            <span>{text.editAndDelete || "Edit and Delete"}</span>
          </button>
        </div>
      )}

      {customerMode === "add" && (
        <div className="space-y-4">
          {/* Validation Error Message */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
              {errorMessage}
            </div>
          )}

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
                className={`flex-1 rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition ${
                  nameError
                    ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-200"
                    : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-primary"
                }`}
              />
              {nameError && (
                <p className="text-red-600 text-xs mt-1">{nameError}</p>
              )}
            </div>

            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <label className="w-full md:w-40 text-sm font-medium text-slate-700 dark:text-slate-300">
                {text.whatsappNo}
              </label>
              <input
                type="tel"
                placeholder="e.g., 9876543210"
                value={whatsAppNo}
                onChange={(e) => setWhatsAppNo(e.target.value)}
                className={`flex-1 rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition ${
                  whatsappError
                    ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-200"
                    : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-primary"
                }`}
              />
              {whatsappError && (
                <p className="text-red-600 text-xs mt-1">{whatsappError}</p>
              )}
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
                {/* <option value="Both">{text.milkTypeBoth}</option> */}
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

          {/* (milkType === "Cow" || milkType === "Both") && ( */}
          {milkType === "Cow" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {!useMasterRate && (
                <div className="flex flex-col md:flex-row md:items-center gap-2">
                  <label className="w-full md:w-40 text-sm font-medium text-slate-700 dark:text-slate-300">
                    {text.cowRate}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={cowRate === 0 ? "" : cowRate}
                    onChange={(e) =>
                      setCowRate(e.target.value === "" ? "" : parseFloat(e.target.value))
                    }
                    onBlur={(e) =>
                      setCowRate(e.target.value === "" ? 0 : parseFloat(e.target.value) || 0)
                    }
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
                  value={cowDefaultLiters === 0 ? "" : cowDefaultLiters}
                  onChange={(e) =>
                    setCowDefaultLiters(e.target.value === "" ? "" : parseFloat(e.target.value))
                  }
                  onBlur={(e) =>
                    setCowDefaultLiters(e.target.value === "" ? 0 : parseFloat(e.target.value) || 0)
                  }
                  className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          )}

          {/* (milkType === "Buffalo" || milkType === "Both") && ( */}
          {milkType === "Buffalo" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {!useMasterRate && (
                <div className="flex flex-col md:flex-row md:items-center gap-2">
                  <label className="w-full md:w-40 text-sm font-medium text-slate-700 dark:text-slate-300">
                    {text.buffaloRate}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={buffaloRate === 0 ? "" : buffaloRate}
                    onChange={(e) =>
                      setBuffaloRate(e.target.value === "" ? "" : parseFloat(e.target.value))
                    }
                    onBlur={(e) =>
                      setBuffaloRate(e.target.value === "" ? 0 : parseFloat(e.target.value) || 0)
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
                  value={buffaloDefaultLiters === 0 ? "" : buffaloDefaultLiters}
                  onChange={(e) =>
                    setBuffaloDefaultLiters(e.target.value === "" ? "" : parseFloat(e.target.value))
                  }
                  onBlur={(e) =>
                    setBuffaloDefaultLiters(e.target.value === "" ? 0 : parseFloat(e.target.value) || 0)
                  }
                  className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              disabled={loading || !!nameError || !!whatsappError}
              className="flex-1 bg-primary hover:bg-[#007aa3] text-white font-semibold py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSaveCustomer}
            >
              {loading
                ? "Saving..."
                : customerId === 0
                  ? text.saveCustomer
                  : text.updateCustomer}
            </button>
            <button
              type="button"
              className="flex-1 bg-slate-500 hover:bg-slate-600 text-white font-semibold py-2.5 px-3 rounded-lg text-sm transition"
              onClick={() => {
                setCustomerMode("buttons");
                resetCustomerForm();
                setErrorMessage("");
                setNameError("");
                setWhatsappError("");
              }}
            >
              {text.cancel}
            </button>
          </div>

          {/* Customer List Table with Search */}
          {customerList.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Active Customers
                </h3>
              </div>

              {/* Search Box */}
              <div className="relative mb-4">
                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Search customer by name or phone..."
                  type="text"
                  value={customerSearch}
                  onChange={handleCustomerSearchChange}
                />
              </div>

              <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-600 max-h-96 overflow-y-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 sticky top-0">
                    <tr>
                      <th className="px-4 py-3">{text.actions || "Actions"}</th>
                      <th className="px-4 py-3">{text.customerName}</th>
                      <th className="px-4 py-3">{text.whatsappNo}</th>
                      <th className="px-4 py-3">{text.milkType}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomerList.length > 0 ? (
                      filteredCustomerList.map((customer) => (
                        <tr
                          key={customer.customerId}
                          className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 transition"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                className="text-primary hover:text-[#007aa3] transition"
                                onClick={() => handleEditCustomer(customer)}
                                title="Edit Customer"
                              >
                                <i className="fas fa-edit text-lg" />
                              </button>
                              <button
                                type="button"
                                disabled={loading}
                                className="text-red-600 hover:text-red-700 transition disabled:opacity-50"
                                onClick={() => handleDeleteCustomer({ id: customer.customerId, name: customer.customerName })}
                                title="Delete Customer"
                              >
                                <i className="fas fa-trash text-lg" />
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-900 dark:text-white font-medium">
                            {customer.customerName}
                          </td>
                          <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                            {customer.whatsAppNo || "N/A"}
                          </td>
                          <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                            {customer.milkType === 0
                              ? text.milkTypeCow
                              : customer.milkType === 1
                                ? text.milkTypeBuffalo
                                : text.milkTypeCow} {/* milkTypeBoth option removed */}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="4"
                          className="px-4 py-8 text-center text-slate-500 dark:text-slate-400"
                        >
                          <i className="fas fa-search text-3xl mb-2 block" />
                          <p>No customers found matching your search</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Results Count */}
              <div className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                Showing {filteredCustomerList.length} of {customerList.length}{" "}
                customers
              </div>
            </div>
          )}
        </div>
      )}

      {customerMode === "delete" && (
        <div className="space-y-4">
          {/* Search Box */}
          <div className="relative">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="Search customer by name or phone..."
              type="text"
              value={customerSearch}
              onChange={handleCustomerSearchChange}
            />
          </div>

          {/* Customer List Table */}
          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-600 max-h-96 overflow-y-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 sticky top-0">
                <tr>
                  <th className="px-4 py-3">{text.actions || "Actions"}</th>
                  <th className="px-4 py-3">{text.customerName}</th>
                  <th className="px-4 py-3">{text.whatsappNo}</th>
                  <th className="px-4 py-3">{text.milkType}</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomerList.length > 0 ? (
                  filteredCustomerList.map((customer) => (
                    <tr
                      key={customer.customerId}
                      className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 transition"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            className="text-primary hover:text-[#007aa3] transition"
                            onClick={() => {
                              handleEditCustomer(customer);
                              setCustomerMode("add");
                            }}
                            title="Edit Customer"
                          >
                            <i className="fas fa-edit text-lg" />
                          </button>
                          <button
                            type="button"
                            disabled={loading}
                            className="text-red-600 hover:text-red-700 transition disabled:opacity-50"
                            onClick={() => handleDeleteCustomer({ id: customer.customerId, name: customer.customerName })}
                            title="Delete Customer"
                          >
                            <i className="fas fa-trash text-lg" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-900 dark:text-white font-medium">
                        {customer.customerName}
                      </td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                        {customer.whatsAppNo || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                        {customer.milkType === 0
                          ? text.milkTypeCow
                          : customer.milkType === 1
                            ? text.milkTypeBuffalo
                            : text.milkTypeCow}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-4 py-8 text-center text-slate-500 dark:text-slate-400"
                    >
                      <i className="fas fa-search text-3xl mb-2 block" />
                      <p>No customers found matching your search</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Results Count */}
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Showing {filteredCustomerList.length} of {customerList.length} customers
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

      {/* Alert and Confirm Dialogs */}
      {alertConfig && <Alert {...alertConfig} />}
      {confirmConfig && <ConfirmDialog {...confirmConfig} />}
    </section>
  );
}

export default CustomerManagement;
