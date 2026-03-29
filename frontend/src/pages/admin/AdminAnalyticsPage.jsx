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
import { orderAPI, productAPI, userAPI, receiptAPI } from "../../services";
import Button from "../../components/ui/Button";
import { exportToCsv } from "../../utils/exportCSV";
import useToastStore from "../../stores/useToastStore";
import { formatCurrency, formatDate } from "../../utils/formatDate";

const AdminAnalyticsPage = () => {
  const toast = useToastStore();
  const [isLoading, setIsLoading] = useState(true);
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.toISOString().slice(0, 7);
  const [reportType, setReportType] = useState("month"); // month | quarter | year
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedQuarter, setSelectedQuarter] = useState(
    Math.floor(today.getMonth() / 3) + 1
  );
  const [selectedYear, setSelectedYear] = useState(currentYear);
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
  }, [reportType, selectedMonth, selectedQuarter, selectedYear]);

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    try {
      const [ordersRes, productsRes, usersRes] = await Promise.all([
        orderAPI.getAllOrders(1, 500).catch(() => ({ data: [] })),
        productAPI.getAllProducts().catch(() => ({ data: [] })),
        userAPI.getAllUsers({ page: 1, limit: 500 }).catch(() => ({ data: [] })),
      ]);

      const orders = ordersRes.data || [];
      const products = productsRes.data || [];
      const users = usersRes.data || usersRes.users || [];
      

            const buildRangeConfig = () => {
        if (reportType === "month") {
          const [yearStr, monthStr] = selectedMonth.split("-");
          const year = Number(yearStr);
          const monthIndex = Number(monthStr) - 1;
          const start = new Date(year, monthIndex, 1);
          const end = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);
          const totalDays = new Date(year, monthIndex + 1, 0).getDate();
          const buckets = Array.from({ length: totalDays }, (_, idx) => {
            const date = new Date(year, monthIndex, idx + 1);
            return {
              label: date.toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
              }),
              match: (d) =>
                d.getDate() === date.getDate() &&
                d.getMonth() === monthIndex &&
                d.getFullYear() === year,
            };
          });
          return { start, end, buckets };
        }

        if (reportType === "quarter") {
          const year = Number(selectedYear);
          const startMonth = (Number(selectedQuarter) - 1) * 3;
          const start = new Date(year, startMonth, 1);
          const end = new Date(year, startMonth + 3, 0, 23, 59, 59, 999);
          const buckets = Array.from({ length: 3 }, (_, idx) => {
            const monthIndex = startMonth + idx;
            return {
              label: `Thg ${monthIndex + 1}`,
              match: (d) =>
                d.getMonth() === monthIndex && d.getFullYear() === year,
            };
          });
          return { start, end, buckets };
        }

        const year = Number(selectedYear);
        const start = new Date(year, 0, 1);
        const end = new Date(year, 11, 31, 23, 59, 59, 999);
        const buckets = Array.from({ length: 12 }, (_, idx) => ({
          label: `Thg ${idx + 1}`,
          match: (d) => d.getMonth() === idx && d.getFullYear() === year,
        }));
        return { start, end, buckets };
      };

      const { start, end, buckets } = buildRangeConfig();

      const ordersInRange = orders.filter((order) => {
        const date = new Date(order.orderDate || order.order_date || order.createdAt);
        return !Number.isNaN(date.getTime()) && date >= start && date <= end;
      });

      const revenueSeries = buckets.map((bucket) => {
        const bucketOrders = ordersInRange.filter((order) => {
          const date = new Date(order.orderDate || order.order_date || order.createdAt);
          return bucket.match(date);
        });

        const dayRevenue = bucketOrders
          .filter((order) =>
            order.status === "COMPLETED" || order.status === "completed"
          )
          .reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);

        return {
          date: bucket.label,
          revenue: dayRevenue / 1000000,
          orders: bucketOrders.length,
        };
      });

      setRevenueData(revenueSeries);


      // Calculate top products
      const productSales = {};
      ordersInRange.forEach((order) => {
        (order.items || []).forEach((item) => {
          const productId = item.productId || item.product_id || item.productid;
          if (!productSales[productId]) {
            productSales[productId] = {
              productId,
              quantity: 0,
              revenue: 0,
            };
          }
          productSales[productId].quantity += item.quantity || 0;
          productSales[productId].revenue +=
            (item.quantity || 0) * (item.unitPrice || 0);
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
      const totalRevenue = ordersInRange
        .filter((o) => o.status === "COMPLETED" || o.status === "completed")
        .reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
      const totalOrders = ordersInRange.length;
      const totalCustomers = users.filter(
        (u) => (u.roleCode || u.roleName || "").toLowerCase() === "user"
      ).length;
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
      "Ngày": item.date,
      "Doanh Thu (VNĐ)": formatCurrency(item.revenue * 1000000),
      "Số Đơn": item.orders,
    }));
    exportToCsv("bao-cao-doanh-thu.csv", reportData);
    toast.success("Đã xuất báo cáo thành công!");
  };

  const COLORS = ["#8B4513", "#D2691E", "#CD853F", "#DEB887", "#F5DEB3"];

  const rangeLabel = (() => {
    if (reportType === "month") {
      const [year, month] = selectedMonth.split("-");
      return `Tháng ${month}/${year}`;
    }
    if (reportType === "quarter") {
      return `Quý ${selectedQuarter}/${selectedYear}`;
    }
    return `Năm ${selectedYear}`;
  })();

  const yearOptions = Array.from({ length: 6 }, (_, idx) => currentYear - 3 + idx);

  const periodDays = (() => {
    if (reportType === "month") {
      const [year, month] = selectedMonth.split("-");
      return new Date(Number(year), Number(month), 0).getDate();
    }
    if (reportType === "quarter") {
      const year = Number(selectedYear);
      const startMonth = (Number(selectedQuarter) - 1) * 3 + 1;
      return [0, 1, 2].reduce(
        (sum, offset) => sum + new Date(year, startMonth + offset, 0).getDate(),
        0
      );
    }
    const year = Number(selectedYear);
    const isLeap = new Date(year, 1, 29).getMonth() === 1;
    return isLeap ? 366 : 365;
  })();

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
        <div className="flex flex-wrap gap-3">
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
          >
            <option value="month">Theo tháng</option>
            <option value="quarter">Theo quý</option>
            <option value="year">Theo năm</option>
          </select>

          {reportType === "month" && (
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
            />
          )}

          {reportType === "quarter" && (
            <>
              <select
                value={selectedQuarter}
                onChange={(e) => setSelectedQuarter(Number(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
              >
                <option value={1}>Quý 1</option>
                <option value={2}>Quý 2</option>
                <option value={3}>Quý 3</option>
                <option value={4}>Quý 4</option>
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </>
          )}

          {reportType === "year" && (
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          )}

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
            {formatCurrency(stats.totalRevenue)}
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
            {stats.totalOrders.toLocaleString("vi-VN")}
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
            {stats.totalCustomers.toLocaleString("vi-VN")}
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
            {formatCurrency(stats.averageOrderValue)}
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
            {periodDays} ngày gần đây
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
              name="Doanh Thu (tr VNĐ)"
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
            {stats.conversionRate.toLocaleString("vi-VN", {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })}
            %
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
            +
            {stats.growthRate.toLocaleString("vi-VN", {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })}
            %
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
            {(stats.totalOrders / periodDays).toLocaleString("vi-VN", {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Trung bình {periodDays} ngày
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
