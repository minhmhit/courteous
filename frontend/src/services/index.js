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
};
