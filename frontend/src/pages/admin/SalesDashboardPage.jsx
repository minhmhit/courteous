import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Star,
  ArrowRight,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { orderAPI, productAPI } from "../../services";
import useToastStore from "../../stores/useToastStore";
import { formatDate, formatCurrency } from "../../utils/formatDate";

const SalesDashboardPage = () => {
  const toast = useToastStore();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [ordersRes, productsRes] = await Promise.all([
        orderAPI.getAllOrders(1, 100).catch(() => ({ data: [] })),
        productAPI.getAllProducts().catch(() => ({ data: [] })),
      ]);

      // Normalize data
      const ordersData = Array.isArray(ordersRes.data)
        ? ordersRes.data
        : ordersRes.data?.orders || [];

      const productsData = Array.isArray(productsRes.data)
        ? productsRes.data
        : productsRes.data?.products || [];

      // Calculate stats
      // console.log("Orders Data:", ordersData); // Debug log
      const totalRevenue = ordersData
        .filter(
          (o) => o.status === "COMPLETED" || o.payment_status === "COMPLETED"
        )
        .reduce(
          (sum, order) => sum + Number(order.total || order.totalAmount || 0),
          0
        );

      const completedOrders = ordersData.filter(
        (o) => o.status === "COMPLETED" || o.orderStatus === "COMPLETED"
      ).length;

      const pendingOrders = ordersData.filter(
        (o) =>
          o.status === "PENDING" ||
          o.orderStatus === "PENDING" ||
          o.status === "PROCESSING" ||
          o.orderStatus === "PROCESSING"
      ).length;

      setStats({
        totalRevenue,
        totalOrders: ordersData.length,
        completedOrders,
        pendingOrders,
      });

      setRecentOrders(ordersData.slice(0, 5));

      // Calculate sales data for last 7 days
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = formatDate(date, "yyyy-MM-dd");

        const dayRevenue = ordersData
          .filter((order) => {
            const orderDate = formatDate(
              new Date(order.orderDate),
              "yyyy-MM-dd"
            );
            return (
              orderDate === dateStr &&
              (order.status === "COMPLETED" ||
                order.payment_status === "COMPLETED")
            );
          })
          .reduce(
            (sum, order) => sum + Number(order.total || order.totalAmount || 0),
            0
          );

        last7Days.push({
          date: formatDate(date, "dd/MM"),
          revenue: dayRevenue,
        });
      }
      setSalesData(last7Days);

      // Top products (mock data - replace with real API)
      setTopProducts(productsData.slice(0, 5));
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

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { icon: Clock, color: "text-yellow-600", bg: "bg-yellow-100" },
      PROCESSING: { icon: Clock, color: "text-blue-600", bg: "bg-blue-100" },
      DELIVERED: {
        icon: CheckCircle,
        color: "text-green-600",
        bg: "bg-green-100",
      },
      CANCELLED: { icon: XCircle, color: "text-red-600", bg: "bg-red-100" },
    };
    const config = statusMap[status] || statusMap.PENDING;
    const Icon = config.icon;
    return <Icon className={`w-5 h-5 ${config.color}`} />;
  };

  const statCards = [
    {
      title: "Tổng Doanh Thu",
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: "bg-green-500",
      link: "/admin/orders",
    },
    {
      title: "Tổng Đơn Hàng",
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: "bg-blue-500",
      link: "/admin/orders",
    },
    {
      title: "Đơn Hoàn Thành",
      value: stats.completedOrders,
      icon: CheckCircle,
      color: "bg-purple-500",
      link: "/admin/orders",
    },
    {
      title: "Đơn Chờ Xử Lý",
      value: stats.pendingOrders,
      icon: Clock,
      color: "bg-yellow-500",
      link: "/admin/orders",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Bán Hàng</h1>
        <p className="text-gray-600 mt-1">Tổng quan doanh thu và đơn hàng</p>
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
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {card.value}
                </p>
              </motion.div>
            </Link>
          ))}
        </div>
      )}

      {/* Sales Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Doanh Thu 7 Ngày Qua
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={salesData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              formatter={(value) => formatCurrency(value)}
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#colorRevenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Đơn Hàng Gần Đây
              </h2>
              <Link
                to="/admin/orders"
                className="text-sm text-coffee-600 hover:text-coffee-700 font-medium"
              >
                Xem tất cả →
              </Link>
            </div>
          </div>
          <div className="p-6">
            {recentOrders.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.map((order, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusBadge(order.status || order.orderStatus)}
                      <div>
                        <p className="font-medium text-gray-900">
                          Đơn #{order.id}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatDate(order.orderDate)}
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(order.total || order.totalAmount || 0)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                Chưa có đơn hàng nào
              </p>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Sản Phẩm Bán Chạy
              </h2>
              <Link
                to="/admin/products"
                className="text-sm text-coffee-600 hover:text-coffee-700 font-medium"
              >
                Xem tất cả →
              </Link>
            </div>
          </div>
          <div className="p-6">
            {topProducts.length > 0 ? (
              <div className="space-y-3">
                {topProducts.map((product, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {product.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatCurrency(product.price)}
                        </p>
                      </div>
                    </div>
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">Chưa có dữ liệu</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions
      <div className="bg-gradient-to-r from-coffee-600 to-coffee-800 rounded-xl p-8 text-white">
        <h2 className="text-2xl font-bold mb-4">Thao Tác Nhanh</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/admin/orders"
            className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 transition-all"
          >
            <ShoppingCart className="w-8 h-8 mb-2" />
            <h3 className="font-semibold">Quản Lý Đơn Hàng</h3>
            <p className="text-sm text-white text-opacity-80">
              Xem và xử lý đơn hàng
            </p>
          </Link>
          <Link
            to="/admin/analytics"
            className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 transition-all"
          >
            <TrendingUp className="w-8 h-8 mb-2" />
            <h3 className="font-semibold">Báo Cáo Doanh Thu</h3>
            <p className="text-sm text-white text-opacity-80">
              Xem phân tích chi tiết
            </p>
          </Link>
          <Link
            to="/admin/products"
            className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 transition-all"
          >
            <Star className="w-8 h-8 mb-2" />
            <h3 className="font-semibold">Sản Phẩm</h3>
            <p className="text-sm text-white text-opacity-80">
              Quản lý sản phẩm
            </p>
          </Link>
        </div>
      </div> */}
    </div>
  );
};

export default SalesDashboardPage;
