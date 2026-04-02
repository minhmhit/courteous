const ACCESS_TOKEN_KEY = "token";
const USER_KEY = "user";
const REFRESH_COOKIE_KEY = "refreshToken";
const REFRESH_INTERVAL_MS = 14 * 60 * 1000 + 30 * 1000;
const REFRESH_COOKIE_MAX_AGE = 30 * 24 * 60 * 60;

let refreshTimerId = null;

const isBrowser = () => typeof window !== "undefined" && typeof document !== "undefined";

export const getAccessToken = () =>
  isBrowser() ? localStorage.getItem(ACCESS_TOKEN_KEY) : null;

export const setAccessToken = (token) => {
  if (!isBrowser()) return;
  if (token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    return;
  }
  localStorage.removeItem(ACCESS_TOKEN_KEY);
};

export const getStoredUser = () => {
  if (!isBrowser()) return null;
  const rawUser = localStorage.getItem(USER_KEY);
  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser);
  } catch (error) {
    console.error("Failed to parse stored user", error);
    localStorage.removeItem(USER_KEY);
    return null;
  }
};

export const setStoredUser = (user) => {
  if (!isBrowser()) return;
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return;
  }
  localStorage.removeItem(USER_KEY);
};

export const getRefreshToken = () => {
  if (!isBrowser()) return null;

  const cookieValue = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${REFRESH_COOKIE_KEY}=`));

  if (!cookieValue) return null;
  return decodeURIComponent(cookieValue.split("=").slice(1).join("="));
};

export const setRefreshToken = (refreshToken) => {
  if (!isBrowser()) return;

  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${REFRESH_COOKIE_KEY}=${encodeURIComponent(refreshToken)}; Max-Age=${REFRESH_COOKIE_MAX_AGE}; Path=/; SameSite=Lax${secure}`;
};

export const clearRefreshToken = () => {
  if (!isBrowser()) return;
  document.cookie = `${REFRESH_COOKIE_KEY}=; Max-Age=0; Path=/; SameSite=Lax`;
};

export const persistSession = ({ accessToken, refreshToken, user } = {}) => {
  if (accessToken) {
    setAccessToken(accessToken);
  }

  if (refreshToken) {
    setRefreshToken(refreshToken);
  }

  if (user) {
    setStoredUser(user);
  }
};

export const clearSession = () => {
  cancelScheduledRefresh();
  setAccessToken(null);
  setStoredUser(null);
  clearRefreshToken();
};

export const cancelScheduledRefresh = () => {
  if (refreshTimerId) {
    window.clearTimeout(refreshTimerId);
    refreshTimerId = null;
  }
};

export const scheduleTokenRefresh = (refreshHandler) => {
  if (!isBrowser()) return;

  cancelScheduledRefresh();

  if (!getRefreshToken() || typeof refreshHandler !== "function") {
    return;
  }

  refreshTimerId = window.setTimeout(async () => {
    try {
      await refreshHandler();
    } catch (error) {
      console.error("Scheduled token refresh failed", error);
    }
  }, REFRESH_INTERVAL_MS);
};
