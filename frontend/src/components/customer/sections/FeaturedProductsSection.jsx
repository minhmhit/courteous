import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import ProductCard from "../ProductCard";
import SkeletonLoader from "../../ui/SkeletonLoader";

const FeaturedProductsSection = ({ products, isLoading }) => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Sản phẩm nổi bật
          </h2>
          <p className="text-gray-600 text-lg">
            Những sản phẩm cà phê bột được yêu thích nhất
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <SkeletonLoader key={i} className="h-96" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="text-center">
          <Link to="/products">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-coffee-600 text-white rounded-lg font-semibold hover:bg-coffee-700 transition-colors"
            >
              Xem tất cả sản phẩm
            </motion.button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProductsSection;
