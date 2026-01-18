import axios from "axios";

//const API_BASE_URL = "https://localhost:7226/api";
const API_BASE_URL = "https://milkbilling-api.deltalogapp.online/api";
// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem("milkBillingUser"));
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("milkBillingUser");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Get userId from localStorage
const getUserId = () => {
  const userData = localStorage.getItem("milkBillingUser");
  return userData ? JSON.parse(userData).userId : null;
};

// Get token from localStorage
const getToken = () => {
  const userData = localStorage.getItem("milkBillingUser");
  return userData ? JSON.parse(userData).token : null;
};

// Add token to requests
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: async (username, password) => {
    const response = await api.post("/auth/login", {
      userName: username,
      password: password,
    });

    if (response.data.success && response.data.data) {
      localStorage.setItem(
        "milkBillingUser",
        JSON.stringify(response.data.data)
      );
    }

    return response.data;
  },

  register: async (username, email, password, confirmPassword) => {
    const response = await api.post("/auth/register", {
      userName: username,
      email: email,
      password: password,
      confirmPassword: confirmPassword,
    });

    if (response.data.success && response.data.data) {
      localStorage.setItem(
        "milkBillingUser",
        JSON.stringify(response.data.data)
      );
    }

    return response.data;
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("milkBillingUser");
    }
  },

  validateToken: async () => {
    const response = await api.get("/auth/validate");
    return response.data;
  },

  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem("milkBillingUser"));
  },

  isAuthenticated: () => {
    const user = JSON.parse(localStorage.getItem("milkBillingUser"));
    if (!user || !user.token) return false;

    // Check if token is expired
    if (user.tokenExpiry) {
      const expiry = new Date(user.tokenExpiry);
      if (expiry < new Date()) {
        localStorage.removeItem("milkBillingUser");
        return false;
      }
    }

    return true;
  },
};

// Customer API
// Customer API
export const customerAPI = {
  getCustomers: async () => {
    const userId = getUserId();
    const response = await api.get(`/Customer/${userId}`);
    return response.data;
  },

  addCustomer: async (customerData) => {
    const userId = getUserId();
    try {
      const response = await api.post(
        `/Customer?userId=${userId}`,
        customerData
      );
      return response.data;
    } catch (error) {
      // Re-throw with better error structure
      if (error.response?.data) {
        throw error;
      }
      throw new Error("Failed to add customer");
    }
  },

  deleteCustomer: async (customerId) => {
    const userId = getUserId();
    try {
      const response = await api.delete(
        `/Customer/${customerId}?userId=${userId}`
      );
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        throw error;
      }
      throw new Error("Failed to delete customer");
    }
  },

  updateCustomer: async (customerData) => {
    const userId = getUserId();
    try {
      const response = await api.put(
        `/Customer/${customerData.customerId}?userId=${userId}`,
        customerData
      );
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        throw error;
      }
      throw new Error("Failed to update customer");
    }
  },
};

// Daily Milk Entry API
export const dailyMilkAPI = {
  saveDailyEntries: async (entryDate, entries, isHoliday = false) => {
    const userId = getUserId();
    const dateStr =
      entryDate instanceof Date
        ? entryDate.toISOString().split("T")[0]
        : entryDate;
    const response = await api.post(`/DailyMilkEntry?userId=${userId}`, {
      entryDate: dateStr,
      entries,
      isHoliday, // Add holiday flag
    });
    return response.data;
  },

  getDailyEntries: async (entryDate) => {
    const userId = getUserId();
    const dateStr =
      entryDate instanceof Date
        ? entryDate.toISOString().split("T")[0]
        : entryDate;
    const response = await api.get(
      `/DailyMilkEntry?entryDate=${dateStr}&userId=${userId}`
    );
    return response.data;
  },
};

// Milk Rate API
export const milkRateAPI = {
  getMilkRates: async () => {
    const userId = getUserId();
    const response = await api.get(`/MilkRate/${userId}`);
    return response.data;
  },

  updateMilkRates: async (cowRate, buffaloRate) => {
    const userId = getUserId();
    const response = await api.put(`/MilkRate?userId=${userId}`, {
      cowRate,
      buffaloRate,
    });
    return response.data;
  },
};

// Dairy Info API
export const dairyInfoAPI = {
  getDairyInfo: async () => {
    const userId = getUserId();
    const response = await api.get(`/DairyInfo/${userId}`);
    return response.data;
  },

  saveDairyInfo: async (formData) => {
    const userId = getUserId();
    const response = await api.post(`/DairyInfo?userId=${userId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data; // IMPORTANT
  },
};

// Purchase Milk API
export const purchaseMilkAPI = {
  savePurchaseEntry: async (purchaseData) => {
    const userId = getUserId();
    const response = await api.post(
      `/PurchaseMilk?userId=${userId}`,
      purchaseData
    );
    return response.data;
  },

  updatePurchaseEntry: async (purchaseData) => {
    const userId = getUserId();
    const response = await api.post(
      `/PurchaseMilk?userId=${userId}`,
      purchaseData
    );
    return response.data;
  },

  deletePurchaseEntry: async (purchaseEntryId) => {
    const userId = getUserId();
    const response = await api.delete(
      `/PurchaseMilk/${purchaseEntryId}?userId=${userId}`
    );
    return response.data;
  },

  getLast5DaysEntries: async () => {
    const userId = getUserId();
    const response = await api.get(
      `/PurchaseMilk/GetlastFivedaysEntris?userId=${userId}`
    );
    return response.data;
  },
};

// Dashboard API
export const dashboardAPI = {
  getDashboardSummary: async (
    period,
    year,
    month,
    quarter,
    startDate,
    endDate
  ) => {
    const userId = getUserId();
    const response = await api.post(`/Dashboard?userId=${userId}`, {
      period,
      year,
      month,
      quarter,
      startDate,
      endDate,
    });
    return response.data;
  },

  getMonthlySoldMilk: async () => {
    const userId = getUserId();
    const response = await api.get(
      `/Dashboard/monthlysoldmilk?userId=${userId}`
    );
    return response.data;
  },
};

// Report API
// ✅ OPTIMIZED Report API with proper timeout handling
export const reportAPI = {
  getCustomerBills: async (
    period,
    year,
    month,
    quarter,
    startDate,
    endDate
  ) => {
    const userId = getUserId();
    const response = await api.post(`/Report/customer-bills?userId=${userId}`, {
      period,
      year,
      month,
      quarter,
      startDate,
      endDate,
    });
    return response.data;
  },

  sendMonthlyBill: async (customerId) => {
    const userId = getUserId();
    // ✅ Extended timeout for PDF generation
    const response = await api.post(
      `/Report/send-monthly-bill/${customerId}?userId=${userId}`,
      {},
      { timeout: 60000 } // 60 second timeout for this specific request
    );
    return response.data;
  },

  downloadBill: async (customerId) => {
    const userId = getUserId();
    const response = await api.get(
      `/Report/download-bill/${customerId}?userId=${userId}`,
      { responseType: "blob" }
    );

    const url = window.URL.createObjectURL(new Blob([response]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Bill_${customerId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    return response;
  },
};

// Billing API
export const billingAPI = {
  saveBillPayment: async (paymentData) => {
    const userId = getUserId();
    const response = await api.post(
      `/Billing/payment?userId=${userId}`,
      paymentData
    );
    return response.data;
  },
};

// User Management API (Admin only)
export const userManagementAPI = {
  getAllUsers: async () => {
    const userId = getUserId();
    const response = await api.get(`/UserManagement/all?adminUserId=${userId}`);
    return response.data;
  },

  toggleUserStatus: async (targetUserId, activeStatus) => {
    const adminUserId = getUserId();
    const response = await api.put(
      `/UserManagement/toggle-status?adminUserId=${adminUserId}`,
      {
        userId: targetUserId,
        activeStatus: activeStatus,
      }
    );
    return response.data;
  },

  setSubscription: async (targetUserId, years) => {
    const adminUserId = getUserId();
    const response = await api.put(
      `/UserManagement/set-subscription?adminUserId=${adminUserId}`,
      {
        userId: targetUserId,
        subscriptionYears: years,
      }
    );
    return response.data;
  },
};

export default api;
