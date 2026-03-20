import { useEffect, useState } from "react";
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
} from "lucide-react";
import { paymentAPI } from "../../services";
import Button from "../../components/ui/Button";
import { formatCurrency } from "../../utils/formatDate";

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
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const verifyPayment = async () => {
      const searchParams = new URLSearchParams(location.search);
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
      } catch (error) {
        setErrorMessage(
          error?.message || "Không thể xác minh kết quả thanh toán VNPay.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    verifyPayment();
  }, [location.search]);

  if (isLoading) {
    return (
      <div className="page-shell min-h-screen px-3 py-10 md:px-6">
        <div className="mx-auto max-w-2xl rounded-[32px] border border-white/25  p-10 text-center shadow-[0_14px_40px_rgba(64,33,12,0.08)] backdrop-blur-xl">
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

  const isSuccess = !!result?.success;
  const statusStyle = isSuccess ? STATUS_STYLES.success : STATUS_STYLES.failed;
  const summaryCards = [
    {
      label: "Mã đơn hàng",
      value: result?.orderId ? `#${result.orderId}` : "N/A",
      icon: ReceiptText,
    },
    {
      label: "Mã giao dịch VNPay",
      value: result?.transactionNo || "N/A",
      icon: CreditCard,
    },
    {
      label: "Số tiền thanh toán",
      value: formatCurrency(result?.amount),
      icon: CircleDollarSign,
    },
    {
      label: "Mã phản hồi",
      value: result?.responseCode || "N/A",
      icon: ShieldCheck,
    },
  ];
  const detailRows = [
    {
      label: "Trạng thái thanh toán",
      value: formatStatusLabel(result?.paymentStatus, result?.message),
    },
    {
      label: "Trạng thái đơn hàng",
      value: formatStatusLabel(result?.orderStatus, "Đang xử lý"),
    },
    {
      label: "Phương thức",
      value: "VNPay",
    },
  ];

  return (
    <div className="page-shell min-h-screen px-3 py-10 md:px-6">
      <div className="mx-auto max-w-4xl space-y-6">
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
                  {result?.message ||
                    errorMessage ||
                    "Không thể xác định trạng thái giao dịch."}
                </p>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/25 bg-white/[0.14] p-5 text-left shadow-[0_10px_28px_rgba(64,33,12,0.06)] backdrop-blur-xl">
              <p className="text-sm text-slate-500">Số tiền đã xử lý</p>
              <p className="mt-1 text-3xl font-bold text-coffee-700">
                {formatCurrency(result?.amount)}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Response code: {result?.responseCode || "N/A"}
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
              <ChevronRight className="h-6 w-6 text-coffee-700" />
              <h2 className="text-xl font-bold text-slate-900">
                Hành động tiếp theo
              </h2>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              {result?.orderId && (
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
