import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, UserCheck, UserX, Shield, Mail, Phone } from "lucide-react";
import { userAPI } from "../../services";
import useToastStore from "../../stores/useToastStore";
import Input from "../../components/ui/Input";
import Pagination from "../../components/ui/Pagination";

const AdminUsersPage = () => {
  const toast = useToastStore();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState({
    role: "all",
    status: "all",
    createdFrom: "",
    createdTo: "",
    sort: "newest",
  });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;


  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await userAPI.getAllUsers({ page: 1, limit: 200 });
      setUsers(response.data || response.users || []);
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
      await userAPI.updateUserStatus(userId, newStatus === 1);
      toast.success(`Đã ${action} người dùng thành công`);
      fetchUsers();
    } catch (error) {
      console.error("Error updating user status:", error);
      toast.error("Không thể cập nhật trạng thái người dùng");
    }
  };

  const getRoleName = (roleId) => {
    const roleMap = {
      admin: "Admin",
      user: "Khách hàng",
      sale: "Nhân viên bán hàng",
      hrm: "Nhân viên nhân sự",
      warehouse: "Nhân viên kho",
    };
    return roleMap[roleId] || "Không xác định";
  };

  const getRoleColor = (roleId) => {
    const colorMap = {
      admin: "bg-red-100 text-red-800",
      user: "bg-blue-100 text-blue-800",
      sale: "bg-green-100 text-green-800",
      hrm: "bg-purple-100 text-purple-800",
      warehouse: "bg-purple-100 text-purple-800",
    };
    return colorMap[roleId] || "bg-gray-100 text-gray-800";
  };

  const filteredUsers = users.filter((user) => {
    const keyword = searchTerm.toLowerCase();
    const createdAt = new Date(user.createdAt);
    const roleKey = (user.roleCode || user.roleName || "").toLowerCase();
    const isActive = user.isActive === 1 || user.isActive === true;
    const searchMatch =
      user.name?.toLowerCase().includes(keyword) ||
      user.email?.toLowerCase().includes(keyword) ||
      user.phoneNumber?.includes(searchTerm);
    const roleMatch = filters.role === "all" || roleKey === filters.role;
    const statusMatch =
      filters.status === "all" ||
      (filters.status === "active" && isActive) ||
      (filters.status === "inactive" && !isActive);
    const createdFromMatch =
      !filters.createdFrom ||
      createdAt >= new Date(`${filters.createdFrom}T00:00:00`);
    const createdToMatch =
      !filters.createdTo ||
      createdAt <= new Date(`${filters.createdTo}T23:59:59`);
    return searchMatch && roleMatch && statusMatch && createdFromMatch && createdToMatch;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (filters.sort === "name-asc") return (a.name || "").localeCompare(b.name || "");
    if (filters.sort === "name-desc") return (b.name || "").localeCompare(a.name || "");
    if (filters.sort === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const stats = {
    active: users.filter((u) => u.isActive === 1 || u.isActive === true).length,
    inactive: users.filter((u) => u.isActive === 0 || u.isActive === false).length,
    admins: users.filter((u) => (u.roleCode || u.roleName || "").toLowerCase() === "admin").length,
    users: users.filter((u) => (u.roleCode || u.roleName || "").toLowerCase() === "user").length,
    staff: users.filter((u) => {
      const roleKey = (u.roleCode || u.roleName || "").toLowerCase();
      return roleKey !== "user" && roleKey !== "admin";
    }).length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Quản Lý Người Dùng</h1>
        <p className="mt-1 text-gray-600">Quản lý tài khoản và phân quyền người dùng</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
        {[
          { label: "Tổng Khách Hàng", value: stats.users, icon: Shield, color: "bg-blue-100 text-blue-600" },
          { label: "Tổng Nhân Viên", value: stats.staff, icon: Shield, color: "bg-blue-100 text-blue-600" },
          { label: "Quản Trị Viên", value: stats.admins, icon: Shield, color: "bg-purple-100 text-purple-600" },
          { label: "Đang Hoạt Động", value: stats.active, icon: UserCheck, color: "bg-green-100 text-green-600" },
          { label: "Bị Khóa", value: stats.inactive, icon: UserX, color: "bg-red-100 text-red-600" },
        ].map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
            >
              <div className="mb-2 flex items-center gap-3">
                <div className={`rounded-lg p-2 ${card.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-medium text-gray-600">{card.label}</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900">{card.value}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="rounded-lg bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-[260px] flex-1">
            <Input
              placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              icon={<Search className="h-5 w-5" />}
            />
          </div>
          <button onClick={() => setShowAdvanced((prev) => !prev)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700">
            {showAdvanced ? "Ẩn lọc nâng cao" : "Lọc nâng cao"}
          </button>
        </div>
        {showAdvanced && (
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
            <select value={filters.role} onChange={(e) => { setFilters((prev) => ({ ...prev, role: e.target.value })); setCurrentPage(1); }} className="rounded-lg border border-gray-300 px-3 py-2">
              <option value="all">Tất cả vai trò</option>
              <option value="user">Khách hàng</option>
              <option value="admin">Admin</option>
              <option value="sale">Sale</option>
              <option value="hrm">HRM</option>
              <option value="warehouse">Kho</option>
            </select>
            <select value={filters.status} onChange={(e) => { setFilters((prev) => ({ ...prev, status: e.target.value })); setCurrentPage(1); }} className="rounded-lg border border-gray-300 px-3 py-2">
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Bị khóa</option>
            </select>
            <input type="date" value={filters.createdFrom} onChange={(e) => { setFilters((prev) => ({ ...prev, createdFrom: e.target.value })); setCurrentPage(1); }} className="rounded-lg border border-gray-300 px-3 py-2" />
            <input type="date" value={filters.createdTo} onChange={(e) => { setFilters((prev) => ({ ...prev, createdTo: e.target.value })); setCurrentPage(1); }} className="rounded-lg border border-gray-300 px-3 py-2" />
            <select value={filters.sort} onChange={(e) => { setFilters((prev) => ({ ...prev, sort: e.target.value })); setCurrentPage(1); }} className="rounded-lg border border-gray-300 px-3 py-2">
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="name-asc">Tên A-Z</option>
              <option value="name-desc">Tên Z-A</option>
            </select>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow-sm">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-coffee-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Người Dùng</th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Liên Hệ</th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Vai Trò</th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Trạng Thái</th>
                  <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {sortedUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).length > 0 ? (
                  sortedUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((user) => {
                    const isActive = user.isActive === 1 || user.isActive === true;
                    const roleId = (user.roleCode || user.roleName || "").toLowerCase();
                    return (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap px-6 py-4"><span className="font-mono text-sm text-gray-600">#{user.id}</span></td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-coffee-400 to-coffee-600">
                              <span className="text-sm font-semibold text-white">{user.name?.charAt(0).toUpperCase()}</span>
                            </div>
                            <div><div className="font-medium text-gray-900">{user.name}</div></div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-gray-600"><Mail className="h-4 w-4" /><span>{user.email || "N/A"}</span></div>
                            {user.phoneNumber && <div className="flex items-center gap-2 text-sm text-gray-600"><Phone className="h-4 w-4" /><span>{user.phoneNumber}</span></div>}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4"><span className={`rounded-full px-3 py-1 text-xs font-medium ${getRoleColor(roleId)}`}>{getRoleName(roleId)}</span></td>
                        <td className="whitespace-nowrap px-6 py-4"><span className={`rounded-full px-3 py-1 text-xs font-medium ${isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{isActive ? "Hoạt động" : "Bị khóa"}</span></td>
                        <td className="whitespace-nowrap px-6 py-4 text-right">
                          {roleId !== "admin" ? (
                            <button onClick={() => handleToggleUserStatus(user.id, user.isActive || user.is_active)} className={`inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive ? "text-red-600 hover:bg-red-50 hover:text-red-800" : "text-green-600 hover:bg-green-50 hover:text-green-800"}`}>
                              {isActive ? <><UserX className="mr-1 h-4 w-4" />Khóa</> : <><UserCheck className="mr-1 h-4 w-4" />Mở khóa</>}
                            </button>
                          ) : (
                            <span className="text-sm italic text-gray-400">Admin</span>
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
        
        {/* Pagination Logic at bottom */}
        {!isLoading && Math.ceil(sortedUsers.length / itemsPerPage) > 1 && (
          <Pagination
            currentPage={Math.min(currentPage, Math.ceil(sortedUsers.length / itemsPerPage))}
            totalPages={Math.ceil(sortedUsers.length / itemsPerPage)}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
};

export default AdminUsersPage;
