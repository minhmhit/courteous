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
import { departmentAPI, employeeAPI, positionAPI } from "../../services";
import useToastStore from "../../stores/useToastStore";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Pagination from "../../components/ui/Pagination";
import { formatCurrency } from "../../utils/formatDate";

const AdminHRMPage = () => {
  const toast = useToastStore();
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  
  // Pagination details
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    fullName: "",
    phoneNumber: "",
    employeeCode: "",
    hireDate: new Date().toISOString().split("T")[0],
    roleId: "",
    address: "",
    departmentId: "",
    positionId: "",
    baseSalary: "",
    roleEffectiveDate: new Date().toISOString().split("T")[0],
  });
  const isEditing = Boolean(editingEmployee);

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
    fetchPositions();
  }, []);

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const response = await employeeAPI.getAllEmployees({
        page: 1,
        limit: 200,
      });
      const list = response?.data || response?.employees || response?.items || [];
      setEmployees(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error("Không thể tải danh sách nhân viên");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await departmentAPI.getAllDepartments();
      const list = response?.data || response?.departments || response || [];
      setDepartments(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const fetchPositions = async () => {
    try {
      const response = await positionAPI.getAllPositions();
      const list = response?.data || response?.positions || response || [];
      setPositions(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("Error fetching positions:", error);
    }
  };

  const handleOpenModal = async (employee = null) => {
    if (employee) {
      setEditingEmployee(employee);
      setFormData({
        email: employee.userEmail || "",
        password: "",
        username: employee.username || "",
        fullName: employee.userName || "",
        phoneNumber: employee.phoneNumber || "",
        employeeCode: employee.employeeCode || "",
        hireDate: employee.hireDate ? employee.hireDate.split("T")[0] : "",
        roleId:
          employee.roleId ||
          employee.role_id ||
          employee.user?.roleId ||
          employee.user?.role_id ||
          "",
        address: employee.address || "",
        departmentId: employee.departmentId || "",
        positionId: employee.currentPosition?.id || "",
        baseSalary: employee.baseSalary || "",
        roleEffectiveDate: "",
      });

      try {
        const historyRes = await employeeAPI.getPositionHistory(employee.id);
        const historyList =
          historyRes?.data || historyRes?.items || historyRes?.history || [];
        if (Array.isArray(historyList) && historyList.length > 0) {
          const latest = [...historyList].sort((a, b) => {
            const da = new Date(a.effectiveDate || a.effective_date || a.startDate || 0).getTime();
            const db = new Date(b.effectiveDate || b.effective_date || b.startDate || 0).getTime();
            return db - da;
          })[0];
          setFormData((prev) => ({
            ...prev,
            positionId:
              latest.positionId || latest.position_id || latest.position?.id || prev.positionId,
            baseSalary:
              latest.baseSalary || latest.base_salary || latest.salary || prev.baseSalary,
            roleEffectiveDate:
              latest.effectiveFrom || latest.effective_from || latest.effectiveDate || prev.roleEffectiveDate,
          }));
        }
      } catch (error) {
        console.error("Error fetching position history:", error);
      }
    } else {
      setEditingEmployee(null);
      setFormData({
        email: "",
        password: "",
        username: "",
        fullName: "",
        phoneNumber: "",
        employeeCode: "",
        hireDate: new Date().toISOString().split("T")[0],
        roleId: "",
        address: "",
        departmentId: "",
        positionId: "",
        baseSalary: "",
        roleEffectiveDate: new Date().toISOString().split("T")[0],
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEmployee(null);
    setFormData({
      email: "",
      password: "",
      username: "",
      fullName: "",
      phoneNumber: "",
      employeeCode: "",
      hireDate: new Date().toISOString().split("T")[0],
      roleId: "",
      address: "",
      departmentId: "",
      positionId: "",
      baseSalary: "",
      roleEffectiveDate: new Date().toISOString().split("T")[0],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editingEmployee && !formData.password) {
      toast.error("Vui lòng nhập mật khẩu cho nhân viên mới");
      return;
    }

    try {
      const payload = editingEmployee
        ? {
            hireDate: formData.hireDate,
            address: formData.address,
            departmentId: formData.departmentId
              ? Number(formData.departmentId)
              : undefined,
          }
        : {
            email: formData.email,
            password: formData.password,
            username: formData.username,
            name: formData.fullName,
            phoneNumber: formData.phoneNumber,
            employeeCode: formData.employeeCode,
            hireDate: formData.hireDate,
            roleId: formData.roleId ? Number(formData.roleId) : undefined,
            address: formData.address,
            departmentId: formData.departmentId
              ? Number(formData.departmentId)
              : undefined,
            positionId: formData.positionId ? Number(formData.positionId) : undefined,
            baseSalary: formData.baseSalary ? Number(formData.baseSalary) : undefined,
          };

      const submitData = Object.fromEntries(
        Object.entries(payload).filter(
          ([, value]) => value !== "" && value !== undefined && value !== null
        )
      );

      if (editingEmployee) {
        await employeeAPI.updateEmployee(editingEmployee.id, submitData);

        if (formData.roleEffectiveDate && formData.positionId && formData.baseSalary) {
          await employeeAPI.addPositionHistory(editingEmployee.id, {
            positionId: Number(formData.positionId),
            baseSalary: Number(formData.baseSalary || 0),
            effectiveFrom: formData.roleEffectiveDate,
          });
        }

        toast.success("Cập nhật nhân viên thành công");
      } else {
        const res = await employeeAPI.createEmployee(submitData);
        const payloadRes = res?.data || res;
        const newEmployeeId =
          payloadRes?.id ||
          payloadRes?.employeeId ||
          payloadRes?.employee?.id ||
          payloadRes?.userId ||
          null;

        if (newEmployeeId && formData.roleEffectiveDate && formData.positionId && formData.baseSalary) {
          await employeeAPI.addPositionHistory(newEmployeeId, {
            positionId: Number(formData.positionId),
            baseSalary: Number(formData.baseSalary || 0),
            effectiveFrom: formData.roleEffectiveDate,
          });
        }

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
      await employeeAPI.updateEmployeeStatus(employeeId, {
        status: "TERMINATED",
      });
      toast.success("Đã cập nhật trạng thái nhân viên");
      fetchEmployees();
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast.error("Không thể cập nhật nhân viên");
    }
  };

  const getRoleKey = (employee) => {
    const dept = (employee.departmentCode || employee.departmentName || "").toUpperCase();
    if (dept.includes("BOD") || dept.includes("ADMIN") || dept.includes("GIÁM ĐỐC")) return 1;
    if (dept.includes("WAREHOUSE") || dept.includes("KHO") || dept.includes("WH")) return 3;
    if (dept.includes("SALE") || dept.includes("BÁN HÀNG")) return 4;
    if (dept.includes("HR") || dept.includes("NHÂN SỰ")) return 5;
    return 0; // Default: Nhân viên thường
  };

  const getRoleName = (employee) => {
    const roleIdNum = Number(getRoleKey(employee));
    if (roleIdNum === 1) return "Admin";
    if (roleIdNum === 3) return "Nhân Viên Kho";
    if (roleIdNum === 4) return "Nhân Viên Bán Hàng";
    if (roleIdNum === 5) return "Quản Lý (HR)";
    return "Nhân Viên";
  };

  const getRoleBadgeColor = (employee) => {
    const roleIdNum = Number(getRoleKey(employee));
    if (roleIdNum === 1) return "bg-purple-100 text-purple-800";
    if (roleIdNum === 3) return "bg-blue-100 text-blue-800";
    if (roleIdNum === 4) return "bg-green-100 text-green-800";
    if (roleIdNum === 5) return "bg-orange-100 text-orange-800";
    return "bg-gray-100 text-gray-800";
  };

  const getBaseSalary = (employee) => {
    const value =employee?.currentPosition?.baseSalary || 0;
    return Number(value || 0);
  };

  const getStatusLabel = (employee) => {
    const status =
      employee.status||
      (employee.isActive === 0 ? "INACTIVE" : "ACTIVE");
    const normalized = String(status).toUpperCase();
    if (["INACTIVE", "TERMINATED", "RESIGNED"].includes(normalized)) {
      return { label: "Đã khóa", className: "bg-red-100 text-red-800" };
    }
    if (["ON_LEAVE"].includes(normalized)) {
      return { label: "Đang nghỉ", className: "bg-yellow-100 text-yellow-800" };
    }
    return { label: "Hoạt động", className: "bg-green-100 text-green-800" };
  };

  const filteredEmployees = employees.filter((employee) => {
    const searchMatch =
      employee.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.user_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const roleKey = getRoleKey(employee);
    const roleMatch =
      roleFilter === "all" || Number(roleKey) === Number(roleFilter);

    return searchMatch && roleMatch;
  });

  const roleOptions = [
    { value: "all", label: "Tất cả", count: employees.length },
    {
      value: 1,
      label: "Admin",
      count: employees.filter((e) => Number(getRoleKey(e)) === 1).length,
    },
    {
      value: 3,
      label: "Kho",
      count: employees.filter((e) => Number(getRoleKey(e)) === 3).length,
    },
    {
      value: 4,
      label: "Bán Hàng",
      count: employees.filter((e) => Number(getRoleKey(e)) === 4).length,
    },
    {
      value: 5,
      label: "Quản Lý",
      count: employees.filter((e) => Number(getRoleKey(e)) === 5).length,
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
                {
                  employees.filter(
                    (e) => Number(getRoleKey(e)) === 1
                  ).length
                }
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Award className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Nhân Viên Hoạt Động</p>
              <p className="text-2xl font-bold text-gray-900">
                {
                  employees.filter((e) => {
                    const status =
                      e.status ||
                      e.employee_status ||
                      e.user_status ||
                      (e.isActive === 0 ? "INACTIVE" : "ACTIVE");
                    return String(status).toUpperCase() !== "INACTIVE";
                  }).length
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tháng Này</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Date().toLocaleDateString("vi-VN", { month: "long" })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="w-5 h-5 text-gray-500" />
          {roleOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                setRoleFilter(option.value);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${roleFilter === option.value
                  ? "bg-coffee-600 text-white shadow-[0_12px_30px_rgba(85,50,27,0.25)]"
                  : "bg-white/55 text-gray-700 hover:bg-white/70 border border-white/40"
                }`}
            >
              {option.label} ({option.count})
            </button>
          ))}
        </div>

        <Input
          placeholder="Tìm kiếm nhân viên..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          icon={<Search className="w-5 h-5" />}
        />
      </div>

      {/* Employees Table */}
      <div className="admin-table-shell">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-600"></div>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-white/60">
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
                  Lương Cơ Bản
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Trạng Thái
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Thao Tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/60">
              {filteredEmployees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).length > 0 ? (
                filteredEmployees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((employee) => {
                  // console.log(employee);
                  const displayName =
                    employee.userName
                  const displayEmail =
                    employee.userEmail
                  const displayPhone =
                    employee.phoneNumber
                  const displayname =
                    employee.username
                  const roleKey = getRoleKey(employee);
                  const statusInfo = getStatusLabel(employee);
                  return (
                    <tr key={employee.id} className="hover:bg-white/40">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-gray-900">
                            {displayName}
                          </p>
                          <p className="text-sm text-gray-600">
                            @{displayname}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-4 h-4" />
                            {displayEmail}
                          </div>
                          {displayPhone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="w-4 h-4" />
                              {displayPhone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block text-center px-3 py-1.5 rounded-lg text-xs font-medium leading-tight ${getRoleBadgeColor(
                            employee
                          )}`}
                          style={{ minWidth: "100px", maxWidth: "120px" }}
                        >
                          {getRoleName(employee)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-gray-900">
                          {getBaseSalary(employee) > 0
                            ? formatCurrency(getBaseSalary(employee))
                            : "--"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusInfo.className}`}
                        >
                          {statusInfo.label}
                        </span>
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
                  )
                })
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    Không tìm thấy nhân viên nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
        
        {!isLoading && Math.ceil(filteredEmployees.length / itemsPerPage) > 1 && (
          <Pagination
            currentPage={Math.min(currentPage, Math.ceil(filteredEmployees.length / itemsPerPage))}
            totalPages={Math.ceil(filteredEmployees.length / itemsPerPage)}
            onPageChange={setCurrentPage}
          />
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
                        label="Email *"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        required
                        disabled={isEditing}
                        icon={<Mail className="w-5 h-5" />}
                      />
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
                        disabled={isEditing}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Username"
                        name="username"
                        value={formData.username}
                        onChange={(e) =>
                          setFormData({ ...formData, username: e.target.value })
                        }
                        disabled={isEditing}
                      />
                      <Input
                        label="Mã Nhân Viên *"
                        name="employeeCode"
                        value={formData.employeeCode}
                        onChange={(e) =>
                          setFormData({ ...formData, employeeCode: e.target.value })
                        }
                        required
                        disabled={isEditing}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Ngày vào làm *"
                        name="hireDate"
                        type="date"
                        value={formData.hireDate}
                        onChange={(e) =>
                          setFormData({ ...formData, hireDate: e.target.value })
                        }
                        required
                      />
                      <Input
                        label="Số điện thoại"
                        name="phone"
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) =>
                          setFormData({ ...formData, phoneNumber: e.target.value })
                        }
                        disabled={isEditing}
                        icon={<Phone className="w-5 h-5" />}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Họ và tên *"
                        name="fullName"
                        value={formData.fullName}
                        onChange={(e) =>
                          setFormData({ ...formData, fullName: e.target.value })
                        }
                        required
                        disabled={isEditing}
                      />
                      <Input
                        label="Địa chỉ"
                        name="address"
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vai trò *
                      </label>
                      <select
                        value={formData.roleId}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            roleId: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
                        required
                        disabled={isEditing}
                      >
                        <option value={1}>Admin</option>
                        <option value={3}>Nhân Viên Kho</option>
                        <option value={4}>Nhân Viên Bán Hàng</option>
                        <option value={5}>Quản Lý</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phòng ban
                        </label>
                        <select
                          value={formData.departmentId}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              departmentId: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
                        >
                          <option value="">-- Chọn phòng ban --</option>
                          {departments.map((dept) => (
                            <option key={dept.id} value={dept.id}>
                              {dept.name || dept.department_name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Chức vụ
                        </label>
                        <select
                          value={formData.positionId}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              positionId: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
                        >
                          <option value="">-- Chọn chức vụ --</option>
                          {positions.map((pos) => (
                            <option key={pos.id} value={pos.id}>
                              {pos.name || pos.position_name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <Input
                        label="Lương cơ bản (VNĐ)"
                        name="baseSalary"
                        type="number"
                        value={formData.baseSalary}
                        onChange={(e) =>
                          setFormData({ ...formData, baseSalary: e.target.value })
                        }
                        min="0"
                        step="1000"
                        icon={<Award className="w-5 h-5" />}
                      />
                      <Input
                        label="Hiệu lực chức vụ"
                        type="date"
                        value={formData.roleEffectiveDate}
                        onChange={(e) =>
                          setFormData({ ...formData, roleEffectiveDate: e.target.value })
                        }
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
