const PENDING_PAYMENT_STORAGE_KEY = "pending_payment_orders";

export const PENDING_PAYMENT_TIMEOUT_MS = 60 * 1000;

const isBrowser = () => typeof window !== "undefined" && !!window.localStorage;

const safeParse = (value, fallback) => {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const readPendingPaymentMap = () => {
  if (!isBrowser()) return {};
  const parsed = safeParse(localStorage.getItem(PENDING_PAYMENT_STORAGE_KEY), {});
  return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
};

const writePendingPaymentMap = (value) => {
  if (!isBrowser()) return;
  localStorage.setItem(PENDING_PAYMENT_STORAGE_KEY, JSON.stringify(value));
};

export const markOrderPendingPaymentTimeout = (orderId, createdAt = Date.now()) => {
  if (!orderId) return;

  const baseTime = new Date(createdAt).getTime();
  const normalizedCreatedAt = Number.isFinite(baseTime) ? baseTime : Date.now();
  const currentMap = readPendingPaymentMap();

  currentMap[String(orderId)] = {
    createdAt: normalizedCreatedAt,
    expiresAt: normalizedCreatedAt + PENDING_PAYMENT_TIMEOUT_MS,
    cancelRequestedAt: null,
    cancelledAt: null,
  };

  writePendingPaymentMap(currentMap);
};

export const clearPendingPaymentTimeout = (orderId) => {
  if (!orderId) return;

  const currentMap = readPendingPaymentMap();
  delete currentMap[String(orderId)];
  writePendingPaymentMap(currentMap);
};

export const getPendingPaymentMeta = (orderId) => {
  if (!orderId) return null;

  const value = readPendingPaymentMap()[String(orderId)];
  if (!value || typeof value !== "object") return null;

  const createdAt = Number(value.createdAt);
  const expiresAt = Number(value.expiresAt);
  const cancelRequestedAt =
    value.cancelRequestedAt == null ? null : Number(value.cancelRequestedAt);
  const cancelledAt = value.cancelledAt == null ? null : Number(value.cancelledAt);

  if (!Number.isFinite(createdAt) || !Number.isFinite(expiresAt)) {
    return null;
  }

  return {
    createdAt,
    expiresAt,
    cancelRequestedAt: Number.isFinite(cancelRequestedAt) ? cancelRequestedAt : null,
    cancelledAt: Number.isFinite(cancelledAt) ? cancelledAt : null,
  };
};

export const getPendingPaymentPhase = (orderId, backendStatus, vnpayPaidIds = [], now = Date.now()) => {
  const normalizedStatus = String(backendStatus || "").toUpperCase();
  if (normalizedStatus !== "PENDING") return null;
  if (Array.isArray(vnpayPaidIds) && vnpayPaidIds.includes(Number(orderId))) return null;

  const meta = getPendingPaymentMeta(orderId);
  if (!meta) return null;

  return now >= meta.expiresAt ? "CANCELLED" : "PENDING";
};

export const shouldAutoCancelPendingPayment = (
  orderId,
  backendStatus,
  vnpayPaidIds = [],
  now = Date.now(),
) => {
  const phase = getPendingPaymentPhase(orderId, backendStatus, vnpayPaidIds, now);
  if (phase !== "CANCELLED") return false;

  const meta = getPendingPaymentMeta(orderId);
  return !!meta && !meta.cancelRequestedAt && !meta.cancelledAt;
};

export const markPendingPaymentCancelRequested = (orderId, requestedAt = Date.now()) => {
  if (!orderId) return;

  const currentMap = readPendingPaymentMap();
  const currentValue = currentMap[String(orderId)];
  if (!currentValue || typeof currentValue !== "object") return;

  currentMap[String(orderId)] = {
    ...currentValue,
    cancelRequestedAt: requestedAt,
  };
  writePendingPaymentMap(currentMap);
};

export const markPendingPaymentCancelled = (orderId, cancelledAt = Date.now()) => {
  if (!orderId) return;

  const currentMap = readPendingPaymentMap();
  const currentValue = currentMap[String(orderId)];
  if (!currentValue || typeof currentValue !== "object") return;

  currentMap[String(orderId)] = {
    ...currentValue,
    cancelledAt,
  };
  writePendingPaymentMap(currentMap);
};
