import { useState, useEffect, useCallback, useMemo } from "react";
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
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.toISOString().slice(0, 7);
  const [reportType, setReportType] = useState("month");
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedQuarter, setSelectedQuarter] = useState(
    Math.floor(today.getMonth() / 3) + 1
  );
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [ordersData, setOrdersData] = useState([]);
  const [productsData, setProductsData] = useState([]);
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

      setOrdersData(ordersData);
      setProductsData(productsData);

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

  const reportMetrics = useMemo(() => {
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
    const ordersInRange = ordersData.filter((order) => {
      const date = new Date(order.orderDate || order.order_date || order.createdAt);
      return !Number.isNaN(date.getTime()) && date >= start && date <= end;
    });

    const costMap = new Map(
      (productsData || []).map((product) => [
        product.id,
        Number(product.costPrice || product.cost_price || product.importPrice || 0),
      ])
    );

    let missingCost = false;

    const calcOrderMetrics = (order) => {
      const items =
        order.items || order.orderItems || order.details || order.order_details || [];
      if (!Array.isArray(items) || items.length === 0) {
        const quantity =
          Number(order.totalQuantity || order.total_items || order.quantity || 0) || 0;
        const revenue = Number(order.total || order.totalAmount || 0);
        return { quantity, revenue, profit: revenue };
      }

      return items.reduce(
        (acc, item) => {
          const quantity = Number(item.quantity || item.qty || 0);
          const unitPrice = Number(item.unitPrice || item.unit_price || item.price || 0);
          const productId = item.productId || item.product_id;
          const costPrice = costMap.get(productId) || 0;
          if (!costMap.get(productId)) missingCost = true;
          const revenue = unitPrice * quantity;
          const cost = costPrice * quantity;
          acc.quantity += quantity;
          acc.revenue += revenue;
          acc.profit += revenue - cost;
          return acc;
        },
        { quantity: 0, revenue: 0, profit: 0 }
      );
    };

    const rows = buckets.map((bucket) => {
      const bucketOrders = ordersInRange.filter((order) => {
        const date = new Date(order.orderDate || order.order_date || order.createdAt);
        return bucket.match(date);
      });

      const bucketMetrics = bucketOrders.reduce(
        (acc, order) => {
          const metrics = calcOrderMetrics(order);
          acc.quantity += metrics.quantity;
          acc.revenue += metrics.revenue;
          acc.profit += metrics.profit;
          return acc;
        },
        { quantity: 0, revenue: 0, profit: 0 }
      );

      return {
        label: bucket.label,
        ...bucketMetrics,
      };
    });

    const summary = rows.reduce(
      (acc, row) => ({
        totalQuantity: acc.totalQuantity + row.quantity,
        totalRevenue: acc.totalRevenue + row.revenue,
        totalProfit: acc.totalProfit + row.profit,
      }),
      { totalQuantity: 0, totalRevenue: 0, totalProfit: 0 }
    );

    return { rows, summary, missingCost };
  }, [ordersData, productsData, reportType, selectedMonth, selectedQuarter, selectedYear]);

  const yearOptions = Array.from({ length: 6 }, (_, idx) => currentYear - 3 + idx);

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


      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Báo cáo xuất hàng</h2>
            <p className="text-sm text-gray-600">Theo tháng, quý hoặc năm</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
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
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
              />
            )}
            {reportType === "quarter" && (
              <>
                <select
                  value={selectedQuarter}
                  onChange={(e) => setSelectedQuarter(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
                >
                  <option value={1}>Quý 1</option>
                  <option value={2}>Quý 2</option>
                  <option value={3}>Quý 3</option>
                  <option value={4}>Quý 4</option>
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
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
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg border border-gray-100 p-4">
            <p className="text-sm text-gray-600">Tổng số lượng xuất</p>
            <p className="text-2xl font-bold text-gray-900">
              {reportMetrics.summary.totalQuantity.toLocaleString("vi-VN")}
            </p>
          </div>
          <div className="rounded-lg border border-gray-100 p-4">
            <p className="text-sm text-gray-600">Tổng doanh thu</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(reportMetrics.summary.totalRevenue)}
            </p>
          </div>
          <div className="rounded-lg border border-gray-100 p-4">
            <p className="text-sm text-gray-600">Lợi nhuận được tính</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(reportMetrics.summary.totalProfit)}
            </p>
          </div>
        </div>

        {reportMetrics.missingCost && (
          <p className="mt-3 text-xs text-amber-600">
            Lưu ý: Một số sản phẩm chưa có giá nhập, lợi nhuận được tính tạm theo doanh thu.
          </p>
        )}

        <div className="mt-4 overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Kỳ
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Số lượng
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Lợi nhuận
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  L?i nhu?n
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reportMetrics.rows.map((row) => (
                <tr key={row.label}>
                  <td className="px-4 py-3 text-gray-900">{row.label}</td>
                  <td className="px-4 py-3 text-right text-gray-900">
                    {row.quantity.toLocaleString("vi-VN")}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-900">
                    {formatCurrency(row.revenue)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-900">
                    {formatCurrency(row.profit)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
        <h2 className="text-2xl font-bold mb-4">Thao tác nhanh</h2>
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
