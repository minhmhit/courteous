import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CreditCard, MapPin, Phone, User, CheckCircle } from "lucide-react";
import useCartStore from "../../stores/useCartStore";
import useAuthStore from "../../stores/useAuthStore";
import useToastStore from "../../stores/useToastStore";
import { couponAPI, orderAPI } from "../../services";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { formatCurrency } from "../../utils/formatDate";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const toast = useToastStore();
  const { items, totalPrice, clearCart, fetchCart } = useCartStore();
  const { user } = useAuthStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [availableCoupons, setAvailableCoupons] = useState([]);

  // Form data
  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    phoneNumber: user?.phoneNumber || "",
    email: user?.email || "",
    address: "",
    city: "",
    district: "",
    note: "",
    paymentMethod: "cod", // cod hoặc banking
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (
      !formData.fullName ||
      !formData.phoneNumber ||
      !formData.address ||
      !formData.city
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin giao hàng");
      return;
    }

    if (!items || items.length === 0) {
      toast.error("Giỏ hàng trống");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("📦 Checkout - Cart items:", items); // Debug log

      // Prepare order data theo format backend
      // Backend expects: { cartItems: [{ cartItemId, productId, quantity }], couponId }
      const orderData = {
        cartItems: items.map((item) => ({
          cartItemId: item.id || item.cartItemId,
          productId: item.productId || item.product_id,
          quantity: item.quantity,
        })),
        couponId: appliedCoupon?.id || null, // Gửi couponId nếu có
      };

      console.log("📤 Sending order data:", orderData); // Debug log

      const response = await orderAPI.createOrder(orderData);
      console.log("✅ Order response:", response); // Debug log

      const newOrderId =
        response.data?.id || response.data?.orderId || response.id;

      setOrderId(newOrderId);
      setOrderSuccess(true);
      clearCart();

      toast.success("Đặt hàng thành công!");

      // Redirect sau 3 giây
      setTimeout(() => {
        navigate(`/profile/orders`);
      }, 3000);
    } catch (error) {
      console.error("❌ Lỗi khi đặt hàng:", error);
      console.error("Error response:", error.response?.data);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Không thể đặt hàng. Vui lòng thử lại"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-12 text-center"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Thanh toán</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Shipping & Payment Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Address */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-coffee-50 rounded-lg">
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
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      placeholder="Số nhà, tên đường..."
                    />
                  </div>
                  <Input
                    label="Quận / Huyện"
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                  />
                  <Input
                    label="Thành phố / Tỉnh"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                  />
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ghi chú (tùy chọn)
                    </label>
                    <textarea
                      name="note"
                      value={formData.note}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                      placeholder="Ghi chú về đơn hàng (thời gian giao, yêu cầu đặc biệt...)"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-coffee-50 rounded-lg">
                    <CreditCard className="w-6 h-6 text-coffee-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Phương thức thanh toán
                  </h2>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-coffee-500 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === "cod"}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-coffee-600 focus:ring-coffee-500"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">
                        Thanh toán khi nhận hàng (COD)
                      </p>
                      <p className="text-sm text-gray-600">
                        Thanh toán bằng tiền mặt khi nhận hàng
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-coffee-500 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="banking"
                      checked={formData.paymentMethod === "banking"}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-coffee-600 focus:ring-coffee-500"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">
                        Chuyển khoản ngân hàng
                      </p>
                      <p className="text-sm text-gray-600">
                        Thanh toán qua chuyển khoản ngân hàng
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Đơn hàng của bạn
                </h2>

                {/* Products */}
                <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                  {items?.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <img
                        src={item.imageUrl || "https://via.placeholder.com/60"}
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
                <div className="border-t border-gray-200 pt-4 mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mã giảm giá
                  </label>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div>
                        <p className="font-semibold text-green-700">
                          {appliedCoupon.code}
                        </p>
                        <p className="text-xs text-green-600">
                          Giảm {appliedCoupon.discountPercentage}%
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
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
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
                <div className="border-t border-gray-200 pt-4 space-y-2 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Tạm tính</span>
                    <span>{formatCurrency(totalPrice)}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-green-600">
                      <span>
                        Giảm giá ({appliedCoupon.discountPercentage}%)
                      </span>
                      <span>-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>Phí vận chuyển</span>
                    <span className="text-green-600">Miễn phí</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2">
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
                  {isSubmitting ? "Đang xử lý..." : "Đặt hàng"}
                </Button>

                <p className="text-xs text-gray-500 text-center mt-4">
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
