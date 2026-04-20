const COD_SHIPPING_STORAGE_KEY = "cod_shipping_orders";

export const COD_SHIPPING_DELAY_MS = 60 * 1000;

const isBrowser = () => typeof window !== "undefined" && !!window.localStorage;

const safeParse = (value, fallback) => {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const readCodShippingMap = () => {
  if (!isBrowser()) return {};
  const parsed = safeParse(localStorage.getItem(COD_SHIPPING_STORAGE_KEY), {});
  return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
};

const writeCodShippingMap = (value) => {
  if (!isBrowser()) return;
  localStorage.setItem(COD_SHIPPING_STORAGE_KEY, JSON.stringify(value));
};

export const markCodOrderPendingShipping = (orderId, createdAt = Date.now()) => {
  if (!orderId) return;

  const normalizedOrderId = String(orderId);
  const createdTime = new Date(createdAt).getTime();
  const baseTime = Number.isFinite(createdTime) ? createdTime : Date.now();

  const currentMap = readCodShippingMap();
  currentMap[normalizedOrderId] = {
    createdAt: baseTime,
    shippingAt: baseTime + COD_SHIPPING_DELAY_MS,
  };
  writeCodShippingMap(currentMap);
};

export const getCodShippingMeta = (orderId) => {
  if (!orderId) return null;

  const value = readCodShippingMap()[String(orderId)];
  if (!value || typeof value !== "object") return null;

  const createdAt = Number(value.createdAt);
  const shippingAt = Number(value.shippingAt);

  if (!Number.isFinite(createdAt) || !Number.isFinite(shippingAt)) {
    return null;
  }

  return { createdAt, shippingAt };
};

export const getCodShippingPhase = (orderId, backendStatus, now = Date.now()) => {
  const normalizedStatus = String(backendStatus || "").toUpperCase();
  if (normalizedStatus !== "PENDING") return null;

  const meta = getCodShippingMeta(orderId);
  if (!meta) return null;

  return now >= meta.shippingAt ? "SHIPPING" : "PENDING";
};
