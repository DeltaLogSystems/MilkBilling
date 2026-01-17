import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import homeLanguage from "../../language/homeLanguage";
import { customerAPI, dailyMilkAPI } from "../../services/api";
import Spinner from "../common/Spinner";

// Helper: format Date -> "24 July, 2024"
function formatDisplayDate(date) {
  if (!date) return "";
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, "0");
  const month = d.toLocaleString("en-US", { month: "long" });
  const year = d.getFullYear();
  return `${day} ${month}, ${year}`;
}

// Helper: convert Date -> "yyyy-MM-dd" for input value & max
function toInputDateValue(date) {
  if (!date) return "";
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function HomePage() {
  const { language } = useLanguage();
  const text = homeLanguage[language];

  const [dateFilter, setDateFilter] = useState("today");
  const [selectedDate, setSelectedDate] = useState("");
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(false);
  const [isHoliday, setIsHoliday] = useState(false);
  const [savedQuantities, setSavedQuantities] = useState({});

  const today = useMemo(() => new Date(), []);
  const yesterday = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d;
  }, []);

  const effectiveDate = useMemo(() => {
    if (dateFilter === "today") return today;
    if (dateFilter === "yesterday") return yesterday;
    if (dateFilter === "custom" && selectedDate) return new Date(selectedDate);
    return today;
  }, [dateFilter, today, yesterday, selectedDate]);

  // Load customers on mount
  useEffect(() => {
    loadCustomers();
  }, []);

  // Load entries when date changes
  useEffect(() => {
    if (customers.length > 0) {
      loadDailyEntries();
    }
  }, [effectiveDate, customers.length]);

  const loadCustomers = async () => {
    try {
      setLoading(true);

      const response = await customerAPI.getCustomers();
      if (response.success) {
        const customerData = response.data.map((c) => ({
          id: c.customerId,
          name: c.customerName,
          milkType:
            c.milkType === 0 ? "cow" : c.milkType === 1 ? "buffalo" : "both",
          defaultQty:
            c.milkType === 0
              ? c.cowDefaultLiters || 1
              : c.buffaloDefaultLiters || 0.5,
          step: c.milkType === 0 ? 1 : 0.5,
        }));
        setCustomers(customerData);

        // Initialize quantities
        const initialQty = {};
        customerData.forEach((c) => {
          initialQty[c.id] = c.defaultQty;
        });
        setQuantities(initialQty);
      }
    } catch (error) {
      console.error("Error loading customers:", error);
      alert("Failed to load customers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadDailyEntries = async () => {
    try {
      const dateStr = toInputDateValue(effectiveDate);
      const response = await dailyMilkAPI.getDailyEntries(dateStr);

      if (response.success && response.data) {
        const { entries, isHoliday: holidayFlag } = response.data;

        if (entries && entries.length > 0) {
          const newQty = {};
          customers.forEach((c) => {
            newQty[c.id] = c.defaultQty;
          });

          entries.forEach((entry) => {
            newQty[entry.customerId] = entry.quantity;
          });

          setQuantities(newQty);
          setIsHoliday(holidayFlag || false);
        } else {
          // Reset to defaults if no entries found
          const defaultQty = {};
          customers.forEach((c) => {
            defaultQty[c.id] = c.defaultQty;
          });
          setQuantities(defaultQty);
          setIsHoliday(false);
        }
      }
    } catch (error) {
      console.error("Error loading daily entries:", error);
    }
  };

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleIncrement = (id, step) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Number((prev[id] + step).toFixed(2)),
    }));
  };

  const handleDecrement = (id, step) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(0, Number((prev[id] - step).toFixed(2))),
    }));
  };

  const handleCustomDateChange = (e) => {
    const value = e.target.value;
    if (!value) {
      setSelectedDate("");
      setShowCustomPicker(false);
      return;
    }

    const picked = new Date(value);
    const todayOnly = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const pickedOnly = new Date(
      picked.getFullYear(),
      picked.getMonth(),
      picked.getDate()
    );

    if (pickedOnly.getTime() > todayOnly.getTime()) {
      alert("You cannot select a future date.");
      return;
    }

    setSelectedDate(value);
    setShowCustomPicker(false);
  };

  const handleDateFilterClick = (type) => {
    setDateFilter(type);
    if (type === "custom") {
      setShowCustomPicker(true);
    } else {
      setShowCustomPicker(false);
    }
  };

  const handleHolidayToggle = () => {
    if (!isHoliday) {
      // Entering holiday mode - save current quantities and set all to 0
      setSavedQuantities({ ...quantities });
      const zeroQty = {};
      customers.forEach((c) => {
        zeroQty[c.id] = 0;
      });
      setQuantities(zeroQty);
      setIsHoliday(true);
    } else {
      // Exiting holiday mode - restore saved quantities or defaults
      if (Object.keys(savedQuantities).length > 0) {
        setQuantities({ ...savedQuantities });
      } else {
        const defaultQty = {};
        customers.forEach((c) => {
          defaultQty[c.id] = c.defaultQty;
        });
        setQuantities(defaultQty);
      }
      setIsHoliday(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      // Include all customers, even with 0 quantity
      const entries = customers.map((c) => ({
        customerId: c.id,
        milkType: c.milkType === "cow" ? 0 : 1,
        quantity: quantities[c.id] || 0,
      }));

      const dateStr = toInputDateValue(effectiveDate);
      const response = await dailyMilkAPI.saveDailyEntries(
        dateStr,
        entries,
        isHoliday
      );

      if (response.success) {
        alert("Daily entries saved successfully!");
      } else {
        alert("Failed to save entries. Please try again.");
      }
    } catch (error) {
      console.error("Error saving entries:", error);
      alert("Error saving entries. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const headingDateText = formatDisplayDate(effectiveDate);

  return (
    <>
      <header className="sticky top-0 z-10 bg-background-light p-4 pb-2 dark:bg-background-dark md:static md:p-6 md:pb-3">
        <div className="flex items-center justify-between ">
          <div className="flex items-center gap-2 md:hidden">
            <img className="logo" src="/images/logo.png" alt={text.appTitle} />
          </div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">
            {text.appTitle}
          </h1>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center justify-center gap-1 px-3 py-2 bg-primary rounded-lg text-white font-bold text-sm md:hidden disabled:opacity-50"
          >
            <i className="fas fa-save" />
            <span>{loading ? "Saving..." : text.saveButton}</span>
          </button>
        </div>

        <div className="mt-0 md:mt-0 flex items-center gap-3">
          <div className="relative flex-1">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-0 focus:border-primary"
              placeholder={text.searchCustomersPlaceholder}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button
            onClick={handleSave}
            disabled={loading}
            className="hidden md:flex items-center justify-center gap-1 px-3 py-2 bg-primary rounded-lg text-white font-bold text-sm disabled:opacity-50"
          >
            <i className="fas fa-save" />
            <span>{loading ? "Saving..." : text.saveButton}</span>
          </button>
        </div>

        <div className="mt-2 md:mt-2 flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              onClick={() => handleDateFilterClick("today")}
              className={`flex h-10 flex-1 items-center justify-center rounded-lg text-sm ${
                dateFilter === "today"
                  ? "bg-primary text-white font-bold"
                  : "bg-primary/20 text-primary"
              }`}
            >
              {text.today}
            </button>
            <button
              onClick={() => handleDateFilterClick("yesterday")}
              className={`flex h-10 flex-1 items-center justify-center rounded-lg text-sm ${
                dateFilter === "yesterday"
                  ? "bg-primary text-white font-bold"
                  : "bg-primary/20 text-primary dark:bg-primary/30"
              }`}
            >
              {text.yesterday}
            </button>
            <button
              onClick={() => handleDateFilterClick("custom")}
              className={`flex h-10 flex-1 items-center justify-center rounded-lg text-sm ${
                dateFilter === "custom"
                  ? "bg-primary text-white font-bold"
                  : "bg-primary/20 text-primary dark:bg-primary/30"
              }`}
            >
              {text.customDate}
            </button>
          </div>

          {showCustomPicker && (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                  {text.customDate}
                </label>
                <input
                  type="date"
                  className="h-10 flex-1 rounded-lg border border-slate-300 dark:border-slate-600 px-3 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-0 focus:border-primary"
                  value={selectedDate || ""}
                  max={toInputDateValue(today)}
                  onChange={handleCustomDateChange}
                  autoFocus
                />
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 pt-0 pb-24 md:p-6 md:pt-0 md:pb-6">
        <section>
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-base md:text-md font-bold text-slate-800 dark:text-white">
              {text.dailyEntriesFor} {headingDateText}
            </h2>

            {/* Holiday Toggle Button - Icon Only */}
            <button
              onClick={handleHolidayToggle}
              className={`flex items-center justify-center w-10 h-10 md:w-11 md:h-11 rounded-full transition-all duration-300 shadow-md hover:shadow-lg ${
                isHoliday
                  ? "bg-orange-500 hover:bg-orange-600"
                  : "bg-green-500 hover:bg-green-600"
              }`}
              title={isHoliday ? "Exit Holiday Mode" : "Enter Holiday Mode"}
            >
              <i
                className={`fas ${
                  isHoliday ? "fa-umbrella-beach" : "fa-calendar-check"
                } text-white text-lg`}
              />
            </button>
          </div>

          {loading ? (
            <Spinner />
          ) : (
            <div className="grid gap-3 md:grid-cols-1 lg:grid-cols-2">
              {filteredCustomers.map((c) => (
                <div
                  key={c.id}
                  className={`customer-card bg-white dark:bg-slate-800/60 rounded-xl shadow-md p-2 md:p-3 transition-all duration-300 ${
                    isHoliday ? "opacity-60 pointer-events-none" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-0">
                    <p className="font-bold text-slate-900 dark:text-white text-sm md:text-base">
                      {c.name}
                    </p>
                    <div className="flex items-center gap-1.5 md:gap-2">
                      <button
                        onClick={() => handleDecrement(c.id, c.step)}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-primary"
                        disabled={isHoliday}
                      >
                        <i className="fas fa-minus text-xs" />
                      </button>
                      <input
                        className="h-8 w-12 md:h-9 md:w-14 rounded-lg border border-slate-300 bg-white text-center font-bold text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-xs md:text-sm focus:outline-none focus:ring-0 focus:border-primary"
                        type="number"
                        step={c.step}
                        value={quantities[c.id] || 0}
                        onChange={(e) =>
                          setQuantities((prev) => ({
                            ...prev,
                            [c.id]: Number(e.target.value) || 0,
                          }))
                        }
                        disabled={isHoliday}
                      />
                      <button
                        onClick={() => handleIncrement(c.id, c.step)}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-primary"
                        disabled={isHoliday}
                      >
                        <i className="fas fa-plus text-xs" />
                      </button>
                    </div>
                  </div>

                  <div className="customer-info-line flex items-center gap-2 flex-wrap">
                    <span
                      className={`milk-type-badge ${
                        c.milkType === "cow"
                          ? "milk-type-cow"
                          : "milk-type-buffalo"
                      }`}
                    >
                      {c.milkType === "cow"
                        ? text.milkTypeCow
                        : text.milkTypeBuffalo}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {text.defaultLabel}: {c.defaultQty}
                      {text.literUnit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}

export default HomePage;
