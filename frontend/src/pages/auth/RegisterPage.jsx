import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Coffee } from "lucide-react";
import useAuthStore from "../../stores/useAuthStore";
import useToastStore from "../../stores/useToastStore";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuthStore();
  const toast = useToastStore();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      toast.success("Đăng ký thành công! Vui lòng đăng nhập");
      navigate("/login");
    } catch (error) {
      toast.error(error.message || "Đăng ký thất bại");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-cream-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Coffee className="w-16 h-16 mx-auto mb-4 text-coffee-600" />
          <h1 className="text-3xl font-bold text-gray-900">Đăng Ký</h1>
          <p className="text-gray-600 mt-2">Tạo tài khoản mới</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Họ và tên"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />

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

          <Input
            label="Xác nhận mật khẩu"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            isLoading={isLoading}
          >
            Đăng Ký
          </Button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          Đã có tài khoản?{" "}
          <Link
            to="/login"
            className="text-coffee-600 hover:underline font-medium"
          >
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
