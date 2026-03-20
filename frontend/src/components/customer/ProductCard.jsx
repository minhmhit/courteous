import { motion } from "framer-motion";
import { ShoppingCart, Heart } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import useCartStore from "../../stores/useCartStore";
import useToastStore from "../../stores/useToastStore";

const getProductImageSrc = (imageUrl) => {
  if (!imageUrl) {
    return "https://via.placeholder.com/600x600?text=Coffee";
  }

  if (imageUrl.startsWith("http")) {
    return imageUrl;
  }

  return imageUrl.replace(/^\.\//, "/");
};

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
        whileHover={{ y: -6 }}
        className="glass-card overflow-hidden rounded-[28px] transition-all duration-300 hover:shadow-[0_24px_60px_rgba(77,48,28,0.18)]"
      >
        <div className="relative aspect-square overflow-hidden bg-white/30">
          <img
            src={getProductImageSrc(product.imageUrl)}
            alt={product.name}
            className="h-full w-full object-cover"
          />

          <button
            onClick={(e) => {
              e.preventDefault();
              setIsLiked(!isLiked);
            }}
            className="glass-card absolute right-3 top-3 rounded-full p-2 transition-transform hover:scale-110"
          >
            <Heart
              className={`h-5 w-5 ${
                isLiked ? "fill-red-500 text-red-500" : "text-slate-500"
              }`}
            />
          </button>

          {product.badge && (
            <div className="glass-badge absolute left-3 top-3 text-coffee-800">
              {product.badge}
            </div>
          )}
        </div>

        <div className="p-5">
          <h3 className="mb-1 line-clamp-2 text-lg font-semibold text-slate-900">
            {product.name}
          </h3>

          <p className="mb-4 line-clamp-2 text-sm text-slate-500">
            {product.description}
          </p>

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xl font-bold text-coffee-700">
                {formatPrice(product.price)}
              </p>
              {product.originalPrice && (
                <p className="text-sm text-slate-400 line-through">
                  {formatPrice(product.originalPrice)}
                </p>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddToCart}
              className="glass-button rounded-2xl p-3 text-white"
            >
              <ShoppingCart className="h-5 w-5" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default ProductCard;
