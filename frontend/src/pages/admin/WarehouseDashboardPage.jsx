import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Package,
  TrendingUp,
  AlertTriangle,
  TruckIcon,
  ArrowRight,
  CheckCircle,
  Clock,
} from "lucide-react";
import { inventoryAPI, importAPI, productAPI } from "../../services";
import useToastStore from "../../stores/useToastStore";
import { formatDate } from "../../utils/formatDate";

const WarehouseDashboardPage = () => {
  const toast = useToastStore();
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockCount: 0,
    totalInventory: 0,
    recentImports: 0,
  });
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [recentImports, setRecentImports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [inventoryRes, lowStockRes, importsRes, productsRes] =
        await Promise.all([
          inventoryAPI.getAllInventory(1, 100).catch(() => ({ data: [] })),
          inventoryAPI.getLowStockProducts(20).catch(() => ({ data: [] })),
          importAPI.getAllImports(1, 10).catch(() => ({ data: [] })),
          productAPI.getAllProducts().catch(() => ({ data: [] })),
        ]);

      // Normalize data
      const inventoryData = Array.isArray(inventoryRes.data)
        ? inventoryRes.data
        : inventoryRes.data?.inventory || [];

      const lowStockData = Array.isArray(lowStockRes.data)
        ? lowStockRes.data
        : lowStockRes.data?.products || [];

      const importsData = Array.isArray(importsRes.data)
        ? importsRes.data
        : importsRes.data?.imports || [];

      const productsData = Array.isArray(productsRes.data)
        ? productsRes.data
        : productsRes.data?.products || [];

      // Calculate stats
      const totalInventory = inventoryData.reduce(
        (sum, item) => sum + (item.quantity || 0),
        0
      );

      setStats({
        totalProducts: productsData.length,
        lowStockCount: lowStockData.length,
        totalInventory,
        recentImports: importsData.length,
      });

      setLowStockProducts(lowStockData.slice(0, 5));
      setRecentImports(importsData.slice(0, 5));
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
      title: "Tổng Sản Phẩm",
      value: stats.totalProducts,
      icon: Package,
      color: "bg-blue-500",
      link: "/admin/products",
    },
    {
      title: "Tổng Tồn Kho",
      value: stats.totalInventory,
      icon: TrendingUp,
      color: "bg-green-500",
      link: "/admin/warehouse",
    },
    {
      title: "Sắp Hết Hàng",
      value: stats.lowStockCount,
      icon: AlertTriangle,
      color: "bg-red-500",
      link: "/admin/warehouse",
    },
    {
      title: "Phiếu Nhập Gần Đây",
      value: stats.recentImports,
      icon: TruckIcon,
      color: "bg-purple-500",
      link: "/admin/warehouse",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard Quản Lý Kho
        </h1>
        <p className="text-gray-600 mt-1">
          Tổng quan tình trạng kho hàng và nhập hàng
        </p>
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
        {/* Low Stock Products */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Sản Phẩm Sắp Hết
              </h2>
              <Link
                to="/admin/warehouse"
                className="text-sm text-coffee-600 hover:text-coffee-700 font-medium"
              >
                Xem tất cả →
              </Link>
            </div>
          </div>
          <div className="p-6">
            {lowStockProducts.length > 0 ? (
              <div className="space-y-3">
                {lowStockProducts.map((product, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200"
                  >
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <div>
                        <p className="font-medium text-gray-900">
                          Sản phẩm #{product.productId || product.id}
                        </p>
                        <p className="text-sm text-gray-600">
                          Còn {product.quantity || 0} sản phẩm
                        </p>
                      </div>
                    </div>
                    <Link to="/admin/warehouse">
                      <button className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">
                        Nhập hàng
                      </button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                Tất cả sản phẩm đều đủ hàng
              </p>
            )}
          </div>
        </div>

        {/* Recent Imports */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Phiếu Nhập Gần Đây
              </h2>
              <Link
                to="/admin/warehouse"
                className="text-sm text-coffee-600 hover:text-coffee-700 font-medium"
              >
                Xem tất cả →
              </Link>
            </div>
          </div>
          <div className="p-6">
            {recentImports.length > 0 ? (
              <div className="space-y-3">
                {recentImports.map((importItem, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <TruckIcon className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-gray-900">
                          Phiếu #{importItem.id}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatDate(
                            importItem.createdAt || importItem.created_at
                          )}
                        </p>
                      </div>
                    </div>
                    {importItem.paymentStatus === "PAID" ||
                    importItem.payment_status === "PAID" ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <Clock className="w-5 h-5 text-yellow-600" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                Chưa có phiếu nhập nào
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
            to="/admin/warehouse"
            className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 transition-all"
          >
            <TruckIcon className="w-8 h-8 mb-2" />
            <h3 className="font-semibold">Tạo Phiếu Nhập</h3>
            <p className="text-sm text-white text-opacity-80">
              Nhập hàng mới vào kho
            </p>
          </Link>
          <Link
            to="/admin/products"
            className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 transition-all"
          >
            <Package className="w-8 h-8 mb-2" />
            <h3 className="font-semibold">Quản Lý Sản Phẩm</h3>
            <p className="text-sm text-white text-opacity-80">
              Xem và cập nhật sản phẩm
            </p>
          </Link>
          <Link
            to="/admin/warehouse"
            className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 transition-all"
          >
            <AlertTriangle className="w-8 h-8 mb-2" />
            <h3 className="font-semibold">Kiểm Tra Tồn Kho</h3>
            <p className="text-sm text-white text-opacity-80">
              Xem hàng sắp hết
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default WarehouseDashboardPage;
