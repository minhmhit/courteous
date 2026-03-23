import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Coffee, Award, ArrowRight } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="px-3 pb-10 pt-2 md:px-6 md:pb-14">
      <div className="glass-panel-strong container mx-auto overflow-hidden rounded-[36px] px-6 py-12 md:px-10 md:py-16">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="glass-badge mb-6 text-coffee-800">
              Specialty coffee for modern mornings
            </span>
            <h1 className="mb-6 text-5xl font-bold leading-tight text-coffee-950 md:text-6xl">
              Cà Phê Bột
              <br />
              <span className="text-coffee-700">Luôn là số một</span>
            </h1>
            <p className="mb-8 max-w-xl text-lg leading-8 text-slate-600 md:text-xl">
              Hương vị đậm đà từ hạt cà phê tuyển chọn, đặt trong giao diện sáng, mịn và có chiều sâu như kính mờ.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/products">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="glass-button flex items-center gap-2 px-8 py-4 text-white"
                >
                  Khám phá ngay
                  <ArrowRight className="h-5 w-5" />
                </motion.button>
              </Link>
              <div className="glass-card rounded-2xl px-5 py-4 text-sm text-slate-600">
                Rang xay mỗi ngày, giao nhanh toàn quốc
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden justify-center lg:flex"
          >
            <div className="relative">
              <div className="glass-panel flex h-80 w-80 items-center justify-center rounded-full border-white/30">
                <Coffee className="h-40 w-40 text-coffee-700" />
              </div>
              <div className="absolute -right-4 -top-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/70 shadow-[0_20px_40px_rgba(123,84,56,0.18)] backdrop-blur-xl">
                <Award className="h-10 w-10 text-amber-500" />
              </div>
              <div className="glass-card absolute -bottom-5 -left-8 rounded-3xl px-5 py-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Best seller</p>
                <p className="mt-1 text-lg font-semibold text-coffee-900">Arabica Blend</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
