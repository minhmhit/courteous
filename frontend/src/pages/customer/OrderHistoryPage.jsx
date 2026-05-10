import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Store, ChevronRight, Truck, PackageOpen, ShieldCheck } from "lucide-react";
import { orderAPI } from "../../services";
import useToastStore from "../../stores/useToastStore";
import SkeletonLoader from "../../components/ui/SkeletonLoader";
import { formatCurrency } from "../../utils/formatDate";

const getVnpayPaidOrderIds = () => {
  try {
    const raw = JSON.parse(sessionStorage.getItem("vnpay_paid_orders") || "[]");
    return Array.isArray(raw) ? raw.map(Number) : [];
  } catch {
    return [];
  }
};

const getLogicalStatus = (orderStatus, orderId, vnpayPaidIds) => {
  const normalizedStatus = String(orderStatus || "").toUpperCase();
  const orderIdNum = Number(orderId);

  if (normalizedStatus === "COMPLETED") return "COMPLETED";
  if (normalizedStatus === "CANCELLED") return "CANCELLED";
  if (normalizedStatus === "SHIPPING") return "SHIPPING";

  // PENDING + đã thanh toán VNPay → trạng thái riêng "PAID"
  if (normalizedStatus === "PENDING" && vnpayPaidIds.includes(orderIdNum)) {
    return "PAID";
  }

  return "PENDING";
};

const getStatusLabelText = (logicalStatus) => {
  switch (logicalStatus) {
    case "COMPLETED":
      return "HOÀN THÀNH";
    case "PAID":
      return "THANH TOÁN THÀNH CÔNG";
    case "CANCELLED":
      return "ĐÃ HỦY";
    case "SHIPPING":
      return "ĐANG GIAO HÀNG";
    case "PENDING":
      return "CHỜ THANH TOÁN";
    default:
      return logicalStatus;
  }
};

const getImageSrc = (imageUrl) => {
  if (!imageUrl) return "https://via.placeholder.com/160x160?text=Coffee";
  if (imageUrl.startsWith("http")) return imageUrl;
  return imageUrl.replace(/^\.\//, "/");
};

const TABS = [
  { id: "ALL", label: "Tất cả" },
  { id: "PENDING", label: "Chờ thanh toán" },
  { id: "PAID", label: "Đã thanh toán" },
  { id: "SHIPPING", label: "Vận chuyển" },
  { id: "COMPLETED", label: "Hoàn thành" },
  { id: "CANCELLED", label: "Đã hủy" },
];

const OrderHistoryPage = () => {
  const toast = useToastStore();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [vnpayPaidIds, setVnpayPaidIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");

  useEffect(() => {
    setVnpayPaidIds(getVnpayPaidOrderIds());

    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const response = await orderAPI.getUserOrders();
        const ordersList = response.data || response.orders || [];

        if (ordersList.length > 0) {
          const detailResults = await Promise.allSettled(
            ordersList.map((order) => orderAPI.getOrderById(order.id)),
          );

          const detailedOrders = ordersList.map((order, index) => {
            const result = detailResults[index];
            if (result.status === "fulfilled" && result.value) {
              const detailData = result.value.data || result.value;
              return { ...order, items: detailData.items || [] };
            }

            return order;
          });

          setOrders(detailedOrders);
        } else {
          setOrders([]);
        }
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

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const logicalStatus = getLogicalStatus(order.status, order.id, vnpayPaidIds);
      if (activeTab === "ALL") return true;
      return logicalStatus === activeTab;
    });
  }, [orders, activeTab, vnpayPaidIds]);

  if (isLoading) {
    return (
      <div className="py-6 sm:py-8 lg:py-12">
        <div className="container mx-auto px-4 lg:max-w-5xl">
          <div className="space-y-6">
            {[...Array(3)].map((_, index) => (
              <SkeletonLoader key={index} className="h-48 rounded-3xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 sm:py-8 lg:py-12">
      <div className="container mx-auto px-2 sm:px-4 lg:max-w-5xl">
        <div className="mb-6 hidden items-center justify-between sm:flex">
          <h1 className="bg-gradient-to-r from-coffee-600 to-amber-700 bg-clip-text text-3xl font-bold text-transparent">
            Đơn hàng của tôi
          </h1>
          <Link
            to="/profile"
            className="text-sm font-medium text-coffee-600 transition-colors hover:text-coffee-800"
          >
            ← Trở lại hồ sơ
          </Link>
        </div>

        <div className="sticky top-[70px] z-10 mb-6 flex w-full gap-2 overflow-x-auto rounded-2xl border border-white/40 bg-white/40 p-2 shadow-[0_8px_32px_rgba(64,33,12,0.05)] backdrop-blur-xl sm:top-4 hide-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`min-w-[120px] flex-1 whitespace-nowrap rounded-xl py-3 text-center text-sm font-semibold transition-all duration-300 md:text-base ${
                activeTab === tab.id
                  ? "scale-[1.02] bg-coffee-600 text-white shadow-md shadow-coffee-600/20"
                  : "text-gray-700 hover:bg-white/60 hover:text-coffee-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {filteredOrders.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-[32px] border border-white/50 bg-white/40 p-16 text-center shadow-[0_14px_40px_rgba(64,33,12,0.05)] backdrop-blur-xl">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl border border-white bg-white/60 shadow-inner">
              <PackageOpen className="mx-auto block h-12 w-12 text-coffee-300" />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-gray-700">Chưa có đơn hàng</h2>
            <p className="mb-8 max-w-sm text-gray-500">
              Hiện tại bạn chưa có đơn hàng nào trong phân loại này, hãy mua sắm thêm nhé.
            </p>
            <button
              onClick={() => navigate("/products")}
              className="rounded-xl bg-coffee-600 px-8 py-3 font-medium text-white shadow-lg shadow-coffee-600/30 transition-all hover:-translate-y-0.5 hover:bg-coffee-700"
            >
              Khám phá menu
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const logicalStatus = getLogicalStatus(order.status, order.id, vnpayPaidIds);
              const items = order.items || [];
              const isVnpayConfirmed = vnpayPaidIds.includes(Number(order.id));

              return (
                <div
                  key={order.id}
                  className="overflow-hidden rounded-2xl border border-white/50 bg-white/40 shadow-[0_8px_32px_rgba(64,33,12,0.04)] transition-all duration-300 hover:shadow-[0_12px_40px_rgba(64,33,12,0.08)] sm:rounded-[32px] backdrop-blur-xl"
                >
                  <div className="flex items-center justify-between border-b border-white/50 bg-white/30 px-4 py-4 backdrop-blur-md sm:px-8">
                    <div className="flex items-center gap-3">
                      <div className="hidden rounded-lg bg-coffee-100 p-2 text-coffee-600 sm:block">
                        <Store className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                      <span className="text-sm font-bold tracking-tight text-gray-800 sm:text-lg">
                        Courteous Coffee
                      </span>
                      <Link
                        to="/products"
                        className="ml-1 flex items-center gap-0.5 rounded-lg border border-coffee-200 bg-coffee-600/10 px-2 py-1 text-[10px] font-medium text-coffee-700 transition-colors hover:bg-coffee-600 hover:text-white sm:ml-2 sm:text-xs"
                      >
                        Xem Menu <ChevronRight className="h-3 w-3" />
                      </Link>
                      {isVnpayConfirmed && (
                        <span className="ml-1 flex h-[26px] items-center rounded-lg border border-blue-200/50 bg-blue-50/80 px-2 text-[10px] font-medium text-blue-600 shadow-sm backdrop-blur-sm sm:text-xs">
                          VNPay
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs font-bold text-coffee-600 sm:text-sm">
                      {(logicalStatus === "COMPLETED" || logicalStatus === "SHIPPING" || logicalStatus === "PAID") && (
                        <>
                          <Truck className="mr-0.5 hidden h-4 w-4 text-emerald-600 sm:inline" />
                          <span className="mr-1 hidden border-r border-coffee-200/50 pr-3 text-emerald-600 sm:inline">
                            {logicalStatus === "COMPLETED"
                              ? "Giao thành công"
                              : logicalStatus === "PAID"
                              ? "Đã thanh toán"
                              : "Đơn nhận nhanh"}
                          </span>
                        </>
                      )}
                      <span className="uppercase tracking-wider">
                        {getStatusLabelText(logicalStatus)}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white/20">
                    <Link to={`/orders/${order.id}`} className="block">
                      {items.map((item, index) => (
                        <div
                          key={index}
                          className="flex border-b border-white/40 px-4 py-4 transition-colors hover:bg-white/40 sm:px-8"
                        >
                          <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl border-2 border-white/60 bg-white/50 shadow-sm sm:h-24 sm:w-24">
                            <img
                              src={getImageSrc(item.imageUrl)}
                              alt={item.productName || item.product?.name}
                              className="h-full w-full object-cover mix-blend-multiply"
                            />
                          </div>
                          <div className="ml-4 flex flex-1 flex-col justify-center">
                            <div>
                              <div className="line-clamp-2 text-sm font-semibold leading-snug text-gray-900 sm:text-lg">
                                {item.productName || item.product?.name || "Sản phẩm"}
                              </div>
                              <div className="mt-1 text-xs font-medium text-gray-500 opacity-90 sm:mt-1.5 sm:text-sm">
                                Ly Tiêu Chuẩn N/A
                              </div>
                            </div>
                          </div>
                          <div className="ml-4 flex flex-col items-end justify-center">
                            <div className="mb-2 rounded-full border border-coffee-100 bg-coffee-50 px-2 py-0.5 text-xs font-medium text-coffee-800">
                              SL: x{item.quantity}
                            </div>
                            <div className="text-sm font-bold text-coffee-600 sm:text-xl">
                              {formatCurrency(Number(item.price || item.unitPrice || 0))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </Link>
                  </div>

                  <div className="border-t border-white/60 bg-white/40 px-5 py-5 shadow-inner-top backdrop-blur-xl sm:px-8 sm:py-6">
                    <div className="mb-5 flex items-center justify-end sm:mb-6">
                      <span className="mr-3 flex items-center gap-1.5 text-sm font-medium text-gray-600 sm:text-base">
                        <ShieldCheck className="h-5 w-5 text-coffee-600" />
                        Thành tiền:
                      </span>
                      <span className="text-2xl font-black text-coffee-700 drop-shadow-sm sm:text-3xl">
                        {formatCurrency(order.totalAmount || 0)}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-2 sm:justify-end sm:gap-4">
                      <div className="hidden rounded-xl border border-white/60 bg-white/50 px-4 py-2 text-xs font-medium text-gray-500 sm:block sm:text-sm">
                        {logicalStatus === "COMPLETED"
                          ? "Giao hàng thành công"
                          : logicalStatus === "PAID"
                          ? "Thanh toán thành công, chờ xử lý đơn"
                          : logicalStatus === "SHIPPING"
                          ? "Đơn hàng đang được vận chuyển"
                          : logicalStatus === "CANCELLED"
                          ? "Đơn đã bị hủy do thay đổi hoặc lỗi mạng"
                          : "Vui lòng thanh toán hoặc chờ bộ phận xử lý"}
                      </div>
                      <div className="flex flex-wrap gap-2 sm:gap-3">
                        {logicalStatus === "PENDING" && (
                          <button
                            onClick={() => navigate(`/orders/${order.id}`)}
                            className="rounded-xl border border-transparent bg-gradient-to-r from-coffee-600 to-amber-700 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-coffee-600/30 sm:px-6 sm:py-3"
                          >
                            Thanh toán / Hủy
                          </button>
                        )}
                        {(logicalStatus === "COMPLETED" || logicalStatus === "CANCELLED" || logicalStatus === "PAID") && (
                          <button
                            onClick={() => navigate("/products")}
                            className="rounded-xl border border-transparent bg-gradient-to-r from-coffee-600 to-amber-700 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-coffee-600/30 sm:px-6 sm:py-3"
                          >
                            Mua lại
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/orders/${order.id}`)}
                          className="rounded-xl border border-white bg-white/60 px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-sm transition-all hover:bg-white hover:shadow-md sm:px-6 sm:py-3 backdrop-blur-sm"
                        >
                          Xem chi tiết
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistoryPage;
