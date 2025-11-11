import authAPI from "./authAPI";
import productAPI from "./productAPI";
import cartAPI from "./cartAPI";
import orderAPI from "./orderAPI";
import categoryAPI from "./categoryAPI";

export { authAPI, productAPI, cartAPI, orderAPI, categoryAPI };

export default {
  auth: authAPI,
  product: productAPI,
  cart: cartAPI,
  order: orderAPI,
  category: categoryAPI,
};
