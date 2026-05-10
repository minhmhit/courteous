import { useEffect, useState } from "react";
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
import { authAPI, orderAPI, userAPI, addressAPI } from "../../services";
import { formatDate } from "../../utils/formatDate";
import { Trash2 } from "lucide-react";

const unwrapApiData = (response) =>
  response?.data?.data || response?.data || null;
const unwrapApiList = (response) => {
  const data = unwrapApiData(response);
  return Array.isArray(data) ? data : [];
};

const NAME_REGEX = /^(?=.*[A-Za-zÀ-ỹĐđ])[A-Za-zÀ-ỹĐđ\s]+$/u;
const PHONE_REGEX = /^0\d{9}$/;

const ADDRESS_FIELD_MESSAGES = {
  receiverName:
    "Tên người nhận phải có ký tự chữ và chỉ gồm chữ cái, khoảng trắng.",
  phoneNumber: "Số điện thoại phải bắt đầu bằng 0 và có đúng 10 chữ số.",
  fullAddress: "Địa chỉ chi tiết không được để trống.",
};

const getApiErrorMessage = (error) => {
  const validationErrors = error?.response?.data?.errors;

  if (Array.isArray(validationErrors) && validationErrors.length > 0) {
    return validationErrors
      .map((item) => item?.msg)
      .filter(Boolean)
      .join(". ");
  }

  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Không thể cập nhật thông tin"
  );
};

const ProfilePage = () => {
  const { user, updateProfile } = useAuthStore();
  const toast = useToastStore();
  const [activeTab, setActiveTab] = useState("info");
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState(user || null);
  const [recentOrders, setRecentOrders] = useState([]);

  // Address management states
  const [addresses, setAddresses] = useState([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddressForm, setNewAddressForm] = useState({
    receiverName: user?.name || "",
    phoneNumber: "",
    fullAddress: "",
    addressType: "home",
    isDefault: false,
  });

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
          ? unwrapApiData(authProfile.value)
          : null;
      const selfUser =
        userProfile.status === "fulfilled"
          ? unwrapApiData(userProfile.value)
          : null;

      setProfileData(selfUser || authUser || user || null);
      setRecentOrders(
        orderList.status === "fulfilled" ? orderList.value?.data || [] : [],
      );
    };

    loadProfile();
  }, [user]);

  // Fetch addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      setIsLoadingAddresses(true);
      try {
        const response = await addressAPI.getMyAddresses();
        setAddresses(unwrapApiList(response));
      } catch (error) {
        console.error("Error fetching addresses:", error);
        setAddresses([]);
      } finally {
        setIsLoadingAddresses(false);
      }
    };

    fetchAddresses();
  }, []);

  const handleInfoChange = (e) => {
    setInfoForm({ ...infoForm, [e.target.name]: e.target.value });
  };

  const getAddressErrorMessage = (error) => {
    const validationErrors = error?.response?.data?.errors;

    if (Array.isArray(validationErrors) && validationErrors.length > 0) {
      const priorityField = ["receiverName", "phoneNumber", "fullAddress"];

      for (const field of priorityField) {
        const fieldError = validationErrors.find(
          (item) => item?.path === field,
        );
        if (fieldError?.msg) {
          return fieldError.msg;
        }
      }

      return validationErrors
        .map((item) => item?.msg)
        .filter(Boolean)
        .join(". ");
    }

    return (
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "Không thể thêm địa chỉ"
    );
  };

  const getAddressFieldErrorMessage = (field, value) => {
    const trimmedValue = typeof value === "string" ? value.trim() : value;

    if (field === "receiverName") {
      if (!trimmedValue) {
        return "Tên người nhận không được để trống.";
      }

      if (!NAME_REGEX.test(trimmedValue)) {
        return ADDRESS_FIELD_MESSAGES.receiverName;
      }

      return null;
    }

    if (field === "phoneNumber") {
      if (!trimmedValue) {
        return "Số điện thoại không được để trống.";
      }

      if (!PHONE_REGEX.test(trimmedValue)) {
        return ADDRESS_FIELD_MESSAGES.phoneNumber;
      }

      return null;
    }

    if (field === "fullAddress") {
      if (!trimmedValue) {
        return ADDRESS_FIELD_MESSAGES.fullAddress;
      }

      return null;
    }

    return null;
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handleUpdateInfo = async (e) => {
    e.preventDefault();

    const nextName = infoForm.name.trim();
    const nextPhone = infoForm.phoneNumber.trim();
    const nextUsername = infoForm.username.trim();

    if (!nextName) {
      toast.error("Họ và tên không được để trống.");
      return;
    }

    if (!NAME_REGEX.test(nextName)) {
      toast.error(
        "Họ và tên phải chứa ít nhất một chữ cái và chỉ gồm chữ cái, khoảng trắng, dấu chấm, dấu gạch ngang hoặc dấu nháy.",
      );
      return;
    }

    if (nextPhone && !PHONE_REGEX.test(nextPhone)) {
      toast.error("Số điện thoại phải bắt đầu bằng 0 và có đúng 10 chữ số.");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        ...infoForm,
        name: nextName,
        phoneNumber: nextPhone || undefined,
        username: nextUsername || undefined,
      };

      await updateProfile(payload);
      setProfileData((prev) => ({ ...(prev || {}), ...payload }));
      setInfoForm((prev) => ({
        ...prev,
        name: nextName,
        phoneNumber: nextPhone,
        username: nextUsername,
      }));
      toast.success("Cập nhật thông tin cá nhân thành công!");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
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
        confirmPassword: passwordForm.confirmPassword,
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

  const handleNewAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewAddressForm({
      ...newAddressForm,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();

    const nextReceiverName = newAddressForm.receiverName.trim();
    const nextPhoneNumber = newAddressForm.phoneNumber.trim();
    const nextFullAddress = newAddressForm.fullAddress.trim();

    if (!nextReceiverName) {
      toast.error("Tên người nhận không được để trống.");
      return;
    }

    if (!NAME_REGEX.test(nextReceiverName)) {
      toast.error(ADDRESS_FIELD_MESSAGES.receiverName);
      return;
    }

    if (!nextPhoneNumber) {
      toast.error(getAddressFieldErrorMessage("phoneNumber", nextPhoneNumber));
      return;
    }

    if (!PHONE_REGEX.test(nextPhoneNumber)) {
      toast.error(getAddressFieldErrorMessage("phoneNumber", nextPhoneNumber));
      return;
    }

    if (!nextFullAddress) {
      toast.error(getAddressFieldErrorMessage("fullAddress", nextFullAddress));
      return;
    }

    setIsLoading(true);
    try {
      await addressAPI.createAddress({
        receiverName: nextReceiverName,
        phoneNumber: nextPhoneNumber,
        fullAddress: nextFullAddress,
        addressType: newAddressForm.addressType,
        isDefault: newAddressForm.isDefault,
      });

      toast.success("Thêm địa chỉ mới thành công!");
      setShowAddressForm(false);
      setNewAddressForm({
        receiverName: user?.name || "",
        phoneNumber: "",
        fullAddress: "",
        addressType: "home",
        isDefault: false,
      });

      // Refresh addresses list
      const response = await addressAPI.getMyAddresses();
      setAddresses(unwrapApiList(response));
    } catch (error) {
      toast.error(getAddressErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Bạn có chắc muốn xóa địa chỉ này?")) {
      return;
    }

    setIsLoading(true);
    try {
      await addressAPI.deleteAddress(addressId);
      toast.success("Xóa địa chỉ thành công!");

      // Refresh addresses list
      const response = await addressAPI.getMyAddresses();
      setAddresses(unwrapApiList(response));
    } catch (error) {
      toast.error(error?.message || "Không thể xóa địa chỉ");
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
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
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

              {activeTab === "address" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Địa chỉ của tôi
                    </h2>
                    {!showAddressForm && (
                      <Button
                        onClick={() => setShowAddressForm(true)}
                        variant="primary"
                        className="whitespace-nowrap"
                      >
                        + Thêm địa chỉ mới
                      </Button>
                    )}
                  </div>

                  {/* Danh sách địa chỉ */}
                  {isLoadingAddresses ? (
                    <div className="rounded-lg border border-gray-200 p-6 text-center text-gray-600">
                      Đang tải danh sách địa chỉ...
                    </div>
                  ) : addresses.length > 0 ? (
                    <div className="mb-8 space-y-3">
                      {addresses.map((address) => (
                        <div
                          key={address.id}
                          className="rounded-lg border border-gray-200 p-4 hover:border-coffee-300 hover:shadow-sm transition-all"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="mb-2 flex items-center gap-2">
                                <p className="font-semibold text-gray-900">
                                  {address.receiverName}
                                </p>
                                <span
                                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                    address.addressType === "home"
                                      ? "bg-blue-100 text-blue-700"
                                      : "bg-orange-100 text-orange-700"
                                  }`}
                                >
                                  {address.addressType === "home"
                                    ? "Nhà riêng"
                                    : "Văn phòng"}
                                </span>
                                {address.isDefault && (
                                  <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                                    Mặc định
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">
                                {address.phoneNumber}
                              </p>
                              <p className="mt-2 text-gray-700">
                                {address.fullAddress}
                              </p>
                            </div>
                            <button
                              onClick={() => handleDeleteAddress(address.id)}
                              disabled={isLoading}
                              className="ml-4 flex-shrink-0 rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mb-8 rounded-lg border border-dashed border-gray-300 p-6 text-center text-gray-600">
                      Bạn chưa có địa chỉ nào. Hãy thêm địa chỉ mới để tiện cho
                      việc mua hàng.
                    </div>
                  )}

                  {/* Form thêm địa chỉ mới */}
                  {showAddressForm && (
                    <div className="rounded-lg border-2 border-coffee-200 bg-coffee-50/50 p-6">
                      <div className="mb-6 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Thêm địa chỉ mới
                        </h3>
                        <button
                          onClick={() => setShowAddressForm(false)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          ✕
                        </button>
                      </div>

                      <form onSubmit={handleAddAddress} className="space-y-4">
                        <Input
                          label="Tên người nhận"
                          name="receiverName"
                          value={newAddressForm.receiverName}
                          onChange={handleNewAddressChange}
                          required
                        />
                        <Input
                          label="Số điện thoại"
                          name="phoneNumber"
                          type="tel"
                          value={newAddressForm.phoneNumber}
                          onChange={handleNewAddressChange}
                          required
                        />
                        <Input
                          label="Địa chỉ chi tiết"
                          name="fullAddress"
                          value={newAddressForm.fullAddress}
                          onChange={handleNewAddressChange}
                          placeholder="Số nhà, tên đường, quận, thành phố..."
                          required
                        />

                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700">
                            Loại địa chỉ
                          </label>
                          <div className="flex gap-3">
                            <label className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="addressType"
                                value="home"
                                checked={newAddressForm.addressType === "home"}
                                onChange={handleNewAddressChange}
                                className="h-4 w-4 text-coffee-600"
                              />
                              <span className="text-sm text-gray-700">
                                Nhà riêng
                              </span>
                            </label>
                            <label className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="addressType"
                                value="office"
                                checked={
                                  newAddressForm.addressType === "office"
                                }
                                onChange={handleNewAddressChange}
                                className="h-4 w-4 text-coffee-600"
                              />
                              <span className="text-sm text-gray-700">
                                Văn phòng
                              </span>
                            </label>
                          </div>
                        </div>

                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            name="isDefault"
                            checked={newAddressForm.isDefault}
                            onChange={handleNewAddressChange}
                            className="h-4 w-4 rounded border-gray-300 text-coffee-600"
                          />
                          <span className="text-sm text-gray-700">
                            Đặt làm địa chỉ mặc định
                          </span>
                        </label>

                        <div className="flex gap-3 pt-4">
                          <Button
                            type="submit"
                            variant="primary"
                            isLoading={isLoading}
                            disabled={isLoading}
                          >
                            Lưu địa chỉ
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowAddressForm(false)}
                            disabled={isLoading}
                          >
                            Hủy
                          </Button>
                        </div>
                      </form>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "password" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
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

              {activeTab === "orders" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
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
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
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
