import { Link } from "react-router-dom";
import {
  Coffee,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Youtube,
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 px-3 pb-4 pt-10 md:px-6 md:pb-6 md:pt-14">
      <div className="glass-panel mx-auto max-w-7xl rounded-[32px] px-6 py-10 text-slate-800 md:px-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-coffee-700 text-white shadow-lg">
                <Coffee className="h-5 w-5" />
              </div>
              <div>
                <span className="block text-xl font-bold text-coffee-950">CoffeeBot</span>
                <span className="text-xs uppercase tracking-[0.28em] text-coffee-700/70">
                  premium beans
                </span>
              </div>
            </div>
            <p className="mb-5 text-sm leading-6 text-slate-600">
              Cà phê bột chất lượng cao với trải nghiệm mua sắm sáng, mềm và hiện đại.
            </p>
            <div className="flex gap-3">
              {[
                { href: "https://www.facebook.com/profile.php?id=61575249303691", icon: Facebook },
                { href: "https://instagram.com", icon: Instagram },
                { href: "https://youtube.com", icon: Youtube },
              ].map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-card flex h-10 w-10 items-center justify-center rounded-2xl text-slate-700 hover:text-coffee-700"
                >
                  <item.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-coffee-800">
              Liên kết nhanh
            </h3>
            <ul className="space-y-3 text-sm text-slate-600">
              <li><Link to="/products" className="hover:text-coffee-700">Sản phẩm</Link></li>
              <li><Link to="/about" className="hover:text-coffee-700">Về chúng tôi</Link></li>
              <li><Link to="/contact" className="hover:text-coffee-700">Liên hệ</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-coffee-800">
              Hỗ trợ
            </h3>
            <ul className="space-y-3 text-sm text-slate-600">
              <li><Link to="/terms-of-service" className="hover:text-coffee-700">Điều khoản sử dụng</Link></li>
              <li><Link to="/shipping-policy" className="hover:text-coffee-700">Chính sách giao hàng</Link></li>
              <li><Link to="/return-policy" className="hover:text-coffee-700">Chính sách đổi trả</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-coffee-700">Chính sách bảo mật</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-coffee-800">
              Liên hệ
            </h3>
            <ul className="space-y-4 text-sm text-slate-600">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-coffee-700" />
                <span>123 Đường Cà Phê, Quận 1, TP. HCM</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 flex-shrink-0 text-coffee-700" />
                <a href="tel:+84123456789" className="hover:text-coffee-700">+84 935 704 208</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 flex-shrink-0 text-coffee-700" />
                <a href="mailto:contact@coffeebot.vn" className="hover:text-coffee-700">contact@coffeebot.vn</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="glass-divider mt-8 border-t pt-6 text-sm text-slate-500">
          <p>© {currentYear} CoffeeBot.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
