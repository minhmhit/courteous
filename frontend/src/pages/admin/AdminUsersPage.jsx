import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  UserCheck,
  UserX,
  Shield,
  Mail,
  Phone,
} from "lucide-react";
import { userAPI } from "../../services";
import useToastStore from "../../stores/useToastStore";
import Input from "../../components/ui/Input";

const roleLabels = {
  admin: "Admin",
  user: "Khách hàng",
  sale: "Nhân viên sale",
  hrm: "Nhân sự",
  warehouse: "Nhân viên kho",
};

const roleColors = {
  admin: "bg-red-100 text-red-800",
  user: "bg-blue-100 text-blue-800",
  sale: "bg-green-100 text-green-800",
  hrm: "bg-purple-100 text-purple-800",
  warehouse: "bg-amber-100 text-amber-800",
};

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
      const response = await userAPI.getAllUsers(1, 200);
      setUsers(response.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Không thể tải danh sách người dùng");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    const nextStatus = !Boolean(currentStatus);
    const action = nextStatus ? "kích hoạt" : "vô hiệu hóa";

    if (!window.confirm(`Bạn có chắc muốn ${action} người dùng này?`)) return;

    try {
      await userAPI.updateUserStatus(userId, nextStatus);
      toast.success(`Đã ${action} người dùng thành công`);
      fetchUsers();
    } catch (error) {
      console.error("Error updating user status:", error);
      toast.error("Không thể cập nhật trạng thái người dùng");
    }
  };

  const filteredUsers = users.filter((user) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.phoneNumber?.includes(searchTerm)
    );
  });

  const stats = {
    total: users.length,
    active: users.filter((u) => Boolean(u.isActive)).length,
    inactive: users.filter((u) => !u.isActive).length,
    admins: users.filter((u) => u.roleName === "admin").length,
    customers: users.filter((u) => u.roleName === "user").length,
    staff: users.filter((u) => !["user", "admin"].includes(u.roleName)).length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Quản lý người dùng</h1>
        <p className="text-gray-600 mt-1">
          Quản lý tài khoản và trạng thái hoạt động
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {[
          { label: "Khách hàng", value: stats.customers, color: "bg-blue-100 text-blue-600" },
          { label: "Nhân viên", value: stats.staff, color: "bg-amber-100 text-amber-600" },
          { label: "Quản trị viên", value: stats.admins, color: "bg-purple-100 text-purple-600" },
          { label: "Đang hoạt động", value: stats.active, color: "bg-green-100 text-green-600" },
          { label: "Bị khóa", value: stats.inactive, color: "bg-red-100 text-red-600" },
        ].map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg ${item.color}`}>
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-medium text-gray-600">{item.label}</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{item.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <Input
          placeholder="Tìm theo tên, email hoặc số điện thoại..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<Search className="w-5 h-5" />}
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-600" />
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
                    Người dùng
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Liên hệ
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vai trò
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => {
                    const isActive = Boolean(user.isActive);
                    const roleName = user.roleName || "user";

                    return (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-mono text-sm text-gray-600">#{user.id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-coffee-400 to-coffee-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                {user.name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">
                                @{user.username || user.email?.split("@")[0] || "user"}
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
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              roleColors[roleName] || "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {roleLabels[roleName] || "Không xác định"}
                          </span>
                        </td>
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
                          {roleName !== "admin" ? (
                            <button
                              onClick={() => handleToggleUserStatus(user.id, user.isActive)}
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
                          ) : (
                            <span className="text-sm text-gray-400 italic">Admin</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      {searchTerm ? "Không tìm thấy người dùng nào" : "Chưa có người dùng nào"}
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
