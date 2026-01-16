import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import reportLanguage from "../../language/reportLanguage";
import { reportAPI } from "../../services/api";

// ✅ CRITICAL: Store window reference OUTSIDE component to persist across renders
let whatsappWindow = null;

function Report() {
  const { language } = useLanguage();
  const text = reportLanguage[language];

  const location = useLocation();
  const isReportTabActive = location.pathname === "/report";
  const isBillTabActive = location.pathname === "/bill";

  const [activeTab, setActiveTab] = useState("month");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [search, setSearch] = useState("");
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sendingBillFor, setSendingBillFor] = useState(null); // ✅ Track which bill is being sent

  useEffect(() => {
    loadReports();
  }, [activeTab, fromDate, toDate]);

  const loadReports = async () => {
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

      if (response && response.success) {
        setReports(
          response.data.map((r) => ({
            id: r.customerId,
            name: r.customerName,
            currentBill: r.currentBill,
            pending: r.pendingAmount,
            whatsappNo: r.whatsAppNo,
          }))
        );
      }
    } catch (error) {
      console.error("Error loading reports:", error);
      alert("Failed to load reports. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTabClick = (tabKey) => {
    setActiveTab(tabKey);
  };

  const handleFromDateChange = (e) => {
    setFromDate(e.target.value);
  };

  const handleToDateChange = (e) => {
    setToDate(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const filteredReports = useMemo(
    () =>
      reports.filter((r) =>
        r.name.toLowerCase().includes(search.toLowerCase())
      ),
    [search, reports]
  );

  const handleSendReport = async (customer) => {
    if (!customer.whatsappNo) {
      alert(`No WhatsApp number available for ${customer.name}`);
      return;
    }

    try {
      setSendingBillFor(customer.id); // ✅ Show loading for specific customer

      const response = await reportAPI.sendMonthlyBill(customer.id);

      if (response && response.success && response.data) {
        const whatsappUrl = response.data.whatsAppUrl;

        if (whatsappUrl) {
          // ✅ SOLUTION: Reuse existing WhatsApp tab or create new one
          if (!whatsappWindow || whatsappWindow.closed) {
            // Open new tab only if it doesn't exist or was closed
            whatsappWindow = window.open(whatsappUrl, "WhatsAppBilling");
          } else {
            // Reuse existing tab - change URL and bring to focus
            whatsappWindow.location.href = whatsappUrl;
            whatsappWindow.focus();
          }

          // ✅ Success feedback without alert (better UX)
          console.log(`Bill sent successfully for ${customer.name}`);
        } else {
          alert(
            `Bill generated but WhatsApp URL not available for ${customer.name}`
          );
        }
      } else {
        alert(
          `Failed to generate bill: ${response?.message || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Error sending report:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to send report";
      alert(`Error: ${errorMessage}`);
    } finally {
      setSendingBillFor(null); // ✅ Clear loading state
    }
  };

  return (
    <>
      <header className="sticky top-0 z-10 bg-background-light p-4 pb-2 dark:bg-background-dark md:static md:p-6 md:pb-3">
        <div className="flex items-center justify-between ">
          <div className="flex items-center gap-2 md:hidden">
            <img
              src="/images/logo.png"
              alt={text.pageTitle}
              width="40"
              height="32"
            />
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">
              {text.pageTitle}
            </h1>
          </div>
        </div>

        <div className="flex gap-2 mt-3 mb-2">
          <Link
            to="/report"
            className={`flex-1 h-10 flex items-center justify-center rounded-lg text-sm ${
              isReportTabActive
                ? "bg-primary text-white font-bold"
                : "bg-primary/20 text-primary dark:bg-primary/30"
            }`}
          >
            {text.tabReport}
          </Link>
          <Link
            to="/bill"
            className={`flex-1 h-10 flex items-center justify-center rounded-lg text-sm ${
              isBillTabActive
                ? "bg-primary text-white font-bold"
                : "bg-primary/20 text-primary dark:bg-primary/30"
            }`}
          >
            {text.tabBill}
          </Link>
        </div>

        <div className="relative mb-2">
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder={text.searchCustomerPlaceholder}
            value={search}
            onChange={handleSearchChange}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div
          className="flex gap-3 mb-1 overflow-x-auto"
          style={{ display: "none" }}
        >
          <button
            type="button"
            className={`flex h-10 flex-1 items-center justify-center rounded-lg text-sm ${
              activeTab === "month"
                ? "bg-primary text-white font-bold"
                : "bg-primary/20 text-primary dark:bg-primary/30"
            }`}
            onClick={() => handleTabClick("month")}
          >
            {text.month}
          </button>
          <button
            type="button"
            className={`flex h-10 flex-1 items-center justify-center rounded-lg text-sm ${
              activeTab === "quarter"
                ? "bg-primary text-white font-bold"
                : "bg-primary/20 text-primary dark:bg-primary/30"
            }`}
            onClick={() => handleTabClick("quarter")}
          >
            {text.quarter}
          </button>
          <button
            type="button"
            className={`flex h-10 flex-1 items-center justify-center rounded-lg text-sm ${
              activeTab === "custom"
                ? "bg-primary text-white font-bold"
                : "bg-primary/20 text-primary dark:bg-primary/30"
            }`}
            onClick={() => handleTabClick("custom")}
          >
            {text.customDate || "Custom"}
          </button>
        </div>

        {activeTab === "custom" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 ">
            <label className="flex items-center gap-3">
              <span className="text-primary font-semibold w-24">
                {text.fromDate}
              </span>
              <input
                type="date"
                value={fromDate}
                onChange={handleFromDateChange}
                className="h-10 flex-1 rounded-lg border border-slate-300 dark:border-slate-600 px-3 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-0 focus:border-primary"
              />
            </label>

            <label className="flex items-center gap-3">
              <span className="text-primary font-semibold w-24">
                {text.toDate}
              </span>
              <input
                type="date"
                value={toDate}
                onChange={handleToDateChange}
                className="h-10 flex-1 rounded-lg border border-slate-300 dark:border-slate-600 px-3 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-0 focus:border-primary"
              />
            </label>
          </div>
        )}
      </header>

      <main className="flex-1 overflow-y-auto p-4 pt-0 pb-24 md:p-6 md:pt-0 md:pb-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Loading reports...
            </p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-1 lg:grid-cols-2">
            {filteredReports.map((report) => {
              const totalDue = report.currentBill + report.pending;
              const isSending = sendingBillFor === report.id;

              return (
                <div
                  key={report.id}
                  className="customer-card bg-white dark:bg-slate-800/60 rounded-xl shadow-md p-2 md:p-3"
                >
                  <div className="font-bold text-sm text-slate-900 dark:text-white">
                    {report.name}
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3 text-sm mt-0">
                    <div>
                      <span className="text-slate-600 dark:text-slate-400">
                        {text.currentBill}:{" "}
                      </span>
                      <span className="font-semibold">
                        ₹{report.currentBill.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-600 dark:text-slate-400">
                        {text.pending}:{" "}
                      </span>
                      <span
                        className={`font-semibold ${
                          report.pending > 0 ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        ₹{report.pending.toFixed(2)}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="md:flex items-center justify-center gap-1 px-3 py-2 bg-primary rounded-lg text-white font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => handleSendReport(report)}
                      disabled={isSending}
                    >
                      {isSending ? (
                        <>
                          <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></span>
                          Sending...
                        </>
                      ) : (
                        text.sendReport
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}

export default Report;
