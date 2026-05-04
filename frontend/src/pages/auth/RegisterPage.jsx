import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Coffee, MapPin } from "lucide-react";
import useAuthStore from "../../stores/useAuthStore";
import useToastStore from "../../stores/useToastStore";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import provinceAPI from "../../services/provinceAPI";
import { getApiErrorMessage, getApiFieldErrors } from "../../utils/apiValidation";
import { validateRegisterForm } from "../../validations/auth";

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
  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const data = await provinceAPI.getAllProvinces();
        setProvinces(data);
      } catch (error) {
        console.error("Error fetching provinces:", error);
        toast.error("Khong the tai danh sach tinh thanh");
      }
    };

    fetchProvinces();
  }, [toast]);

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddressData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleProvinceChange = async (e) => {
    const provinceCode = e.target.value;
    if (!provinceCode) {
      setSelectedProvince(null);
      setDistricts([]);
      setWards([]);
      setSelectedDistrict(null);
      setSelectedWard(null);
      setFormErrors((prev) => ({
        ...prev,
        selectedProvince: "",
        selectedDistrict: "",
        selectedWard: "",
      }));
      return;
    }

    const province = provinces.find((p) => p.code === parseInt(provinceCode, 10));
    setSelectedProvince(province);
    setSelectedDistrict(null);
    setSelectedWard(null);
    setWards([]);
    setFormErrors((prev) => ({
      ...prev,
      selectedProvince: "",
      selectedDistrict: "",
      selectedWard: "",
    }));

    try {
      const data = await provinceAPI.getDistrictsByProvince(provinceCode);
      setDistricts(data.districts || []);
    } catch (error) {
      console.error("Error fetching districts:", error);
      toast.error("Khong the tai danh sach quan/huyen");
    }
  };

  const handleDistrictChange = async (e) => {
    const districtCode = e.target.value;
    if (!districtCode) {
      setSelectedDistrict(null);
      setWards([]);
      setSelectedWard(null);
      setFormErrors((prev) => ({
        ...prev,
        selectedDistrict: "",
        selectedWard: "",
      }));
      return;
    }

    const district = districts.find((d) => d.code === parseInt(districtCode, 10));
    setSelectedDistrict(district);
    setSelectedWard(null);
    setFormErrors((prev) => ({
      ...prev,
      selectedDistrict: "",
      selectedWard: "",
    }));

    try {
      const data = await provinceAPI.getWardsByDistrict(districtCode);
      setWards(data.wards || []);
    } catch (error) {
      console.error("Error fetching wards:", error);
      toast.error("Khong the tai danh sach phuong/xa");
    }
  };

  const handleWardChange = (e) => {
    const wardCode = e.target.value;
    if (!wardCode) {
      setSelectedWard(null);
      setFormErrors((prev) => ({ ...prev, selectedWard: "" }));
      return;
    }

    const ward = wards.find((w) => w.code === parseInt(wardCode, 10));
    setSelectedWard(ward);
    setFormErrors((prev) => ({ ...prev, selectedWard: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = validateRegisterForm(formData, addressData);
    const nextErrors = { ...validation.errors };

    if (!selectedProvince) nextErrors.selectedProvince = "Vui long chon tinh/thanh pho";
    if (!selectedDistrict) nextErrors.selectedDistrict = "Vui long chon quan/huyen";
    if (!selectedWard) nextErrors.selectedWard = "Vui long chon phuong/xa";

    if (Object.keys(nextErrors).length > 0) {
      setFormErrors(nextErrors);
      toast.error(Object.values(nextErrors)[0]);
      return;
    }

    setIsLoading(true);

    try {
      setFormErrors({});
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

      toast.success("Dang ky thanh cong. Vui long dang nhap");
      navigate("/login");
    } catch (error) {
      const fieldErrors = getApiFieldErrors(error);
      if (Object.keys(fieldErrors).length > 0) {
        setFormErrors((prev) => ({ ...prev, ...fieldErrors }));
      }
      toast.error(getApiErrorMessage(error, "Dang ky that bai"));
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
              <h1 className="text-3xl font-bold text-gray-900">Dang Ky</h1>
              <p className="text-gray-600 mt-2">Tao tai khoan moi</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Ho va ten"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={formErrors.name}
                required
              />

              <Input
                label="Email"
                type="email"
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

              <Input
                label="Xac nhan mat khau"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={formErrors.confirmPassword}
                required
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={isLoading || authLoading}
                disabled={isLoading || authLoading}
              >
                Dang Ky
              </Button>
            </form>

            <p className="text-center mt-6 text-gray-600">
              Da co tai khoan?{" "}
              <Link
                to="/login"
                className="text-coffee-600 hover:underline font-medium"
              >
                Dang nhap
              </Link>
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-coffee-100 rounded-full flex items-center justify-center">
                <MapPin className="w-8 h-8 text-coffee-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Dia Chi</h1>
              <p className="text-gray-600 mt-2">Them dia chi mac dinh</p>
            </div>

            <form className="space-y-4">
              <Input
                label="Ten nguoi nhan"
                type="text"
                name="receiverName"
                value={addressData.receiverName}
                onChange={handleAddressChange}
                error={formErrors.receiverName}
                placeholder={formData.name || "Nhap ten nguoi nhan"}
                required
              />

              <Input
                label="So dien thoai"
                type="tel"
                name="phoneNumber"
                value={addressData.phoneNumber}
                onChange={handleAddressChange}
                error={formErrors.phoneNumber}
                required
              />

              <Input
                label="Dia chi chi tiet"
                type="text"
                name="fullAddress"
                value={addressData.fullAddress}
                onChange={handleAddressChange}
                error={formErrors.fullAddress}
                placeholder="So nha, ten duong..."
                required
              />

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tinh / Thanh pho <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedProvince?.code || ""}
                    onChange={handleProvinceChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 text-sm"
                  >
                    <option value="">Chon tinh</option>
                    {provinces.map((province) => (
                      <option key={province.code} value={province.code}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.selectedProvince && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.selectedProvince}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quan / Huyen <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedDistrict?.code || ""}
                    onChange={handleDistrictChange}
                    disabled={!selectedProvince}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                  >
                    <option value="">Chon quan</option>
                    {districts.map((district) => (
                      <option key={district.code} value={district.code}>
                        {district.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.selectedDistrict && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.selectedDistrict}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phuong / Xa <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedWard?.code || ""}
                    onChange={handleWardChange}
                    disabled={!selectedDistrict}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                  >
                    <option value="">Chon phuong</option>
                    {wards.map((ward) => (
                      <option key={ward.code} value={ward.code}>
                        {ward.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.selectedWard && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.selectedWard}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loai dia chi <span className="text-red-500">*</span>
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
                    <span className="text-sm text-gray-700">Nha rieng</span>
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
                    <span className="text-sm text-gray-700">Van phong</span>
                  </label>
                </div>
                {formErrors.addressType && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.addressType}</p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
                Dia chi nay se duoc dat lam dia chi mac dinh cho cac don hang tiep theo.
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
