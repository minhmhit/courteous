import { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import useAuthStore from "../../stores/useAuthStore";
import useToastStore from "../../stores/useToastStore";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { authAPI, employeeAPI } from "../../services";

const getProfileFromResponse = (response) => {
  const payload = response?.data || response;
  return (
    payload?.data?.employee || payload?.data || payload?.employee || payload
  );
};

const toDateInputValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const toApiDateString = (dateInputValue) => {
  const normalized = normalizeNullable(dateInputValue);
  if (!normalized) return null;
  return /^\d{4}-\d{2}-\d{2}$/.test(normalized) ? normalized : null;
};

const formatDisplayDate = (value) => {
  if (!value) return "Chưa cập nhật";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa cập nhật";
  return date.toLocaleDateString("vi-VN");
};

const normalizeNullable = (value) => {
  const normalized = typeof value === "string" ? value.trim() : value;
  return normalized === "" ? null : normalized;
};

const AdminProfilePage = () => {
  const { user, updateProfile } = useAuthStore();
  const toast = useToastStore();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("info");

  const [infoForm, setInfoForm] = useState({
    name: user?.name || user?.fullName || "",
    email: user?.email || user?.userEmail || "",
    phoneNumber: user?.phoneNumber || user?.phone || "",
    address: user?.address || "",
    dateOfBirth: "",
    gender: "",
    nationalId: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    bankAccountNo: "",
    bankAccountName: "",
    bankName: "",
  });

  const [profileMeta, setProfileMeta] = useState({
    employeeCode: "",
    username: user?.username || "",
    departmentName: "",
    departmentCode: "",
    employmentType: "",
    employeeStatus: "",
    currentPositionName: "",
    hireDate: "",
    officialDate: "",
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
    setPasswordForm({
      ...passwordForm,
      [event.target.name]: event.target.value,
    });
  };

  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      try {
        let profile = null;
        try {
          const res = await employeeAPI.getMyProfile();
          profile = getProfileFromResponse(res);
        } catch (error) {
          // ignore employee profile fetch errors
        }

        if (!profile) {
          const res = await authAPI.getProfile();
          const payload = res?.data || res;
          profile = payload?.data || payload?.user || payload;
        }
        if (!isMounted || !profile) return;

        setInfoForm((prev) => ({
          ...prev,
          name: profile.name || profile.fullName || prev.name,
          email: profile.email || prev.email,
          phoneNumber: profile.phoneNumber || profile.phone || "",
          address:
            profile.address ||
            profile.user_address ||
            profile.fullAddress ||
            "",
          dateOfBirth: toDateInputValue(profile.dateOfBirth),
          gender: profile.gender || "",
          nationalId: profile.nationalId || "",
          emergencyContactName: profile.emergencyContactName || "",
          emergencyContactPhone: profile.emergencyContactPhone || "",
          bankAccountNo: profile.bankAccountNo || "",
          bankAccountName: profile.bankAccountName || "",
          bankName: profile.bankName || "",
        }));

        setProfileMeta({
          employeeCode: profile.employeeCode || "",
          username: profile.username || "",
          departmentName: profile.departmentName || "",
          departmentCode: profile.departmentCode || "",
          employmentType: profile.employmentType || "",
          employeeStatus: profile.status || "",
          currentPositionName: profile.currentPosition?.name || "",
          hireDate: profile.hireDate || "",
          officialDate: profile.officialDate || "",
        });
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
      const employeePayload = {
        dateOfBirth: toApiDateString(infoForm.dateOfBirth),
        gender: normalizeNullable(infoForm.gender),
        nationalId: normalizeNullable(infoForm.nationalId),
        address: normalizeNullable(infoForm.address),
        emergencyContactName: normalizeNullable(infoForm.emergencyContactName),
        emergencyContactPhone: normalizeNullable(
          infoForm.emergencyContactPhone,
        ),
        bankAccountNo: normalizeNullable(infoForm.bankAccountNo),
        bankAccountName: normalizeNullable(infoForm.bankAccountName),
        bankName: normalizeNullable(infoForm.bankName),
      };

      const profilePayload = {
        name: infoForm.name,
        phoneNumber: infoForm.phoneNumber,
      };

      const normalizedAddress = (infoForm.address || "").trim();
      if (normalizedAddress.length >= 5) {
        profilePayload.address = normalizedAddress;
      }

      await employeeAPI.updateMyProfile(employeePayload);
      await updateProfile(profilePayload);
      toast.success("Cập nhật thông tin thành công!");
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Không thể cập nhật thông tin";
      toast.error(message);
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
          <form onSubmit={handleUpdateInfo} className="space-y-6">
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Thông tin công việc
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Mã nhân viên"
                  value={profileMeta.employeeCode}
                  disabled
                />
                <Input
                  label="Tên đăng nhập"
                  value={profileMeta.username}
                  disabled
                />
                <Input
                  label="Phòng ban"
                  value={
                    profileMeta.departmentName
                      ? `${profileMeta.departmentName}${
                          profileMeta.departmentCode
                            ? ` (${profileMeta.departmentCode})`
                            : ""
                        }`
                      : ""
                  }
                  disabled
                />
                <Input
                  label="Vị trí hiện tại"
                  value={profileMeta.currentPositionName}
                  disabled
                />
                <Input
                  label="Loại hợp đồng"
                  value={profileMeta.employmentType}
                  disabled
                />
                <Input
                  label="Trạng thái nhân sự"
                  value={profileMeta.employeeStatus}
                  disabled
                />
                <Input
                  label="Ngày vào làm"
                  value={formatDisplayDate(profileMeta.hireDate)}
                  disabled
                />
                <Input
                  label="Ngày chính thức"
                  value={formatDisplayDate(profileMeta.officialDate)}
                  disabled
                />
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Thông tin cá nhân
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  label="Ngày sinh"
                  name="dateOfBirth"
                  type="date"
                  value={infoForm.dateOfBirth}
                  onChange={handleInfoChange}
                />
                <div className="w-full">
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Giới tính
                  </label>
                  <select
                    name="gender"
                    value={infoForm.gender}
                    onChange={handleInfoChange}
                    className="glass-input w-full"
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="MALE">Nam</option>
                    <option value="FEMALE">Nữ</option>
                    <option value="OTHER">Khác</option>
                  </select>
                </div>
                <Input
                  label="CCCD/CMND"
                  name="nationalId"
                  value={infoForm.nationalId}
                  onChange={handleInfoChange}
                />
                <div className="md:col-span-2">
                  <Input
                    label="Địa chỉ"
                    name="address"
                    value={infoForm.address}
                    onChange={handleInfoChange}
                  />
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Liên hệ khẩn cấp
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Tên liên hệ"
                  name="emergencyContactName"
                  value={infoForm.emergencyContactName}
                  onChange={handleInfoChange}
                />
                <Input
                  label="SĐT liên hệ"
                  name="emergencyContactPhone"
                  value={infoForm.emergencyContactPhone}
                  onChange={handleInfoChange}
                />
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Thông tin ngân hàng
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Số tài khoản"
                  name="bankAccountNo"
                  value={infoForm.bankAccountNo}
                  onChange={handleInfoChange}
                />
                <Input
                  label="Tên tài khoản"
                  name="bankAccountName"
                  value={infoForm.bankAccountName}
                  onChange={handleInfoChange}
                />
                <Input
                  label="Ngân hàng"
                  name="bankName"
                  value={infoForm.bankName}
                  onChange={handleInfoChange}
                />
              </div>
            </section>

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
