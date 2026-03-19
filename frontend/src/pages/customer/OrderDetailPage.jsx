import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  User,
} from "lucide-react";
import { orderAPI } from "../../services";
import useToastStore from "../../stores/useToastStore";
import SkeletonLoader from "../../components/ui/SkeletonLoader";
import Button from "../../components/ui/Button";
import { formatCurrency } from "../../utils/formatDate";

const statusConfigs = {
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
  SHIPPING: {
    label: "Đang giao hàng",
    icon: Package,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
};

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToastStore();

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      setIsLoading(true);
      try {
        const response = await orderAPI.getOrderById(id);
        setOrder(response.data || null);
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
      const response = await orderAPI.cancelOrder(id);
      setOrder(response.data || null);
      toast.success("Đã hủy đơn hàng thành công");
    } catch (error) {
      toast.error(error.message || "Không thể hủy đơn hàng");
    } finally {
      setIsCancelling(false);
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

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

  const statusConfig =
    statusConfigs[order.status] || statusConfigs.PENDING;
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
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
          <div className="lg:col-span-2 space-y-6">
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
                      src={`../.${item.imageUrl}`}
                      alt={item.productName}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {item.productName || "Sản phẩm"}
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

          <div className="lg:col-span-1 space-y-6">
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

              <div className="mt-6 space-y-3">
                {order.status === "PENDING" && (
                  <Button
                    variant="danger"
                    className="w-full"
                    onClick={handleCancelOrder}
                    isLoading={isCancelling}
                  >
                    Hủy đơn hàng
                  </Button>
                )}

                {order.status === "COMPLETED" && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                    <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <p className="text-green-700 font-medium">
                      Đơn hàng đã hoàn thành
                    </p>
                  </div>
                )}

                {order.status === "CANCELLED" && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
                    <XCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
                    <p className="text-red-700 font-medium">
                      Đơn hàng đã bị hủy
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Thông tin đơn
              </h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Khách hàng</p>
                    <p className="font-medium text-gray-900">
                      {order.customerName || "N/A"}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Địa chỉ giao hàng</p>
                  <p className="font-medium text-gray-900">
                    {order.shipAddress || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Số điện thoại</p>
                  <p className="font-medium text-gray-900">
                    {order.phoneNumber || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Thời gian đặt</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(order.orderDate)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
