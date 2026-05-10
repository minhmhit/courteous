export const isBlank = (value) =>
  value === undefined || value === null || String(value).trim() === "";

export const isEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());

export const isVietnamesePhone = (value) =>
  /^(0|\+84)(3|5|7|8|9)\d{8}$/.test(String(value || "").trim());

export const isPositiveInteger = (value) => {
  const number = Number(value);
  return Number.isInteger(number) && number > 0;
};

export const isNonNegativeNumber = (value) => {
  if (value === "" || value === null || value === undefined) return false;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0;
};

export const isPositiveNumber = (value) => {
  if (value === "" || value === null || value === undefined) return false;
  const number = Number(value);
  return Number.isFinite(number) && number > 0;
};

export const isValidDateInput = (value) =>
  /^\d{4}-\d{2}-\d{2}$/.test(String(value || "").trim());

export const isValidDateTimeInput = (value) =>
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(String(value || "").trim());

export const buildValidationResult = (errors) => ({
  isValid: Object.keys(errors).length === 0,
  errors,
});
