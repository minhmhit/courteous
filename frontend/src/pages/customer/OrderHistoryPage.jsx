import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Package, Clock, CheckCircle, XCircle, Truck, Eye } from "lucide-react";
import { orderAPI } from "../../services";
import useToastStore from "../../stores/useToastStore";
import SkeletonLoader from "../../components/ui/SkeletonLoader";
import { formatCurrency } from "../../utils/formatDate";

const OrderHistoryPage = () => {
  const toast = useToastStore();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const response = await orderAPI.getUserOrders();
        const ordersList = response.data || response.orders || [];
        setOrders(ordersList);
      } catch (error) {
        console.error("Fetch orders error:", error);
        toast.error("Không thể tải danh sách đơn hàng");
        setOrders([]); // Set empty if error
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [toast]);

  const getStatusConfig = (status) => {
    const configs = {
      PENDING: {
        label: "Chờ xác nhận",
        icon: Clock,
        color: "text-yellow-600",
        bg: "bg-yellow-50",
      },
      COMPLETED: {
        label: "Đã giao",
        icon: CheckCircle,
        color: "text-green-600",
        bg: "bg-green-50",
      },
      CANCELLED: {
        label: "Đã hủy",
        icon: XCircle,
        color: "text-red-600",
        bg: "bg-red-50",
      },
    };
    return (
      configs[status] || {
        label: "Không xác định",
        icon: Package,
        color: "text-gray-600",
        bg: "bg-gray-50",
      }
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredOrders =
    filterStatus === "all"
      ? orders
      : orders.filter((order) => order.status === filterStatus);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <SkeletonLoader key={i} className="h-48" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Lịch sử đơn hàng</h1>
          <Link
            to="/profile"
            className="text-coffee-600 hover:text-coffee-700 font-medium"
          >
            ← Quay lại
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex gap-2 overflow-x-auto">
            {[
              { value: "all", label: "Tất cả" },
              { value: "pending", label: "Chờ xác nhận" },
              
              { value: "delivered", label: "Đã giao" },
              { value: "cancelled", label: "Đã hủy" },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setFilterStatus(filter.value)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  filterStatus === filter.value
                    ? "bg-coffee-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Chưa có đơn hàng
            </h2>
            <p className="text-gray-600 mb-6">
              Bạn chưa có đơn hàng nào trong danh sách này
            </p>
            <Link
              to="/products"
              className="inline-block px-6 py-3 bg-coffee-600 text-white rounded-lg hover:bg-coffee-700 transition-colors"
            >
              Khám phá sản phẩm
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const statusConfig = getStatusConfig(order.status);
              const StatusIcon = statusConfig.icon;

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-sm overflow-hidden"
                >
                  {/* Order Header */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-600">
                          Mã đơn hàng:{" "}
                          <span className="font-mono font-semibold text-gray-900">
                            #{order.id}
                          </span>
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {formatDate(order.orderDate || new Date())}
                        </p>
                      </div>
                      <div
                        className={`flex items-center gap-2 px-4 py-2 rounded-full ${statusConfig.bg}`}
                      >
                        <StatusIcon
                          className={`w-5 h-5 ${statusConfig.color}`}
                        />
                        <span className={`font-semibold ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                      </div>
                    </div>

                    {/* Order Items Preview */}
                    <div className="space-y-3">
                      {(order.items || []).slice(0, 2).map((item, index) => (
                        <div key={index} className="flex items-center gap-4">
                          <img
                            src={
                              `../.${item.imageUrl}`
                            }
                            alt={item.name || item.product?.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {item.name || item.product?.name || "Sản phẩm"}
                            </p>
                            <p className="text-sm text-gray-600">
                              x{item.quantity}
                            </p>
                          </div>
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(item.price * item.quantity)}
                          </p>
                        </div>
                      ))}
                      {(order.items?.length || 0) > 2 && (
                        <p className="text-sm text-gray-600">
                          +{order.items.length - 2} sản phẩm khác
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Order Footer */}
                  <div className="p-6 bg-gray-50 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Tổng tiền:</p>
                      <p className="text-2xl font-bold text-coffee-600">
                        {formatCurrency(order.totalAmount || 0)}
                      </p>
                    </div>
                    <Link
                      to={`/orders/${order.id}`}
                      className="flex items-center gap-2 px-6 py-3 bg-coffee-600 text-white rounded-lg hover:bg-coffee-700 transition-colors"
                    >
                      <Eye className="w-5 h-5" />
                      <span>Xem chi tiết</span>
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistoryPage;
