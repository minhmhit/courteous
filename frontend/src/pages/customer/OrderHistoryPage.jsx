import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Store, ChevronRight, Truck, PackageOpen, ShieldCheck } from "lucide-react";
import { orderAPI } from "../../services";
import useToastStore from "../../stores/useToastStore";
import SkeletonLoader from "../../components/ui/SkeletonLoader";
import { formatCurrency } from "../../utils/formatDate";

/**
 * Đọc danh sách orderId đã được VNPay confirm success từ sessionStorage.
 * Được lưu bởi VnpayReturnPage khi verifyResult.success = true.
 */
const getVnpayPaidOrderIds = () => {
  try {
    const raw = JSON.parse(sessionStorage.getItem("vnpay_paid_orders") || "[]");
    return Array.isArray(raw) ? raw.map(Number) : [];
  } catch {
    return [];
  }
};

/**
 * Xác định trạng thái logic của đơn hàng
 */
const getLogicalStatus = (orderStatus, orderId, vnpayPaidIds) => {
  const oStatus = String(orderStatus || "").toUpperCase();
  const orderIdNum = Number(orderId);

  // VNPay confirm success (local) hoặc IPN success
  if (oStatus === "COMPLETED" || (oStatus === "PENDING" && vnpayPaidIds.includes(orderIdNum))) {
    return "COMPLETED";
  }
  if (oStatus === "CANCELLED") return "CANCELLED";
  if (oStatus === "SHIPPING") return "SHIPPING";
  return "PENDING";
};

/**
 * Trả về text trạng thái
 */
const getStatusLabelText = (logicalStatus) => {
  switch (logicalStatus) {
    case "COMPLETED": return "HOÀN THÀNH";
    case "CANCELLED": return "ĐÃ HỦY";
    case "SHIPPING": return "ĐANG GIAO HÀNG";
    case "PENDING": return "CHỜ THANH TOÁN";
    default: return logicalStatus;
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
    // Đọc sessionStorage ngay khi mount
    setVnpayPaidIds(getVnpayPaidOrderIds());

    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const response = await orderAPI.getUserOrders();
        const ordersList = response.data || response.orders || [];

        // Fetch chi tiết cho từng đơn hàng để lấy thông tin sản phẩm (order.items)
        if (ordersList.length > 0) {
          const detailResults = await Promise.allSettled(
            ordersList.map((order) => orderAPI.getOrderById(order.id))
          );

          const detailedOrders = ordersList.map((order, index) => {
            const res = detailResults[index];
            if (res.status === "fulfilled" && res.value) {
              const detailData = res.value.data || res.value;
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

  // Lọc đơn hàng theo tab
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
       const logical = getLogicalStatus(order.status, order.id, vnpayPaidIds);
       if (activeTab === "ALL") return true;
       return logical === activeTab;
    });
  }, [orders, activeTab, vnpayPaidIds]);

  if (isLoading) {
    return (
      <div className="py-6 sm:py-8 lg:py-12">
        <div className="container lg:max-w-5xl mx-auto px-4">
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <SkeletonLoader key={i} className="h-48 rounded-3xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 sm:py-8 lg:py-12">
      <div className="container lg:max-w-5xl mx-auto px-2 sm:px-4">
        
        {/* Breadcrumb / Title (Optional) */}
        <div className="hidden sm:flex mb-6 items-center justify-between">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-coffee-600 to-amber-700 bg-clip-text text-transparent">Đơn hàng của tôi</h1>
          <Link to="/profile" className="text-coffee-600 hover:text-coffee-800 text-sm font-medium transition-colors">
             ← Trở lại hồ sơ
          </Link>
        </div>

        {/* Tabs - Glassmorphism */}
        <div className="sticky top-[70px] sm:top-4 z-10 mb-6 flex w-full overflow-x-auto gap-2 p-2 
                        bg-white/40 border border-white/40 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_rgba(64,33,12,0.05)] hide-scrollbar">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[120px] py-3 text-center text-sm md:text-base font-semibold transition-all duration-300 rounded-xl whitespace-nowrap
                ${activeTab === tab.id 
                  ? "bg-coffee-600 text-white shadow-md shadow-coffee-600/20 transform scale-[1.02]" 
                  : "text-gray-700 hover:bg-white/60 hover:text-coffee-700"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Order List */}
        {filteredOrders.length === 0 ? (
          <div className="p-16 text-center bg-white/40 border border-white/50 backdrop-blur-xl rounded-[32px] shadow-[0_14px_40px_rgba(64,33,12,0.05)] flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-24 h-24 mb-6 rounded-3xl bg-white/60 border border-white flex items-center justify-center shadow-inner">
               <PackageOpen className="w-12 h-12 text-coffee-300 block mx-auto" />
            </div>
            <h2 className="text-gray-700 font-semibold mb-2 text-xl">Chưa có đơn hàng</h2>
            <p className="text-gray-500 mb-8 max-w-sm">Hiện tại bạn chưa có đơn hàng nào trong phân loại này, hãy mua sắm thêm nhé!</p>
            <button 
               onClick={() => navigate('/products')}
               className="px-8 py-3 bg-coffee-600 text-white font-medium rounded-xl shadow-lg shadow-coffee-600/30 hover:bg-coffee-700 hover:-translate-y-0.5 transition-all"
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
                <div key={order.id} className="bg-white/40 border border-white/50 backdrop-blur-xl shadow-[0_8px_32px_rgba(64,33,12,0.04)] rounded-2xl sm:rounded-[32px] overflow-hidden transition-all duration-300 hover:shadow-[0_12px_40px_rgba(64,33,12,0.08)]">
                  
                  {/* Shop header & status */}
                  <div className="flex justify-between items-center px-4 py-4 sm:px-8 border-b border-white/50 bg-white/30 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-coffee-100 rounded-lg hidden sm:block text-coffee-600">
                          <Store className="w-4 h-4 sm:w-5 sm:h-5 " />
                       </div>
                       <span className="font-bold text-gray-800 text-sm sm:text-lg tracking-tight text-shadow-sm">Courteous Coffee</span>
                       <Link to={`/products`} className="bg-coffee-600/10 text-coffee-700 border border-coffee-200 text-[10px] sm:text-xs px-2 py-1 rounded-lg flex items-center gap-0.5 ml-1 sm:ml-2 hover:bg-coffee-600 hover:text-white transition-colors font-medium">Xem Menu <ChevronRight className="w-3 h-3" /></Link>
                       {/* VNPay badge if applicable */}
                       {isVnpayConfirmed && (
                         <span className="text-[10px] sm:text-xs bg-blue-50/80 text-blue-600 border border-blue-200/50 px-2 flex items-center h-[26px] rounded-lg ml-1 font-medium shadow-sm backdrop-blur-sm">VNPay</span>
                       )}
                    </div>
                    <div className="text-coffee-600 text-xs sm:text-sm font-bold flex gap-2 items-center">
                      {(logicalStatus === "COMPLETED" || logicalStatus === "SHIPPING") && (
                        <>
                          <Truck className="w-4 h-4 text-emerald-600 mr-0.5 hidden sm:inline" />
                          <span className="text-emerald-600 border-r border-coffee-200/50 pr-3 mr-1 hidden sm:inline">
                            {logicalStatus === "COMPLETED" ? "Giao Thành Công" : "Đơn Nhận Nhanh"}
                          </span>
                        </>
                      )}
                      <span className="uppercase tracking-wider">{getStatusLabelText(logicalStatus)}</span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="bg-white/20">
                    <Link to={`/orders/${order.id}`} className="block">
                      {items.map((item, index) => (
                        <div key={index} className="flex px-4 py-4 sm:px-8 border-b border-white/40 hover:bg-white/40 transition-colors">
                          <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 border-2 border-white/60 rounded-2xl overflow-hidden shadow-sm bg-white/50">
                             <img
                               src={getImageSrc(item.imageUrl)}
                               alt={item.productName || item.product?.name}
                               className="w-full h-full object-cover mix-blend-multiply"
                             />
                          </div>
                          <div className="ml-4 flex-1 flex flex-col justify-center">
                            <div>
                              <div className="text-gray-900 font-semibold text-sm sm:text-lg line-clamp-2 leading-snug">
                                {item.productName || item.product?.name || "Sản phẩm"}
                              </div>
                              <div className="text-gray-500 font-medium text-xs sm:text-sm mt-1 sm:mt-1.5 opacity-90">
                                Ly Tiêu Chuẩn N/A
                              </div>
                            </div>
                          </div>
                          <div className="ml-4 flex flex-col items-end justify-center">
                             <div className="bg-coffee-50 border border-coffee-100 text-coffee-800 text-xs px-2 py-0.5 rounded-full font-medium mb-2">SL: x{item.quantity}</div>
                            <div className="text-coffee-600 font-bold text-sm sm:text-xl">
                              {formatCurrency(Number(item.price || item.unitPrice || 0))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </Link>
                  </div>

                  {/* Footer Action area */}
                  <div className="px-5 py-5 sm:px-8 sm:py-6 bg-white/40 backdrop-blur-xl shadow-inner-top border-t border-white/60">
                    <div className="flex justify-end items-center mb-5 sm:mb-6">
                      <span className="text-gray-600 text-sm sm:text-base mr-3 flex items-center gap-1.5 font-medium">
                          <ShieldCheck className="w-5 h-5 text-coffee-600" />
                          Thành tiền:
                      </span>
                      <span className="text-coffee-700 text-2xl sm:text-3xl font-black drop-shadow-sm">
                        {formatCurrency(order.totalAmount || 0)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center sm:justify-end gap-2 sm:gap-4 mt-2">
                      <div className="text-xs sm:text-sm text-gray-500 hidden sm:block font-medium px-4 py-2 bg-white/50 border border-white/60 rounded-xl">
                         {logicalStatus === 'COMPLETED' ? "Giao hàng thành công" : 
                          logicalStatus === 'CANCELLED' ? "Đã bị hủy do thay đổi / lỗi mạng" : 
                          "Vui lòng thanh toán hoặc chờ bộ phận xử lý"}
                      </div>
                      <div className="flex flex-wrap gap-2 sm:gap-3">
                          {logicalStatus === "PENDING" && (
                            <button
                              onClick={() => navigate(`/orders/${order.id}`)} 
                              className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-coffee-600 to-amber-700 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-coffee-600/30 hover:-translate-y-0.5 transition-all border border-transparent"
                            >
                              Thanh toán / Hủy
                            </button>
                          )}
                          {(logicalStatus === "COMPLETED" || logicalStatus === "CANCELLED") && (
                            <button 
                              onClick={() => navigate(`/products`)}
                              className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-coffee-600 to-amber-700 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-coffee-600/30 hover:-translate-y-0.5 transition-all border border-transparent"
                            >
                              Mua lại
                            </button>
                          )}
                          <button 
                             onClick={() => navigate(`/orders/${order.id}`)}
                             className="px-4 sm:px-6 py-2.5 sm:py-3 bg-white/60 text-gray-800 border border-white shadow-sm rounded-xl text-sm font-semibold hover:bg-white transition-all hover:shadow-md backdrop-blur-sm"
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
