import authAPI from "./authAPI";
import userAPI from "./userAPI";
import productAPI from "./productAPI";
import cartAPI from "./cartAPI";
import orderAPI from "./orderAPI";
import categoryAPI from "./categoryAPI";
import supplierAPI from "./supplierAPI";

export {
  authAPI,
  userAPI,
  productAPI,
  cartAPI,
  orderAPI,
  categoryAPI,
  supplierAPI,
};

export default {
  auth: authAPI,
  user: userAPI,
  product: productAPI,
  cart: cartAPI,
  order: orderAPI,
  category: categoryAPI,
  supplier: supplierAPI,
};
