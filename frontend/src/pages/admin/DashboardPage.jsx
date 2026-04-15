import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  CalendarRange,
  CheckCircle2,
  Clock,
  DollarSign,
  Package,
  ShieldAlert,
  ShoppingBag,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Truck,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { inventoryAPI, orderAPI, productAPI, userAPI } from "../../services";
import { formatCurrency, formatDate } from "../../utils/formatDate";

const NEW_CUSTOMER_DAYS = 30;
const LOW_STOCK_THRESHOLD = 10;
const ORDER_APPROVAL_WARNING_HOURS = 24;
const STATUS_COLORS = {
  PENDING: "#f59e0b",
  CONFIRMED: "#3b82f6",
  SHIPPING: "#8b5cf6",
  COMPLETED: "#10b981",
  CANCELLED: "#ef4444",
};

const getTodayISO = () => new Date().toISOString().slice(0, 10);

const getMonthStartISO = () => {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
};

const formatCompactCurrency = (amount) => {
  const numericAmount = Number(amount || 0);

  if (Math.abs(numericAmount) >= 1_000_000_000) {
    return `${(numericAmount / 1_000_000_000).toLocaleString("vi-VN", {
      maximumFractionDigits: 1,
    })} tỷ`;
  }

  if (Math.abs(numericAmount) >= 1_000_000) {
    return `${(numericAmount / 1_000_000).toLocaleString("vi-VN", {
      maximumFractionDigits: 1,
    })} triệu`;
  }

  if (Math.abs(numericAmount) >= 1_000) {
    return `${(numericAmount / 1_000).toLocaleString("vi-VN", {
      maximumFractionDigits: 1,
    })} nghìn`;
  }

  return formatCurrency(numericAmount);
};

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalUsers: 0,
    newCustomers: 0,
    pendingOrders: 0,
    completedOrders: 0,
    lowStockCount: 0,
    overdueApprovalOrders: 0,
    revenueGrowth: 12.5,
    ordersGrowth: 8.3,
  });
  const [dateRange, setDateRange] = useState({
    from: getMonthStartISO(),
    to: getTodayISO(),
  });
  const [allOrders, setAllOrders] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [newCustomers, setNewCustomers] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [overdueOrders, setOverdueOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const normalizeUsers = (response) => {
    const payload = response?.data;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.users)) return payload.users;
    if (Array.isArray(payload?.data?.users)) return payload.data.users;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
  };

  const getOrderDate = (order) =>
    new Date(order?.orderDate || order?.order_date || order?.createdAt || 0);

  const getUserCreatedAt = (user) =>
    new Date(user?.createdAt || user?.created_at || user?.updatedAt || 0);

  const getNormalizedStatus = (status) => String(status || "").toUpperCase();

  const isCustomerUser = (user) => {
    const roleLabel = String(user?.roleCode || user?.roleName || "").toUpperCase();
    return roleLabel === "USER" || user?.roleId === 2;
  };

  const getHoursPending = (order) => {
    const orderDate = getOrderDate(order);
    if (Number.isNaN(orderDate.getTime())) return 0;
    return Math.max(0, Math.floor((Date.now() - orderDate.getTime()) / (1000 * 60 * 60)));
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [ordersRes, productsRes, usersRes, lowStockRes] = await Promise.all([
        orderAPI.getAllOrders(1, 500).catch(() => ({ data: [] })),
        productAPI.getAllProducts().catch(() => ({ data: [] })),
        userAPI.getAllUsers({ page: 1, limit: 500 }).catch(() => ({ data: [] })),
        inventoryAPI.getLowStockProducts(LOW_STOCK_THRESHOLD).catch(() => ({ data: [] })),
      ]);

      const orders = Array.isArray(ordersRes.data) ? ordersRes.data : [];
      const products = Array.isArray(productsRes.data) ? productsRes.data : [];
      const users = normalizeUsers(usersRes);
      const lowStockData = Array.isArray(lowStockRes.data) ? lowStockRes.data : [];

      const now = new Date();
      const newCustomerCutoff = new Date(
        now.getTime() - NEW_CUSTOMER_DAYS * 24 * 60 * 60 * 1000,
      );
      const overdueCutoff = new Date(
        now.getTime() - ORDER_APPROVAL_WARNING_HOURS * 60 * 60 * 1000,
      );

      const totalRevenue = orders.reduce(
        (sum, order) => sum + Number(order.totalAmount || order.total_amount || 0),
        0,
      );
      const pendingOrders = orders.filter(
        (order) => getNormalizedStatus(order?.status || order?.orderStatus) === "PENDING",
      ).length;
      const completedOrders = orders.filter(
        (order) => getNormalizedStatus(order?.status || order?.orderStatus) === "COMPLETED",
      ).length;

      const customerUsers = users.filter(isCustomerUser);
      const latestNewCustomers = customerUsers
        .filter((user) => {
          const createdAt = getUserCreatedAt(user);
          return !Number.isNaN(createdAt.getTime()) && createdAt >= newCustomerCutoff;
        })
        .sort((a, b) => getUserCreatedAt(b) - getUserCreatedAt(a));

      const overduePendingOrders = orders
        .filter((order) => {
          const status = getNormalizedStatus(order?.status || order?.orderStatus);
          const orderDate = getOrderDate(order);
          return (
            status === "PENDING" &&
            !Number.isNaN(orderDate.getTime()) &&
            orderDate <= overdueCutoff
          );
        })
        .sort((a, b) => getOrderDate(a) - getOrderDate(b));

      setStats({
        totalOrders: orders.length,
        totalRevenue,
        totalProducts: products.length,
        totalUsers: customerUsers.length,
        newCustomers: latestNewCustomers.length,
        pendingOrders,
        completedOrders,
        lowStockCount: lowStockData.length,
        overdueApprovalOrders: overduePendingOrders.length,
        revenueGrowth: 12.5,
        ordersGrowth: 8.3,
      });

      setAllOrders(orders);
      setRecentOrders([...orders].sort((a, b) => getOrderDate(b) - getOrderDate(a)).slice(0, 5));
      setNewCustomers(latestNewCustomers.slice(0, 5));
      setLowStockProducts(lowStockData.slice(0, 5));
      setOverdueOrders(overduePendingOrders.slice(0, 5));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const analytics = useMemo(() => {
    const fromDate = new Date(`${dateRange.from}T00:00:00`);
    const toDate = new Date(`${dateRange.to}T23:59:59`);

    if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime()) || fromDate > toDate) {
      return {
        filteredOrders: [],
        salesByDay: [],
        summary: {
          revenue: 0,
          totalOrders: 0,
          soldOrders: 0,
          averageOrderValue: 0,
          completed: 0,
          pending: 0,
          shipping: 0,
          cancelled: 0,
        },
        statusChart: [],
      };
    }

    const filteredOrders = allOrders.filter((order) => {
      const orderDate = getOrderDate(order);
      return !Number.isNaN(orderDate.getTime()) && orderDate >= fromDate && orderDate <= toDate;
    });

    const salesMap = new Map();
    const cursor = new Date(fromDate);
    while (cursor <= toDate) {
      const key = cursor.toISOString().slice(0, 10);
      salesMap.set(key, {
        date: key,
        label: cursor.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
        revenue: 0,
        orders: 0,
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    filteredOrders.forEach((order) => {
      const orderDate = getOrderDate(order);
      const status = getNormalizedStatus(order?.status || order?.orderStatus);
      const key = orderDate.toISOString().slice(0, 10);
      const bucket = salesMap.get(key);
      if (!bucket) return;
      bucket.orders += 1;
      if (status === "COMPLETED") {
        bucket.revenue += Number(order.totalAmount || order.total_amount || 0);
      }
    });

    const completed = filteredOrders.filter(
      (order) => getNormalizedStatus(order?.status || order?.orderStatus) === "COMPLETED",
    );
    const pending = filteredOrders.filter(
      (order) => getNormalizedStatus(order?.status || order?.orderStatus) === "PENDING",
    );
    const shipping = filteredOrders.filter(
      (order) => getNormalizedStatus(order?.status || order?.orderStatus) === "SHIPPING",
    );
    const cancelled = filteredOrders.filter(
      (order) => getNormalizedStatus(order?.status || order?.orderStatus) === "CANCELLED",
    );

    const revenue = completed.reduce(
      (sum, order) => sum + Number(order.totalAmount || order.total_amount || 0),
      0,
    );

    const statusChart = [
      { name: "Chờ xác nhận", value: pending.length, color: STATUS_COLORS.PENDING },
      { name: "Đang giao", value: shipping.length, color: STATUS_COLORS.SHIPPING },
      { name: "Hoàn thành", value: completed.length, color: STATUS_COLORS.COMPLETED },
      { name: "Đã hủy", value: cancelled.length, color: STATUS_COLORS.CANCELLED },
    ].filter((item) => item.value > 0);

    return {
      filteredOrders,
      salesByDay: Array.from(salesMap.values()),
      summary: {
        revenue,
        totalOrders: filteredOrders.length,
        soldOrders: completed.length,
        averageOrderValue: completed.length > 0 ? revenue / completed.length : 0,
        completed: completed.length,
        pending: pending.length,
        shipping: shipping.length,
        cancelled: cancelled.length,
      },
      statusChart,
    };
  }, [allOrders, dateRange]);

  const getStatusColor = (status) => {
    const normalized = getNormalizedStatus(status);
    const statusMap = {
      PENDING: "bg-yellow-100 text-yellow-800",
      CONFIRMED: "bg-blue-100 text-blue-800",
      SHIPPING: "bg-purple-100 text-purple-800",
      COMPLETED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
    };
    return statusMap[normalized] || "bg-gray-100 text-gray-800";
  };

  const getStatusText = (status) => {
    const normalized = getNormalizedStatus(status);
    const statusMap = {
      PENDING: "Chờ xác nhận",
      CONFIRMED: "Đã xác nhận",
      SHIPPING: "Đang giao",
      COMPLETED: "Hoàn thành",
      CANCELLED: "Đã hủy",
    };
    return statusMap[normalized] || normalized || "Không rõ";
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    trend,
    trendValue,
    color,
    subtitle,
    valueClassName = "",
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className={`rounded-lg p-3 ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        {trend ? (
          <div
            className={`flex items-center gap-1 text-sm font-medium ${
              trendValue >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {trendValue >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            <span>{Math.abs(trendValue)}%</span>
          </div>
        ) : null}
      </div>
      <h3 className="mb-1 text-sm font-medium text-gray-600">{title}</h3>
      <p className={`text-2xl font-bold leading-tight text-gray-900 xl:text-3xl ${valueClassName}`}>
        {value}
      </p>
      {subtitle ? <p className="mt-2 text-sm text-gray-500">{subtitle}</p> : null}
    </motion.div>
  );

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-coffee-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Tổng quan dành cho admin về đơn hàng, khách hàng và tồn kho</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-5">
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
          value={formatCompactCurrency(stats.totalRevenue)}
          icon={DollarSign}
          trend
          trendValue={stats.revenueGrowth}
          color="bg-green-500"
          subtitle={formatCurrency(stats.totalRevenue)}
        />
        <StatCard title="Sản Phẩm" value={stats.totalProducts} icon={Package} color="bg-violet-500" />
        <StatCard title="Tổng Khách Hàng" value={stats.totalUsers} icon={Users} color="bg-orange-500" />
        <StatCard
          title="Khách Hàng Mới"
          value={stats.newCustomers}
          icon={UserPlus}
          color="bg-rose-500"
          subtitle={`${NEW_CUSTOMER_DAYS} ngày gần nhất`}
        />
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-coffee-100 p-2">
                <CalendarRange className="h-5 w-5 text-coffee-700" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Phân Tích Doanh Thu Và Đơn Hàng</h2>
            </div>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange((prev) => ({ ...prev, from: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-coffee-500 sm:w-52"
            />
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange((prev) => ({ ...prev, to: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-coffee-500 sm:w-52"
            />
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <p className="text-sm text-gray-600">Doanh thu trong kỳ</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {formatCompactCurrency(analytics.summary.revenue)}
            </p>
            <p className="mt-1 text-xs text-gray-500">{formatCurrency(analytics.summary.revenue)}</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <p className="text-sm text-gray-600">Tổng số đơn</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{analytics.summary.totalOrders}</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <p className="text-sm text-gray-600">Đơn bán được</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{analytics.summary.soldOrders}</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <p className="text-sm text-gray-600">Giá trị TB / đơn hoàn thành</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {formatCompactCurrency(analytics.summary.averageOrderValue)}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {formatCurrency(analytics.summary.averageOrderValue)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[2fr_1fr]">
          <div className="rounded-xl border border-gray-100 p-4">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Biểu Đồ Doanh Thu Theo Ngày</h3>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={analytics.salesByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="label" stroke="#6b7280" />
                <YAxis stroke="#6b7280" tickFormatter={(value) => `${Math.round(value / 1000)}k`} />
                <Tooltip
                  formatter={(value, name) =>
                    name === "revenue" ? formatCurrency(value) : `${value} đơn`
                  }
                  labelFormatter={(label) => `Ngày ${label}`}
                />
                <Legend
                  formatter={(value) =>
                    value === "revenue" ? "Doanh thu" : value === "orders" ? "Số đơn" : value
                  }
                />
                <Bar dataKey="revenue" name="revenue" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="orders" name="orders" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl border border-gray-100 p-4">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Trạng Thái Đơn Hàng</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={analytics.statusChart}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={82}
                  paddingAngle={3}
                >
                  {analytics.statusChart.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value} đơn`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <span>Chờ xác nhận</span>
                </div>
                <span className="font-semibold">{analytics.summary.pending}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <Truck className="h-4 w-4 text-violet-500" />
                  <span>Đang giao</span>
                </div>
                <span className="font-semibold">{analytics.summary.shipping}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Hoàn thành</span>
                </div>
                <span className="font-semibold">{analytics.summary.completed}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span>Đã hủy</span>
                </div>
                <span className="font-semibold">{analytics.summary.cancelled}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-yellow-100 p-2">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Đơn Chờ Xử Lý</h3>
          </div>
          <p className="text-4xl font-bold text-yellow-600">{stats.pendingOrders}</p>
          <p className="mt-2 text-sm text-gray-600">Cần xác nhận và xử lý sớm</p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-2">
              <ShoppingCart className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Đơn Hoàn Thành</h3>
          </div>
          <p className="text-4xl font-bold text-green-600">{stats.completedOrders}</p>
          <p className="mt-2 text-sm text-gray-600">Tổng đơn đã hoàn thành</p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-red-100 p-2">
              <Package className="h-5 w-5 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Sản Phẩm Sắp Hết</h3>
          </div>
          <p className="text-4xl font-bold text-red-600">{stats.lowStockCount}</p>
          <p className="mt-2 text-sm text-gray-600">Tồn kho dưới {LOW_STOCK_THRESHOLD} sản phẩm</p>
        </div>
      </div>

      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-red-100 p-2">
              <ShieldAlert className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Cảnh Báo Duyệt Đơn</h2>
              <p className="mt-1 text-sm text-gray-700">
                Có <span className="font-semibold text-red-700">{stats.overdueApprovalOrders}</span> đơn
                đang chờ quá {ORDER_APPROVAL_WARNING_HOURS} giờ chưa duyệt.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full bg-white px-3 py-1 text-sm font-medium text-red-700">
              Ưu tiên xử lý
            </div>
            <Link
              to="/admin/orders"
              className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
            >
              Đi tới đơn hàng
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {overdueOrders.length > 0 ? (
            overdueOrders.map((order) => (
              <div
                key={order.id}
                className="flex flex-col gap-2 rounded-xl border border-red-100 bg-white p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <span>Đơn #{order.id}</span>
                  </div>
                  <p className="mt-1 font-semibold text-gray-900">
                    {order.customerName || order.customer_name || "Khách hàng"}
                  </p>
                  <p className="text-sm text-gray-600">
                    Tạo lúc {formatDate(order.orderDate, { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-sm font-semibold text-red-700">Quá {getHoursPending(order)} giờ</p>
                  <p className="text-sm text-gray-700">
                    {formatCurrency(order.totalAmount || order.total_amount)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-red-200 bg-white/80 p-4 text-sm text-gray-600">
              Chưa có đơn nào quá {ORDER_APPROVAL_WARNING_HOURS} giờ chưa duyệt.
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-gray-200 p-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Khách Hàng Mới</h2>
              <p className="mt-1 text-sm text-gray-500">Đăng ký trong {NEW_CUSTOMER_DAYS} ngày gần nhất</p>
            </div>
            <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
              {stats.newCustomers} người
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {newCustomers.length > 0 ? (
              newCustomers.map((user) => (
                <div key={user.id} className="flex items-center justify-between gap-4 p-4">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {user.name || user.username || "Khách hàng mới"}
                    </p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    {formatDate(user.createdAt || user.created_at)}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-sm text-gray-500">
                Chưa có khách hàng mới trong {NEW_CUSTOMER_DAYS} ngày gần nhất.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-gray-200 p-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Insight Kho Sắp Hết</h2>
              <p className="mt-1 text-sm text-gray-500">Ưu tiên nhập thêm các mặt hàng tồn thấp</p>
            </div>
            <div className="rounded-lg bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700">
              {stats.lowStockCount} mặt hàng
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {lowStockProducts.length > 0 ? (
              lowStockProducts.map((item) => (
                <div key={item.id || item.productId} className="flex items-center justify-between gap-4 p-4">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {item.product_name || item.name || "Sản phẩm"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {item.categoryName || item.description || "Cần theo dõi tồn kho"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-600">{item.quantity ?? item.stock ?? 0}</p>
                    <p className="text-xs uppercase tracking-wide text-gray-500">còn lại</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-sm text-gray-500">
                Chưa có sản phẩm nào dưới ngưỡng {LOW_STOCK_THRESHOLD}.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900">Đơn Hàng Gần Đây</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Mã đơn
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Thời gian
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Tổng tiền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="font-mono font-medium text-gray-900">#{order.id}</span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                      {formatDate(order.orderDate)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(order.totalAmount || order.total_amount)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
                          order.status || order.orderStatus,
                        )}`}
                      >
                        {getStatusText(order.status || order.orderStatus)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
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
