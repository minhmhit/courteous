import { motion } from "framer-motion";
import { Tag, TrendingUp } from "lucide-react";
import ProductCard from "../ProductCard";

const PromotionsSection = ({ coupons, products }) => {
  if (!coupons || coupons.length === 0) {
    return null;
  }

  return (
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
          {coupons.map((coupon, index) => (
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
                {coupon.discountPercent 
                 }
                %
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {coupon.description || "Áp dụng cho tất cả sản phẩm"}
              </p>
              <div className="text-xs text-gray-500">
                Còn lại:{" "}
                {(coupon.usageLimit ||
                  coupon.usage_limit ||
                  coupon.limit ||
                  99) -
                  (coupon.usedCount ||
                    coupon.used_count ||
                    coupon.used ||
                    0)}{" "}
                lượt
              </div>
            </motion.div>
          ))}
        </div>

        {products && products.length > 0 && (
          <>
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Sản Phẩm Khuyến Mãi
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default PromotionsSection;
