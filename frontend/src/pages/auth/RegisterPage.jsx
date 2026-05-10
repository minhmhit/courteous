import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Coffee, MapPin } from "lucide-react";
import useAuthStore from "../../stores/useAuthStore";
import useToastStore from "../../stores/useToastStore";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import provinceAPI from "../../services/provinceAPI";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, isLoading: authLoading } = useAuthStore();
  const toast = useToastStore();
  const [isLoading, setIsLoading] = useState(false);

  const NAME_REGEX = /^(?=.*[A-Za-zÀ-ỹĐđ])[A-Za-zÀ-ỹĐđ\s]+$/u;
  const PHONE_REGEX = /^0\d{9}$/;
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const [errors, setErrors] = useState({
    name: null,
    email: null,
    phone: null,
    receiverName: null,
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [addressData, setAddressData] = useState({
    receiverName: "",
    phoneNumber: "",
    fullAddress: "",
    addressType: "home",
  });

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // live-validate name and email
    const { name, value } = e.target;
    if (name === "name" || name === "email") {
      const fieldErr = getFieldErrorMessage(name, value);
      setErrors((prev) => ({ ...prev, [name]: fieldErr }));
    }
  };

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const data = await provinceAPI.getAllProvinces();
        setProvinces(data);
      } catch (error) {
        console.error("Error fetching provinces:", error);
        toast.error("Không thể tải danh sách tỉnh thành");
      }
    };

    fetchProvinces();
  }, [toast]);

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddressData({
      ...addressData,
      [name]: value,
    });
    if (name === "phoneNumber") {
      const fieldErr = getFieldErrorMessage("phone", value);
      setErrors((prev) => ({ ...prev, phone: fieldErr }));
    }

    if (name === "receiverName") {
      const fieldErr = getFieldErrorMessage("name", value);
      setErrors((prev) => ({ ...prev, receiverName: fieldErr }));
    }
  };

  const getFieldErrorMessage = (field, value) => {
    const v = typeof value === "string" ? value.trim() : value;
    if (field === "name") {
      if (!v) return "Họ và tên không được để trống.";
      if (!NAME_REGEX.test(v))
        return "Họ và tên phải chỉ gồm chữ và khoảng trắng.";
      return null;
    }

    if (field === "email") {
      if (!v) return "Email không được để trống.";
      if (!EMAIL_REGEX.test(v)) return "Email không hợp lệ.";
      return null;
    }

    if (field === "phone") {
      if (!v) return "Số điện thoại không được để trống.";
      if (!PHONE_REGEX.test(v))
        return "Số điện thoại phải bắt đầu bằng 0 và có đúng 10 chữ số.";
      return null;
    }

    return null;
  };

  const handleProvinceChange = async (e) => {
    const provinceCode = e.target.value;
    if (!provinceCode) {
      setSelectedProvince(null);
      setDistricts([]);
      setWards([]);
      setSelectedDistrict(null);
      setSelectedWard(null);
      return;
    }

    const province = provinces.find(
      (p) => p.code === parseInt(provinceCode, 10),
    );
    setSelectedProvince(province);
    setSelectedDistrict(null);
    setSelectedWard(null);
    setWards([]);

    try {
      const data = await provinceAPI.getDistrictsByProvince(provinceCode);
      setDistricts(data.districts || []);
    } catch (error) {
      console.error("Error fetching districts:", error);
      toast.error("Không thể tải danh sách quận/huyện");
    }
  };

  const handleDistrictChange = async (e) => {
    const districtCode = e.target.value;
    if (!districtCode) {
      setSelectedDistrict(null);
      setWards([]);
      setSelectedWard(null);
      return;
    }

    const district = districts.find(
      (d) => d.code === parseInt(districtCode, 10),
    );
    setSelectedDistrict(district);
    setSelectedWard(null);

    try {
      const data = await provinceAPI.getWardsByDistrict(districtCode);
      setWards(data.wards || []);
    } catch (error) {
      console.error("Error fetching wards:", error);
      toast.error("Không thể tải danh sách phường/xã");
    }
  };

  const handleWardChange = (e) => {
    const wardCode = e.target.value;
    if (!wardCode) {
      setSelectedWard(null);
      return;
    }

    const ward = wards.find((w) => w.code === parseInt(wardCode, 10));
    setSelectedWard(ward);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate client-side fields: name, email, phone
    const nameErr = getFieldErrorMessage("name", formData.name);
    const emailErr = getFieldErrorMessage("email", formData.email);
    const phoneErr = getFieldErrorMessage("phone", addressData.phoneNumber);
    const receiverErr = getFieldErrorMessage("name", addressData.receiverName);

    setErrors({ name: nameErr, email: emailErr, phone: phoneErr });

    if (nameErr) {
      toast.error(nameErr);
      return;
    }

    if (emailErr) {
      toast.error(emailErr);
      return;
    }

    if (phoneErr) {
      toast.error(phoneErr);
      return;
    }

    if (receiverErr) {
      toast.error(receiverErr);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    if (
      !addressData.receiverName ||
      !addressData.phoneNumber ||
      !addressData.fullAddress ||
      !selectedProvince ||
      !selectedDistrict ||
      !selectedWard
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin địa chỉ");
      return;
    }

    setIsLoading(true);

    try {
      const fullAddress = [
        addressData.fullAddress,
        selectedWard?.name,
        selectedDistrict?.name,
        selectedProvince?.name,
      ]
        .filter(Boolean)
        .join(", ");

      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        fullAddress,
        phoneNumber: addressData.phoneNumber,
        addressType: addressData.addressType,
      });

      toast.success("Đăng ký thành công! Vui lòng đăng nhập");
      navigate("/login");
    } catch (error) {
      // axios interceptor may reject with response.data directly, so handle both shapes
      const resp = error?.response?.data || error || {};
      const apiErrors =
        resp?.errors || resp?.error || (Array.isArray(resp) ? resp : null);

      let handled = false;
      if (Array.isArray(apiErrors) && apiErrors.length) {
        const emailErrObj = apiErrors.find(
          (it) => it.param === "email" || it.param === "username",
        );
        if (emailErrObj) {
          const msg = emailErrObj.msg || "Email đã tồn tại";
          setErrors((prev) => ({ ...prev, email: msg }));
          toast.error(msg);
          handled = true;
        } else {
          const msg = apiErrors[0].msg || "Đăng ký thất bại";
          toast.error(msg);
          handled = true;
        }
      }

      if (!handled && resp?.message) {
        const msgLower = String(resp.message).toLowerCase();
        if (
          msgLower.includes("email") &&
          (msgLower.includes("exist") ||
            msgLower.includes("already") ||
            msgLower.includes("tồn tại"))
        ) {
          setErrors((prev) => ({ ...prev, email: "Email đã tồn tại" }));
          toast.error("Email đã tồn tại");
          handled = true;
        } else {
          toast.error(resp.message || "Đăng ký thất bại");
          handled = true;
        }
      }

      if (!handled) {
        // if error is a string (some interceptors reject with a string)
        if (typeof error === "string") {
          const s = error.toLowerCase();
          if (
            s.includes("email") &&
            (s.includes("exist") ||
              s.includes("tồn tại") ||
              s.includes("already"))
          ) {
            setErrors((prev) => ({ ...prev, email: "Email đã tồn tại" }));
            toast.error("Email đã tồn tại");
          } else {
            toast.error(error || "Đăng ký thất bại");
          }
        } else {
          toast.error("Đăng ký thất bại");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-cream-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <Coffee className="w-16 h-16 mx-auto mb-4 text-coffee-600" />
              <h1 className="text-3xl font-bold text-gray-900">Đăng Ký</h1>
              <p className="text-gray-600 mt-2">Tạo tài khoản mới</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <Input
                  label="Họ và tên"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600" role="alert">
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <Input
                  label="Email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600" role="alert">
                    {errors.email}
                  </p>
                )}
              </div>

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
                isLoading={isLoading || authLoading}
                disabled={isLoading || authLoading}
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

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-coffee-100 rounded-full flex items-center justify-center">
                <MapPin className="w-8 h-8 text-coffee-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Địa Chỉ</h1>
              <p className="text-gray-600 mt-2">Thêm địa chỉ mặc định</p>
            </div>

            <form className="space-y-4">
              <div>
                <Input
                  label="Tên người nhận"
                  type="text"
                  name="receiverName"
                  value={addressData.receiverName}
                  onChange={handleAddressChange}
                  placeholder={formData.name || "Nhập tên người nhận"}
                  required
                />
                {errors.receiverName && (
                  <p className="mt-1 text-sm text-red-600" role="alert">
                    {errors.receiverName}
                  </p>
                )}
              </div>

              <div>
                <Input
                  label="Số điện thoại"
                  type="tel"
                  name="phoneNumber"
                  value={addressData.phoneNumber}
                  onChange={handleAddressChange}
                  required
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600" role="alert">
                    {errors.phone}
                  </p>
                )}
              </div>

              <Input
                label="Địa chỉ chi tiết"
                type="text"
                name="fullAddress"
                value={addressData.fullAddress}
                onChange={handleAddressChange}
                placeholder="Số nhà, tên đường..."
                required
              />

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tỉnh / Thành phố <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedProvince?.code || ""}
                    onChange={handleProvinceChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 text-sm"
                  >
                    <option value="">Chọn tỉnh</option>
                    {provinces.map((province) => (
                      <option key={province.code} value={province.code}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quận / Huyện <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedDistrict?.code || ""}
                    onChange={handleDistrictChange}
                    disabled={!selectedProvince}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                  >
                    <option value="">Chọn quận</option>
                    {districts.map((district) => (
                      <option key={district.code} value={district.code}>
                        {district.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phường / Xã <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedWard?.code || ""}
                    onChange={handleWardChange}
                    disabled={!selectedDistrict}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                  >
                    <option value="">Chọn phường</option>
                    {wards.map((ward) => (
                      <option key={ward.code} value={ward.code}>
                        {ward.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại địa chỉ <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 flex-1">
                    <input
                      type="radio"
                      name="addressType"
                      value="home"
                      checked={addressData.addressType === "home"}
                      onChange={handleAddressChange}
                      className="h-4 w-4 text-coffee-600"
                    />
                    <span className="text-sm text-gray-700">Nhà riêng</span>
                  </label>
                  <label className="flex items-center gap-2 flex-1">
                    <input
                      type="radio"
                      name="addressType"
                      value="office"
                      checked={addressData.addressType === "office"}
                      onChange={handleAddressChange}
                      className="h-4 w-4 text-coffee-600"
                    />
                    <span className="text-sm text-gray-700">Văn phòng</span>
                  </label>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
                Địa chỉ này sẽ được đặt làm địa chỉ mặc định cho các đơn hàng
                tiếp theo!
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
