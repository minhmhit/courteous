import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import { Coffee, Award, ArrowRight } from "lucide-react";

const HeroSection = () => {
  return (   
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
  );
};

export default HeroSection;
