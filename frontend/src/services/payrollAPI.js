import axiosInstance from "./axiosConfig";

const loadPeriods = async () => {
  try {
    const res = await axiosInstance.get("/payroll-periods");
    const data = res?.data || res;
    const list =
      data?.items || data?.periods || data?.rows || data?.data || data || [];
    return Array.isArray(list) ? list : [];
  } catch (error) {
    return [];
  }
};

const resolvePeriodId = async (params) => {
  if (!params || params.periodId) return params?.periodId || null;
  const year = Number(params.year);
  const month = Number(params.month);
  if (!year || !month) return null;
  const periods = await loadPeriods();
  const match = periods.find((p) => {
    const start = p.startDate || p.start_date || p.from_date || p.fromDate;
    if (start) {
      const d = new Date(start);
      if (!Number.isNaN(d.getTime())) {
        return d.getFullYear() === year && d.getMonth() + 1 === month;
      }
    }
    if (p.month && p.year) {
      return Number(p.month) === month && Number(p.year) === year;
    }
    if (p.month_no && p.year_no) {
      return Number(p.month_no) === month && Number(p.year_no) === year;
    }
    if (p.name || p.periodName) {
      const label = String(p.name || p.periodName).toLowerCase();
      return label.includes(`${month}`) && label.includes(`${year}`);
    }
    return false;
  });
  return match?.id || null;
};

const withResolvedPeriod = async (params = {}) => {
  const periodId = await resolvePeriodId(params);
  if (!periodId) return { periodId: null };
  const { year, month, ...rest } = params;
  return { ...rest, periodId };
};

const payrollAPI = {
  // Admin/HR
  generatePayrolls: async (payload) => {
    return await axiosInstance.post("/payrolls/generate", payload);
  },

  getPayrolls: async (params = {}) => {
    const resolved = await withResolvedPeriod(params);
    if (resolved.periodId === null) return { data: [] };
    return await axiosInstance.get("/payrolls", { params: resolved });
  },

  getPayrollById: async (id) => {
    return await axiosInstance.get(`/payrolls/${id}`);
  },

  finalizePayroll: async (id) => {
    return await axiosInstance.patch(`/payrolls/${id}/finalize`);
  },

  markPayrollPaid: async (id) => {
    return await axiosInstance.patch(`/payrolls/${id}/mark-paid`);
  },

  finalizePeriod: async () => {
    return await axiosInstance.post("/payrolls/finalize-period");
  },

  getPayrollStatistics: async (params = {}) => {
    const resolved = await withResolvedPeriod(params);
    if (resolved.periodId === null) return { data: { totalEmployees: 0, totalSalary: 0 } };
    return await axiosInstance.get("/payrolls/statistics", { params: resolved });
  },

  getEmployeeMonthlySlip: async (employeeId, params = {}) => {
    const resolved = await withResolvedPeriod(params);
    if (resolved.periodId === null) return { data: [] };
    return await axiosInstance.get(
      `/payrolls/admin/${employeeId}/monthly-slip`,
      { params: resolved }
    );
  },

  getEmployeeYearlySummary: async (employeeId, params = {}) => {
    return await axiosInstance.get(
      `/payrolls/admin/${employeeId}/yearly-summary`,
      { params }
    );
  },

  // Self
  getMyPayrolls: async (params = {}) => {
    const resolved = await withResolvedPeriod(params);
    if (resolved.periodId === null) return { data: [] };
    return await axiosInstance.get("/payrolls/me", { params: resolved });
  },

  getMyYearly: async (params = {}) => {
    return await axiosInstance.get("/payrolls/me/yearly", { params });
  },

  getMyMonthlySlip: async (params = {}) => {
    const resolved = await withResolvedPeriod(params);
    if (resolved.periodId === null) return { data: [] };
    return await axiosInstance.get("/payrolls/me/monthly-slip", { params: resolved });
  },

  getMyYearlySummary: async (params = {}) => {
    return await axiosInstance.get("/payrolls/me/yearly-summary", { params });
  },
};

export default payrollAPI;
