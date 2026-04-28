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

    const province = provinces.find((p) => p.code === parseInt(provinceCode, 10));
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

    const district = districts.find((d) => d.code === parseInt(districtCode, 10));
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
      toast.error(error.errors?.[0]?.msg || "Đăng ký thất bại");
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
              <Input
                label="Tên người nhận"
                type="text"
                name="receiverName"
                value={addressData.receiverName}
                onChange={handleAddressChange}
                placeholder={formData.name || "Nhập tên người nhận"}
                required
              />

              <Input
                label="Số điện thoại"
                type="tel"
                name="phoneNumber"
                value={addressData.phoneNumber}
                onChange={handleAddressChange}
                required
              />

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
                Địa chỉ này sẽ được đặt làm địa chỉ mặc định cho các đơn hàng tiếp theo!
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
