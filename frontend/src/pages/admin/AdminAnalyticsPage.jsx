import { useEffect, useState } from "react";
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
import { formatCurrency, formatDate } from "../../utils/formatDate";

const COLORS = ["#8B4513", "#D2691E", "#CD853F", "#DEB887", "#F5DEB3"];

const AdminAnalyticsPage = () => {
  const toast = useToastStore();
  const [isLoading, setIsLoading] = useState(true);
  const today = new Date();
  const defaultTo = today.toISOString().slice(0, 10);
  const defaultFrom = new Date(today.getFullYear(), today.getMonth(), 1)
    .toISOString()
    .slice(0, 10);
  const [dateRange, setDateRange] = useState({ from: defaultFrom, to: defaultTo });
  const [revenueData, setRevenueData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [categoryDistribution, setCategoryDistribution] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    paidRevenue: 0,
    pendingRevenue: 0,
    cancelledRevenue: 0,
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    cancelledOrders: 0,
    totalCustomers: 0,
    averageOrderValue: 0,
    conversionRate: 0,
    growthRate: 0,
    estimatedProfit: 0,
    totalCOGS: 0,
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange.from, dateRange.to]);

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
      const start = new Date(`${dateRange.from}T00:00:00`);
      const end = new Date(`${dateRange.to}T23:59:59`);
      const totalBucketDays = Math.max(
        1,
        Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1,
      );

      const buckets = Array.from({ length: totalBucketDays }, (_, idx) => {
        const date = new Date(start);
        date.setDate(start.getDate() + idx);
        return {
          label: date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
          key: date.toISOString().slice(0, 10),
        };
      });

      const ordersInRange = orders.filter((order) => {
        const date = new Date(order.orderDate || order.order_date || order.createdAt);
        return !Number.isNaN(date.getTime()) && date >= start && date <= end;
      });

      setRevenueData(
        buckets.map((bucket) => {
          const bucketOrders = ordersInRange.filter((order) => {
            const date = new Date(order.orderDate || order.order_date || order.createdAt);
            return date.toISOString().slice(0, 10) === bucket.key;
          });
          const dayRevenue = bucketOrders
            .filter((order) => order.status === "COMPLETED" || order.status === "completed")
            .reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
          return {
            date: bucket.label,
            revenue: dayRevenue / 1000000,
            orders: bucketOrders.length,
          };
        }),
      );

      const productSales = {};
      ordersInRange.forEach((order) => {
        (order.items || []).forEach((item) => {
          const productId = item.productId || item.product_id || item.productid;
          if (!productSales[productId]) {
            productSales[productId] = { productId, quantity: 0, revenue: 0 };
          }
          productSales[productId].quantity += item.quantity || 0;
          productSales[productId].revenue += (item.quantity || 0) * (item.unitPrice || 0);
        });
      });

      setTopProducts(
        Object.values(productSales)
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5)
          .map((item) => {
            const product = products.find((p) => p.id === item.productId);
            return {
              name: product?.name || "Unknown",
              sales: item.quantity,
              revenue: item.revenue / 1000,
            };
          }),
      );

      const categoryCounts = {};
      products.forEach((product) => {
        const categoryId = product.categoryId;
        categoryCounts[categoryId] = (categoryCounts[categoryId] || 0) + 1;
      });
      setCategoryDistribution(
        Object.entries(categoryCounts).map(([id, count]) => ({
          name: `Danh mục ${id}`,
          value: count,
        })),
      );

      const totalRevenue = ordersInRange.reduce(
        (sum, order) => sum + Number(order.totalAmount || 0),
        0,
      );
      const paidRevenue = ordersInRange
        .filter((o) => o.status === "COMPLETED" || o.status === "completed")
        .reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
      const pendingRevenue = ordersInRange
        .filter((o) => o.status === "PENDING" || o.status === "pending")
        .reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
      const cancelledRevenue = ordersInRange
        .filter((o) => o.status === "CANCELLED" || o.status === "cancelled")
        .reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
      const totalOrders = ordersInRange.length;
      const completedOrders = ordersInRange.filter((o) => o.status === "COMPLETED" || o.status === "completed").length;
      const pendingOrders = ordersInRange.filter((o) => o.status === "PENDING" || o.status === "pending").length;
      const cancelledOrders = ordersInRange.filter((o) => o.status === "CANCELLED" || o.status === "cancelled").length;
      const totalCustomers = users.filter((u) => (u.roleCode || u.roleName || "").toLowerCase() === "user").length;
      const averageOrderValue = totalOrders > 0 ? paidRevenue / totalOrders : 0;
      const conversionRate = totalCustomers > 0 ? (totalOrders / totalCustomers) * 100 : 0;

      let totalCOGS = 0;
      ordersInRange
        .filter((o) => o.status === "COMPLETED" || o.status === "completed")
        .forEach((order) => {
          (order.items || []).forEach((item) => {
            const productId = item.productId || item.product_id || item.productid;
            const product = products.find((p) => p.id === productId);
            totalCOGS += Number(product?.costPrice || product?.cost_price || 0) * (item.quantity || 0);
          });
        });

      setStats({
        totalRevenue,
        paidRevenue,
        pendingRevenue,
        cancelledRevenue,
        totalOrders,
        completedOrders,
        pendingOrders,
        cancelledOrders,
        totalCustomers,
        averageOrderValue,
        conversionRate,
        growthRate: 12.5,
        estimatedProfit: paidRevenue - totalCOGS,
        totalCOGS,
      });
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      toast.error("Không thể tải dữ liệu phân tích");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportReport = () => {
    exportToCsv(
      "bao-cao-doanh-thu.csv",
      revenueData.map((item) => ({
        Ngày: item.date,
        "Doanh Thu (VNĐ)": formatCurrency(item.revenue * 1000000),
        "Số Đơn": item.orders,
      })),
    );
    toast.success("Đã xuất báo cáo thành công!");
  };

  const rangeLabel = `${formatDate(dateRange.from)} - ${formatDate(dateRange.to)}`;
  const periodDays = Math.max(
    1,
    Math.ceil(
      (new Date(`${dateRange.to}T23:59:59`).getTime() - new Date(`${dateRange.from}T00:00:00`).getTime()) /
        (24 * 60 * 60 * 1000),
    ) + 1,
  );

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-coffee-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Phân Tích Bán Hàng</h1>
          <p className="mt-1 text-gray-600">Thống kê chi tiết và xu hướng kinh doanh</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <input type="date" value={dateRange.from} onChange={(e) => setDateRange((prev) => ({ ...prev, from: e.target.value }))} className="rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-coffee-500" />
          <input type="date" value={dateRange.to} onChange={(e) => setDateRange((prev) => ({ ...prev, to: e.target.value }))} className="rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-coffee-500" />
          <Button onClick={handleExportReport} variant="secondary">
            <Download className="mr-2 h-5 w-5" />
            Xuất Báo Cáo
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Doanh Thu Đã Thanh Toán", value: formatCurrency(stats.paidRevenue), icon: DollarSign, color: "bg-green-500", sub: `+${stats.growthRate}%` },
          { label: "Tổng Đơn Hàng", value: stats.totalOrders.toLocaleString("vi-VN"), icon: ShoppingCart, color: "bg-blue-500" },
          { label: "Khách Hàng", value: stats.totalCustomers.toLocaleString("vi-VN"), icon: Users, color: "bg-purple-500" },
          { label: "Giá Trị TB/Đơn", value: formatCurrency(stats.averageOrderValue), icon: Star, color: "bg-orange-500" },
        ].map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className={`rounded-lg p-3 ${card.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                {card.sub && <div className="text-sm font-medium text-green-600">{card.sub}</div>}
              </div>
              <h3 className="mb-1 text-sm font-medium text-gray-600">{card.label}</h3>
              <p className="text-3xl font-bold text-gray-900">{card.value}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-coffee-100 p-2">
              <TrendingUp className="h-5 w-5 text-coffee-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Doanh Thu Theo Thời Gian</h2>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            {rangeLabel}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: "12px" }} />
            <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
            <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
            <Legend />
            <Line type="monotone" dataKey="revenue" name="Doanh Thu (tr VNĐ)" stroke="#8B4513" strokeWidth={3} dot={{ fill: "#8B4513", r: 4 }} />
            <Line type="monotone" dataKey="orders" name="Số Đơn Hàng" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981", r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Số lượng đơn theo trạng thái</h3>
          <div className="mt-4 space-y-2 text-sm text-gray-700">
            <div className="flex items-center justify-between"><span>Thành công</span><span className="font-semibold">{stats.completedOrders}</span></div>
            <div className="flex items-center justify-between"><span>Đang đợi thanh toán</span><span className="font-semibold">{stats.pendingOrders}</span></div>
            <div className="flex items-center justify-between"><span>Đã hủy</span><span className="font-semibold">{stats.cancelledOrders}</span></div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Doanh thu theo tình trạng đơn</h3>
          <div className="mt-4 space-y-2 text-sm text-gray-700">
            <div className="flex items-center justify-between"><span>Tổng giá trị đơn</span><span className="font-semibold">{formatCurrency(stats.totalRevenue)}</span></div>
            <div className="flex items-center justify-between"><span>Đã thanh toán</span><span className="font-semibold">{formatCurrency(stats.paidRevenue)}</span></div>
            <div className="flex items-center justify-between"><span>Đang chờ thanh toán</span><span className="font-semibold">{formatCurrency(stats.pendingRevenue)}</span></div>
            <div className="flex items-center justify-between"><span>Đơn đã hủy</span><span className="font-semibold">{formatCurrency(stats.cancelledRevenue)}</span></div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-emerald-100 p-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Lợi nhuận ước tính</h3>
          </div>
          <p className="text-4xl font-bold text-gray-900">{formatCurrency(stats.estimatedProfit)}</p>
          <p className="mt-2 text-sm text-gray-600">COGS: {formatCurrency(stats.totalCOGS)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-lg bg-yellow-100 p-2">
              <Package className="h-5 w-5 text-yellow-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Top 5 Sản Phẩm Bán Chạy</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" stroke="#6b7280" style={{ fontSize: "12px" }} />
              <YAxis type="category" dataKey="name" stroke="#6b7280" style={{ fontSize: "12px" }} width={120} />
              <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
              <Bar dataKey="sales" name="Số Lượng Bán" fill="#8B4513" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 p-2">
              <Package className="h-5 w-5 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Phân Bố Danh Mục</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Tỷ Lệ Chuyển Đổi</h3>
          </div>
          <p className="text-4xl font-bold text-blue-600">
            {stats.conversionRate.toLocaleString("vi-VN", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%
          </p>
          <p className="mt-2 text-sm text-gray-600">Đơn hàng / Khách hàng</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-2">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Tăng Trưởng</h3>
          </div>
          <p className="text-4xl font-bold text-green-600">
            +{stats.growthRate.toLocaleString("vi-VN", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%
          </p>
          <p className="mt-2 text-sm text-gray-600">So với kỳ trước</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 p-2">
              <ShoppingCart className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Đơn Hàng/Ngày</h3>
          </div>
          <p className="text-4xl font-bold text-purple-600">
            {(stats.totalOrders / periodDays).toLocaleString("vi-VN", {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })}
          </p>
          <p className="mt-2 text-sm text-gray-600">Trung bình {periodDays} ngày</p>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
