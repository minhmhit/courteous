import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CreditCard, MapPin, Phone, User, CheckCircle } from "lucide-react";
import useCartStore from "../../stores/useCartStore";
import useAuthStore from "../../stores/useAuthStore";
import useToastStore from "../../stores/useToastStore";
import { orderAPI } from "../../services";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const toast = useToastStore();
  const { items, totalPrice, clearCart, fetchCart } = useCartStore();
  const { user } = useAuthStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    phone: user?.phone || "",
    email: user?.email || "",
    address: "",
    city: "",
    district: "",
    note: "",
    paymentMethod: "cod", // cod hoặc banking
  });

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    if (!items || items.length === 0) {
      navigate("/cart");
    }
  }, [items, navigate]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (
      !formData.fullName ||
      !formData.phone ||
      !formData.address ||
      !formData.city
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin giao hàng");
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare order data
      const orderData = {
        customerName: formData.fullName,
        customerPhone: formData.phone,
        customerEmail: formData.email,
        shippingAddress: `${formData.address}, ${formData.district}, ${formData.city}`,
        paymentMethod: formData.paymentMethod,
        note: formData.note,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: totalPrice,
      };

      const response = await orderAPI.createOrder(orderData);
      const newOrderId = response.data?.id || response.id;

      setOrderId(newOrderId);
      setOrderSuccess(true);
      clearCart();

      toast.success("Đặt hàng thành công!");

      // Redirect sau 3 giây
      setTimeout(() => {
        navigate(`/profile/orders`);
      }, 3000);
    } catch (error) {
      console.error("Lỗi khi đặt hàng:", error);
      toast.error("Không thể đặt hàng. Vui lòng thử lại");
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
                    name="phone"
                    type="tel"
                    value={formData.phone}
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
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
                      placeholder="Ghi chú thêm về đơn hàng..."
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
                          {item.quantity} x {formatPrice(item.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Summary */}
                <div className="border-t border-gray-200 pt-4 space-y-2 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Tạm tính</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Phí vận chuyển</span>
                    <span className="text-green-600">Miễn phí</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2">
                    <div className="flex justify-between text-lg font-bold text-gray-900">
                      <span>Tổng cộng</span>
                      <span className="text-coffee-600">
                        {formatPrice(totalPrice)}
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
