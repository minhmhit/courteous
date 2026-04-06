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
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import { orderAPI, paymentAPI, receiptAPI } from "../../services";
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
  failed: {
    badge: "bg-amber-100 text-amber-700",
    panel:
      "border-amber-200/60 bg-[linear-gradient(135deg,rgba(255,251,235,0.42),rgba(255,251,235,0.18))] shadow-[0_18px_50px_rgba(245,158,11,0.10)]",
    icon: "text-amber-500",
    title: "Thanh toán chưa hoàn tất",
  },
};

const formatStatusLabel = (value, fallback) => {
  const map = {
    SUCCESS: "Thành công",
    COMPLETED: "Hoàn tất",
    PENDING: "Đang chờ",
    FAILED: "Thất bại",
  };

  return map[value] || fallback || value || "Không xác định";
};

const VnpayReturnPage = () => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [order, setOrder] = useState(null);
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
        const payload = response?.data || response;
        setResult(payload);

        if (payload?.orderId) {
          const [orderResponse, receiptResponse] = await Promise.all([
            orderAPI.getOrderById(payload.orderId).catch(() => null),
            receiptAPI.getReceiptsByOrderId(payload.orderId).catch(() => null),
          ]);

          setOrder(orderResponse?.data || orderResponse || null);

          const receiptList = receiptResponse?.data || receiptResponse || [];
          setReceipt(Array.isArray(receiptList) ? receiptList[0] || null : null);
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
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="page-shell min-h-screen px-3 py-10 md:px-6">
        <div className="mx-auto max-w-2xl rounded-[32px] border border-white/25 p-10 text-center shadow-[0_14px_40px_rgba(64,33,12,0.08)] backdrop-blur-xl">
          <LoaderCircle className="mx-auto mb-4 h-14 w-14 animate-spin text-coffee-600" />
          <h1 className="text-2xl font-bold text-slate-900">
            Đang xác minh thanh toán VNPay
          </h1>
          <p className="mt-3 text-slate-600">
            Vui lòng chờ trong giây lát, chúng tôi đang đối chiếu kết quả giao
            dịch với hệ thống.
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

  const isSuccess = !!result.success;
  const statusStyle = isSuccess ? STATUS_STYLES.success : STATUS_STYLES.failed;
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
      value: formatCurrency(result.amount),
      icon: CircleDollarSign,
    },
  ];

  const detailRows = [
    {
      label: "Trạng thái thanh toán",
      value: formatStatusLabel(result.paymentStatus, result.message),
    },
    {
      label: "Trạng thái đơn hàng",
      value: formatStatusLabel(result.orderStatus, "Đang xử lý"),
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
      value: result.paymentId ? `#${result.paymentId}` : "N/A",
    },
    {
      label: "Mô tả",
      value: receipt?.description || "Thanh toán đơn hàng qua VNPay",
    },
  ];

  return (
    <div className="page-shell min-h-screen px-3 py-10 md:px-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div
          className={`overflow-hidden rounded-[36px] border p-8 backdrop-blur-xl ${statusStyle.panel}`}
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="rounded-3xl border border-white/25 bg-white/[0.14] p-4 shadow-[0_10px_28px_rgba(64,33,12,0.06)] backdrop-blur-xl">
                {isSuccess ? (
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
                <p className="mt-3 max-w-2xl text-slate-600">
                  {result.message || "Không thể xác định trạng thái giao dịch."}
                </p>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/25 bg-white/[0.14] p-5 text-left shadow-[0_10px_28px_rgba(64,33,12,0.06)] backdrop-blur-xl">
              <p className="text-sm text-slate-500">Số tiền đã xử lý</p>
              <p className="mt-1 text-3xl font-bold text-coffee-700">
                {formatCurrency(result.amount)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
                    <p className="truncate font-semibold text-slate-900">
                      {card.value}
                    </p>
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
              <h2 className="text-xl font-bold text-slate-900">
                Chi tiết giao dịch
              </h2>
            </div>

            <div className="mt-6 space-y-4">
              {detailRows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between gap-4 rounded-[22px] border border-white/16 bg-white/[0.12] px-4 py-3 backdrop-blur-xl"
                >
                  <span className="text-sm text-slate-500">{row.label}</span>
                  <span className="font-semibold text-slate-900">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-white/22 bg-white/[0.10] p-6 shadow-[0_14px_36px_rgba(64,33,12,0.06)] backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <ReceiptText className="h-6 w-6 text-coffee-700" />
              <h2 className="text-xl font-bold text-slate-900">
                Biên nhận thanh toán
              </h2>
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
              <h2 className="text-xl font-bold text-slate-900">
                Thông tin đơn hàng
              </h2>
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
                  {formatCurrency(order?.totalAmount || result.amount)}
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
                      <p className="text-sm text-slate-500">
                        Số lượng: {item.quantity}
                      </p>
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
                  Chi tiết sản phẩm sẽ hiển thị khi dữ liệu đơn hàng được đồng
                  bộ.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[32px] border border-white/22 bg-white/[0.10] p-6 shadow-[0_14px_36px_rgba(64,33,12,0.06)] backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <ChevronRight className="h-6 w-6 text-coffee-700" />
              <h2 className="text-xl font-bold text-slate-900">
                Hành động tiếp theo
              </h2>
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
              <Link to="/products">
                <Button variant="ghost" className="w-full justify-center">
                  Tiếp tục mua sắm
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VnpayReturnPage;
