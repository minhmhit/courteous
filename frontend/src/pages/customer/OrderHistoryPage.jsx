import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Package, CheckCircle, XCircle, Eye, Truck, Clock } from "lucide-react";
import { orderAPI } from "../../services";
import useToastStore from "../../stores/useToastStore";
import SkeletonLoader from "../../components/ui/SkeletonLoader";
import { formatCurrency } from "../../utils/formatDate";

const getStatusConfig = (status) => {
  const normalizedStatus = String(status || "").toUpperCase();
  const configs = {
    PENDING: {
      label: "Chờ thanh toán / xác nhận",
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    SHIPPING: {
      label: "Đang giao hàng",
      icon: Truck,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    COMPLETED: {
      label: "Hoàn tất",
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
    configs[normalizedStatus] || {
      label: "Không xác định",
      icon: Package,
      color: "text-gray-600",
      bg: "bg-gray-50",
    }
  );
};

const getImageSrc = (imageUrl) => {
  if (!imageUrl) {
    return "https://via.placeholder.com/160x160?text=Coffee";
  }

  if (imageUrl.startsWith("http")) {
    return imageUrl;
  }

  return imageUrl.replace(/^\.\//, "/");
};

const OrderHistoryPage = () => {
  const toast = useToastStore();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [toast]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Lịch sử đơn hàng</h1>
            <p className="mt-2 text-sm text-gray-600">
              Hiển thị toàn bộ đơn hàng của bạn theo trạng thái hiện tại.
            </p>
          </div>
          <Link
            to="/profile"
            className="font-medium text-coffee-600 hover:text-coffee-700"
          >
            ← Quay lại
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center shadow-sm">
            <Package className="mx-auto mb-4 h-16 w-16 text-gray-400" />
            <h2 className="mb-2 text-xl font-semibold text-gray-900">
              Bạn chưa có đơn hàng nào
            </h2>
            <p className="mb-6 text-gray-600">
              Các đơn hàng của bạn sẽ hiển thị tại đây khi được tạo thành công.
            </p>
            <Link
              to="/products"
              className="inline-block rounded-lg bg-coffee-600 px-6 py-3 text-white transition-colors hover:bg-coffee-700"
            >
              Khám phá sản phẩm
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusConfig = getStatusConfig(order.status);
              const StatusIcon = statusConfig.icon;
              const items = order.items || [];

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="overflow-hidden rounded-lg bg-white shadow-sm"
                >
                  <div className="border-b border-gray-200 p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">
                          Mã đơn hàng:{" "}
                          <span className="font-mono font-semibold text-gray-900">
                            #{order.id}
                          </span>
                        </p>
                        <p className="mt-1 text-sm text-gray-600">
                          {formatDate(order.orderDate || new Date())}
                        </p>
                      </div>
                      <div
                        className={`flex items-center gap-2 rounded-full px-4 py-2 ${statusConfig.bg}`}
                      >
                        <StatusIcon className={`h-5 w-5 ${statusConfig.color}`} />
                        <span className={`font-semibold ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                      </div>
                    </div>

                    {items.length > 0 ? (
                      <div className="space-y-3">
                        {items.slice(0, 2).map((item, index) => (
                          <div key={index} className="flex items-center gap-4">
                            <img
                              src={getImageSrc(item.imageUrl)}
                              alt={item.name || item.product?.name}
                              className="h-16 w-16 rounded-lg object-cover"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">
                                {item.productName || item.product?.name || "Sản phẩm"}
                              </p>
                              <p className="text-sm text-gray-600">x{item.quantity}</p>
                            </div>
                            <p className="font-semibold text-gray-900">
                              {formatCurrency(
                                Number(item.price || item.unitPrice || 0) *
                                  Number(item.quantity || 0),
                              )}
                            </p>
                          </div>
                        ))}
                        {items.length > 2 && (
                          <p className="text-sm text-gray-600">
                            +{items.length - 2} sản phẩm khác
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        Mở chi tiết đơn hàng để xem đầy đủ sản phẩm trong đơn.
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between bg-gray-50 p-6">
                    <div>
                      <p className="text-sm text-gray-600">Tổng tiền:</p>
                      <p className="text-2xl font-bold text-coffee-600">
                        {formatCurrency(order.totalAmount || 0)}
                      </p>
                    </div>
                    <Link
                      to={`/orders/${order.id}`}
                      className="flex items-center gap-2 rounded-lg bg-coffee-600 px-6 py-3 text-white transition-colors hover:bg-coffee-700"
                    >
                      <Eye className="h-5 w-5" />
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
