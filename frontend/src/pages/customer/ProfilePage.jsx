import { useState } from "react";
import { motion } from "framer-motion";
import { User, Lock, Settings as SettingsIcon, Package } from "lucide-react";
import useAuthStore from "../../stores/useAuthStore";
import useToastStore from "../../stores/useToastStore";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { authAPI } from "../../services";

const ProfilePage = () => {
  const { user, updateProfile } = useAuthStore();
  const toast = useToastStore();
  const [activeTab, setActiveTab] = useState("info");
  const [isLoading, setIsLoading] = useState(false);

  // Personal Info Form
  const [infoForm, setInfoForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  // Password Form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleInfoChange = (e) => {
    setInfoForm({ ...infoForm, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await updateProfile(infoForm);
      toast.success("Cập nhật thông tin thành công!");
    } catch (error) {
      toast.error("Không thể cập nhật thông tin");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Mật khẩu mới không khớp!");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }

    setIsLoading(true);
    try {
      await authAPI.changePassword({
        oldPassword: passwordForm.currentPassword,
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

  const tabs = [
    { id: "info", label: "Thông tin cá nhân", icon: User },
    { id: "password", label: "Đổi mật khẩu", icon: Lock },
    { id: "orders", label: "Đơn hàng", icon: Package },
    { id: "settings", label: "Cài đặt", icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Tài khoản của tôi
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Tabs */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* User Info */}
              <div className="flex flex-col items-center mb-6 pb-6 border-b border-gray-200">
                <div className="w-20 h-20 bg-coffee-600 rounded-full flex items-center justify-center mb-3">
                  <span className="text-2xl font-bold text-white">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900">{user?.name}</h3>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>

              {/* Tabs */}
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? "bg-coffee-50 text-coffee-700 font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-8">
              {/* Personal Info Tab */}
              {activeTab === "info" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Thông tin cá nhân
                  </h2>
                  <form onSubmit={handleUpdateInfo} className="space-y-6">
                    <Input
                      label="Họ và tên"
                      name="name"
                      value={infoForm.name}
                      onChange={handleInfoChange}
                      required
                    />
                    <Input
                      label="Email"
                      name="email"
                      type="email"
                      value={infoForm.email}
                      onChange={handleInfoChange}
                      required
                      disabled
                    />
                    <Input
                      label="Số điện thoại"
                      name="phone"
                      type="tel"
                      value={infoForm.phone}
                      onChange={handleInfoChange}
                    />
                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={isLoading}
                    >
                      Cập nhật thông tin
                    </Button>
                  </form>
                </motion.div>
              )}

              {/* Change Password Tab */}
              {activeTab === "password" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Đổi mật khẩu
                  </h2>
                  <form onSubmit={handleChangePassword} className="space-y-6">
                    <Input
                      label="Mật khẩu hiện tại"
                      name="currentPassword"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      required
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
                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={isLoading}
                    >
                      Đổi mật khẩu
                    </Button>
                  </form>
                </motion.div>
              )}

              {/* Orders Tab */}
              {activeTab === "orders" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Đơn hàng của tôi
                  </h2>
                  <p className="text-gray-600">
                    Xem chi tiết đơn hàng tại trang{" "}
                    <a
                      href="/profile/orders"
                      className="text-coffee-600 hover:underline font-medium"
                    >
                      Lịch sử đơn hàng
                    </a>
                  </p>
                </motion.div>
              )}

              {/* Settings Tab */}
              {activeTab === "settings" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Cài đặt
                  </h2>
                  <div className="space-y-4">
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Thông báo email
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Nhận thông báo về đơn hàng và khuyến mãi qua email
                      </p>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded border-gray-300 text-coffee-600 focus:ring-coffee-500"
                        />
                        <span className="text-sm text-gray-700">
                          Bật thông báo email
                        </span>
                      </label>
                    </div>

                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Ngôn ngữ
                      </h3>
                      <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500">
                        <option value="vi">Tiếng Việt</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
