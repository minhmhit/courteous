import {
  buildValidationResult,
  isBlank,
  isPositiveInteger,
} from "./common";
import { validateAddressForm } from "./address";

export const validateCheckoutForm = ({
  formData,
  items,
  addressMode,
  savedAddresses,
  selectedAddressId,
  newAddressType,
  selectedProvince,
  selectedDistrict,
  selectedWard,
}) => {
  const errors = {};

  if (isBlank(formData.fullName)) {
    errors.fullName = "Ho va ten khong duoc de trong";
  }

  if (isBlank(formData.phoneNumber)) {
    errors.phoneNumber = "So dien thoai khong duoc de trong";
  }

  if (!["COD", "VNPAY"].includes(String(formData.paymentMethod || ""))) {
    errors.paymentMethod = "Phuong thuc thanh toan khong hop le";
  }

  if (!Array.isArray(items) || items.length === 0) {
    errors.cartItems = "Gio hang trong";
  } else {
    const invalidItem = items.find(
      (item) =>
        !isPositiveInteger(item.id || item.cartItemId) ||
        !isPositiveInteger(item.productId || item.product_id) ||
        !isPositiveInteger(item.quantity),
    );

    if (invalidItem) {
      errors.cartItems = "Du lieu san pham trong gio hang khong hop le";
    }
  }

  if (addressMode === "existing") {
    const hasAddress = savedAddresses.some(
      (address) => Number(address.id) === Number(selectedAddressId),
    );

    if (!hasAddress) {
      errors.selectedAddressId = "Vui long chon dia chi giao hang";
    }
  }

  if (addressMode === "new") {
    const fullAddress = [
      formData.shipAddress,
      selectedWard?.name,
      selectedDistrict?.name,
      selectedProvince?.name,
    ]
      .filter(Boolean)
      .join(", ");

    const addressValidation = validateAddressForm({
      receiverName: formData.fullName,
      phoneNumber: formData.phoneNumber,
      fullAddress,
      addressType: newAddressType,
    });

    Object.assign(errors, addressValidation.errors);

    if (isBlank(formData.shipAddress)) {
      errors.shipAddress = "Dia chi chi tiet khong duoc de trong";
    }

    if (!selectedProvince) errors.selectedProvince = "Vui long chon tinh/thanh pho";
    if (!selectedDistrict) errors.selectedDistrict = "Vui long chon quan/huyen";
    if (!selectedWard) errors.selectedWard = "Vui long chon phuong/xa";
  }

  return buildValidationResult(errors);
};
