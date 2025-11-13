import { motion } from "framer-motion";
import {
  Coffee,
  Heart,
  Award,
  Users,
  Globe,
  Leaf,
  Target,
  TrendingUp,
} from "lucide-react";
import {
  AboutSection,
  ReviewsSection,
} from "../../components/customer/sections";

const AboutPage = () => {
  const stats = [
    { icon: Users, label: "Khách hàng", value: "10,000+" },
    { icon: Coffee, label: "Sản phẩm", value: "50+" },
    { icon: Award, label: "Giải thưởng", value: "15+" },
    { icon: Globe, label: "Chi nhánh", value: "5" },
  ];

  const values = [
    {
      icon: Heart,
      title: "Đam mê",
      description:
        "Chúng tôi yêu cà phê và muốn chia sẻ niềm đam mê này với mọi người.",
    },
    {
      icon: Award,
      title: "Chất lượng",
      description:
        "Cam kết cung cấp sản phẩm cà phê chất lượng cao nhất từ khắp nơi trên thế giới.",
    },
    {
      icon: Leaf,
      title: "Bền vững",
      description:
        "Chú trọng vào việc bảo vệ môi trường và phát triển bền vững trong mọi hoạt động.",
    },
    {
      icon: Target,
      title: "Tận tâm",
      description:
        "Luôn lắng nghe và đáp ứng nhu cầu của khách hàng một cách tốt nhất.",
    },
  ];

  const timeline = [
    {
      year: "2018",
      title: "Khởi đầu",
      description:
        "CoffeeBot được thành lập với sứ mệnh mang cà phê chất lượng đến mọi nhà.",
    },
    {
      year: "2019",
      title: "Mở rộng",
      description: "Ra mắt 3 chi nhánh đầu tiên tại Hà Nội và TP.HCM.",
    },
    {
      year: "2021",
      title: "Đổi mới",
      description:
        "Ứng dụng công nghệ AI vào quy trình rang xay và pha chế cà phê.",
    },
    {
      year: "2023",
      title: "Phát triển",
      description: "Đạt mốc 10,000 khách hàng và mở rộng ra 5 chi nhánh.",
    },
    {
      year: "2024",
      title: "Tương lai",
      description:
        "Tiếp tục đổi mới và mang đến trải nghiệm cà phê tốt nhất cho khách hàng.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-cream-50">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-coffee-600 to-coffee-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] animate-slow-pan"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto text-center"
          >
            <Coffee className="w-16 h-16 mx-auto mb-6" />
            <h1 className="text-5xl font-bold mb-6">Về CoffeeBot</h1>
            <p className="text-xl text-cream-100 leading-relaxed">
              Chúng tôi là những người đam mê cà phê, luôn tìm kiếm và mang đến
              cho bạn những hạt cà phê tốt nhất từ khắp nơi trên thế giới.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white -mt-8 relative z-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-coffee-100 rounded-full mb-4">
                  <stat.icon className="w-8 h-8 text-coffee-600" />
                </div>
                <h3 className="text-3xl font-bold text-coffee-800 mb-2">
                  {stat.value}
                </h3>
                <p className="text-gray-600">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <AboutSection />

      {/* Values Section */}
      <section className="py-20 bg-gradient-to-b from-white to-cream-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-coffee-800 mb-4">
              Giá Trị Cốt Lõi
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Những giá trị định hướng mọi hoạt động của chúng tôi
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 bg-coffee-100 rounded-full mb-6">
                  <value.icon className="w-7 h-7 text-coffee-600" />
                </div>
                <h3 className="text-xl font-bold text-coffee-800 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <TrendingUp className="w-12 h-12 mx-auto mb-4 text-coffee-600" />
            <h2 className="text-4xl font-bold text-coffee-800 mb-4">
              Hành Trình Phát Triển
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Từ những bước đi đầu tiên đến hiện tại
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {timeline.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative pl-8 pb-12 border-l-2 border-coffee-200 last:border-0 last:pb-0"
              >
                <div className="absolute left-0 top-0 -translate-x-1/2 w-4 h-4 bg-coffee-600 rounded-full"></div>
                <div className="bg-cream-50 p-6 rounded-lg">
                  <span className="inline-block px-3 py-1 bg-coffee-600 text-white text-sm font-bold rounded-full mb-3">
                    {item.year}
                  </span>
                  <h3 className="text-xl font-bold text-coffee-800 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <ReviewsSection />

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-coffee-600 to-coffee-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">
              Sẵn sàng trải nghiệm cà phê tuyệt vời?
            </h2>
            <p className="text-xl text-cream-100 mb-8 max-w-2xl mx-auto">
              Khám phá bộ sưu tập cà phê đặc biệt của chúng tôi ngay hôm nay
            </p>
            <motion.a
              href="/products"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block px-8 py-4 bg-white text-coffee-800 font-bold rounded-lg hover:bg-cream-100 transition-colors"
            >
              Xem Sản Phẩm
            </motion.a>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
