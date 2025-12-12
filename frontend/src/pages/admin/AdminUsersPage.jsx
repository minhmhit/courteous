import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  UserCheck,
  UserX,
  Shield,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";
import { userAPI } from "../../services";
import useToastStore from "../../stores/useToastStore";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { formatDate } from "../../utils/formatDate";

const AdminUsersPage = () => {
  const toast = useToastStore();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await userAPI.getAllUsers();
      setUsers(response.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Không thể tải danh sách người dùng");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 1 || currentStatus === true ? 0 : 1;
    const action = newStatus === 1 ? "kích hoạt" : "vô hiệu hóa";

    if (!confirm(`Bạn có chắc muốn ${action} người dùng này?`)) return;

    try {
      await userAPI.updateUserStatus(userId, newStatus);
      toast.success(`Đã ${action} người dùng thành công`);
      fetchUsers();
    } catch (error) {
      console.error("Error updating user status:", error);
      toast.error("Không thể cập nhật trạng thái người dùng");
    }
  };

  const getRoleName = (roleId) => {
    const roleMap = {
      "admin": "Admin",
      "user": "Khách hàng",
      "sale": "Nhân viên sale",
      "hrm": "Nhân viên nhân sự",
      "warehouse": "Nhân viên kho",
    };
    return roleMap[roleId] || "Không xác định";
  };

  const getRoleColor = (roleId) => {
    const colorMap = {
      "admin": "bg-red-100 text-red-800",
      "user": "bg-blue-100 text-blue-800",
      "sale": "bg-green-100 text-green-800",
      "hrm": "bg-purple-100 text-purple-800",
      "warehouse": "bg-purple-100 text-purple-800",
    };
    return colorMap[roleId] || "bg-gray-100 text-gray-800";
  };

  const filteredUsers = users.filter((user) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.phone?.includes(searchTerm)
    );
  });

  const stats = {
    total: users.length,
    active: users.filter((u) => u.isActive === 1 ).length,
    inactive: users.filter((u) => u.isActive === 0 ).length,
    admins: users.filter((u) => u.roleName === "admin" ).length,
    users: users.filter((u) => u.roleName === "user" ).length,
    staff: users.filter((u) => u.roleName !== "user" && u.roleName !== "admin" ).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Quản Lý Người Dùng</h1>
        <p className="text-gray-600 mt-1">
          Quản lý tài khoản và phân quyền người dùng
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-600">
              Tổng Khách Hàng
            </h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.users}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-600">
              Tổng Nhân viên
            </h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.staff}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-600">Quản Trị Viên</h3>
          </div>
          <p className="text-3xl font-bold text-purple-600">{stats.admins}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserCheck className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-600">
              Đang Hoạt Động
            </h3>
          </div>
          <p className="text-3xl font-bold text-green-600">{stats.active}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <UserX className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-600">Bị Khóa</h3>
          </div>
          <p className="text-3xl font-bold text-red-600">{stats.inactive}</p>
        </motion.div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <Input
          placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<Search className="w-5 h-5" />}
        />
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Người Dùng
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Liên Hệ
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vai Trò
                  </th>
                  {/* <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày Tạo
                  </th> */}
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng Thái
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao Tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => {
                    const isActive =
                      user.isActive === 1 || user.is_active === 1;
                    // console.log(user);
                    const roleId = user.roleName;

                    return (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-mono text-sm text-gray-600">
                            #{user.id}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-coffee-400 to-coffee-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                {user.name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {user.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail className="w-4 h-4" />
                              <span>{user.email || "N/A"}</span>
                            </div>
                            {user.phoneNumber && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Phone className="w-4 h-4" />
                                <span>{user.phoneNumber}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(
                              roleId
                            )}`}
                          >
                            {getRoleName(roleId)}
                          </span>
                        </td>
                        {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {formatDate(user.createdAt || user.created_at)}
                          </div>
                        </td> */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {isActive ? "Hoạt động" : "Bị khóa"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          {roleId !== "admin" && ( // Don't allow banning admin
                            <button
                              onClick={() =>
                                handleToggleUserStatus(
                                  user.id,
                                  user.isActive || user.is_active
                                )
                              }
                              className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                isActive
                                  ? "text-red-600 hover:text-red-800 hover:bg-red-50"
                                  : "text-green-600 hover:text-green-800 hover:bg-green-50"
                              }`}
                            >
                              {isActive ? (
                                <>
                                  <UserX className="w-4 h-4 mr-1" />
                                  Khóa
                                </>
                              ) : (
                                <>
                                  <UserCheck className="w-4 h-4 mr-1" />
                                  Mở khóa
                                </>
                              )}
                            </button>
                          )}
                          {roleId === 1 && (
                            <span className="text-sm text-gray-400 italic">
                              Admin
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      {searchTerm
                        ? "Không tìm thấy người dùng nào"
                        : "Chưa có người dùng nào"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsersPage;
