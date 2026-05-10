import {
  buildValidationResult,
  isBlank,
  isEmail,
  isNonNegativeNumber,
  isPositiveInteger,
  isValidDateInput,
} from "./common";

const EMPLOYEE_CODE_REGEX = /^EMP(00[1-9]|0[1-9]\d|[1-9]\d{2})$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;

export const validateEmployeeForm = (formData, isEditing = false) => {
  const errors = {};

  if (!isEditing) {
    if (isBlank(formData.email)) {
      errors.email = "Email khong duoc de trong";
    } else if (!isEmail(formData.email)) {
      errors.email = "Email khong hop le";
    }

    if (isBlank(formData.password)) {
      errors.password = "Mat khau khong duoc de trong";
    } else if (String(formData.password).length < 6) {
      errors.password = "Mat khau toi thieu 6 ky tu";
    }

    if (isBlank(formData.fullName)) {
      errors.fullName = "Ten khong duoc de trong";
    } else if (String(formData.fullName).trim().length > 255) {
      errors.fullName = "Ten toi da 255 ky tu";
    }

    if (!isBlank(formData.username)) {
      const username = String(formData.username).trim();
      if (username.length < 3 || username.length > 50 || !USERNAME_REGEX.test(username)) {
        errors.username = "Username chi chap nhan 3-50 ky tu gom chu, so va dau gach duoi";
      }
    }

    if (isBlank(formData.employeeCode)) {
      errors.employeeCode = "Ma nhan vien khong duoc de trong";
    } else if (!EMPLOYEE_CODE_REGEX.test(String(formData.employeeCode).trim().toUpperCase())) {
      errors.employeeCode = "Ma nhan vien phai theo dinh dang EMP001 den EMP999";
    }

    if (isBlank(formData.roleId) || !isPositiveInteger(formData.roleId)) {
      errors.roleId = "Vai tro khong hop le";
    }
  }

  if (!isBlank(formData.phoneNumber) && String(formData.phoneNumber).trim().length > 20) {
    errors.phoneNumber = "SDT toi da 20 ky tu";
  }

  if (!isBlank(formData.address) && String(formData.address).trim().length > 255) {
    errors.address = "Dia chi toi da 255 ky tu";
  }

  if (!isBlank(formData.departmentId) && !isPositiveInteger(formData.departmentId)) {
    errors.departmentId = "Phong ban khong hop le";
  }

  if (!isBlank(formData.positionId) && !isPositiveInteger(formData.positionId)) {
    errors.positionId = "Chuc vu khong hop le";
  }

  if (isBlank(formData.hireDate)) {
    errors.hireDate = "Ngay vao lam khong duoc de trong";
  } else if (!isValidDateInput(formData.hireDate)) {
    errors.hireDate = "Ngay vao lam phai dung dinh dang YYYY-MM-DD";
  }

  if (!isBlank(formData.baseSalary) && !isNonNegativeNumber(formData.baseSalary)) {
    errors.baseSalary = "Luong co ban phai la so hop le";
  }

  if (!isBlank(formData.roleEffectiveDate) && !isValidDateInput(formData.roleEffectiveDate)) {
    errors.roleEffectiveDate = "Ngay hieu luc phai dung dinh dang YYYY-MM-DD";
  }

  return buildValidationResult(errors);
};
