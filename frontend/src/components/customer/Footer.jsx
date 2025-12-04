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
    <footer className="bg-coffee-900 text-cream-100">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-coffee-600 rounded-lg">
                <Coffee className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">CoffeeBot</span>
            </div>
            <p className="text-cream-200 text-sm mb-4">
              Cà phê bột chất lượng cao, mang đến hương vị tuyệt vời cho mỗi
              buổi sáng của bạn.
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.facebook.com/profile.php?id=61575249303691"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-coffee-800 rounded-lg hover:bg-coffee-700 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-coffee-800 rounded-lg hover:bg-coffee-700 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-coffee-800 rounded-lg hover:bg-coffee-700 transition-colors"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/products"
                  className="text-cream-200 hover:text-white transition-colors text-sm"
                >
                  Sản phẩm
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-cream-200 hover:text-white transition-colors text-sm"
                >
                  Về chúng tôi
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-cream-200 hover:text-white transition-colors text-sm"
                >
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Hỗ trợ khách hàng</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/terms-of-service"
                  className="text-cream-200 hover:text-white transition-colors text-sm"
                >
                  Điều khoản sử dụng
                </Link>
              </li>
              <li>
                <Link
                  to="/shipping-policy"
                  className="text-cream-200 hover:text-white transition-colors text-sm"
                >
                  Chính sách giao hàng
                </Link>
              </li>
              <li>
                <Link
                  to="/return-policy"
                  className="text-cream-200 hover:text-white transition-colors text-sm"
                >
                  Chính sách đổi trả
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy-policy"
                  className="text-cream-200 hover:text-white transition-colors text-sm"
                >
                  Chính sách bảo mật
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">Liên hệ</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-coffee-400 flex-shrink-0 mt-0.5" />
                <span className="text-cream-200 text-sm">
                  123 Đường Cà Phê, Quận 1, TP. HCM
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-coffee-400 flex-shrink-0" />
                <a
                  href="tel:+84123456789"
                  className="text-cream-200 hover:text-white transition-colors text-sm"
                >
                  +84 935 704 208
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-coffee-400 flex-shrink-0" />
                <a
                  href="mailto:contact@coffeebot.vn"
                  className="text-cream-200 hover:text-white transition-colors text-sm"
                >
                  contact@coffeebot.vn
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-coffee-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-cream-300 text-sm">© {currentYear} CoffeeBot.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
