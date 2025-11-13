import { Link } from "react-router-dom";

const PolicyLinksSection = () => {
  return (
    <section className="py-12 bg-white border-t">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-600">
          <Link
            to="/privacy-policy"
            className="hover:text-coffee-600 transition-colors"
          >
            Chính sách bảo mật
          </Link>
          <Link
            to="/terms-of-service"
            className="hover:text-coffee-600 transition-colors"
          >
            Điều khoản sử dụng
          </Link>
          <Link
            to="/return-policy"
            className="hover:text-coffee-600 transition-colors"
          >
            Chính sách đổi trả
          </Link>
          <Link
            to="/shipping-policy"
            className="hover:text-coffee-600 transition-colors"
          >
            Chính sách vận chuyển
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PolicyLinksSection;
