import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  UserCheck,
  UserX,
  Shield,
  ArrowRight,
  Clock,
  Ban,
  CheckCircle,
  CloudSnow,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { userAPI } from "../../services";
import useToastStore from "../../stores/useToastStore";
import RoleBadge from "../../components/ui/RoleBadge";
import { formatDate } from "../../utils/formatDate";

const HRMDashboardPage = () => {
  const toast = useToastStore();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    inactiveEmployees: 0,
    totalRoles: 0,
  });
  const [recentEmployees, setRecentEmployees] = useState([]);
  const [roleDistribution, setRoleDistribution] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const usersRes = await userAPI
        .getAllUsers(1, 100)
        .catch(() => ({ data: [] }));

      // Normalize data
      const usersData = Array.isArray(usersRes.data)
        ? usersRes.data
        : usersRes.data?.users || [];

      const employees = usersData.filter(
        (u) => (u.roleName) !== "user"
      );
      

      const activeEmployees = employees.filter(
        (e) => e.isActive  !== false
      );
      const inactiveEmployees = employees.filter(
        (e) => e.isActive === false
      );

      setStats({
        totalEmployees: employees.length,
        activeEmployees: activeEmployees.length,
        inactiveEmployees: inactiveEmployees.length,
        totalRoles: 5, // 0,1,3,4,5 (excluding customer role 2)
      });

      setRecentEmployees(employees.slice(0, 5));

      // Calculate role distribution
      const roleMap = {
        "user": { name: "Guest", color: "#9ca3af" },
        "admin": { name: "Admin", color: "#ef4444" },
        "warehouse": { name: "Warehouse", color: "#8b5cf6" },
        "sale": { name: "Sales", color: "#3b82f6" },
        "hrm": { name: "HRM", color: "#10b981" },
      };

      const roleCounts = employees.reduce((acc, emp) => {
        const roleId = emp.roleName;
        if (roleMap[roleId]) {
          acc[roleId] = (acc[roleId] || 0) + 1;
        }
        return acc;
      }, {});

      const distribution = Object.entries(roleCounts).map(
        ([roleId, count]) => ({
          name: roleMap[roleId].name,
          value: count,
          color: roleMap[roleId].color,
        })
      );

      setRoleDistribution(distribution);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Không thể tải dữ liệu dashboard");
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const statCards = [
    {
      title: "Tổng Nhân Viên",
      value: stats.totalEmployees,
      icon: Users,
      color: "bg-blue-500",
      link: "/admin/hrm",
    },
    {
      title: "Đang Hoạt Động",
      value: stats.activeEmployees,
      icon: UserCheck,
      color: "bg-green-500",
      link: "/admin/hrm",
    },
    {
      title: "Không Hoạt Động",
      value: stats.inactiveEmployees,
      icon: UserX,
      color: "bg-red-500",
      link: "/admin/hrm",
    },
    {
      title: "Phân Quyền",
      value: stats.totalRoles,
      icon: Shield,
      color: "bg-purple-500",
      link: "/admin/users",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard Quản Lý Nhân Sự
        </h1>
        <p className="text-gray-600 mt-1">Tổng quan nhân viên và phân quyền</p>
      </div>

      {/* Stats Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-6 shadow-sm animate-pulse"
            >
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, index) => (
            <Link key={index} to={card.link}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${card.color} bg-opacity-10`}>
                    <card.icon
                      className={`w-6 h-6 ${card.color.replace(
                        "bg-",
                        "text-"
                      )}`}
                    />
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
                <h3 className="text-gray-600 text-sm font-medium">
                  {card.title}
                </h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {card.value}
                </p>
              </motion.div>
            </Link>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Role Distribution Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Phân Bổ Vai Trò
          </h2>
          {roleDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={roleDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {roleDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 py-8">Chưa có dữ liệu</p>
          )}
        </div>

        {/* Recent Employees */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Nhân Viên Mới Nhất
              </h2>
              <Link
                to="/admin/hrm"
                className="text-sm text-coffee-600 hover:text-coffee-700 font-medium"
              >
                Xem tất cả →
              </Link>
            </div>
          </div>
          <div className="p-6">
            {console.log(recentEmployees)}
            {recentEmployees.length > 0 ? (
              <div className="space-y-3">
                {recentEmployees.map((employee, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {employee.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <RoleBadge roleId={employee.roleId} size="sm" />
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      {employee.isActive===1 ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Ban className="w-4 h-4 text-red-400" />
                      )}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                Chưa có nhân viên nào
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-coffee-600 to-coffee-800 rounded-xl p-8 text-white">
        <h2 className="text-2xl font-bold mb-4">Thao Tác Nhanh</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/admin/hrm"
            className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 transition-all"
          >
            <Users className="w-8 h-8 mb-2" />
            <h3 className="font-semibold">Quản Lý Nhân Viên</h3>
            <p className="text-sm text-white text-opacity-80">
              Xem và cập nhật nhân viên
            </p>
          </Link>
          <Link
            to="/admin/users"
            className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 transition-all"
          >
            <Shield className="w-8 h-8 mb-2" />
            <h3 className="font-semibold">Phân Quyền</h3>
            <p className="text-sm text-white text-opacity-80">
              Quản lý vai trò và quyền
            </p>
          </Link>
          <Link
            to="/admin/hrm"
            className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 transition-all"
          >
            <UserCheck className="w-8 h-8 mb-2" />
            <h3 className="font-semibold">Thêm Nhân Viên</h3>
            <p className="text-sm text-white text-opacity-80">
              Tạo tài khoản mới
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HRMDashboardPage;
