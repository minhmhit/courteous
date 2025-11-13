import { motion } from "framer-motion";
import { Truck, Shield, Award } from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: Truck,
      title: "Giao hàng nhanh",
      description: "Miễn phí vận chuyển cho đơn hàng trên 500.000đ",
    },
    {
      icon: Shield,
      title: "Đảm bảo chất lượng",
      description: "Sản phẩm chính hãng 100%, nguồn gốc rõ ràng",
    },
    {
      icon: Award,
      title: "Hương vị tuyệt hảo",
      description: "Rang xay tươi mỗi ngày, giữ trọn hương vị",
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-8 text-center shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-16 h-16 bg-coffee-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-8 h-8 text-coffee-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
