import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const CTASection = () => {
  return (
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
  );
};

export default CTASection;
