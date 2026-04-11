import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Lock,
  Settings as SettingsIcon,
  Package,
  MapPin,
} from "lucide-react";
import useAuthStore from "../../stores/useAuthStore";
import useToastStore from "../../stores/useToastStore";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { authAPI, orderAPI, userAPI } from "../../services";
import { formatDate } from "../../utils/formatDate";

const ProfilePage = () => {
  const { user, updateProfile } = useAuthStore();
  const toast = useToastStore();
  const [activeTab, setActiveTab] = useState("info");
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState(user || null);
  const [recentOrders, setRecentOrders] = useState([]);

  const [infoForm, setInfoForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    username: user?.username || "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    setInfoForm({
      name: profileData?.name || user?.name || "",
      email: profileData?.email || user?.email || "",
      phoneNumber: profileData?.phoneNumber || user?.phoneNumber || "",
      username: profileData?.username || user?.username || "",
    });
  }, [profileData, user]);

  useEffect(() => {
    const loadProfile = async () => {
      const [authProfile, userProfile, orderList] = await Promise.allSettled([
        authAPI.getProfile(),
        userAPI.getProfile(),
        orderAPI.getUserOrders(1, 20),
      ]);

      const authUser =
        authProfile.status === "fulfilled"
          ? authProfile.value?.data || authProfile.value
          : null;
      const selfUser =
        userProfile.status === "fulfilled"
          ? userProfile.value?.data || userProfile.value
          : null;

      setProfileData(selfUser || authUser || user || null);
      setRecentOrders(
        orderList.status === "fulfilled" ? orderList.value?.data || [] : [],
      );
    };

    loadProfile();
  }, [user]);

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
      setProfileData((prev) => ({ ...(prev || {}), ...infoForm }));
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

  const tabs = [
    { id: "info", label: "Thông tin cá nhân", icon: User },
    { id: "address", label: "Địa chỉ", icon: MapPin },
    { id: "password", label: "Đổi mật khẩu", icon: Lock },
    { id: "orders", label: "Đơn hàng", icon: Package },
    { id: "settings", label: "Cài đặt", icon: SettingsIcon },
  ];

  const addressList = useMemo(() => {
    const seen = new Set();
    return recentOrders
      .map((order) => ({
        id: order.id,
        shipAddress: order.shipAddress,
        orderDate: order.orderDate,
      }))
      .filter((order) => order.shipAddress)
      .filter((order) => {
        if (seen.has(order.shipAddress)) return false;
        seen.add(order.shipAddress);
        return true;
      })
      .slice(0, 5);
  }, [recentOrders]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">
          Tài khoản của tôi
        </h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="mb-6 flex flex-col items-center border-b border-gray-200 pb-6">
                <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-coffee-600">
                  <span className="text-2xl font-bold text-white">
                    {profileData?.name?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900">
                  {profileData?.name}
                </h3>
                <p className="text-sm text-gray-600">{profileData?.email}</p>
              </div>

              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                        activeTab === tab.id
                          ? "bg-coffee-50 font-medium text-coffee-700"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="rounded-lg bg-white p-8 shadow-sm">
              {activeTab === "info" && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <h2 className="mb-6 text-2xl font-bold text-gray-900">
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
                      name="phoneNumber"
                      type="tel"
                      value={infoForm.phoneNumber}
                      onChange={handleInfoChange}
                    />
                    <Input
                      label="Tên đăng nhập"
                      name="username"
                      value={infoForm.username}
                      onChange={handleInfoChange}
                    />
                    <Button type="submit" variant="primary" isLoading={isLoading}>
                      Cập nhật thông tin
                    </Button>
                  </form>
                </motion.div>
              )}

              {activeTab === "address" && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <h2 className="mb-6 text-2xl font-bold text-gray-900">
                    Địa chỉ của tôi
                  </h2>
                  {addressList.length > 0 ? (
                    <div className="space-y-4">
                      {addressList.map((address) => (
                        <div
                          key={address.id}
                          className="rounded-lg border border-gray-200 p-4"
                        >
                          <p className="font-medium text-gray-900">
                            {address.shipAddress}
                          </p>
                          <p className="mt-2 text-sm text-gray-500">
                            Đơn gần nhất: #{address.id} •{" "}
                            {formatDate(address.orderDate)}
                          </p>
                        </div>
                      ))}
                      <p className="text-sm text-amber-700">
                        Frontend hiện chỉ có thể hiển thị địa chỉ giao hàng đã
                        dùng ở các đơn trước. Dữ liệu địa chỉ riêng trong
                        `/auth/me` hoặc `/users/me` hiện chưa có từ backend.
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-gray-300 p-6 text-sm text-gray-600">
                      Chưa có địa chỉ nào để hiển thị. Địa chỉ sẽ xuất hiện sau
                      khi bạn tạo đơn hàng, hoặc khi backend bổ sung trường địa
                      chỉ vào dữ liệu profile.
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "password" && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <h2 className="mb-6 text-2xl font-bold text-gray-900">
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
                    <Button type="submit" variant="primary" isLoading={isLoading}>
                      Đổi mật khẩu
                    </Button>
                  </form>
                </motion.div>
              )}

              {activeTab === "orders" && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <h2 className="mb-6 text-2xl font-bold text-gray-900">
                    Đơn hàng của tôi
                  </h2>
                  <p className="text-gray-600">
                    Xem chi tiết đơn hàng tại trang{" "}
                    <a
                      href="/profile/orders"
                      className="font-medium text-coffee-600 hover:underline"
                    >
                      Lịch sử đơn hàng
                    </a>
                  </p>
                </motion.div>
              )}

              {activeTab === "settings" && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <h2 className="mb-6 text-2xl font-bold text-gray-900">
                    Cài đặt
                  </h2>
                  <div className="space-y-4">
                    <div className="rounded-lg border border-gray-200 p-4">
                      <h3 className="mb-2 font-semibold text-gray-900">
                        Thông báo email
                      </h3>
                      <p className="mb-3 text-sm text-gray-600">
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

                    <div className="rounded-lg border border-gray-200 p-4">
                      <h3 className="mb-2 font-semibold text-gray-900">
                        Ngôn ngữ
                      </h3>
                      <select className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-coffee-500">
                        <option value="vi">Tiếng Việt</option>
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
