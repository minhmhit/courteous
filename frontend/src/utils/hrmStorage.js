const safeParse = (value, fallback) => {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch (error) {
    console.error("Failed to parse HRM storage", error);
    return fallback;
  }
};

const isBrowser = () => typeof window !== "undefined" && !!window.localStorage;

const LEAVE_KEY = "hrm_leave_requests";
const EXTRA_KEY = "hrm_employee_extras";

export const loadLeaveRequests = () => {
  if (!isBrowser()) return [];
  return safeParse(localStorage.getItem(LEAVE_KEY), []);
};

export const saveLeaveRequests = (requests) => {
  if (!isBrowser()) return;
  localStorage.setItem(LEAVE_KEY, JSON.stringify(requests || []));
};

export const loadEmployeeExtras = () => {
  if (!isBrowser()) return {};
  return safeParse(localStorage.getItem(EXTRA_KEY), {});
};

export const saveEmployeeExtras = (extras) => {
  if (!isBrowser()) return;
  localStorage.setItem(EXTRA_KEY, JSON.stringify(extras || {}));
};

export const upsertEmployeeExtra = (employeeId, payload) => {
  if (!employeeId) return;
  const extras = loadEmployeeExtras();
  const existing = extras[employeeId] || {};
  extras[employeeId] = { ...existing, ...payload };
  saveEmployeeExtras(extras);
};

export const appendRoleHistory = (employeeId, entry) => {
  if (!employeeId) return;
  const extras = loadEmployeeExtras();
  const existing = extras[employeeId] || {};
  const history = Array.isArray(existing.roleHistory)
    ? [...existing.roleHistory]
    : [];
  history.unshift(entry);
  extras[employeeId] = { ...existing, roleHistory: history };
  saveEmployeeExtras(extras);
};
