import { buildValidationResult, isBlank, isVietnamesePhone } from "./common";

export const validateAddressForm = (data) => {
  const errors = {};

  if (isBlank(data.receiverName)) {
    errors.receiverName = "Ten nguoi nhan khong duoc de trong";
  } else {
    const receiverName = String(data.receiverName).trim();
    if (receiverName.length < 2 || receiverName.length > 100) {
      errors.receiverName = "Ten nguoi nhan phai co tu 2-100 ky tu";
    }
  }

  if (isBlank(data.phoneNumber)) {
    errors.phoneNumber = "So dien thoai khong duoc de trong";
  } else {
    const phone = String(data.phoneNumber).trim();
    if (phone.length < 8 || phone.length > 15 || !isVietnamesePhone(phone)) {
      errors.phoneNumber = "So dien thoai khong hop le";
    }
  }

  if (isBlank(data.fullAddress)) {
    errors.fullAddress = "Dia chi khong duoc de trong";
  }

  if (data.addressType && !["home", "office"].includes(String(data.addressType))) {
    errors.addressType = "Loai dia chi khong hop le";
  }

  return buildValidationResult(errors);
};
