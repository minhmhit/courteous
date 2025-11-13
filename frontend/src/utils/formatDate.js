/**
 * Format date string to Vietnamese locale
 * @param {string|Date|number} dateValue - Date value to format
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string or fallback value
 */
export const formatDate = (dateValue, options = {}) => {
  // Check if dateValue is valid
  if (!dateValue) {
    return "N/A";
  }

  try {
    const date = new Date(dateValue);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "N/A";
    }

    const defaultOptions = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      ...options,
    };

    return date.toLocaleDateString("vi-VN", defaultOptions);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "N/A";
  }
};

/**
 * Format date to ISO string safely
 * @param {string|Date|number} dateValue - Date value to format
 * @returns {string} ISO date string or empty string
 */
export const formatDateISO = (dateValue) => {
  if (!dateValue) {
    return "";
  }

  try {
    const date = new Date(dateValue);

    if (isNaN(date.getTime())) {
      return "";
    }

    return date.toISOString();
  } catch (error) {
    console.error("Error formatting date to ISO:", error);
    return "";
  }
};

/**
 * Format currency to Vietnamese Dong
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "0 ₫";
  }

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};
