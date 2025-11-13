import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  MapPin,
  Phone,
  Mail,
  User,
} from "lucide-react";
import { orderAPI } from "../../services";
import useToastStore from "../../stores/useToastStore";
import SkeletonLoader from "../../components/ui/SkeletonLoader";
import Button from "../../components/ui/Button";
import { formatCurrency } from "../../utils/formatDate";

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToastStore();

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      setIsLoading(true);
      try {
        const response = await orderAPI.getOrderById(id);
        setOrder(response.data || response);
      } catch (error) {
        console.error("Fetch order detail error:", error);
        toast.error("Không thể tải chi tiết đơn hàng");
        navigate("/profile/orders");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetail();
  }, [id, navigate, toast]);

  const handleCancelOrder = async () => {
    if (!window.confirm("Bạn có chắc muốn hủy đơn hàng này?")) return;

    setIsCancelling(true);
    try {
      await orderAPI.cancelOrder(id);
      toast.success("Đã hủy đơn hàng thành công");
      // Refresh order data
      const response = await orderAPI.getOrderById(id);
      setOrder(response.data || response);
    } catch (error) {
      toast.error("Không thể hủy đơn hàng");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleConfirmReceived = async () => {
    if (!window.confirm("Xác nhận bạn đã nhận được hàng?")) return;

    setIsConfirming(true);
    try {
      // Cập nhật trạng thái đơn hàng thành "delivered"
      await orderAPI.updateOrderStatus(id, { status: "delivered" });
      toast.success("Cảm ơn bạn đã xác nhận nhận hàng!");
      // Refresh order data
      const response = await orderAPI.getOrderById(id);
      setOrder(response.data || response);
    } catch (error) {
      toast.error("Không thể xác nhận nhận hàng");
    } finally {
      setIsConfirming(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        label: "Chờ xác nhận",
        icon: Clock,
        color: "text-yellow-600",
        bg: "bg-yellow-50",
      },
      delivered: {
        label: "Đã giao",
        icon: CheckCircle,
        color: "text-green-600",
        bg: "bg-green-50",
      },
      cancelled: {
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

  // Order Status Timeline
  const getTimeline = (status) => {
    const allSteps = [
      { key: "pending", label: "Chờ xác nhận" },
      { key: "confirmed", label: "Đã xác nhận" },
      { key: "shipping", label: "Đang giao hàng" },
      { key: "delivered", label: "Đã giao hàng" },
    ];

    if (status === "cancelled") {
      return [
        { key: "pending", label: "Chờ xác nhận", completed: true },
        { key: "cancelled", label: "Đã hủy", completed: true },
      ];
    }

    const currentIndex = allSteps.findIndex((step) => step.key === status);
    return allSteps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <SkeletonLoader className="h-96" />
        </div>
      </div>
    );
  }

  if (!order) return null;

  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;
  const timeline = getTimeline(order.status);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              to="/profile/orders"
              className="text-coffee-600 hover:text-coffee-700 font-medium mb-2 inline-block"
            >
              ← Quay lại danh sách
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              Chi tiết đơn hàng #{order.id}
            </h1>
          </div>
          <div
            className={`flex items-center gap-2 px-6 py-3 rounded-full ${statusConfig.bg}`}
          >
            <StatusIcon className={`w-6 h-6 ${statusConfig.color}`} />
            <span className={`font-semibold text-lg ${statusConfig.color}`}>
              {statusConfig.label}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Products */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Sản phẩm ({order.items?.length || 0})
              </h2>
              <div className="space-y-4">
                {(order.items || []).map((item, index) => (
                  <div
                    key={index}
                    className="flex gap-4 pb-4 border-b border-gray-200 last:border-0"
                  >
                    <img
                      src={`../.${item.imageUrl}
                        `}
                      alt={item.name || item.product?.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {item.name || item.product?.name || "Sản phẩm"}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Số lượng: {item.quantity}
                      </p>
                      <p className="text-sm text-gray-600">
                        Đơn giá: {formatCurrency(item.unitPrice)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-coffee-600">
                        {formatCurrency(item.unitPrice * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Tóm tắt đơn hàng
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính:</span>
                  <span>{formatCurrency(order.totalAmount || 0)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển:</span>
                  <span className="text-green-600">Miễn phí</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Tổng cộng:</span>
                    <span className="text-coffee-600">
                      {formatCurrency(order.totalAmount || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                {/* Nút Hủy đơn - Chỉ hiện khi đơn hàng đang chờ xác nhận */}
                {order.status === "pending" && (
                  <Button
                    variant="danger"
                    className="w-full"
                    onClick={handleCancelOrder}
                    isLoading={isCancelling}
                  >
                    Hủy đơn hàng
                  </Button>
                )}

                {/* Nút Nhận hàng - Chỉ hiện khi đơn hàng đang giao */}
                {order.status === "shipping" && (
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={handleConfirmReceived}
                    isLoading={isConfirming}
                  >
                    Đã nhận hàng
                  </Button>
                )}

                {/* Hiển thị thông báo cho các trạng thái khác */}
                {order.status === "delivered" && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                    <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <p className="text-green-700 font-medium">
                      Đơn hàng đã hoàn thành
                    </p>
                  </div>
                )}

                {order.status === "cancelled" && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
                    <XCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
                    <p className="text-red-700 font-medium">
                      Đơn hàng đã bị hủy
                    </p>
                  </div>
                )}

                {order.status === "confirmed" && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                    <Package className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-blue-700 font-medium">
                      Đơn hàng đang được chuẩn bị
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Thông tin khách hàng
              </h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Họ tên</p>
                    <p className="font-medium text-gray-900">
                      {order.customerName || "N/A"}
                    </p>
                  </div>
                </div>
                {/* <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Số điện thoại</p>
                    <p className="font-medium text-gray-900">
                      {order.customerPhone || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">
                      {order.customerEmail || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Địa chỉ giao hàng</p>
                    <p className="font-medium text-gray-900">
                      {order.shippingAddress || "N/A"}
                    </p>
                  </div>
                </div> */}
              </div>
            </div>

            {/* Payment Method */}
            {/* <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Thanh toán
              </h2>
              <p className="text-gray-700">
                {order.paymentMethod === "cod"
                  ? "Thanh toán khi nhận hàng (COD)"
                  : "Chuyển khoản ngân hàng"}
              </p>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
