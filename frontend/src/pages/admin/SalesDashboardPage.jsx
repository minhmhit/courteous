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
  Download,
  FileText,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
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
    Math.floor(today.getMonth() / 3) + 1,
  );
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [ordersData, setOrdersData] = useState([]);
  const [productsData, setProductsData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [profitAnalysis, setProfitAnalysis] = useState({
    chartData: [],
    metrics: {
      avgMargin: 0,
      totalProfit: 0,
      profitGrowth: 0,
      topMonth: null,
    },
  });
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
          (o) => o.status === "COMPLETED" || o.payment_status === "COMPLETED",
        )
        .reduce(
          (sum, order) => sum + Number(order.total || order.totalAmount || 0),
          0,
        );

      const completedOrders = ordersData.filter(
        (o) => o.status === "COMPLETED" || o.orderStatus === "COMPLETED",
      ).length;

      const pendingOrders = ordersData.filter(
        (o) =>
          o.status === "PENDING" ||
          o.orderStatus === "PENDING" ||
          o.status === "PROCESSING" ||
          o.orderStatus === "PROCESSING",
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
              "yyyy-MM-dd",
            );
            return (
              orderDate === dateStr &&
              (order.status === "COMPLETED" ||
                order.payment_status === "COMPLETED")
            );
          })
          .reduce(
            (sum, order) => sum + Number(order.total || order.totalAmount || 0),
            0,
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
      const date = new Date(
        order.orderDate || order.order_date || order.createdAt,
      );
      return !Number.isNaN(date.getTime()) && date >= start && date <= end;
    });

    const costMap = new Map(
      (productsData || []).map((product) => [
        product.id,
        Number(
          product.costPrice || product.cost_price || product.importPrice || 0,
        ),
      ]),
    );

    let missingCost = false;

    const calcOrderMetrics = (order) => {
      const items =
        order.items ||
        order.orderItems ||
        order.details ||
        order.order_details ||
        [];
      if (!Array.isArray(items) || items.length === 0) {
        const quantity =
          Number(
            order.totalQuantity || order.total_items || order.quantity || 0,
          ) || 0;
        const revenue = Number(order.total || order.totalAmount || 0);
        return { quantity, revenue, profit: revenue };
      }

      return items.reduce(
        (acc, item) => {
          const quantity = Number(item.quantity || item.qty || 0);
          const unitPrice = Number(
            item.unitPrice || item.unit_price || item.price || 0,
          );
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
        { quantity: 0, revenue: 0, profit: 0 },
      );
    };

    const rows = buckets.map((bucket) => {
      const bucketOrders = ordersInRange.filter((order) => {
        const date = new Date(
          order.orderDate || order.order_date || order.createdAt,
        );
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
        { quantity: 0, revenue: 0, profit: 0 },
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
      { totalQuantity: 0, totalRevenue: 0, totalProfit: 0 },
    );

    return { rows, summary, missingCost };
  }, [
    ordersData,
    productsData,
    reportType,
    selectedMonth,
    selectedQuarter,
    selectedYear,
  ]);

  // Calculate profit analysis metrics
  useEffect(() => {
    const calculateProfitAnalysis = () => {
      if (!reportMetrics.rows || reportMetrics.rows.length === 0) {
        setProfitAnalysis({
          chartData: [],
          metrics: {
            avgMargin: 0,
            totalProfit: 0,
            profitGrowth: 0,
            topMonth: null,
          },
        });
        return;
      }

      const chartData = reportMetrics.rows.map((row) => ({
        label: row.label,
        profit: Math.round(row.profit),
        revenue: Math.round(row.revenue),
        margin:
          row.revenue > 0 ? Math.round((row.profit / row.revenue) * 100) : 0,
      }));

      const totalProfit = reportMetrics.summary.totalProfit;
      const totalRevenue = reportMetrics.summary.totalRevenue;
      const avgMargin =
        totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

      // Calculate profit growth (compare first period with last)
      const profitGrowth =
        chartData.length > 1
          ? ((chartData[chartData.length - 1].profit - chartData[0].profit) /
              (chartData[0].profit || 1)) *
            100
          : 0;

      // Find top month by profit
      const topMonth =
        chartData.length > 0
          ? chartData.reduce((max, item) =>
              item.profit > max.profit ? item : max,
            )
          : null;

      setProfitAnalysis({
        chartData,
        metrics: {
          avgMargin: Math.round(avgMargin),
          totalProfit: Math.round(totalProfit),
          profitGrowth: Math.round(profitGrowth),
          topMonth: topMonth?.label || null,
        },
      });
    };

    calculateProfitAnalysis();
  }, [reportMetrics]);

  const yearOptions = Array.from(
    { length: 6 },
    (_, idx) => currentYear - 3 + idx,
  );

  const reportLabel = useMemo(() => {
    if (reportType === "month") return `tháng-${selectedMonth}`;
    if (reportType === "quarter")
      return `quý-${selectedQuarter}-${selectedYear}`;
    return `năm-${selectedYear}`;
  }, [reportType, selectedMonth, selectedQuarter, selectedYear]);

  const handleExportCSV = useCallback(() => {
    try {
      const headers = ["Kỳ", "Số_lượng_xuất", "Doanh_thu", "Lợi_nhuận"];
      const rows = reportMetrics.rows.map((row) => [
        row.label,
        row.quantity,
        Math.round(row.revenue),
        Math.round(row.profit),
      ]);

      rows.push([
        "Tong",
        reportMetrics.summary.totalQuantity,
        Math.round(reportMetrics.summary.totalRevenue),
        Math.round(reportMetrics.summary.totalProfit),
      ]);

      const escapeCell = (cell) => {
        const value = String(cell ?? "");
        if (
          value.includes(",") ||
          value.includes('"') ||
          value.includes("\n")
        ) {
          return `"${value.replace(/\"/g, '""')}"`;
        }
        return value;
      };

      const csvContent = [headers, ...rows]
        .map((line) => line.map(escapeCell).join(","))
        .join("\n");

      const blob = new Blob([`\uFEFF${csvContent}`], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `bao-cao-xuat-hang-${reportLabel}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Đã xuất báo cáo CSV");
    } catch (error) {
      console.error("Export CSV error:", error);
      toast.error("Không thể xuất CSV");
    }
  }, [reportLabel, reportMetrics, toast]);

  const handleExportPDF = useCallback(() => {
    try {
      const rowsHtml = reportMetrics.rows
        .map(
          (row) => `
            <tr>
              <td>${row.label}</td>
              <td style="text-align:right">${row.quantity.toLocaleString("vi-VN")}</td>
              <td style="text-align:right">${Math.round(row.revenue).toLocaleString("vi-VN")} d</td>
              <td style="text-align:right">${Math.round(row.profit).toLocaleString("vi-VN")} d</td>
            </tr>
          `,
        )
        .join("");

      const periodText =
        reportType === "month"
          ? `Tháng ${selectedMonth}`
          : reportType === "quarter"
            ? `Quý ${selectedQuarter} - ${selectedYear}`
            : `Năm ${selectedYear}`;

      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        toast.error("Trình duyệt chặn cửa sổ in PDF");
        return;
      }

      printWindow.document.write(`
        <html>
          <head>
            <meta charset="UTF-8" />
            <title>Báo cáo xuất hàng ${periodText}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
              h1 { margin: 0 0 8px; }
              .meta { margin-bottom: 16px; color: #4b5563; font-size: 14px; }
              table { width: 100%; border-collapse: collapse; margin-top: 12px; }
              th, td { border: 1px solid #d1d5db; padding: 10px; font-size: 14px; }
              th { background: #f9fafb; text-transform: uppercase; font-size: 12px; }
              .summary { margin-top: 16px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
              .card { border: 1px solid #d1d5db; border-radius: 8px; padding: 10px; }
              .card-label { font-size: 12px; color: #6b7280; }
              .card-value { font-weight: bold; margin-top: 4px; }
            </style>
          </head>
          <body>
            <h1>Báo cáo xuất hàng</h1>
            <div class="meta">Kỳ báo cáo: ${periodText}</div>

            <table>
              <thead>
                <tr>
                  <th>Ky</th>
                  <th>Số lượng xuất</th>
                  <th>Doanh thu</th>
                  <th>Lợi nhuận</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
                <tr>
                  <td><b>Tong</b></td>
                  <td style="text-align:right"><b>${reportMetrics.summary.totalQuantity.toLocaleString("vi-VN")}</b></td>
                  <td style="text-align:right"><b>${Math.round(reportMetrics.summary.totalRevenue).toLocaleString("vi-VN")} d</b></td>
                  <td style="text-align:right"><b>${Math.round(reportMetrics.summary.totalProfit).toLocaleString("vi-VN")} d</b></td>
                </tr>
              </tbody>
            </table>

            <div class="summary">
              <div class="card">
                <div class="card-label">Tổng số lượng xuất</div>
                <div class="card-value">${reportMetrics.summary.totalQuantity.toLocaleString("vi-VN")}</div>
              </div>
              <div class="card">
                <div class="card-label">Tổng doanh thu</div>
                <div class="card-value">${Math.round(reportMetrics.summary.totalRevenue).toLocaleString("vi-VN")} d</div>
              </div>
              <div class="card">
                <div class="card-label">Tổng lợi nhuận</div>
                <div class="card-value">${Math.round(reportMetrics.summary.totalProfit).toLocaleString("vi-VN")} d</div>
              </div>
            </div>
            <script>window.print();<\/script>
          </body>
        </html>
      `);
      printWindow.document.close();
      toast.success("Đã mở mẫu in PDF");
    } catch (error) {
      console.error("Export PDF error:", error);
      toast.error("Không thể xuất PDF");
    }
  }, [
    reportMetrics,
    reportType,
    selectedMonth,
    selectedQuarter,
    selectedYear,
    toast,
  ]);

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
                        "text-",
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
            <h2 className="text-xl font-bold text-gray-900">
              Báo cáo xuất hàng
            </h2>
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
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Download className="h-4 w-4" />
              Xuất CSV
            </button>
            <button
              type="button"
              onClick={handleExportPDF}
              className="inline-flex items-center gap-2 rounded-lg border border-coffee-600 bg-coffee-600 px-3 py-2 text-sm font-medium text-white hover:bg-coffee-700"
            >
              <FileText className="h-4 w-4" />
              Xuất PDF
            </button>
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
            Lưu ý: Một số sản phẩm chưa có giá nhập, lợi nhuận được tính tạm
            theo doanh thu.
          </p>
        )}

        {/* Profit Analysis Section */}
        <div className="mt-6 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📊 Phân tích lợi nhuận
            </h3>

            {/* Profit Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              <div className="rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 p-4">
                <p className="text-xs text-emerald-700 font-medium">
                  Tổng lợi nhuận
                </p>
                <p className="text-2xl font-bold text-emerald-900 mt-1">
                  {formatCurrency(profitAnalysis.metrics.totalProfit)}
                </p>
              </div>
              <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-4">
                <p className="text-xs text-blue-700 font-medium">
                  Lợi nhuận bình quân (%)
                </p>
                <p className="text-2xl font-bold text-blue-900 mt-1">
                  {profitAnalysis.metrics.avgMargin}%
                </p>
              </div>
              <div
                className={`rounded-lg border p-4 ${
                  profitAnalysis.metrics.profitGrowth >= 0
                    ? "bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200"
                    : "bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200"
                }`}
              >
                <p
                  className={`text-xs font-medium ${
                    profitAnalysis.metrics.profitGrowth >= 0
                      ? "text-cyan-700"
                      : "text-orange-700"
                  }`}
                >
                  Thay đổi lợi nhuận (%)
                </p>
                <p
                  className={`text-2xl font-bold mt-1 ${
                    profitAnalysis.metrics.profitGrowth >= 0
                      ? "text-cyan-900"
                      : "text-orange-900"
                  }`}
                >
                  {profitAnalysis.metrics.profitGrowth > 0 ? "+" : ""}
                  {profitAnalysis.metrics.profitGrowth}%
                </p>
              </div>
              <div className="rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 p-4">
                <p className="text-xs text-purple-700 font-medium">
                  Kỳ lợi nhuận cao nhất
                </p>
                <p className="text-2xl font-bold text-purple-900 mt-1 truncate">
                  {profitAnalysis.metrics.topMonth || "N/A"}
                </p>
              </div>
            </div>

            {/* Profit Trend Chart */}
            {profitAnalysis.chartData.length > 0 && (
              <div className="rounded-lg border border-gray-100 bg-white p-4 mt-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">
                  Xu hướng lợi nhuận
                </h4>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={profitAnalysis.chartData}
                    margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="label" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                      formatter={(value) => [
                        formatCurrency(value),
                        "Lợi nhuận",
                      ]}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="profit"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ fill: "#10b981" }}
                      name="Lợi nhuận"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Profit vs Revenue Comparison */}
            {profitAnalysis.chartData.length > 0 && (
              <div className="rounded-lg border border-gray-100 bg-white p-4 mt-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">
                  So sánh doanh thu & lợi nhuận
                </h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={profitAnalysis.chartData}
                    margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="label" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                      formatter={(value) => formatCurrency(value)}
                    />
                    <Legend />
                    <Bar dataKey="revenue" fill="#3b82f6" name="Doanh thu" />
                    <Bar dataKey="profit" fill="#10b981" name="Lợi nhuận" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Margin Percentage Chart */}
            {profitAnalysis.chartData.length > 0 && (
              <div className="rounded-lg border border-gray-100 bg-white p-4 mt-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">
                  Tỷ suất lợi nhuận (%)
                </h4>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={profitAnalysis.chartData}
                    margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="label" stroke="#6b7280" />
                    <YAxis
                      stroke="#6b7280"
                      label={{ value: "%", angle: -90, position: "insideLeft" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                      formatter={(value) => `${value}%`}
                    />
                    <Bar dataKey="margin" fill="#8b5cf6" name="Tỷ suất (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

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
                  Doanh thu
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Lợi nhuận
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
