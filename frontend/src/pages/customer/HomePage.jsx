import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Coffee,
  Truck,
  Shield,
  Award,
  ArrowRight,
  Star,
  MapPin,
  Phone,
  Mail,
  Clock,
  Package,
  Heart,
  Users,
  CheckCircle,
  Tag,
  TrendingUp,
  MessageCircle,
} from "lucide-react";
import ProductCard from "../../components/customer/ProductCard";
import SkeletonLoader from "../../components/ui/SkeletonLoader";
import { productAPI, couponAPI } from "../../services";

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [promotionProducts, setPromotionProducts] = useState([]);
  const [activeCoupons, setActiveCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [productsRes, couponsRes] = await Promise.all([
          productAPI.getAllProducts(1, 8),
          couponAPI.getAllCoupons().catch(() => ({ data: [] })),
        ]);

        const products = productsRes.data || [];
        setFeaturedProducts(products.slice(0, 4));
        setPromotionProducts(products.slice(4, 8));

        // Filter active coupons
        const coupons = couponsRes.data || [];
        const now = new Date();
        const active = coupons.filter((coupon) => {
          const endDate = new Date(coupon.endDate || coupon.end_date);
          return (
            endDate > now &&
            (coupon.usageLimit || 999) > (coupon.usedCount || 0)
          );
        });
        setActiveCoupons(active.slice(0, 3));
      } catch (error) {
        console.error("Không thể tải dữ liệu:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomeData();
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

      {/* Promotions & Coupons */}
      {activeCoupons.length > 0 && (
        <section className="py-16 bg-gradient-to-br from-yellow-50 to-orange-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
                <Tag className="w-10 h-10 text-orange-600" />
                Khuyến Mãi Đặc Biệt
              </h2>
              <p className="text-gray-600 text-lg">
                Những mã giảm giá hấp dẫn đang chờ bạn
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {activeCoupons.map((coupon, index) => (
                <motion.div
                  key={coupon.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl p-6 border-2 border-dashed border-orange-300 hover:border-orange-500 transition-colors shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-4 py-2 bg-orange-100 text-orange-800 rounded-lg font-mono font-bold text-lg">
                      {coupon.code}
                    </span>
                    <TrendingUp className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Giảm{" "}
                    {coupon.discountPercentage || coupon.discount_percentage}%
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {coupon.description || "Áp dụng cho tất cả sản phẩm"}
                  </p>
                  <div className="text-xs text-gray-500">
                    Còn lại:{" "}
                    {(coupon.usageLimit || 999) - (coupon.usedCount || 0)} lượt
                  </div>
                </motion.div>
              ))}
            </div>

            {promotionProducts.length > 0 && (
              <>
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                  Sản Phẩm Khuyến Mãi
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {promotionProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* About Brand */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Về CoffeeBot
              </h2>
              <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                Chúng tôi là những người đam mê cà phê, mang đến cho bạn những
                hạt cà phê chất lượng cao được tuyển chọn kỹ lưỡng từ các vùng
                trồng cà phê nổi tiếng.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-coffee-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Coffee className="w-6 h-6 text-coffee-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">
                      Nguồn gốc rõ ràng
                    </h4>
                    <p className="text-gray-600">
                      Mỗi loại cà phê đều có nguồn gốc xuất xứ minh bạch, đảm
                      bảo chất lượng từ trang trại đến tay người tiêu dùng.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-coffee-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Heart className="w-6 h-6 text-coffee-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">
                      Rang xay thủ công
                    </h4>
                    <p className="text-gray-600">
                      Quy trình rang xay được thực hiện cẩn thận bởi các chuyên
                      gia, giữ trọn hương vị đặc trưng của từng loại cà phê.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-coffee-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-coffee-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">
                      Cộng đồng yêu cà phê
                    </h4>
                    <p className="text-gray-600">
                      Tham gia cộng đồng những người đam mê cà phê, chia sẻ kiến
                      thức và trải nghiệm về hương vị cà phê.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              <div className="space-y-4">
                <div className="bg-coffee-100 rounded-xl p-6 text-center">
                  <div className="text-4xl font-bold text-coffee-800 mb-2">
                    10+
                  </div>
                  <div className="text-gray-700">Năm kinh nghiệm</div>
                </div>
                <div className="bg-coffee-100 rounded-xl p-6 text-center">
                  <div className="text-4xl font-bold text-coffee-800 mb-2">
                    50k+
                  </div>
                  <div className="text-gray-700">Khách hàng hài lòng</div>
                </div>
              </div>
              <div className="space-y-4 mt-8">
                <div className="bg-coffee-100 rounded-xl p-6 text-center">
                  <div className="text-4xl font-bold text-coffee-800 mb-2">
                    100%
                  </div>
                  <div className="text-gray-700">Cà phê nguyên chất</div>
                </div>
                <div className="bg-coffee-100 rounded-xl p-6 text-center">
                  <div className="text-4xl font-bold text-coffee-800 mb-2">
                    24/7
                  </div>
                  <div className="text-gray-700">Hỗ trợ khách hàng</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Khách Hàng Nói Gì Về Chúng Tôi
            </h2>
            <p className="text-gray-600 text-lg">
              Những đánh giá chân thực từ khách hàng
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Nguyễn Văn A",
                rating: 5,
                comment:
                  "Cà phê rất thơm và đậm đà, đúng như mô tả. Giao hàng nhanh, đóng gói cẩn thận. Sẽ ủng hộ tiếp!",
                avatar: "A",
              },
              {
                name: "Trần Thị B",
                rating: 5,
                comment:
                  "Chất lượng tuyệt vời, giá cả hợp lý. Dịch vụ chăm sóc khách hàng rất tốt. Rất hài lòng!",
                avatar: "B",
              },
              {
                name: "Lê Văn C",
                rating: 5,
                comment:
                  "Mình đã thử nhiều loại cà phê nhưng của shop này là ngon nhất. Hương vị đặc biệt, khó quên!",
                avatar: "C",
              },
            ].map((review, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-coffee-600 rounded-full flex items-center justify-center text-white font-bold">
                    {review.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{review.name}</h4>
                    <div className="flex gap-1">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 italic">"{review.comment}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Order */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Cách Đặt Hàng
            </h2>
            <p className="text-gray-600 text-lg">
              Quy trình đặt hàng đơn giản chỉ với 4 bước
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: 1,
                icon: Package,
                title: "Chọn sản phẩm",
                desc: "Duyệt và chọn sản phẩm cà phê yêu thích",
              },
              {
                step: 2,
                icon: CheckCircle,
                title: "Thêm vào giỏ",
                desc: "Thêm sản phẩm vào giỏ hàng và kiểm tra",
              },
              {
                step: 3,
                icon: Truck,
                title: "Thanh toán",
                desc: "Điền thông tin giao hàng và thanh toán",
              },
              {
                step: 4,
                icon: Award,
                title: "Nhận hàng",
                desc: "Nhận hàng tại nhà trong 1-3 ngày",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-coffee-600 rounded-full flex items-center justify-center mx-auto">
                    <item.icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center font-bold text-coffee-900">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 bg-blue-50 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              Chính Sách Vận Chuyển
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">
                    Miễn phí vận chuyển
                  </h4>
                  <p className="text-gray-600">
                    Đơn hàng từ 500.000đ được miễn phí ship toàn quốc
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">
                    Giao hàng nhanh
                  </h4>
                  <p className="text-gray-600">
                    Nội thành: 1-2 ngày, Ngoại thành: 2-3 ngày
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">
                    Đổi trả dễ dàng
                  </h4>
                  <p className="text-gray-600">
                    Đổi trả trong vòng 7 ngày nếu sản phẩm có lỗi
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">
                    Thanh toán an toàn
                  </h4>
                  <p className="text-gray-600">
                    Hỗ trợ nhiều hình thức thanh toán tiện lợi
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact & Store Location */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Liên Hệ & Cửa Hàng
            </h2>
            <p className="text-gray-600 text-lg">
              Ghé thăm cửa hàng hoặc liên hệ với chúng tôi
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Thông Tin Liên Hệ
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-coffee-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Địa chỉ</h4>
                    <p className="text-gray-600">
                      123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Phone className="w-6 h-6 text-coffee-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">
                      Số điện thoại
                    </h4>
                    <p className="text-gray-600">0123 456 789 (Hotline 24/7)</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Mail className="w-6 h-6 text-coffee-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Email</h4>
                    <p className="text-gray-600">contact@coffeebot.vn</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Clock className="w-6 h-6 text-coffee-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Giờ mở cửa</h4>
                    <p className="text-gray-600">
                      Thứ 2 - Chủ Nhật: 8:00 - 22:00
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <MessageCircle className="w-6 h-6 text-coffee-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">
                      Chat online
                    </h4>
                    <p className="text-gray-600">
                      Hỗ trợ trực tuyến qua Zalo, Facebook Messenger
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-2 shadow-sm overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4326810255127!2d106.69531731533449!3d10.776530392320184!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f4b3330bcc9%3A0xb11bb0b8f8ed49ab!2zxJDGsOG7nW5nIE5ndXnhu4VuIEh14buHLCBCw6xuIE5naMOqLCBRdeG6rW4gMSwgVGjDoG5oIHBo4buRIEjhu5MgQ2jDrSBNaW5oLCBWaeG7h3QgTmFt!5e0!3m2!1svi!2s!4v1699999999999!5m2!1svi!2s"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="rounded-lg"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy & Terms */}
      <section className="py-12 bg-white border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-600">
            <Link
              to="/privacy-policy"
              className="hover:text-coffee-600 transition-colors"
            >
              Chính sách bảo mật
            </Link>
            <Link
              to="/terms-of-service"
              className="hover:text-coffee-600 transition-colors"
            >
              Điều khoản sử dụng
            </Link>
            <Link
              to="/return-policy"
              className="hover:text-coffee-600 transition-colors"
            >
              Chính sách đổi trả
            </Link>
            <Link
              to="/shipping-policy"
              className="hover:text-coffee-600 transition-colors"
            >
              Chính sách vận chuyển
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
