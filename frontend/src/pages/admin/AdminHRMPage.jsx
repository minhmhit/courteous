import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Calendar,
  Clock,
  Award,
  Mail,
  Phone,
  Shield,
} from "lucide-react";
import { userAPI } from "../../services";
import useToastStore from "../../stores/useToastStore";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

const AdminHRMPage = () => {
  const toast = useToastStore();
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    fullName: "",
    phone: "",
    role: 2,
    address: "",
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const response = await userAPI.getAllUsers();
      // Filter out customers (role 0) to show only staff
      const staffOnly = (response.data || []).filter((user) => user.role > 0);
      setEmployees(staffOnly);
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error("Không thể tải danh sách nhân viên");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (employee = null) => {
    if (employee) {
      setEditingEmployee(employee);
      setFormData({
        username: employee.username || "",
        email: employee.email || "",
        password: "", // Don't show password
        fullName: employee.fullName || employee.full_name || "",
        phone: employee.phone || "",
        role: employee.role || 2,
        address: employee.address || "",
      });
    } else {
      setEditingEmployee(null);
      setFormData({
        username: "",
        email: "",
        password: "",
        fullName: "",
        phone: "",
        role: 2,
        address: "",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEmployee(null);
    setFormData({
      username: "",
      email: "",
      password: "",
      fullName: "",
      phone: "",
      role: 2,
      address: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.email) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    if (!editingEmployee && !formData.password) {
      toast.error("Vui lòng nhập mật khẩu cho nhân viên mới");
      return;
    }

    try {
      const submitData = {
        ...formData,
        fullName: formData.fullName,
      };

      if (editingEmployee) {
        // Update - don't send password if empty
        if (!formData.password) {
          delete submitData.password;
        }
        await userAPI.updateUser(editingEmployee.id, submitData);
        toast.success("Cập nhật nhân viên thành công");
      } else {
        // Create new employee
        await userAPI.registerUser(submitData);
        toast.success("Thêm nhân viên thành công");
      }
      handleCloseModal();
      fetchEmployees();
    } catch (error) {
      console.error("Error saving employee:", error);
      toast.error(error.response?.data?.message || "Không thể lưu nhân viên");
    }
  };

  const handleDelete = async (employeeId) => {
    if (!confirm("Bạn có chắc muốn xóa nhân viên này?")) return;

    try {
      await userAPI.deleteUser(employeeId);
      toast.success("Xóa nhân viên thành công");
      fetchEmployees();
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast.error("Không thể xóa nhân viên");
    }
  };

  const getRoleName = (role) => {
    const roleMap = {
      1: "Admin",
      2: "Nhân Viên Kho",
      3: "Nhân Viên Bán Hàng",
      4: "Quản Lý",
    };
    return roleMap[role] || "Nhân Viên";
  };

  const getRoleBadgeColor = (role) => {
    const colorMap = {
      1: "bg-purple-100 text-purple-800",
      2: "bg-blue-100 text-blue-800",
      3: "bg-green-100 text-green-800",
      4: "bg-orange-100 text-orange-800",
    };
    return colorMap[role] || "bg-gray-100 text-gray-800";
  };

  const filteredEmployees = employees.filter((employee) => {
    const searchMatch =
      employee.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.full_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const roleMatch =
      roleFilter === "all" || employee.role === parseInt(roleFilter);

    return searchMatch && roleMatch;
  });

  const roleOptions = [
    { value: "all", label: "Tất cả", count: employees.length },
    {
      value: 1,
      label: "Admin",
      count: employees.filter((e) => e.role === 1).length,
    },
    {
      value: 2,
      label: "Kho",
      count: employees.filter((e) => e.role === 2).length,
    },
    {
      value: 3,
      label: "Bán Hàng",
      count: employees.filter((e) => e.role === 3).length,
    },
    {
      value: 4,
      label: "Quản Lý",
      count: employees.filter((e) => e.role === 4).length,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Quản Lý Nhân Sự (HRM)
          </h1>
          <p className="text-gray-600 mt-1">Quản lý nhân viên và phân quyền</p>
        </div>
        <Button onClick={() => handleOpenModal()} variant="primary">
          <Plus className="w-5 h-5 mr-2" />
          Thêm Nhân Viên
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tổng Nhân Viên</p>
              <p className="text-2xl font-bold text-gray-900">
                {employees.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Admin</p>
              <p className="text-2xl font-bold text-gray-900">
                {employees.filter((e) => e.role === 1).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="p-3 bg-green-100 rounded-lg">
            <Award className="w-6 h-6 text-green-600" />
          </div>
          <div className="mt-3">
            <p className="text-sm text-gray-600">Nhân Viên Hoạt Động</p>
            <p className="text-2xl font-bold text-gray-900">
              {employees.filter((e) => !e.isBanned && !e.is_banned).length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="p-3 bg-orange-100 rounded-lg">
            <Calendar className="w-6 h-6 text-orange-600" />
          </div>
          <div className="mt-3">
            <p className="text-sm text-gray-600">Tháng Này</p>
            <p className="text-2xl font-bold text-gray-900">
              {new Date().toLocaleDateString("vi-VN", { month: "long" })}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="w-5 h-5 text-gray-500" />
          {roleOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setRoleFilter(option.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                roleFilter === option.value
                  ? "bg-coffee-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {option.label} ({option.count})
            </button>
          ))}
        </div>

        <Input
          placeholder="Tìm kiếm nhân viên..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<Search className="w-5 h-5" />}
        />
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-600"></div>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Nhân Viên
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Liên Hệ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Vai Trò
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Trạng Thái
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Thao Tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-gray-900">
                          {employee.fullName ||
                            employee.full_name ||
                            employee.username}
                        </p>
                        <p className="text-sm text-gray-600">
                          @{employee.username}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          {employee.email}
                        </div>
                        {employee.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4" />
                            {employee.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                          employee.role
                        )}`}
                      >
                        {getRoleName(employee.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {employee.isBanned || employee.is_banned ? (
                        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                          Đã khóa
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          Hoạt động
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(employee)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(employee.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    Không tìm thấy nhân viên nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-gray-500 bg-opacity-75"
                onClick={handleCloseModal}
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative inline-block w-full max-w-2xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl z-50"
              >
                <form onSubmit={handleSubmit}>
                  <div className="flex items-center justify-between p-6 border-b">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {editingEmployee ? "Sửa Nhân Viên" : "Thêm Nhân Viên Mới"}
                    </h3>
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Tên đăng nhập *"
                        name="username"
                        value={formData.username}
                        onChange={(e) =>
                          setFormData({ ...formData, username: e.target.value })
                        }
                        required
                        disabled={!!editingEmployee}
                        icon={<Users className="w-5 h-5" />}
                      />

                      <Input
                        label="Email *"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        required
                        icon={<Mail className="w-5 h-5" />}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label={
                          editingEmployee
                            ? "Mật khẩu (để trống nếu không đổi)"
                            : "Mật khẩu *"
                        }
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        required={!editingEmployee}
                      />

                      <Input
                        label="Số điện thoại"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        icon={<Phone className="w-5 h-5" />}
                      />
                    </div>

                    <Input
                      label="Họ và tên"
                      name="fullName"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vai trò *
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            role: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
                        required
                      >
                        <option value={1}>Admin</option>
                        <option value={2}>Nhân Viên Kho</option>
                        <option value={3}>Nhân Viên Bán Hàng</option>
                        <option value={4}>Quản Lý</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Địa chỉ
                      </label>
                      <textarea
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                        rows={2}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
                        placeholder="Địa chỉ nhân viên..."
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
                    <Button
                      type="button"
                      onClick={handleCloseModal}
                      variant="outline"
                    >
                      Hủy
                    </Button>
                    <Button type="submit" variant="primary">
                      {editingEmployee ? "Cập Nhật" : "Thêm Mới"}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminHRMPage;
