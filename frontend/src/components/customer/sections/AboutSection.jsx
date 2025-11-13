import { motion } from "framer-motion";
import { Coffee, Heart, Users } from "lucide-react";

const AboutSection = () => {
  return (
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
              Chúng tôi là những người đam mê cà phê, mang đến cho bạn những hạt
              cà phê chất lượng cao được tuyển chọn kỹ lưỡng từ các vùng trồng
              cà phê nổi tiếng.
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
                    Mỗi loại cà phê đều có nguồn gốc xuất xứ minh bạch, đảm bảo
                    chất lượng từ trang trại đến tay người tiêu dùng.
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
  );
};

export default AboutSection;
