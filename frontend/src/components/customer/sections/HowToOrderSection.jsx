import { motion } from "framer-motion";
import { Package, CheckCircle, Truck, Award } from "lucide-react";

const HowToOrderSection = () => {
  const steps = [
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
  ];

  return (
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
          {steps.map((item, index) => (
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
  );
};

export default HowToOrderSection;
