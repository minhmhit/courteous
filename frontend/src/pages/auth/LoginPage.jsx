import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Coffee } from "lucide-react";
import useAuthStore from "../../stores/useAuthStore";
import useToastStore from "../../stores/useToastStore";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { employeeAPI } from "../../services";
import { getEnterpriseLandingPath } from "../../utils/employeeAccess";
import { getApiErrorMessage, getApiFieldErrors } from "../../utils/apiValidation";
import { validateLoginForm } from "../../validations/auth";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuthStore();
  const toast = useToastStore();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = validateLoginForm(formData);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      toast.error(Object.values(validation.errors)[0]);
      return;
    }

    try {
      setFormErrors({});
      const response = await login(formData);
      const payload = response?.data || response;
      if (payload?.error) {
        throw new Error(payload.message);
      }
      toast.success("Dang nhap thanh cong");

      const user = payload?.user;
      const roleId = user?.roleId || user?.role_id || user?.role;
      const from = location.state?.from?.pathname || null;

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
      const fieldErrors = getApiFieldErrors(error);
      if (Object.keys(fieldErrors).length > 0) {
        setFormErrors((prev) => ({ ...prev, ...fieldErrors }));
      }
      toast.error(getApiErrorMessage(error, "Dang nhap that bai"));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-cream-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Coffee className="w-16 h-16 mx-auto mb-4 text-coffee-600" />
          <h1 className="text-3xl font-bold text-gray-900">Dang Nhap</h1>
          <p className="text-gray-600 mt-2">Chao mung tro lai</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email hoac username"
            type="text"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={formErrors.email}
            required
          />

          <Input
            label="Mat khau"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={formErrors.password}
            required
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            isLoading={isLoading}
          >
            Dang Nhap
          </Button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          Chua co tai khoan?{" "}
          <Link
            to="/register"
            className="text-coffee-600 hover:underline font-medium"
          >
            Dang ky ngay
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
