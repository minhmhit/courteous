import {
  buildValidationResult,
  isBlank,
  isNonNegativeNumber,
  isPositiveInteger,
  isPositiveNumber,
} from "./common";

const IMAGE_URL_REGEX = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i;
const IMAGE_PATH_REGEX = /^(\.\/|\/)?(asset|uploads|images)\/.+\.(jpg|jpeg|png|gif|webp)$/i;
const SUPPLIER_CODE_REGEX = /^[A-Z0-9-]+$/;
const UNDERSCORE_CODE_REGEX = /^[A-Z0-9_]+$/;

export const validateCategoryForm = (formData) => {
  const errors = {};

  if (isBlank(formData.name)) {
    errors.name = "Ten danh muc khong duoc de trong";
  } else if (String(formData.name).trim().length < 2) {
    errors.name = "Ten danh muc phai co it nhat 2 ky tu";
  }

  if (!isBlank(formData.description) && String(formData.description).trim().length < 10) {
    errors.description = "Mo ta phai co it nhat 10 ky tu";
  }

  return buildValidationResult(errors);
};

export const validateCouponForm = (formData) => {
  const errors = {};
  const code = String(formData.code || "").trim();

  if (!code) {
    errors.code = "Ma giam gia khong duoc de trong";
  } else if (code.length < 3 || code.length > 20 || !SUPPLIER_CODE_REGEX.test(code)) {
    errors.code = "Ma giam gia chi chap nhan chu in hoa, so va dau gach ngang";
  }

  const discount = Number(formData.discountPercentage);
  if (!Number.isFinite(discount) || discount < 0.1 || discount > 100) {
    errors.discountPercentage = "Phan tram giam gia phai tu 0.1 den 100";
  }

  if (isBlank(formData.validFrom)) {
    errors.validFrom = "Ngay bat dau khong duoc de trong";
  }

  if (isBlank(formData.validUntil)) {
    errors.validUntil = "Ngay ket thuc khong duoc de trong";
  }

  if (!errors.validFrom && !errors.validUntil) {
    const from = new Date(formData.validFrom);
    const until = new Date(formData.validUntil);
    if (Number.isNaN(from.getTime())) {
      errors.validFrom = "Ngay bat dau khong hop le";
    }
    if (Number.isNaN(until.getTime())) {
      errors.validUntil = "Ngay ket thuc khong hop le";
    }
    if (!errors.validFrom && !errors.validUntil && until < from) {
      errors.validUntil = "Ngay ket thuc phai lon hon hoac bang ngay bat dau";
    }
  }

  return buildValidationResult(errors);
};

export const validateProductForm = (formData) => {
  const errors = {};

  if (isBlank(formData.name)) {
    errors.name = "Ten san pham khong duoc de trong";
  } else if (String(formData.name).trim().length < 2) {
    errors.name = "Ten san pham phai co it nhat 2 ky tu";
  }

  if (isBlank(formData.description)) {
    errors.description = "Mo ta khong duoc de trong";
  } else if (String(formData.description).trim().length < 10) {
    errors.description = "Mo ta phai co it nhat 10 ky tu";
  }

  if (!isNonNegativeNumber(formData.price)) {
    errors.price = "Gia phai la so duong";
  }

  if (!isPositiveInteger(formData.categoryId)) {
    errors.categoryId = "Danh muc khong hop le";
  }

  if (!isPositiveInteger(formData.supplierId)) {
    errors.supplierId = "Nha cung cap khong hop le";
  }

  const imageUrl = String(formData.imageUrl || "").trim();
  if (imageUrl && !IMAGE_URL_REGEX.test(imageUrl) && !IMAGE_PATH_REGEX.test(imageUrl)) {
    errors.imageUrl = "URL hinh anh khong hop le";
  }

  return buildValidationResult(errors);
};

export const validateSupplierForm = (formData) => {
  const errors = {};
  const name = String(formData.name || "").trim();
  const code = String(formData.code || "").trim().toUpperCase();
  const address = String(formData.address || "").trim();
  const contactInfo = String(formData.contactInfo || "").trim();

  if (!name) {
    errors.name = "Ten nha cung cap khong duoc de trong";
  } else if (name.length < 2 || name.length > 100) {
    errors.name = "Ten nha cung cap phai tu 2-100 ky tu";
  }

  if (!code) {
    errors.code = "Ma nha cung cap khong duoc de trong";
  } else if (code.length < 3 || code.length > 20 || !SUPPLIER_CODE_REGEX.test(code)) {
    errors.code = "Ma nha cung cap chi chap nhan chu in hoa, so va dau gach ngang";
  }

  if (address.length > 200) {
    errors.address = "Dia chi khong duoc vuot qua 200 ky tu";
  }

  if (contactInfo.length > 100) {
    errors.contactInfo = "Thong tin lien he khong duoc vuot qua 100 ky tu";
  }

  return buildValidationResult(errors);
};

export const validateDepartmentCode = (value) =>
  !isBlank(value) && String(value).trim().length <= 50 && UNDERSCORE_CODE_REGEX.test(String(value).trim());

export const validatePositionCode = validateDepartmentCode;

export const validateVariantForm = (formData) => {
  const errors = {};

  if (isBlank(formData.name)) {
    errors.name = "Ten bien the khong duoc de trong";
  }

  if (formData.productId !== undefined && formData.productId !== "" && !isPositiveInteger(formData.productId)) {
    errors.productId = "ID san pham khong hop le";
  }

  if (formData.additionalPrice !== undefined && formData.additionalPrice !== "" && !isPositiveNumber(formData.additionalPrice) && Number(formData.additionalPrice) !== 0) {
    errors.additionalPrice = "Gia them phai la so khong am";
  }

  return buildValidationResult(errors);
};
