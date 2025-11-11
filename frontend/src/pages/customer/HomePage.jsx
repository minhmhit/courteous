import { Coffee } from "lucide-react";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-cream-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <Coffee className="w-20 h-20 mx-auto mb-6 text-coffee-600" />
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Hệ Thống Bán Cà Phê Bột
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Chất lượng cao - Hương vị đậm đà - Giao hàng nhanh
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="/products"
              className="px-8 py-3 bg-coffee-600 text-white rounded-lg hover:bg-coffee-700 transition-colors"
            >
              Xem Sản Phẩm
            </a>
            <a
              href="/login"
              className="px-8 py-3 border-2 border-coffee-600 text-coffee-600 rounded-lg hover:bg-coffee-50 transition-colors"
            >
              Đăng Nhập
            </a>
          </div>
        </div>

        {/* Status */}
        <div className="mt-16 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-4">Trạng thái dự án</h2>
          <div className="space-y-2 text-gray-600">
            <p>✅ Setup React + Vite</p>
            <p>✅ Cấu hình TailwindCSS</p>
            <p>✅ Tích hợp Zustand stores</p>
            <p>✅ Setup API services</p>
            <p>✅ UI Components cơ bản</p>
            <p>🚧 Customer pages (đang phát triển)</p>
            <p>🚧 Admin panel (đang phát triển)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
