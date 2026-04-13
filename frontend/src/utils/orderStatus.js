import { Clock, Truck, CheckCircle, XCircle, Package } from "lucide-react";

// Danh sách trạng thái order hợp lệ mà backend hỗ trợ cho user
const VALID_STATUSES = {
  PENDING: "PENDING",
  SHIPPING: "SHIPPING",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
};

// Config cho từng trạng thái: label, icon, màu sắc
const STATUS_CONFIGS = {
  PENDING: {
    label: "Chờ thanh toán / xác nhận",
    icon: Clock,
    color: "text-yellow-600",
    bg: "bg-yellow-50",
    description: "Đơn hàng đang chờ xác nhận từ hệ thống",
  },
  SHIPPING: {
    label: "Đang giao hàng",
    icon: Truck,
    color: "text-blue-600",
    bg: "bg-blue-50",
    description: "Đơn hàng đang trên đường giao tới bạn",
  },
  COMPLETED: {
    label: "Hoàn tất",
    icon: CheckCircle,
    color: "text-green-600",
    bg: "bg-green-50",
    description: "Đơn hàng đã hoàn thành",
  },
  CANCELLED: {
    label: "Đã hủy",
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-50",
    description: "Đơn hàng đã bị hủy",
  },
};

/**
 * Chuẩn hóa trạng thái order từ API response
 * @param {string} status - Trạng thái từ backend
 * @returns {string} - Trạng thái chuẩn hóa (uppercase)
 */
export const normalizeOrderStatus = (status) => {
  const normalized = String(status || "").toUpperCase().trim();
  return normalized || null;
};

/**
 * Lấy config cho một trạng thái order
 * @param {string} status - Trạng thái order
 * @returns {object} - Config chứa label, icon, color, bg, description
 */
export const getOrderStatusConfig = (status) => {
  const normalized = normalizeOrderStatus(status);
  return (
    STATUS_CONFIGS[normalized] || {
      label: normalized || "Không xác định",
      icon: Package,
      color: "text-gray-600",
      bg: "bg-gray-50",
      description: "Trạng thái không được hỗ trợ",
    }
  );
};

/**
 * Lấy timeline các bước của đơn hàng dựa trên trạng thái hiện tại
 * Timeline cho flow PENDING -> SHIPPING -> COMPLETED
 * Hoặc PENDING -> CANCELLED
 * @param {string} status - Trạng thái order hiện tại
 * @returns {array} - Mảng các bước với thông tin hoàn thành
 */
export const getOrderTimeline = (status) => {
  const normalized = normalizeOrderStatus(status);

  // Flow đơn hàng bị hủy
  if (normalized === VALID_STATUSES.CANCELLED) {
    return [
      { key: VALID_STATUSES.PENDING, label: "Chờ xử lý", completed: true },
      { key: VALID_STATUSES.CANCELLED, label: "Đã hủy", completed: true },
    ];
  }

  // Flow đơn hàng bình thường
  const allSteps = [
    { key: VALID_STATUSES.PENDING, label: "Chờ xử lý" },
    { key: VALID_STATUSES.SHIPPING, label: "Đang giao hàng" },
    { key: VALID_STATUSES.COMPLETED, label: "Hoàn tất" },
  ];

  const currentIndex = allSteps.findIndex((step) => step.key === normalized);
  return allSteps.map((step, index) => ({
    ...step,
    completed: currentIndex >= 0 ? index <= currentIndex : false,
  }));
};

/**
 * Kiểm tra xem đơn hàng có thể hủy được không
 * Chỉ đơn hàng ở trạng thái PENDING mới có thể hủy
 * @param {string} status - Trạng thái order
 * @returns {boolean}
 */
export const isCancelableOrder = (status) => {
  const normalized = normalizeOrderStatus(status);
  return normalized === VALID_STATUSES.PENDING;
};

/**
 * Kiểm tra xem đơn hàng đã là trạng thái terminal (không thay đổi nữa)
 * @param {string} status - Trạng thái order
 * @returns {boolean}
 */
export const isTerminalStatus = (status) => {
  const normalized = normalizeOrderStatus(status);
  return (
    normalized === VALID_STATUSES.COMPLETED ||
    normalized === VALID_STATUSES.CANCELLED
  );
};

/**
 * Lấy danh sách tất cả các trạng thái hợp lệ
 * Dùng cho filter/tab hiển thị
 * @returns {array} - Mảng các trạng thái hợp lệ
 */
export const getAllValidStatuses = () => {
  return Object.values(VALID_STATUSES);
};

/**
 * Lấy config cho tất cả trạng thái hợp lệ
 * Dùng cho filter/tab UI
 * @returns {object} - Map của tất cả status config
 */
export const getAllStatusConfigs = () => {
  const result = {};
  getAllValidStatuses().forEach((status) => {
    result[status] = getOrderStatusConfig(status);
  });
  return result;
};
