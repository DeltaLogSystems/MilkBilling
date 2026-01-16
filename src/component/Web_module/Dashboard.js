import { useEffect, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import dashboardLanguage from "../../language/dashboardLanguage";
import { dashboardAPI } from "../../services/api";
import Spinner from "../common/Spinner";

function Dashboard() {
  const { language } = useLanguage();
  const text = dashboardLanguage[language];

  const [activeTab, setActiveTab] = useState("month");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [monthlyDataLoading, setMonthlyDataLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    purchasedMilk: {
      cowLiters: 0,
      cowAmount: 0,
      buffaloLiters: 0,
      buffaloAmount: 0,
    },
    soldMilk: {
      cowLiters: 0,
      cowAmount: 0,
      buffaloLiters: 0,
      buffaloAmount: 0,
    },
    profit: 0,
  });
  const [monthlySoldMilk, setMonthlySoldMilk] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, [activeTab, fromDate, toDate]);

  useEffect(() => {
    loadMonthlySoldMilk();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const quarter = Math.ceil(month / 3);

      let response;

      if (activeTab === "month") {
        response = await dashboardAPI.getDashboardSummary(
          "month",
          year,
          month,
          null,
          null,
          null
        );
      } else if (activeTab === "quarter") {
        response = await dashboardAPI.getDashboardSummary(
          "quarter",
          year,
          null,
          quarter,
          null,
          null
        );
      } else if (activeTab === "custom" && fromDate && toDate) {
        response = await dashboardAPI.getDashboardSummary(
          "custom",
          null,
          null,
          null,
          fromDate,
          toDate
        );
      }

      if (response && response.success) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMonthlySoldMilk = async () => {
    try {
      setMonthlyDataLoading(true);
      const response = await dashboardAPI.getMonthlySoldMilk();
      if (response && response.success) {
        setMonthlySoldMilk(response.data);
      }
    } catch (error) {
      console.error("Error loading monthly sold milk:", error);
    } finally {
      setMonthlyDataLoading(false);
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

  return (
    <>
      <header className="sticky top-0 z-10 bg-background-light p-4 pb-2 dark:bg-background-dark md:static md:p-6 md:pb-3">
        <div className="flex items-center justify-between ">
          <div className="flex items-center gap-2">
            <img
              src="/images/logo.png"
              alt={text.pageTitle}
              className="w-10 h-8 md:w-16 md:h-12"
            />
            <h1 className="text-lg md:text-2xl font-bold text-slate-900 dark:text-white">
              {text.pageTitle}
            </h1>
          </div>
        </div>

        <div className="flex gap-3 mb-3 overflow-x-auto">
          <button
            type="button"
            className={`flex h-10 flex-1 items-center justify-center rounded-lg text-sm 
                ${
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
            className={`flex h-10 flex-1 items-center justify-center rounded-lg text-sm 
                ${
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
            className={`flex h-10 flex-1 items-center justify-center rounded-lg text-sm
                 ${
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <label className="flex items-center gap-3">
              <span className="text-md font-bold text-primary w-24">
                {text.fromDate}
              </span>
              <input
                type="date"
                value={fromDate}
                onChange={handleFromDateChange}
                className="h-10 flex-1 rounded-lg border border-slate-300 px-3 bg-white text-sm focus:outline-none focus:ring-0 focus:border-primary"
              />
            </label>

            <label className="flex items-center gap-3">
              <span className="text-md font-bold text-primary w-24">
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
          <Spinner />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="font-bold text-lg mb-4">{text.purchasedMilk}</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 text-left">
                    <span className="font-semibold">{text.cow}</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {dashboardData.purchasedMilk.cowLiters.toFixed(1)} L
                    </span>
                    <span className="text-slate-500 dark:text-slate-400">
                      ₹
                      {dashboardData.purchasedMilk.cowAmount.toLocaleString(
                        "en-IN"
                      )}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 text-left">
                    <span className="font-semibold">{text.buffalo}</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {dashboardData.purchasedMilk.buffaloLiters.toFixed(1)} L
                    </span>
                    <span className="text-slate-500 dark:text-slate-400">
                      ₹
                      {dashboardData.purchasedMilk.buffaloAmount.toLocaleString(
                        "en-IN"
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="font-bold text-lg mb-4">{text.soldMilk}</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 text-left">
                    <span className="font-semibold">{text.cow}</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {dashboardData.soldMilk.cowLiters.toFixed(1)} L
                    </span>
                    <span className="text-slate-500 dark:text-slate-400">
                      ₹
                      {dashboardData.soldMilk.cowAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 text-left">
                    <span className="font-semibold">{text.buffalo}</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {dashboardData.soldMilk.buffaloLiters.toFixed(1)} L
                    </span>
                    <span className="text-slate-500 dark:text-slate-400">
                      ₹
                      {dashboardData.soldMilk.buffaloAmount.toLocaleString(
                        "en-IN"
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col items-center justify-center">
                <h3 className="font-bold text-lg mb-3">{text.profit}</h3>
                <span
                  className={`text-4xl font-bold ${
                    dashboardData.profit >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  ₹{dashboardData.profit.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mt-5">
              <h3 className="text-lg font-bold text-primary mb-6">
                {text.soldMilkMonthWise}
              </h3>
              {monthlyDataLoading ? (
                <Spinner />
              ) : monthlySoldMilk.length > 0 ? (
                <div className="space-y-4">
                  {monthlySoldMilk.map((monthData, idx) => {
                    const maxValue = Math.max(...monthlySoldMilk.map(m => m.totalLiters || 0));
                    const percentage = maxValue > 0 ? (monthData.totalLiters / maxValue) * 100 : 0;

                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-medium text-slate-700 dark:text-slate-300 w-20">
                            {text.months[monthData.monthName?.toLowerCase()] || monthData.monthName}
                          </span>
                          <span className="text-slate-600 dark:text-slate-400">
                            {monthData.totalLiters?.toFixed(1) || 0} L
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-8">
                          <div
                            className="bg-gradient-to-r from-primary to-primary/70 h-8 rounded-full flex items-center justify-end px-3 transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          >
                            <span className="text-white text-xs font-semibold">
                              {percentage > 20 ? `₹${monthData.totalAmount?.toLocaleString('en-IN') || 0}` : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  No monthly data available
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </>
  );
}

export default Dashboard;
