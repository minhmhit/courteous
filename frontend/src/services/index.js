import authAPI from "./authAPI";
import userAPI from "./userAPI";
import productAPI from "./productAPI";
import cartAPI from "./cartAPI";
import orderAPI from "./orderAPI";
import categoryAPI from "./categoryAPI";
import supplierAPI from "./supplierAPI";
import inventoryAPI from "./inventoryAPI";
import importAPI from "./importAPI";
import couponAPI from "./couponAPI";
import receiptAPI from "./receiptAPI";
import paymentAPI from "./paymentAPI";
import attendanceAPI from "./attendanceAPI";
import employeeAPI from "./employeeAPI";
import leaveAPI from "./leaveAPI";
import leaveTypeAPI from "./leaveTypeAPI";
import resignationAPI from "./resignationAPI";
import payrollAPI from "./payrollAPI";
import payrollPeriodAPI from "./payrollPeriodAPI";
import departmentAPI from "./departmentAPI";
import positionAPI from "./positionAPI";
import addressAPI from "./addressAPI";

export {
  authAPI,
  userAPI,
  productAPI,
  cartAPI,
  orderAPI,
  categoryAPI,
  supplierAPI,
  inventoryAPI,
  importAPI,
  couponAPI,
  receiptAPI,
  paymentAPI,
  attendanceAPI,
  employeeAPI,
  leaveAPI,
  leaveTypeAPI,
  resignationAPI,
  payrollAPI,
  payrollPeriodAPI,
  departmentAPI,
  positionAPI,
  addressAPI,
};

export default {
  auth: authAPI,
  user: userAPI,
  product: productAPI,
  cart: cartAPI,
  order: orderAPI,
  category: categoryAPI,
  supplier: supplierAPI,
  inventory: inventoryAPI,
  import: importAPI,
  coupon: couponAPI,
  receipt: receiptAPI,
  payment: paymentAPI,
  attendance: attendanceAPI,
  employee: employeeAPI,
  leave: leaveAPI,
  leaveType: leaveTypeAPI,
  resignation: resignationAPI,
  payroll: payrollAPI,
  payrollPeriod: payrollPeriodAPI,
  department: departmentAPI,
  position: positionAPI,
  address: addressAPI,
};
