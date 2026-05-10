import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Coffee } from "lucide-react";
import useAuthStore from "../../stores/useAuthStore";
import useToastStore from "../../stores/useToastStore";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { employeeAPI } from "../../services";
import { getEnterpriseLandingPath } from "../../utils/employeeAccess";

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
      const payload = response?.data || response;
      if (payload?.error) {
        throw new Error(payload.message);
      }
      toast.success("Đăng nhập thành công!");

      // Lấy roleId từ response
      const user = payload?.user;
      const roleId = user?.roleId || user?.role_id || user?.role;

      // Kiểm tra nếu có trang redirect trước đó (từ ProtectedRoute)
      const from = location.state?.from?.pathname || null;

      // Logic redirect:
      // 1. Nếu có trang trước đó (user cố vào trang cần login) -> redirect về đó
      // 2. Redirect theo role-specific dashboard:
      //    - Role 1 (Admin) -> /admin/dashboard
      //    - Role 3 (Warehouse) -> /admin/warehouse-dashboard
      //    - Role 4 (Sales) -> /admin/sales-dashboard
      //    - Role 5 (HRM) -> /admin/hrm-dashboard
      //    - Role 2 (Customer) -> / (homepage)
      let employeeProfile = null;
      if ([2, 4, 5].includes(Number(roleId))) {
        try {
          const profileRes = await employeeAPI.getMyProfile();
          employeeProfile = profileRes?.data || profileRes || null;
        } catch {
          employeeProfile = null;
        }
      }

      const landingPath = getEnterpriseLandingPath(roleId, employeeProfile);

      if (from && !(from.startsWith("/admin") && landingPath === "/employee/dashboard")) {
        navigate(from, { replace: true });
      } else {
        navigate(landingPath, { replace: true });
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
            label="Email hoặc username"
            type="text"
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

        <p className="text-right mt-3">
          <Link
            to="/forgot-password"
            className="text-sm text-coffee-600 hover:underline"
          >
            Quên mật khẩu?
          </Link>
        </p>

        <p className="text-center mt-4 text-gray-600">
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
