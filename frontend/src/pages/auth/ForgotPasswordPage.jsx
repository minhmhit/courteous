import { useState } from "react";
import { Link } from "react-router-dom";
import { Coffee, Mail } from "lucide-react";
import { authAPI } from "../../services";
import useToastStore from "../../stores/useToastStore";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

const ForgotPasswordPage = () => {
  const toast = useToastStore();
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      toast.error("Vui long nhap email hoac username");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authAPI.forgotPassword(trimmedUsername);
      const payload = response?.data || response;

      toast.success(
        payload?.message || "Yeu cau dat lai mat khau da duoc gui",
      );
    } catch (error) {
      toast.error(error?.message || "Khong the gui yeu cau dat lai mat khau");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-coffee-50 to-cream-100 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <Coffee className="mx-auto mb-4 h-16 w-16 text-coffee-600" />
          <h1 className="text-3xl font-bold text-gray-900">Quen Mat Khau</h1>
          <p className="mt-2 text-gray-600">
            Nhap email hoac username de gui yeu cau dat lai mat khau
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email hoac username"
            type="text"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Nhap email hoac username"
            required
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            isLoading={isLoading}
            disabled={isLoading}
          >
            <span className="inline-flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Gui Yeu Cau
            </span>
          </Button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Nho mat khau roi?{" "}
          <Link to="/login" className="font-medium text-coffee-600 hover:underline">
            Quay lai dang nhap
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
