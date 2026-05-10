import {
  buildValidationResult,
  isPositiveInteger,
  isPositiveNumber,
  isNonNegativeNumber,
} from "./common";

export const validateImportForm = (formData) => {
  const errors = {};

  if (!isPositiveInteger(formData.supplierId)) {
    errors.supplierId = "Nha cung cap khong hop le";
  }

  if (!["pending", "paid", "cancelled", undefined].includes(formData.paymentStatus)) {
    errors.paymentStatus = "Trang thai thanh toan khong hop le";
  }

  if (!Array.isArray(formData.importItems) || formData.importItems.length === 0) {
    errors.importItems = "Phai co it nhat mot san pham";
  } else {
    formData.importItems.forEach((item, index) => {
      if (!isPositiveInteger(item.productId)) {
        errors[`importItems.${index}.productId`] = "San pham khong hop le";
      }
      if (!isPositiveInteger(item.quantity)) {
        errors[`importItems.${index}.quantity`] = "So luong phai la so nguyen duong";
      }
      if (!isPositiveNumber(item.price)) {
        errors[`importItems.${index}.price`] = "Don gia phai lon hon 0";
      }
    });
  }

  return buildValidationResult(errors);
};

export const validateInventoryAdjustForm = (quantity) => {
  const errors = {};

  if (!isNonNegativeNumber(quantity) || !Number.isInteger(Number(quantity))) {
    errors.quantity = "So luong phai la so nguyen khong am";
  }

  return buildValidationResult(errors);
};
