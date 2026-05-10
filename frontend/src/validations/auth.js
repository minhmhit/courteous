import {
  buildValidationResult,
  isBlank,
  isEmail,
  isVietnamesePhone,
} from "./common";

export const validateLoginForm = (formData) => {
  const errors = {};

  if (isBlank(formData.email)) {
    errors.email = "Email/Username khong duoc de trong";
  }

  if (isBlank(formData.password)) {
    errors.password = "Mat khau khong duoc de trong";
  }

  return buildValidationResult(errors);
};

export const validateRegisterForm = (formData, addressData) => {
  const errors = {};

  if (isBlank(formData.name)) {
    errors.name = "Ten khong duoc de trong";
  } else {
    const name = String(formData.name).trim();
    if (name.length < 2 || name.length > 100) {
      errors.name = "Ten phai co tu 2-100 ky tu";
    }
  }

  if (isBlank(formData.email)) {
    errors.email = "Email khong duoc de trong";
  } else if (!isEmail(formData.email)) {
    errors.email = "Email khong hop le";
  }

  if (isBlank(formData.password)) {
    errors.password = "Mat khau khong duoc de trong";
  } else if (String(formData.password).trim().length < 6 || String(formData.password).trim().length > 50) {
    errors.password = "Mat khau phai co tu 6-50 ky tu";
  }

  if (isBlank(formData.confirmPassword)) {
    errors.confirmPassword = "Xac nhan mat khau khong duoc de trong";
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = "Mat khau xac nhan khong khop";
  }

  const receiverName = String(addressData.receiverName || "").trim();
  if (receiverName && (receiverName.length < 2 || receiverName.length > 100)) {
    errors.receiverName = "Ten nguoi nhan phai co tu 2-100 ky tu";
  }

  if (isBlank(addressData.phoneNumber)) {
    errors.phoneNumber = "So dien thoai khong duoc de trong";
  } else if (!isVietnamesePhone(addressData.phoneNumber)) {
    errors.phoneNumber = "So dien thoai khong hop le";
  }

  if (isBlank(addressData.fullAddress)) {
    errors.fullAddress = "Dia chi khong duoc de trong";
  } else {
    const fullAddress = String(addressData.fullAddress).trim();
    if (fullAddress.length < 5 || fullAddress.length > 500) {
      errors.fullAddress = "Dia chi phai co tu 5-500 ky tu";
    }
  }

  if (!["home", "office"].includes(String(addressData.addressType || ""))) {
    errors.addressType = "Loai dia chi khong hop le";
  }

  return buildValidationResult(errors);
};
