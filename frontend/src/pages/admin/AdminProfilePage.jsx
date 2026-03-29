import { useEffect, useState } from "react";
import { Lock, User } from "lucide-react";
import useAuthStore from "../../stores/useAuthStore";
import useToastStore from "../../stores/useToastStore";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { authAPI, employeeAPI } from "../../services";

const AdminProfilePage = () => {
  const { user, updateProfile } = useAuthStore();
  const toast = useToastStore();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("info");

  const [infoForm, setInfoForm] = useState({
    name: user?.name || user?.fullName || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || user?.phone || "",
    address: user?.address || "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleInfoChange = (event) => {
    setInfoForm({ ...infoForm, [event.target.name]: event.target.value });
  };

  const handlePasswordChange = (event) => {
    setPasswordForm({ ...passwordForm, [event.target.name]: event.target.value });
  };

  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      try {
        const res = await employeeAPI.getMyProfile();
        const payload = res?.data || res;
        const profile = payload?.employee || payload;
        if (!isMounted || !profile) return;
        setInfoForm((prev) => ({
          ...prev,
          name:
            profile.name ||
            profile.fullName ||
            profile.employee_name ||
            prev.name,
          email: profile.email || profile.user_email || prev.email,
          phoneNumber:
            profile.phoneNumber || profile.phone || profile.user_phone || "",
          address: profile.address || profile.user_address || "",
        }));
      } catch (error) {
        // ignore
      }
    };
    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const handleUpdateInfo = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      try {
        await employeeAPI.updateMyProfile({
          name: infoForm.name,
          phoneNumber: infoForm.phoneNumber,
          address: infoForm.address,
        });
        try {
          await updateProfile(infoForm);
        } catch (error) {
          // ignore sync errors
        }
      } catch (error) {
        await updateProfile(infoForm);
      }
      toast.success("Cập nhật thông tin thành công!");
    } catch (error) {
      toast.error("Không thể cập nhật thông tin");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Mật khẩu mới không khớp!");
      return;
    }
    setIsLoading(true);
    try {
      await authAPI.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success("Đổi mật khẩu thành công!");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error("Không thể đổi mật khẩu");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Hồ sơ cá nhân</h1>
        <p className="text-gray-600 mt-1">Xem và cập nhật thông tin của bạn</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab("info")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "info"
              ? "bg-coffee-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Thông tin
        </button>
        <button
          onClick={() => setActiveTab("password")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "password"
              ? "bg-coffee-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Đổi mật khẩu
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {activeTab === "info" && (
          <form onSubmit={handleUpdateInfo} className="space-y-4">
            <Input
              label="Họ và tên"
              name="name"
              value={infoForm.name}
              onChange={handleInfoChange}
              required
              icon={<User className="w-5 h-5" />}
            />
            <Input
              label="Email"
              name="email"
              value={infoForm.email}
              onChange={handleInfoChange}
              required
              disabled
            />
            <Input
              label="Số điện thoại"
              name="phoneNumber"
              value={infoForm.phoneNumber}
              onChange={handleInfoChange}
            />
            <Input
              label="Địa chỉ"
              name="address"
              value={infoForm.address}
              onChange={handleInfoChange}
            />
            <Button type="submit" variant="primary" isLoading={isLoading}>
              Cập nhật thông tin
            </Button>
          </form>
        )}

        {activeTab === "password" && (
          <form onSubmit={handleChangePassword} className="space-y-4">
            <Input
              label="Mật khẩu hiện tại"
              name="currentPassword"
              type="password"
              value={passwordForm.currentPassword}
              onChange={handlePasswordChange}
              required
              icon={<Lock className="w-5 h-5" />}
            />
            <Input
              label="Mật khẩu mới"
              name="newPassword"
              type="password"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
              required
            />
            <Input
              label="Xác nhận mật khẩu mới"
              name="confirmPassword"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange}
              required
            />
            <Button type="submit" variant="primary" isLoading={isLoading}>
              Đổi mật khẩu
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminProfilePage;
