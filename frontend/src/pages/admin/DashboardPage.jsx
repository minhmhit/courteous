import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  DollarSign,
  Package,
  Users,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Clock,
} from "lucide-react";
import { orderAPI, productAPI, userAPI } from "../../services";
import SalesChart from "../../components/admin/SalesChart";
import {
  formatDate,
  formatDateISO,
  formatCurrency,
} from "../../utils/formatDate";

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalUsers: 0,
    pendingOrders: 0,
    completedOrders: 0,
    revenueGrowth: 0,
    ordersGrowth: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch all data in parallel
      const [ordersRes, productsRes, usersRes] = await Promise.all([
        orderAPI.getAllOrders(1, 100).catch(() => ({ data: [] })),
        productAPI.getAllProducts().catch(() => ({ data: [] })),
        userAPI.getAllUsers().catch(() => ({ data: [] })),
      ]);

      const orders = ordersRes.data || [];
      const products = productsRes.data || [];
      const users = usersRes.data || [];

      // Calculate stats
      const totalRevenue = orders.reduce(
        (sum, order) => sum + Number(order.totalAmount || 0),
        0
      );
      const pendingOrders = orders.filter(
        (o) => o.status === "PENDING" || o.status === "pending"
      ).length;
      const completedOrders = orders.filter(
        (o) => o.status === "COMPLETED" || o.status === "completed"
      ).length;

      // Mock growth percentages (in real app, compare with previous period)
      const revenueGrowth = 12.5;
      const ordersGrowth = 8.3;

      setStats({
        totalOrders: orders.length,
        totalRevenue,
        totalProducts: products.length,
        totalUsers: users.length,
        pendingOrders,
        completedOrders,
        revenueGrowth,
        ordersGrowth,
      });

      // Get 5 most recent orders
      setRecentOrders(orders.slice(0, 5));

      // Generate sales chart data (last 7 days)
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = formatDateISO(date).split("T")[0];

        // Calculate revenue for this day
        const dayRevenue = orders
          .filter((order) => {
            const orderDateStr = formatDateISO(
              order.orderDate
            ).split("T")[0];
            return orderDateStr === dateStr;
          })
          .reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);

        last7Days.push({
          date: date.toLocaleDateString("vi-VN", {
            month: "short",
            day: "numeric",
          }),
          revenue: dayRevenue / 1000, // Convert to thousands
        });
      }
      setSalesData(last7Days);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const statusMap = {
      PENDING: "bg-yellow-100 text-yellow-800",
      CONFIRMED: "bg-blue-100 text-blue-800",
      SHIPPING: "bg-purple-100 text-purple-800",
      COMPLETED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      shipping: "bg-purple-100 text-purple-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return statusMap[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusText = (status) => {
    const statusMap = {
      PENDING: "Chờ xác nhận",
      CONFIRMED: "Đã xác nhận",
      SHIPPING: "Đang giao",
      COMPLETED: "Hoàn thành",
      CANCELLED: "Đã hủy",
      pending: "Chờ xác nhận",
      confirmed: "Đã xác nhận",
      shipping: "Đang giao",
      completed: "Hoàn thành",
      cancelled: "Đã hủy",
    };
    return statusMap[status] || status;
  };

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-sm font-medium ${
              trendValue >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {trendValue >= 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span>{Math.abs(trendValue)}%</span>
          </div>
        )}
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </motion.div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Tổng quan về cửa hàng cà phê của bạn</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Tổng Đơn Hàng"
          value={stats.totalOrders}
          icon={ShoppingBag}
          trend
          trendValue={stats.ordersGrowth}
          color="bg-blue-500"
        />
        <StatCard
          title="Doanh Thu"
          value={formatCurrency(stats.totalRevenue)}
          icon={DollarSign}
          trend
          trendValue={stats.revenueGrowth}
          color="bg-green-500"
        />
        <StatCard
          title="Sản Phẩm"
          value={stats.totalProducts}
          icon={Package}
          color="bg-purple-500"
        />
        <StatCard
          title="Khách Hàng"
          value={stats.totalUsers}
          icon={Users}
          color="bg-orange-500"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Đơn Chờ Xử Lý
            </h3>
          </div>
          <p className="text-4xl font-bold text-yellow-600">
            {stats.pendingOrders}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Cần xác nhận và xử lý ngay
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <ShoppingCart className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Đơn Hoàn Thành
            </h3>
          </div>
          <p className="text-4xl font-bold text-green-600">
            {stats.completedOrders}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Tổng đơn hàng đã hoàn thành
          </p>
        </div>
      </div>

      {/* Sales Chart
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Doanh Thu 7 Ngày Qua
        </h2>
        <SalesChart data={salesData} />
      </div> */}

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Đơn Hàng Gần Đây</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã Đơn
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thời Gian
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tổng Tiền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng Thái
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono font-medium text-gray-900">
                        #{order.id}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(order.orderDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(
                          order.totalAmount || order.total_amount
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusText(order.status)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    Chưa có đơn hàng nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
