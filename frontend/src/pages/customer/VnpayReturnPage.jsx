import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  AlertCircle,
  BadgeCheck,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  CreditCard,
  LoaderCircle,
  ReceiptText,
  ShoppingBag,
} from "lucide-react";
import { orderAPI, paymentAPI, receiptAPI } from "../../services";
import useCartStore from "../../stores/useCartStore";
import Button from "../../components/ui/Button";
import { formatCurrency, formatDate } from "../../utils/formatDate";

const STATUS_STYLES = {
  success: {
    badge: "bg-emerald-100 text-emerald-700",
    panel:
      "border-emerald-200/60 bg-[linear-gradient(135deg,rgba(236,253,245,0.42),rgba(236,253,245,0.18))] shadow-[0_18px_50px_rgba(16,185,129,0.10)]",
    icon: "text-emerald-600",
    title: "Thanh toán thành công",
  },
  pending: {
    badge: "bg-sky-100 text-sky-700",
    panel:
      "border-sky-200/60 bg-[linear-gradient(135deg,rgba(239,246,255,0.46),rgba(239,246,255,0.18))] shadow-[0_18px_50px_rgba(14,165,233,0.10)]",
    icon: "text-sky-600",
    title: "Đang chờ hệ thống xác nhận",
  },
  failed: {
    badge: "bg-amber-100 text-amber-700",
    panel:
      "border-amber-200/60 bg-[linear-gradient(135deg,rgba(255,251,235,0.42),rgba(255,251,235,0.18))] shadow-[0_18px_50px_rgba(245,158,11,0.10)]",
    icon: "text-amber-500",
    title: "Thanh toán chưa hoàn tất",
  },
};

const unwrapResponseData = (response) => response?.data?.data || response?.data || response;

const formatStatusLabel = (value, fallback) => {
  const map = {
    SUCCESS: "Thành công",
    COMPLETED: "Hoàn tất",
    PENDING: "Đang chờ",
    FAILED: "Thất bại",
    CANCELLED: "Đã hủy",
    SHIPPING: "Đang giao hàng",
  };

  return map[value] || fallback || value || "Không xác định";
};

const getResultState = ({ verifyResult, payment, order }) => {
  const paymentStatus = String(
    payment?.status || verifyResult?.paymentStatus || "",
  ).toUpperCase();
  const orderStatus = String(order?.status || verifyResult?.orderStatus || "").toUpperCase();

  if (paymentStatus === "SUCCESS" || orderStatus === "COMPLETED") {
    return "success";
  }

  if (paymentStatus === "FAILED" || orderStatus === "CANCELLED") {
    return "failed";
  }

  return "pending";
};

const VnpayReturnPage = () => {
  const location = useLocation();
  const { fetchCart } = useCartStore();
  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [order, setOrder] = useState(null);
  const [payment, setPayment] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );

  useEffect(() => {
    const loadResult = async () => {
      const query = Object.fromEntries(searchParams.entries());

      if (!Object.keys(query).length) {
        setErrorMessage("Không nhận được dữ liệu trả về từ VNPay.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await paymentAPI.verifyVnpayReturn(query);
        const verifyResult = unwrapResponseData(response);
        setResult(verifyResult);

        if (verifyResult?.orderId) {
          const [orderResponse, paymentResponse, receiptResponse] = await Promise.all([
            orderAPI.getOrderById(verifyResult.orderId).catch(() => null),
            paymentAPI.getOrderPayment(verifyResult.orderId).catch(() => null),
            receiptAPI.getReceiptsByOrderId(verifyResult.orderId).catch(() => null),
          ]);

          const orderData = unwrapResponseData(orderResponse);
          const paymentData = unwrapResponseData(paymentResponse);
          const receiptData = unwrapResponseData(receiptResponse);
          const receiptList = Array.isArray(receiptData)
            ? receiptData
            : Array.isArray(receiptData?.receipts)
              ? receiptData.receipts
              : receiptData
                ? [receiptData]
                : [];

          setOrder(orderData || null);
          setPayment(paymentData || null);
          setReceipt(receiptList[0] || null);

          const resolvedState = getResultState({
            verifyResult,
            payment: paymentData,
            order: orderData,
          });

          if (resolvedState === "success") {
            fetchCart();
          }
        }
      } catch (error) {
        setErrorMessage(
          error?.message || "Không thể xác minh kết quả thanh toán VNPay.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadResult();
  }, [fetchCart, searchParams]);

  if (isLoading) {
    return (
      <div className="page-shell min-h-screen px-3 py-10 md:px-6">
        <div className="mx-auto max-w-2xl rounded-[32px] border border-white/25 p-10 text-center shadow-[0_14px_40px_rgba(64,33,12,0.08)] backdrop-blur-xl">
          <LoaderCircle className="mx-auto mb-4 h-14 w-14 animate-spin text-coffee-600" />
          <h1 className="text-2xl font-bold text-slate-900">
            Đang xác minh thanh toán VNPay
          </h1>
          <p className="mt-3 text-slate-600">
            Vui lòng chờ trong giây lát, chúng tôi đang đối chiếu kết quả giao dịch với hệ thống.
          </p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="page-shell min-h-screen px-3 py-10 md:px-6">
        <div className="mx-auto max-w-2xl rounded-[32px] border border-amber-200 bg-amber-50 p-10 text-center shadow-[0_14px_40px_rgba(64,33,12,0.08)]">
          <AlertCircle className="mx-auto mb-4 h-14 w-14 text-amber-500" />
          <h1 className="text-2xl font-bold text-slate-900">
            Chưa thể tải kết quả thanh toán
          </h1>
          <p className="mt-3 text-slate-600">
            {errorMessage || "Không tìm thấy dữ liệu giao dịch VNPay."}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/profile/orders">
              <Button variant="outline">Xem lịch sử đơn hàng</Button>
            </Link>
            <Link to="/products">
              <Button variant="primary">Tiếp tục mua sắm</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const resultState = getResultState({ verifyResult: result, payment, order });
  const statusStyle = STATUS_STYLES[resultState];
  const orderItems = order?.items || [];

  const summaryCards = [
    {
      label: "Mã đơn hàng",
      value: result.orderId ? `#${result.orderId}` : "N/A",
      icon: ReceiptText,
    },
    {
      label: "Mã giao dịch VNPay",
      value: result.transactionNo || "N/A",
      icon: CreditCard,
    },
    {
      label: "Số tiền thanh toán",
      value: formatCurrency(result.amount || order?.totalAmount || 0),
      icon: CircleDollarSign,
    },
  ];

  const detailRows = [
    {
      label: "Trạng thái thanh toán",
      value: formatStatusLabel(payment?.status || result.paymentStatus, result.message),
    },
    {
      label: "Trạng thái đơn hàng",
      value: formatStatusLabel(order?.status || result.orderStatus, "Đang xử lý"),
    },
    {
      label: "Phương thức",
      value: "VNPay Sandbox",
    },
    {
      label: "Ngày thanh toán",
      value: receipt?.createdAt
        ? formatDate(receipt.createdAt, {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : resultState === "pending"
          ? "Đang chờ IPN xác nhận"
          : "Đang cập nhật",
    },
  ];

  const receiptRows = [
    {
      label: "Mã biên nhận",
      value: receipt?.id ? `#${receipt.id}` : "Đang cập nhật",
    },
    {
      label: "Mã thanh toán",
      value: (payment?.id || result.paymentId) ? `#${payment?.id || result.paymentId}` : "N/A",
    },
    {
      label: "Mô tả",
      value: receipt?.description || "Thanh toán đơn hàng qua VNPay",
    },
  ];

  const heroMessage =
    resultState === "success"
      ? result.message || "Giao dịch đã được xác nhận và đơn hàng đã hoàn tất."
      : resultState === "failed"
        ? result.message || "Giao dịch chưa thành công hoặc đã bị hủy."
        : "VNPay đã trả kết quả, nhưng hệ thống vẫn đang chờ IPN để chốt trạng thái cuối cùng.";

  return (
    <div className="page-shell min-h-screen px-3 py-10 md:px-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div
          className={`overflow-hidden rounded-[36px] border p-8 backdrop-blur-xl ${statusStyle.panel}`}
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="rounded-3xl border border-white/25 bg-white/[0.14] p-4 shadow-[0_10px_28px_rgba(64,33,12,0.06)] backdrop-blur-xl">
                {resultState === "success" ? (
                  <CheckCircle2 className={`h-14 w-14 ${statusStyle.icon}`} />
                ) : (
                  <AlertCircle className={`h-14 w-14 ${statusStyle.icon}`} />
                )}
              </div>
              <div>
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${statusStyle.badge}`}
                >
                  VNPay
                </span>
                <h1 className="mt-3 text-3xl font-bold text-slate-900">
                  {statusStyle.title}
                </h1>
                <p className="mt-3 max-w-2xl text-slate-600">{heroMessage}</p>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/25 bg-white/[0.14] p-5 text-left shadow-[0_10px_28px_rgba(64,33,12,0.06)] backdrop-blur-xl">
              <p className="text-sm text-slate-500">Số tiền đã xử lý</p>
              <p className="mt-1 text-3xl font-bold text-coffee-700">
                {formatCurrency(result.amount || order?.totalAmount || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {summaryCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.label}
                className="rounded-[28px] border border-white/22 bg-white/[0.10] p-5 shadow-[0_10px_28px_rgba(64,33,12,0.05)] backdrop-blur-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl border border-white/20 bg-white/[0.12] p-3 backdrop-blur-xl">
                    <Icon className="h-5 w-5 text-coffee-700" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-slate-500">{card.label}</p>
                    <p className="truncate font-semibold text-slate-900">{card.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[32px] border border-white/22 bg-white/[0.10] p-6 shadow-[0_14px_36px_rgba(64,33,12,0.06)] backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <BadgeCheck className="h-6 w-6 text-coffee-700" />
              <h2 className="text-xl font-bold text-slate-900">Chi tiết giao dịch</h2>
            </div>

            <div className="mt-6 space-y-4">
              {detailRows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between gap-4 rounded-[22px] border border-white/16 bg-white/[0.12] px-4 py-3 backdrop-blur-xl"
                >
                  <span className="text-sm text-slate-500">{row.label}</span>
                  <span className="font-semibold text-slate-900">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-white/22 bg-white/[0.10] p-6 shadow-[0_14px_36px_rgba(64,33,12,0.06)] backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <ReceiptText className="h-6 w-6 text-coffee-700" />
              <h2 className="text-xl font-bold text-slate-900">Biên nhận thanh toán</h2>
            </div>

            <div className="mt-6 space-y-4">
              {receiptRows.map((row) => (
                <div
                  key={row.label}
                  className="rounded-[22px] border border-white/16 bg-white/[0.12] px-4 py-3 backdrop-blur-xl"
                >
                  <p className="text-sm text-slate-500">{row.label}</p>
                  <p className="mt-1 font-semibold text-slate-900">{row.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[32px] border border-white/22 bg-white/[0.10] p-6 shadow-[0_14px_36px_rgba(64,33,12,0.06)] backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <ShoppingBag className="h-6 w-6 text-coffee-700" />
              <h2 className="text-xl font-bold text-slate-900">Thông tin đơn hàng</h2>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <div className="rounded-[22px] border border-white/16 bg-white/[0.12] px-4 py-3 backdrop-blur-xl">
                <p className="text-sm text-slate-500">Mã đơn</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {result.orderId ? `#${result.orderId}` : "N/A"}
                </p>
              </div>
              <div className="rounded-[22px] border border-white/16 bg-white/[0.12] px-4 py-3 backdrop-blur-xl">
                <p className="text-sm text-slate-500">Tổng đơn hàng</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {formatCurrency(order?.totalAmount || result.amount || 0)}
                </p>
              </div>
              <div className="rounded-[22px] border border-white/16 bg-white/[0.12] px-4 py-3 backdrop-blur-xl md:col-span-2">
                <p className="text-sm text-slate-500">Địa chỉ giao hàng</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {order?.shipAddress || "Đang cập nhật"}
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {orderItems.length > 0 ? (
                orderItems.map((item, index) => (
                  <div
                    key={`${item.productId || item.id || index}-${index}`}
                    className="flex items-center justify-between gap-4 rounded-[22px] border border-white/16 bg-white/[0.12] px-4 py-3 backdrop-blur-xl"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">
                        {item.productName || item.name || "Sản phẩm"}
                      </p>
                      <p className="text-sm text-slate-500">Số lượng: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-coffee-700">
                      {formatCurrency(
                        Number(item.unitPrice || item.price || 0) *
                          Number(item.quantity || 0),
                      )}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-[22px] border border-dashed border-white/20 bg-white/[0.08] px-4 py-5 text-sm text-slate-500">
                  Chi tiết sản phẩm sẽ hiển thị khi dữ liệu đơn hàng được đồng bộ.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[32px] border border-white/22 bg-white/[0.10] p-6 shadow-[0_14px_36px_rgba(64,33,12,0.06)] backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <ChevronRight className="h-6 w-6 text-coffee-700" />
              <h2 className="text-xl font-bold text-slate-900">Hành động tiếp theo</h2>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              {result.orderId && (
                <Link to={`/orders/${result.orderId}`}>
                  <Button variant="primary" className="w-full justify-center">
                    Xem chi tiết đơn hàng
                  </Button>
                </Link>
              )}
              <Link to="/profile/orders">
                <Button variant="outline" className="w-full justify-center">
                  Xem lịch sử đơn hàng
                </Button>
              </Link>
              <Button
                variant="ghost"
                className="w-full justify-center"
                onClick={() => window.location.reload()}
              >
                Kiểm tra trạng thái lại
              </Button>
              <Link to="/products">
                <Button variant="ghost" className="w-full justify-center">
                  Tiếp tục mua sắm
                </Button>
              </Link>
            </div>

            {!isSuccess && (
              <p className="mt-4 text-sm text-amber-700">
                Nếu giao dịch đã trừ tiền nhưng trạng thái chưa cập nhật, khách
                hàng nên liên hệ hỗ trợ. Chính sách tự hủy đơn quá hạn vẫn cần
                backend xử lý để đồng bộ kho và trạng thái đơn.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VnpayReturnPage;
