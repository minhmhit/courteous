import { motion } from "framer-motion";
import { ShoppingCart, Heart } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import useCartStore from "../../stores/useCartStore";
import useToastStore from "../../stores/useToastStore";

const ProductCard = ({ product }) => {
  const [isLiked, setIsLiked] = useState(false);
  const { addToCart } = useCartStore();
  const toast = useToastStore();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    try {
      await addToCart(product.id, 1);
      toast.success("Đã thêm vào giỏ hàng!");
    } catch (error) {
      toast.error("Không thể thêm vào giỏ hàng");
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <Link to={`/products/${product.id}`}>
      <motion.div
        whileHover={{ y: -5 }}
        className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
      >
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img
            src={`../.${product.imageUrl}`}
            alt={product.name}
            className="w-full h-full object-cover"
          />

          {/* Like button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsLiked(!isLiked);
            }}
            className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:scale-110 transition-transform"
          >
            <Heart
              className={`w-5 h-5 ${
                isLiked ? "fill-red-500 text-red-500" : "text-gray-400"
              }`}
            />
          </button>

          {/* Badge nếu có */}
          {product.badge && (
            <div className="absolute top-3 left-3 px-3 py-1 bg-coffee-600 text-white text-xs font-semibold rounded-full">
              {product.badge}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-2">
            {product.name}
          </h3>

          <p className="text-sm text-gray-500 mb-3 line-clamp-2">
            {product.description}
          </p>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold text-coffee-600">
                {formatPrice(product.price)}
              </p>
              {product.originalPrice && (
                <p className="text-sm text-gray-400 line-through">
                  {formatPrice(product.originalPrice)}
                </p>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddToCart}
              className="p-3 bg-coffee-600 text-white rounded-lg hover:bg-coffee-700 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default ProductCard;
