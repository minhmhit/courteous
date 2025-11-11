import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Coffee, Truck, Shield, Award, ArrowRight } from "lucide-react";
import ProductCard from "../../components/customer/ProductCard";
import SkeletonLoader from "../../components/ui/SkeletonLoader";
import { productAPI } from "../../services";

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await productAPI.getAllProducts(1, 4);
        setFeaturedProducts(response.data || []);
      } catch (error) {
        console.error("Không thể tải sản phẩm:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-coffee-900 via-coffee-800 to-coffee-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Cà Phê Bột
                <br />
                <span className="text-cream-200">Chất Lượng Cao</span>
              </h1>
              <p className="text-xl text-cream-100 mb-8">
                Hương vị đậm đà, chọn lọc từ những hạt cà phê nguyên chất tốt
                nhất. Mang đến trải nghiệm cà phê hoàn hảo cho mỗi buổi sáng.
              </p>
              <div className="flex gap-4">
                <Link to="/products">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-cream-100 text-coffee-900 rounded-lg font-semibold hover:bg-white transition-colors flex items-center gap-2"
                  >
                    Khám phá ngay
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:flex justify-center"
            >
              <div className="relative">
                <div className="w-80 h-80 bg-coffee-600 rounded-full flex items-center justify-center">
                  <Coffee className="w-40 h-40 text-cream-100" />
                </div>
                <div className="absolute -top-4 -right-4 bg-yellow-400 rounded-full p-4">
                  <Award className="w-12 h-12 text-coffee-900" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl p-8 text-center shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-16 h-16 bg-coffee-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-coffee-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Giao hàng nhanh
              </h3>
              <p className="text-gray-600">
                Miễn phí vận chuyển cho đơn hàng trên 500.000đ
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-8 text-center shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-16 h-16 bg-coffee-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-coffee-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Đảm bảo chất lượng
              </h3>
              <p className="text-gray-600">
                Sản phẩm chính hãng 100%, nguồn gốc rõ ràng
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-8 text-center shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-16 h-16 bg-coffee-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-coffee-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Hương vị tuyệt hảo
              </h3>
              <p className="text-gray-600">
                Rang xay tươi mỗi ngày, giữ trọn hương vị
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
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
              {featuredProducts.map((product) => (
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

      {/* CTA Section */}
      <section className="py-20 bg-coffee-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Bắt đầu hành trình cà phê của bạn
          </h2>
          <p className="text-xl text-cream-200 mb-8">
            Đăng ký ngay hôm nay để nhận ưu đãi đặc biệt
          </p>
          <Link to="/register">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-cream-100 text-coffee-900 rounded-lg font-semibold hover:bg-white transition-colors"
            >
              Đăng ký ngay
            </motion.button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
