import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Star,
  Calendar,
  Download,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { orderAPI, productAPI, userAPI } from "../../services";
import Button from "../../components/ui/Button";
import { exportToCsv } from "../../utils/exportCSV";
import useToastStore from "../../stores/useToastStore";

const AdminAnalyticsPage = () => {
  const toast = useToastStore();
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30); // days
  const [revenueData, setRevenueData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [categoryDistribution, setCategoryDistribution] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    averageOrderValue: 0,
    conversionRate: 0,
    growthRate: 0,
  });

  useEffect(() => {
    fetchAnalyticsData();
    // eslint-disable-next-line
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    try {
      const [ordersRes, productsRes, usersRes] = await Promise.all([
        orderAPI.getAllOrders(1, 500).catch(() => ({ data: [] })),
        productAPI.getAllProducts().catch(() => ({ data: [] })),
        userAPI.getAllUsers().catch(() => ({ data: [] })),
      ]);

      const orders = ordersRes.data || [];
      const products = productsRes.data || [];
      const users = usersRes.data || [];

      // Calculate revenue over time
      const last30Days = [];
      for (let i = timeRange - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];

        const dayRevenue = orders
          .filter((order) => {
            const orderDate = new Date(order.createdAt || order.created_at)
              .toISOString()
              .split("T")[0];
            return (
              orderDate === dateStr &&
              (order.status === "COMPLETED" || order.status === "completed")
            );
          })
          .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

        const dayOrders = orders.filter((order) => {
          const orderDate = new Date(order.createdAt || order.created_at)
            .toISOString()
            .split("T")[0];
          return orderDate === dateStr;
        }).length;

        last30Days.push({
          date: date.toLocaleDateString("vi-VN", {
            month: "short",
            day: "numeric",
          }),
          revenue: dayRevenue / 1000, // Convert to thousands
          orders: dayOrders,
        });
      }
      setRevenueData(last30Days);

      // Calculate top products
      const productSales = {};
      orders.forEach((order) => {
        (order.orderItems || []).forEach((item) => {
          const productId = item.productId || item.product_id;
          if (!productSales[productId]) {
            productSales[productId] = {
              productId,
              quantity: 0,
              revenue: 0,
            };
          }
          productSales[productId].quantity += item.quantity || 0;
          productSales[productId].revenue +=
            (item.quantity || 0) * (item.price || 0);
        });
      });

      const topProductsList = Object.values(productSales)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)
        .map((item) => {
          const product = products.find((p) => p.id === item.productId);
          return {
            name: product?.name || "Unknown",
            sales: item.quantity,
            revenue: item.revenue / 1000, // thousands
          };
        });
      setTopProducts(topProductsList);

      // Calculate category distribution
      const categoryCounts = {};
      products.forEach((product) => {
        const categoryId = product.categoryId;
        categoryCounts[categoryId] = (categoryCounts[categoryId] || 0) + 1;
      });

      const categoryData = Object.entries(categoryCounts).map(
        ([id, count]) => ({
          name: `Danh mục ${id}`,
          value: count,
        })
      );
      setCategoryDistribution(categoryData);

      // Calculate stats
      const totalRevenue = orders
        .filter((o) => o.status === "COMPLETED" || o.status === "completed")
        .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

      const totalOrders = orders.length;
      const totalCustomers = users.filter((u) => u.role === 0).length;
      const averageOrderValue =
        totalOrders > 0 ? totalRevenue / totalOrders : 0;
      const conversionRate =
        totalCustomers > 0 ? (totalOrders / totalCustomers) * 100 : 0;

      // Mock growth rate (compare with previous period)
      const growthRate = 15.3;

      setStats({
        totalRevenue,
        totalOrders,
        totalCustomers,
        averageOrderValue,
        conversionRate,
        growthRate,
      });
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      toast.error("Không thể tải dữ liệu phân tích");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportReport = () => {
    const reportData = revenueData.map((item) => ({
      Ngày: item.date,
      "Doanh Thu (VNĐ)": item.revenue * 1000,
      "Số Đơn": item.orders,
    }));
    exportToCsv("bao-cao-doanh-thu.csv", reportData);
    toast.success("Đã xuất báo cáo thành công!");
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const COLORS = ["#8B4513", "#D2691E", "#CD853F", "#DEB887", "#F5DEB3"];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Phân Tích Bán Hàng
          </h1>
          <p className="text-gray-600 mt-1">
            Thống kê chi tiết và xu hướng kinh doanh
          </p>
        </div>
        <div className="flex gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
          >
            <option value={7}>7 ngày</option>
            <option value={30}>30 ngày</option>
            <option value={90}>90 ngày</option>
          </select>
          <Button onClick={handleExportReport} variant="secondary">
            <Download className="w-5 h-5 mr-2" />
            Xuất Báo Cáo
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-green-50 to-white rounded-xl shadow-sm p-6 border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500 rounded-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center gap-1 text-sm font-medium text-green-600">
              <TrendingUp className="w-4 h-4" />+{stats.growthRate}%
            </div>
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">
            Tổng Doanh Thu
          </h3>
          <p className="text-3xl font-bold text-gray-900">
            {formatPrice(stats.totalRevenue)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-sm p-6 border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">
            Tổng Đơn Hàng
          </h3>
          <p className="text-3xl font-bold text-gray-900">
            {stats.totalOrders}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-50 to-white rounded-xl shadow-sm p-6 border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-500 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">Khách Hàng</h3>
          <p className="text-3xl font-bold text-gray-900">
            {stats.totalCustomers}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-orange-50 to-white rounded-xl shadow-sm p-6 border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-500 rounded-lg">
              <Star className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">
            Giá Trị TB/Đơn
          </h3>
          <p className="text-3xl font-bold text-gray-900">
            {formatPrice(stats.averageOrderValue)}
          </p>
        </motion.div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-coffee-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-coffee-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Doanh Thu Theo Thời Gian
            </h2>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            {timeRange} ngày gần đây
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              style={{ fontSize: "12px" }}
            />
            <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              name="Doanh Thu (k VNĐ)"
              stroke="#8B4513"
              strokeWidth={3}
              dot={{ fill: "#8B4513", r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="orders"
              name="Số Đơn Hàng"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: "#10b981", r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top Products & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Package className="w-5 h-5 text-yellow-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Top 5 Sản Phẩm Bán Chạy
            </h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                type="number"
                stroke="#6b7280"
                style={{ fontSize: "12px" }}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#6b7280"
                style={{ fontSize: "12px" }}
                width={120}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Bar
                dataKey="sales"
                name="Số Lượng Bán"
                fill="#8B4513"
                radius={[0, 8, 8, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Package className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Phân Bố Danh Mục
            </h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryDistribution.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Tỷ Lệ Chuyển Đổi
            </h3>
          </div>
          <p className="text-4xl font-bold text-blue-600">
            {stats.conversionRate.toFixed(1)}%
          </p>
          <p className="text-sm text-gray-600 mt-2">Đơn hàng / Khách hàng</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Tăng Trưởng</h3>
          </div>
          <p className="text-4xl font-bold text-green-600">
            +{stats.growthRate}%
          </p>
          <p className="text-sm text-gray-600 mt-2">So với kỳ trước</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ShoppingCart className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Đơn Hàng/Ngày
            </h3>
          </div>
          <p className="text-4xl font-bold text-purple-600">
            {(stats.totalOrders / timeRange).toFixed(1)}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Trung bình {timeRange} ngày
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
