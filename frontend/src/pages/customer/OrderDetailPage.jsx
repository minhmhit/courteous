import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  User,
  CreditCard,
} from "lucide-react";
import { orderAPI, paymentAPI } from "../../services";
import useToastStore from "../../stores/useToastStore";
import SkeletonLoader from "../../components/ui/SkeletonLoader";
import Button from "../../components/ui/Button";
import { formatCurrency } from "../../utils/formatDate";

const getVnpayPaidOrderIds = () => {
  try {
    const raw = JSON.parse(sessionStorage.getItem("vnpay_paid_orders") || "[]");
    return Array.isArray(raw) ? raw.map(Number) : [];
  } catch {
    return [];
  }
};

const getDisplayConfig = (orderId, orderStatus, paymentStatus, vnpayPaidIds) => {
  const normalizedOrderStatus = String(orderStatus || "").toUpperCase();
  const normalizedPaymentStatus = String(paymentStatus || "").toUpperCase();

  if (normalizedPaymentStatus === "SUCCESS" || normalizedOrderStatus === "COMPLETED") {
    return {
      label: "Thanh toán thành công",
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-50",
    };
  }

  if (normalizedPaymentStatus === "FAILED" || normalizedOrderStatus === "CANCELLED") {
    return {
      label: "Đã hủy đơn",
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50",
    };
  }

  if (normalizedOrderStatus === "SHIPPING") {
    return {
      label: "Đang giao hàng",
      icon: Truck,
      color: "text-blue-600",
      bg: "bg-blue-50",
    };
  }

  if (normalizedOrderStatus === "PENDING" && vnpayPaidIds.includes(Number(orderId))) {
    return {
      label: "Thanh toán thành công",
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-50",
    };
  }

  return {
    label: "Chờ thanh toán",
    icon: Clock,
    color: "text-yellow-600",
    bg: "bg-yellow-50",
  };
};

const getTimeline = (orderId, orderStatus, paymentStatus, vnpayPaidIds) => {
  const normalizedOrderStatus = String(orderStatus || "").toUpperCase();
  const normalizedPaymentStatus = String(paymentStatus || "").toUpperCase();
  const orderIdNum = Number(orderId);

  const isSuccess =
    normalizedPaymentStatus === "SUCCESS" ||
    normalizedOrderStatus === "COMPLETED" ||
    (normalizedOrderStatus === "PENDING" && vnpayPaidIds.includes(orderIdNum));

  const isCancelled =
    normalizedPaymentStatus === "FAILED" || normalizedOrderStatus === "CANCELLED";

  if (isCancelled) {
    return [
      { key: "PENDING", label: "Chờ xử lý", completed: true },
      { key: "CANCELLED", label: "Đã hủy đơn", completed: true },
    ];
  }

  const allSteps = [
    { key: "PENDING", label: "Chờ xử lý" },
    { key: "PAID", label: "Thanh toán thành công" },
    { key: "SHIPPING", label: "Đang giao hàng" },
  ];

  let currentStep = "PENDING";
  if (isSuccess) currentStep = "PAID";
  if (normalizedOrderStatus === "SHIPPING") currentStep = "SHIPPING";

  const stepOrder = ["PENDING", "PAID", "SHIPPING"];
  const currentIndex = stepOrder.indexOf(currentStep);

  return allSteps.map((step, index) => ({
    ...step,
    completed: index <= currentIndex,
  }));
};

const getImageSrc = (imageUrl) => {
  if (!imageUrl) return "https://via.placeholder.com/160x160?text=Coffee";
  if (imageUrl.startsWith("http")) return imageUrl;
  return imageUrl.replace(/^\.\//, "/");
};

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToastStore();

  const [order, setOrder] = useState(null);
  const [payment, setPayment] = useState(null);
  const [vnpayPaidIds, setVnpayPaidIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const fetchPayment = async (orderId) => {
    try {
      const response = await paymentAPI.getOrderPayment(orderId);
      const paymentData = response?.data ?? response;

      if (paymentData && typeof paymentData === "object" && "status" in paymentData) {
        setPayment(paymentData);
      } else {
        setPayment(null);
      }
    } catch {
      setPayment(null);
    }
  };

  useEffect(() => {
    setVnpayPaidIds(getVnpayPaidOrderIds());

    const fetchOrderDetail = async () => {
      setIsLoading(true);
      try {
        const response = await orderAPI.getOrderById(id);
        const orderData = response.data || response;
        setOrder(orderData);
        await fetchPayment(id);
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

  const refreshOrder = async () => {
    const response = await orderAPI.getOrderById(id);
    setOrder(response.data || response);
    await fetchPayment(id);
  };

  const handleCancelOrder = async () => {
    if (!window.confirm("Bạn có chắc muốn hủy đơn hàng này?")) return;

    setIsCancelling(true);
    try {
      await orderAPI.cancelOrder(id);
      toast.success("Đã hủy đơn hàng thành công");
      await refreshOrder();
    } catch {
      toast.error("Không thể hủy đơn hàng");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleConfirmReceived = async () => {
    if (!window.confirm("Xác nhận bạn đã nhận được hàng?")) return;

    setIsConfirming(true);
    try {
      await orderAPI.updateOrderStatus(id, "COMPLETED");
      toast.success("Cảm ơn bạn đã xác nhận nhận hàng!");
      await refreshOrder();
    } catch {
      toast.error("Không thể xác nhận nhận hàng");
    } finally {
      setIsConfirming(false);
    }
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

  const orderId = order.id ?? parseInt(id, 10);
  const paymentStatus = payment?.status ?? null;
  const displayConfig = getDisplayConfig(orderId, order.status, paymentStatus, vnpayPaidIds);
  const DisplayIcon = displayConfig.icon;
  const timeline = getTimeline(orderId, order.status, paymentStatus, vnpayPaidIds);

  const normalizedOrderStatus = String(order.status || "").toUpperCase();
  const normalizedPaymentStatus = String(paymentStatus || "").toUpperCase();

  const isSuccess =
    normalizedPaymentStatus === "SUCCESS" ||
    normalizedOrderStatus === "COMPLETED" ||
    (normalizedOrderStatus === "PENDING" && vnpayPaidIds.includes(orderId));

  const isCancelled =
    normalizedPaymentStatus === "FAILED" || normalizedOrderStatus === "CANCELLED";
  const isShipping = normalizedOrderStatus === "SHIPPING";
  const isPending = normalizedOrderStatus === "PENDING" && !isSuccess;

  const isVnpay =
    payment?.paymentMethod?.code === "VNPAY" ||
    payment?.ewalletDetails?.provider === "VNPAY" ||
    vnpayPaidIds.includes(orderId);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link
              to="/profile/orders"
              className="mb-2 inline-block font-medium text-coffee-600 hover:text-coffee-700"
            >
              ← Quay lại danh sách
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Chi tiết đơn hàng #{orderId}</h1>
            <p className="mt-2 text-sm text-gray-500">
              {formatDate(order.orderDate || order.createdAt || new Date())}
            </p>
          </div>
          <div className={`flex items-center gap-2 rounded-full px-6 py-3 ${displayConfig.bg}`}>
            <DisplayIcon className={`h-6 w-6 ${displayConfig.color}`} />
            <span className={`text-lg font-semibold ${displayConfig.color}`}>
              {displayConfig.label}
            </span>
          </div>
        </div>

        <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-gray-900">Tiến trình đơn hàng</h2>
          <div
            className={`grid gap-3 ${
              timeline.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3"
            }`}
          >
            {timeline.map((step) => (
              <div
                key={step.key}
                className={`rounded-lg border p-4 ${
                  step.completed
                    ? "border-coffee-300 bg-coffee-50"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                <p className="text-sm font-semibold text-gray-900">{step.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-xl font-bold text-gray-900">
                Sản phẩm ({order.items?.length || 0})
              </h2>
              <div className="space-y-4">
                {(order.items || []).map((item, index) => (
                  <div
                    key={index}
                    className="flex gap-4 border-b border-gray-200 pb-4 last:border-0"
                  >
                    <img
                      src={getImageSrc(item.imageUrl)}
                      alt={item.productName || item.product?.name}
                      className="h-20 w-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {item.productName || item.product?.name || "Sản phẩm"}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600">Số lượng: {item.quantity}</p>
                      <p className="text-sm text-gray-600">
                        Đơn giá: {formatCurrency(item.unitPrice || item.price || 0)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-coffee-600">
                        {formatCurrency(
                          Number(item.unitPrice || item.price || 0) * Number(item.quantity || 0),
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-1">
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-bold text-gray-900">Tóm tắt đơn hàng</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính:</span>
                  <span>{formatCurrency(order.totalAmount || 0)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển:</span>
                  <span className="text-green-600">Miễn phí</span>
                </div>
                {(payment?.paymentMethod?.name || isVnpay) && (
                  <div className="flex items-center justify-between text-gray-600">
                    <span>Thanh toán:</span>
                    <span className="flex items-center gap-1 font-medium">
                      {isVnpay && <CreditCard className="h-4 w-4 text-blue-600" />}
                      {payment?.paymentMethod?.name || "VNPay"}
                    </span>
                  </div>
                )}
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
                {isPending && (
                  <Button
                    variant="danger"
                    className="w-full"
                    onClick={handleCancelOrder}
                    isLoading={isCancelling}
                  >
                    Hủy đơn hàng
                  </Button>
                )}

                {isShipping && (
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={handleConfirmReceived}
                    isLoading={isConfirming}
                  >
                    Đã nhận hàng
                  </Button>
                )}

                {isSuccess && (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
                    <CheckCircle className="mx-auto mb-2 h-6 w-6 text-green-600" />
                    <p className="font-medium text-green-700">Thanh toán thành công</p>
                  </div>
                )}

                {isCancelled && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
                    <XCircle className="mx-auto mb-2 h-6 w-6 text-red-600" />
                    <p className="font-medium text-red-700">Đơn hàng đã bị hủy</p>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-bold text-gray-900">Thông tin khách hàng</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <User className="mt-0.5 h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Họ tên</p>
                    <p className="font-medium text-gray-900">{order.customerName || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Package className="mt-0.5 h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Địa chỉ giao hàng</p>
                    <p className="font-medium text-gray-900">{order.shipAddress || "N/A"}</p>
                  </div>
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
