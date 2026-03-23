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
    <section className="px-3 py-8 md:px-6 md:py-10">
      <div className="container mx-auto grid grid-cols-1 gap-6 md:grid-cols-3">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="glass-card rounded-[28px] p-8 text-center"
          >
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-white/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
              <feature.icon className="h-8 w-8 text-coffee-700" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-slate-900">{feature.title}</h3>
            <p className="text-slate-600">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;
