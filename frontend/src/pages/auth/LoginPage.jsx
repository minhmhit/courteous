import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Coffee } from "lucide-react";
import useAuthStore from "../../stores/useAuthStore";
import useToastStore from "../../stores/useToastStore";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuthStore();
  const toast = useToastStore();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await login(formData);
      toast.success("Đăng nhập thành công!");

      // Lấy roleId từ response
      const user = response.user || response.data?.user;
      const roleId = user?.roleId || user?.role_id || user?.role;

      // Kiểm tra nếu có trang redirect trước đó (từ ProtectedRoute)
      const from = location.state?.from?.pathname || null;

      // Logic redirect:
      // 1. Nếu có trang trước đó (user cố vào trang cần login) -> redirect về đó
      // 2. Nếu role là enterprise (1,3,4,5) -> /admin
      // 3. Nếu role là customer (2) -> / (homepage)
      if (from) {
        navigate(from, { replace: true });
      } else if ([1, 3, 4, 5].includes(roleId)) {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (error) {
      toast.error(error.message || "Đăng nhập thất bại");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-cream-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Coffee className="w-16 h-16 mx-auto mb-4 text-coffee-600" />
          <h1 className="text-3xl font-bold text-gray-900">Đăng Nhập</h1>
          <p className="text-gray-600 mt-2">Chào mừng trở lại!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <Input
            label="Mật khẩu"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            isLoading={isLoading}
          >
            Đăng Nhập
          </Button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          Chưa có tài khoản?{" "}
          <Link
            to="/register"
            className="text-coffee-600 hover:underline font-medium"
          >
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
