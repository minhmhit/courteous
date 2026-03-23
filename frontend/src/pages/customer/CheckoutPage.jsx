import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CreditCard, MapPin, Phone, User, CheckCircle } from "lucide-react";
import useCartStore from "../../stores/useCartStore";
import useAuthStore from "../../stores/useAuthStore";
import useToastStore from "../../stores/useToastStore";
import { couponAPI, orderAPI, paymentAPI } from "../../services";
import provinceAPI from "../../services/provinceAPI";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { formatCurrency } from "../../utils/formatDate";

const PAYMENT_METHOD_CONFIG = {
  CASH: {
    title: "Thanh toán khi nhận hàng (COD)",
    description: "Tạo đơn hàng và ghi nhận thanh toán tiền mặt khi giao hàng.",
  },
  VNPAY: {
    title: "Thanh toán qua VNPay",
    description: "Chuyển sang cổng VNPay để thanh toán trực tuyến an toàn.",
  },
};

const DEFAULT_PAYMENT_METHODS = [
  { code: "CASH", name: "Tiền mặt", enabled: true },
  { code: "VNPAY", name: "VNPay", enabled: false },
];

const getImageSrc = (imageUrl) => {
  if (!imageUrl) {
    return "https://via.placeholder.com/120x120?text=Coffee";
  }

  if (imageUrl.startsWith("http")) {
    return imageUrl;
  }

  return imageUrl.replace(/^\.\//, "/");
};

const CheckoutPage = () => {
  const navigate = useNavigate();
  const toast = useToastStore();
  const { items, totalPrice, clearCart, fetchCart } = useCartStore();
  const { user } = useAuthStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState(DEFAULT_PAYMENT_METHODS);

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [availableCoupons, setAvailableCoupons] = useState([]);

  // Province state
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    phoneNumber: user?.phoneNumber || "",
    email: user?.email || "",
    shipAddress: "",
    note: "",
    paymentMethod: "CASH",
  });

  // Fetch provinces on mount
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const data = await provinceAPI.getAllProvinces();
        setProvinces(data);
      } catch (error) {
        console.error("Error fetching provinces:", error);
        toast.error("Không thể tải danh sách tỉnh thành");
      }
    };
    fetchProvinces();
  }, []);

  // Fetch all available coupons on mount
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const response = await couponAPI.getAllCoupons();
        const coupons = response.data.coupons;

        setAvailableCoupons(coupons);
      } catch (error) {
        console.error("Error fetching coupons:", error);
      }
    };
    fetchCoupons();
  }, []);

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const response = await paymentAPI.getPaymentMethods();
        const methods = response?.data || [];
        const enabledCodes = new Set(methods.map((method) => method.code));

        setPaymentMethods(
          DEFAULT_PAYMENT_METHODS.map((method) => ({
            ...method,
            enabled:
              method.code === "CASH" ? true : enabledCodes.has(method.code),
          })),
        );
      } catch (error) {
        console.error("Error fetching payment methods:", error);
        setPaymentMethods(DEFAULT_PAYMENT_METHODS);
      }
    };

    fetchPaymentMethods();
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    if (!items || items.length === 0) {
      navigate("/cart");
    }
  }, [items, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle province selection
  const handleProvinceChange = async (e) => {
    const provinceCode = e.target.value;
    if (!provinceCode) {
      setSelectedProvince(null);
      setDistricts([]);
      setWards([]);
      setSelectedDistrict(null);
      setSelectedWard(null);
      return;
    }

    const province = provinces.find((p) => p.code === parseInt(provinceCode));
    setSelectedProvince(province);
    setSelectedDistrict(null);
    setSelectedWard(null);
    setWards([]);

    try {
      const data = await provinceAPI.getDistrictsByProvince(provinceCode);
      setDistricts(data.districts || []);
    } catch (error) {
      console.error("Error fetching districts:", error);
      toast.error("Không thể tải danh sách quận/huyện");
    }
  };

  // Handle district selection
  const handleDistrictChange = async (e) => {
    const districtCode = e.target.value;
    if (!districtCode) {
      setSelectedDistrict(null);
      setWards([]);
      setSelectedWard(null);
      return;
    }

    const district = districts.find((d) => d.code === parseInt(districtCode));
    setSelectedDistrict(district);
    setSelectedWard(null);

    try {
      const data = await provinceAPI.getWardsByDistrict(districtCode);
      setWards(data.wards || []);
    } catch (error) {
      console.error("Error fetching wards:", error);
      toast.error("Không thể tải danh sách phường/xã");
    }
  };

  // Handle ward selection
  const handleWardChange = (e) => {
    const wardCode = e.target.value;
    if (!wardCode) {
      setSelectedWard(null);
      return;
    }

    const ward = wards.find((w) => w.code === parseInt(wardCode));
    setSelectedWard(ward);
  };

  // Áp dụng mã giảm giá
  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      toast.error("Vui lòng nhập mã giảm giá");
      return;
    }

    setIsValidatingCoupon(true);

    // Tìm coupon trong danh sách đã load
    const foundCoupon = availableCoupons.find(
      (coupon) => coupon.code.toUpperCase() === couponCode.toUpperCase()
    );

    if (!foundCoupon) {
      toast.error("Mã giảm giá không tồn tại");
      setIsValidatingCoupon(false);
      return;
    }

    // Kiểm tra coupon còn hiệu lực
    const currentDate = new Date();
    const startDate = new Date(foundCoupon.startDate);
    const endDate = new Date(foundCoupon.endDate);

    if (currentDate < startDate) {
      toast.error("Mã giảm giá chưa bắt đầu hiệu lực");
      setIsValidatingCoupon(false);
      return;
    }

    if (currentDate > endDate) {
      toast.error("Mã giảm giá đã hết hạn");
      setIsValidatingCoupon(false);
      return;
    }

    // Kiểm tra số lượng còn lại
    if (foundCoupon.currentUsage >= foundCoupon.usageLimit) {
      toast.error("Mã giảm giá đã hết lượt sử dụng");
      setIsValidatingCoupon(false);
      return;
    }

    // Calculate discount amount
    const discount = (totalPrice * foundCoupon.discountPercent) / 100;

    setAppliedCoupon(foundCoupon);
    setDiscountAmount(discount);
    toast.success(
      `Áp dụng mã giảm giá ${foundCoupon.discountPercent}% thành công!`
    );
    setIsValidatingCoupon(false);
  };

  // Xóa mã giảm giá
  const handleRemoveCoupon = () => {
    setCouponCode("");
    setAppliedCoupon(null);
    setDiscountAmount(0);
    toast.success("Đã xóa mã giảm giá");
  };

  // Tính tổng tiền sau giảm giá
  const finalPrice = totalPrice - discountAmount;
  const selectedPaymentConfig =
    PAYMENT_METHOD_CONFIG[formData.paymentMethod] || PAYMENT_METHOD_CONFIG.CASH;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (
      !formData.fullName ||
      !formData.phoneNumber ||
      !formData.shipAddress ||
      !selectedProvince ||
      !selectedDistrict ||
      !selectedWard
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin giao hàng");
      return;
    }

    if (!items || items.length === 0) {
      toast.error("Giỏ hàng trống");
      return;
    }

    setIsSubmitting(true);
    let createdOrderId = null;

    try {
      // Ghép địa chỉ đầy đủ
      const fullAddress = [
        formData.shipAddress,
        selectedWard?.name,
        selectedDistrict?.name,
        selectedProvince?.name,
      ]
        .filter(Boolean)
        .join(", ");

      const orderData = {
        cartItems: items.map((item) => ({
          cartItemId: item.id || item.cartItemId,
          productId: item.productId || item.product_id,
          quantity: item.quantity,
        })),
        couponId: appliedCoupon?.id || null, // Gửi couponId nếu có
        shipAddress: fullAddress,
        phoneNumber: formData?.phoneNumber || null,
      };
      const response = await orderAPI.createOrder(orderData);

      createdOrderId =
        response.data?.id || response.data?.orderId || response.id;
      if (!createdOrderId) {
        throw new Error("Không thể lấy mã đơn hàng sau khi tạo đơn");
      }

      const paymentResponse = await paymentAPI.createPayment({
        orderId: createdOrderId,
        paymentMethodCode: formData.paymentMethod,
        orderInfo: `Thanh toan don hang #${createdOrderId}`,
        locale: "vn",
      });

      const paymentData = paymentResponse?.data || paymentResponse;

      if (formData.paymentMethod === "VNPAY") {
        if (!paymentData?.paymentUrl) {
          throw new Error("Không nhận được đường dẫn thanh toán VNPay");
        }

        clearCart();
        toast.success("Đơn hàng đã được tạo. Đang chuyển sang VNPay...");
        window.location.assign(paymentData.paymentUrl);
        return;
      }

      setOrderId(createdOrderId);
      setOrderSuccess(true);
      clearCart();

      toast.success("Đặt hàng thành công!");

      setTimeout(() => {
        navigate(`/profile/orders`);
      }, 3000);
    } catch (error) {
      console.error("Lỗi khi đặt hàng:", error);
      toast.error(
        error?.message ||
          (createdOrderId
            ? `Đơn hàng #${createdOrderId} đã tạo nhưng chưa khởi tạo được thanh toán. Bạn có thể thanh toán lại sau.`
            : null) ||
          error.message ||
          "Không thể đặt hàng. Vui lòng thử lại"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen px-3 py-10 md:px-6">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-panel-strong max-w-md mx-auto rounded-[32px] p-12 text-center"
          >
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100/80">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Đặt hàng thành công!
            </h2>
            <p className="text-gray-600 mb-2">
              Cảm ơn bạn đã đặt hàng tại CoffeeBot
            </p>
            {orderId && (
              <p className="text-sm text-gray-500 mb-6">
                Mã đơn hàng:{" "}
                <span className="font-mono font-bold">#{orderId}</span>
              </p>
            )}
            <p className="text-sm text-gray-600 mb-6">
              Chúng tôi sẽ liên hệ với bạn sớm nhất để xác nhận đơn hàng
            </p>
            <Button
              onClick={() => navigate("/profile/orders")}
              variant="primary"
            >
              Xem đơn hàng
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-3 py-6 md:px-6 md:py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Thanh toán</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Shipping & Payment Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping shipAddress */}
              <div className="glass-card rounded-[28px] p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="glass-card rounded-2xl p-2">
                    <MapPin className="w-6 h-6 text-coffee-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Địa chỉ giao hàng
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Họ và tên"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    icon={<User className="w-5 h-5" />}
                  />
                  <Input
                    label="Số điện thoại"
                    name="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    required
                    icon={<Phone className="w-5 h-5" />}
                  />
                  <div className="md:col-span-2">
                    <Input
                      label="Email (tùy chọn)"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Input
                      label="Địa chỉ"
                      name="shipAddress"
                      value={formData.shipAddress}
                      onChange={handleInputChange}
                      required
                      placeholder="Số nhà, tên đường..."
                    />
                  </div>

                  {/* Province Select */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tỉnh / Thành phố <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedProvince?.code || ""}
                      onChange={handleProvinceChange}
                      required
                      className="glass-textarea w-full"
                    >
                      <option value="">Chọn tỉnh/thành phố</option>
                      {provinces.map((province) => (
                        <option key={province.code} value={province.code}>
                          {province.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* District Select */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quận / Huyện <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedDistrict?.code || ""}
                      onChange={handleDistrictChange}
                      disabled={!selectedProvince}
                      required
                      className="glass-select w-full disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">Chọn quận/huyện</option>
                      {districts.map((district) => (
                        <option key={district.code} value={district.code}>
                          {district.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Ward Select */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phường / Xã <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedWard?.code || ""}
                      onChange={handleWardChange}
                      disabled={!selectedDistrict}
                      required
                      className="glass-select w-full disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">Chọn phường/xã</option>
                      {wards.map((ward) => (
                        <option key={ward.code} value={ward.code}>
                          {ward.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ghi chú (tùy chọn)
                    </label>
                    <textarea
                      name="note"
                      value={formData.note}
                      onChange={handleInputChange}
                      rows="3"
                      className="glass-textarea w-full"
                      placeholder="Ghi chú về đơn hàng (thời gian giao, yêu cầu đặc biệt...)"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="glass-card rounded-[28px] p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="glass-card rounded-2xl p-2">
                    <CreditCard className="w-6 h-6 text-coffee-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Phương thức thanh toán
                  </h2>
                </div>

                <div className="space-y-3">
                  {paymentMethods.map((method) => {
                    const config =
                      PAYMENT_METHOD_CONFIG[method.code] ||
                      PAYMENT_METHOD_CONFIG.CASH;

                    return (
                      <label
                        key={method.code}
                        className={`glass-card flex items-center gap-3 rounded-[24px] p-4 transition-all ${
                          method.enabled
                            ? "cursor-pointer hover:-translate-y-0.5"
                            : "cursor-not-allowed opacity-60"
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.code}
                          checked={formData.paymentMethod === method.code}
                          onChange={handleInputChange}
                          disabled={!method.enabled}
                          className="w-5 h-5 text-coffee-600 focus:ring-coffee-500"
                        />
                        <div>
                          <p className="font-semibold text-gray-900">
                            {config.title}
                          </p>
                          <p className="text-sm text-gray-600">
                            {config.description}
                          </p>
                          {!method.enabled && method.code === "VNPAY" && (
                            <p className="mt-1 text-xs text-amber-700">
                              VNPay chưa sẵn sàng vì server chưa cấu hình `VNPAY_*`.
                            </p>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
                <p className="mt-4 text-sm text-slate-500">
                  {selectedPaymentConfig.description}
                </p>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="glass-panel sticky top-28 rounded-[32px] p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Đơn hàng của bạn
                </h2>

                {/* Products */}
                <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                  {items?.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <img
                        src={getImageSrc(item.imageUrl)}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-900 line-clamp-2">
                          {item.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {item.quantity} x {formatCurrency(item.unitPrice)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coupon */}
                <div className="border-t border-white/25 pt-4 mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mã giảm giá
                  </label>
                  {appliedCoupon ? (
                    <div className="glass-card flex items-center justify-between rounded-[20px] border border-emerald-200/70 p-3">
                      <div>
                        <p className="font-semibold text-green-700">
                          {appliedCoupon.code}
                        </p>
                        <p className="text-xs text-green-600">
                          Giảm {appliedCoupon.discountPercent}%
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Xóa
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.trim())}
                        placeholder="Nhập mã giảm giá"
                        className="glass-input flex-1"
                      />
                      <Button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={isValidatingCoupon}
                        variant="outline"
                        className="whitespace-nowrap"
                      >
                        {isValidatingCoupon ? "Đang kiểm tra..." : "Áp dụng"}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Price Summary */}
                <div className="border-t border-white/25 pt-4 space-y-2 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Tạm tính</span>
                    <span>{formatCurrency(totalPrice)}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-green-600">
                      <span>Giảm giá ({appliedCoupon.discountPercent}%)</span>
                      <span>-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>Phí vận chuyển</span>
                    <span className="text-green-600">Miễn phí</span>
                  </div>
                  <div className="border-t border-white/25 pt-2">
                    <div className="flex justify-between text-lg font-bold text-gray-900">
                      <span>Tổng cộng</span>
                      <span className="text-coffee-600">
                        {formatCurrency(finalPrice)}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "Đang xử lý..."
                    : formData.paymentMethod === "VNPAY"
                      ? "Tiếp tục đến VNPay"
                      : "Đặt hàng"}
                </Button>

                <p className="mt-4 text-center text-xs text-slate-500">
                  Bằng việc đặt hàng, bạn đồng ý với{" "}
                  <a href="/terms" className="text-coffee-600 hover:underline">
                    Điều khoản sử dụng
                  </a>{" "}
                  của chúng tôi
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;

