const ACCESS_TOKEN_KEY = "token";
const USER_KEY = "user";
const REFRESH_COOKIE_KEY = "refreshToken";
// Refresh token mỗi 13 phút (giữ 2 phút buffer trước 15 phút hết hạn)
const REFRESH_INTERVAL_MS = 13 * 60 * 1000;
// Time buffer để detect token sắp hết hạn (60 giây)
const TOKEN_EXPIRY_BUFFER_SECONDS = 60;
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

/**
 * Kiểm tra xem token có sắp hết hạn không (trong 60 giây)
 * @param {string} token - Access token (JWT)
 * @returns {boolean} - true nếu token sắp hết hạn
 */
export const isTokenExpiringSoon = (token) => {
  if (!token) return true;

  try {
    // Parse JWT payload (format: header.payload.signature)
    const parts = token.split(".");
    if (parts.length !== 3) return true;

    // Decode payload từ base64url
    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))
    );

    if (!payload.exp) return true;

    // exp là timestamp trong giây, cần convert sang milliseconds
    const expiryTime = payload.exp * 1000;
    const currentTime = Date.now();
    const timeUntilExpiry = expiryTime - currentTime;

    // Token sắp hết hạn nếu chỉ còn < 60 giây
    return timeUntilExpiry < TOKEN_EXPIRY_BUFFER_SECONDS * 1000;
  } catch (error) {
    console.error("Error checking token expiry", error);
    return true; // Nếu lỗi, coi như token sắp hết
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
