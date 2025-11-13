import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Save,
  Settings as SettingsIcon,
  Building,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import useToastStore from "../../stores/useToastStore";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

const AdminSettingsPage = () => {
  const toast = useToastStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    siteName: "",
    siteDescription: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
    logoUrl: "",
  });

  useEffect(() => {
    // Load from localStorage
    const savedSettings = localStorage.getItem("siteSettings");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setFormData(parsed);
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Save to localStorage (fallback if no backend API)
      localStorage.setItem("siteSettings", JSON.stringify(formData));

      // Simulate delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      toast.success("Cài đặt đã được lưu thành công!");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Không thể lưu cài đặt");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Cài Đặt Hệ Thống</h1>
        <p className="text-gray-600 mt-1">
          Quản lý thông tin cửa hàng và cài đặt chung
        </p>
      </div>

      {/* Settings Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm p-8"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Site Information */}
          <div>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
              <div className="p-2 bg-coffee-100 rounded-lg">
                <Building className="w-6 h-6 text-coffee-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Thông Tin Cửa Hàng
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Input
                  label="Tên Cửa Hàng"
                  name="siteName"
                  value={formData.siteName}
                  onChange={(e) =>
                    setFormData({ ...formData, siteName: e.target.value })
                  }
                  icon={<Building className="w-5 h-5" />}
                  placeholder="Coffee Shop Pro"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô Tả
                </label>
                <textarea
                  value={formData.siteDescription}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      siteDescription: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
                  placeholder="Mô tả ngắn về cửa hàng..."
                />
              </div>

              <Input
                label="URL Logo"
                name="logoUrl"
                value={formData.logoUrl}
                onChange={(e) =>
                  setFormData({ ...formData, logoUrl: e.target.value })
                }
                placeholder="https://example.com/logo.png"
              />
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
              <div className="p-2 bg-blue-100 rounded-lg">
                <SettingsIcon className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Thông Tin Liên Hệ
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Email"
                name="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) =>
                  setFormData({ ...formData, contactEmail: e.target.value })
                }
                icon={<Mail className="w-5 h-5" />}
                placeholder="contact@coffeeshop.com"
              />

              <Input
                label="Số Điện Thoại"
                name="contactPhone"
                type="tel"
                value={formData.contactPhone}
                onChange={(e) =>
                  setFormData({ ...formData, contactPhone: e.target.value })
                }
                icon={<Phone className="w-5 h-5" />}
                placeholder="0123 456 789"
              />

              <div className="md:col-span-2">
                <Input
                  label="Địa Chỉ"
                  name="address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  icon={<MapPin className="w-5 h-5" />}
                  placeholder="123 Đường ABC, Quận XYZ, TP. HCM"
                />
              </div>
            </div>
          </div>

          {/* Preview Card */}
          {formData.siteName && (
            <div className="bg-gradient-to-br from-coffee-50 to-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-sm font-medium text-gray-600 mb-4">
                Xem Trước
              </h3>
              <div className="space-y-2">
                {formData.logoUrl && (
                  <img
                    src={formData.logoUrl}
                    alt="Logo"
                    className="h-12 object-contain mb-3"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                )}
                <h4 className="text-2xl font-bold text-gray-900">
                  {formData.siteName}
                </h4>
                {formData.siteDescription && (
                  <p className="text-gray-600">{formData.siteDescription}</p>
                )}
                {formData.contactEmail && (
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {formData.contactEmail}
                  </p>
                )}
                {formData.contactPhone && (
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {formData.contactPhone}
                  </p>
                )}
                {formData.address && (
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {formData.address}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end pt-6 border-t border-gray-200">
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              disabled={isLoading}
            >
              <Save className="w-5 h-5 mr-2" />
              {isLoading ? "Đang lưu..." : "Lưu Cài Đặt"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminSettingsPage;
