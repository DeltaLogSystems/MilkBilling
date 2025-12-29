import axios from "axios";

const API_BASE_URL = "https://localhost:7226/api";

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
export const customerAPI = {
  getCustomers: async () => {
    const userId = getUserId();
    const response = await api.get(`/Customer/${userId}`);
    return response.data;
  },

  addCustomer: async (customerData) => {
    const userId = getUserId();
    const response = await api.post(`/Customer?userId=${userId}`, customerData);
    return response.data;
  },

  deleteCustomer: async (customerId) => {
    const response = await api.delete(`/Customer/${customerId}`);
    return response.data;
  },
};

// Daily Milk Entry API
export const dailyMilkAPI = {
  saveDailyEntries: async (entryDate, entries) => {
    const userId = getUserId();
    const response = await api.post(`/DailyMilkEntry?userId=${userId}`, {
      entryDate,
      entries,
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

  saveDairyInfo: async (dairyData) => {
    const userId = getUserId();
    const response = await api.post(`/DairyInfo?userId=${userId}`, dairyData);
    return response.data;
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
};

// Report API
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
    const response = await api.post(`/Report?userId=${userId}`, {
      period,
      year,
      month,
      quarter,
      startDate,
      endDate,
    });
    return response.data;
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

export default api;
