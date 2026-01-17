import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { useAlert } from "../../Hooks/useAlert";
import billLanguage from "../../language/billLanguage";
import reportLanguage from "../../language/reportLanguage";
import { billingAPI, reportAPI } from "../../services/api";
import Alert from "../common/Alert";
import Spinner from "../common/Spinner";

function Bill() {
  const { language } = useLanguage();
  const reportText = reportLanguage[language];
  const text = billLanguage[language];
  const { showAlert, alertConfig } = useAlert();

  const location = useLocation();
  const isReportTabActive = location.pathname === "/report";
  const isBillTabActive = location.pathname === "/bill";

  // Get previous month name
  const getPreviousMonthName = () => {
    const currentDate = new Date();
    const previousMonth =
      currentDate.getMonth() === 0 ? 11 : currentDate.getMonth() - 1;
    return reportText.months[previousMonth];
  };

  const previousMonthName = getPreviousMonthName();

  const [search, setSearch] = useState("");
  const [bills, setBills] = useState([]);
  const [payments, setPayments] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("month");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    loadBills();
  }, [activeTab, fromDate, toDate]);

  const loadBills = async () => {
    try {
      setLoading(true);

      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const quarter = Math.ceil(month / 3);

      let response;

      if (activeTab === "month") {
        response = await reportAPI.getCustomerBills(
          "month",
          year,
          month,
          null,
          null,
          null
        );
      } else if (activeTab === "quarter") {
        response = await reportAPI.getCustomerBills(
          "quarter",
          year,
          null,
          quarter,
          null,
          null
        );
      } else if (activeTab === "custom" && fromDate && toDate) {
        response = await reportAPI.getCustomerBills(
          "custom",
          null,
          null,
          null,
          fromDate,
          toDate
        );
      }
      console.log("Customer Bills Response:", response);
      if (response && response.success) {
        const billData = response.data.map((b) => ({
          id: b.customerId,
          name: b.customerName,
          currentBill: b.currentBill,
          pending: b.pendingAmount,
          totalDue: b.totalDue, // ✅ ADD THIS
        }));

        setBills(billData);

        const paymentsInit = {};
        billData.forEach((c) => {
          paymentsInit[c.id] = {
            fullPayment: false,
            amount: 0,
            totalDue: c.totalDue, // ✅ USE API VALUE
          };
        });
        setPayments(paymentsInit);
      }
    } catch (error) {
      console.error("Error loading bills:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = useMemo(
    () =>
      bills.filter((c) => c.name.toLowerCase().includes(search.toLowerCase())),
    [search, bills]
  );

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleFullPaymentChange = (id, checked) => {
    setPayments((prev) => {
      const customerState = prev[id];
      const newAmount = checked ? customerState.totalDue : 0;
      return {
        ...prev,
        [id]: {
          ...customerState,
          fullPayment: checked,
          amount: newAmount,
        },
      };
    });
  };

  const handleAmountChange = (id, value) => {
    const numeric = Number(value) || 0;
    setPayments((prev) => {
      const customerState = prev[id];
      const isFull = numeric >= customerState.totalDue;
      return {
        ...prev,
        [id]: {
          ...customerState,
          amount: numeric,
          fullPayment: isFull,
        },
      };
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      let periodStartDate, periodEndDate, billingPeriod;

      if (activeTab === "month") {
        periodStartDate = new Date(year, month - 1, 1)
          .toISOString()
          .split("T")[0];
        periodEndDate = new Date(year, month, 0).toISOString().split("T")[0];
        billingPeriod = "Month";
      } else if (activeTab === "quarter") {
        const quarter = Math.ceil(month / 3);
        const startMonth = (quarter - 1) * 3;
        periodStartDate = new Date(year, startMonth, 1)
          .toISOString()
          .split("T")[0];
        periodEndDate = new Date(year, startMonth + 3, 0)
          .toISOString()
          .split("T")[0];
        billingPeriod = "Quarter";
      } else {
        periodStartDate = fromDate;
        periodEndDate = toDate;
        billingPeriod = "Custom";
      }

      const paymentPromises = filteredCustomers
        .filter((c) => payments[c.id].amount > 0)
        .map((c) => {
          const p = payments[c.id];
          return billingAPI.saveBillPayment({
            customerId: c.id,
            currentBill: c.currentBill,
            previousPending: c.pending,
            amountPaid: p.amount,
            billingPeriod: billingPeriod,
            periodStartDate: periodStartDate,
            periodEndDate: periodEndDate,
          });
        });

      await Promise.all(paymentPromises);
      await showAlert({
        type: "success",
        title: "Success",
        message: "Bill payments saved successfully!",
      });
      loadBills(); // Reload to get updated data
    } catch (error) {
      console.error("Error saving bill payments:", error);
      await showAlert({
        type: "error",
        title: "Error",
        message: "Error saving bill payments. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-10 bg-background-light p-4 pb-2 dark:bg-background-dark md:static md:p-6 md:pb-3">
        <div className="flex items-center justify-between md:hidden">
          <div className="flex items-center gap-2 ">
            <img className="logo" src="/images/logo.png" alt={text.appTitle} />
          </div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">
            {text.pageTitle}
          </h1>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center justify-center gap-1 px-3 py-2 bg-primary rounded-lg text-white font-bold text-sm md:hidden disabled:opacity-50"
          >
            <i className="fas fa-save" />
            <span>{loading ? "Saving..." : text.save}</span>
          </button>
        </div>

        <div className="flex gap-2 mt-0 mb-2">
          <Link
            to="/report"
            className={`flex-1 h-10 flex items-center justify-center rounded-lg text-sm ${
              isReportTabActive
                ? "bg-primary text-white font-bold"
                : "bg-primary/20 text-primary dark:bg-primary/30"
            }`}
          >
            {reportText.tabReport} ({previousMonthName})
          </Link>
          <Link
            to="/bill"
            className={`flex-1 h-10 flex items-center justify-center rounded-lg text-sm ${
              isBillTabActive
                ? "bg-primary text-white font-bold"
                : "bg-primary/20 text-primary dark:bg-primary/30"
            }`}
          >
            {reportText.tabBill} ({previousMonthName})
          </Link>
        </div>

        <div className="mt-2 md:mt-0 flex items-center gap-3">
          <div className="relative flex-1">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-0 focus:border-primary"
              placeholder={text.searchCustomerPlaceholder}
              type="text"
              value={search}
              onChange={handleSearchChange}
            />
          </div>

          <button
            onClick={handleSave}
            disabled={loading}
            className="hidden md:flex items-center justify-center gap-1 px-3 py-2 bg-primary rounded-lg text-white font-bold text-sm disabled:opacity-50"
          >
            <i className="fas fa-save" />
            <span>{loading ? "Saving..." : text.save}</span>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 pt-0 pb-24 md:p-6 md:pt-0 md:pb-6">
        {loading ? (
          <Spinner />
        ) : (
          <section>
            <div className="grid gap-3 md:grid-cols-1 lg:grid-cols-2">
              {filteredCustomers.map((c) => {
                const state = payments[c.id] || {
                  fullPayment: false,
                  amount: 0,
                  totalDue: 0,
                };
                const totalDue = state.totalDue;
                return (
                  <div
                    key={c.id}
                    className="customer-card bg-white dark:bg-slate-800/60 rounded-xl shadow-md p-2 md:p-3"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-bold text-slate-900 dark:text-white text-sm md:text-base">
                        {c.name}
                      </p>
                      <span className="text-xs md:text-sm bg-primary/10 text-primary px-2 py-0.5 rounded font-semibold">
                        ₹{totalDue.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 mb-2 text-xs">
                      <span className="text-slate-600 dark:text-slate-400">
                        {text.currentBill}:{" "}
                        <span className="font-semibold text-slate-900 dark:text-white">
                          ₹{c.currentBill.toFixed(2)}
                        </span>
                      </span>
                      <span className="text-slate-600 dark:text-slate-400">
                        {text.pending}:{" "}
                        <span
                          className={`font-semibold ${
                            c.pending > 0 ? "text-red-600" : "text-green-600"
                          }`}
                        >
                          ₹{c.pending.toFixed(2)}
                        </span>
                      </span>
                      <label className="inline-flex items-center gap-1 text-xs text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="rounded border-slate-300 dark:border-slate-500 w-3 h-3"
                          checked={state.fullPayment}
                          onChange={(e) =>
                            handleFullPaymentChange(c.id, e.target.checked)
                          }
                        />
                        <span>{text.fullPayment}</span>
                      </label>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-xs text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {text.amountToPay}:
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        className="flex-1 h-8 md:h-9 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                        value={state.amount || ""}
                        onChange={(e) =>
                          handleAmountChange(c.id, e.target.value)
                        }
                        placeholder="0"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* Alert Dialog */}
      {alertConfig && <Alert {...alertConfig} />}
    </>
  );
}

export default Bill;
