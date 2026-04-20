import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CheckCircle,
  CreditCard,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import useCartStore from "../../stores/useCartStore";
import useAuthStore from "../../stores/useAuthStore";
import useToastStore from "../../stores/useToastStore";
import { couponAPI, orderAPI, paymentAPI, addressAPI } from "../../services";
import provinceAPI from "../../services/provinceAPI";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { formatCurrency } from "../../utils/formatDate";

const PAYMENT_METHOD_CONFIG = {
  COD: {
    title: "Thanh toán khi nhận hàng (COD)",
    description:
      "Tạo đơn hàng và xử lý giao hàng theo hình thức thanh toán khi nhận.",
  },
  VNPAY: {
    title: "Thanh toán qua VNPay",
    description:
      "Tạo đơn chờ thanh toán và chuyển bạn sang cổng VNPay để hoàn tất giao dịch.",
  },
};

const DEFAULT_PAYMENT_METHODS = [
  { code: "COD", name: "Tiền mặt", enabled: true },
  { code: "VNPAY", name: "VNPay", enabled: false },
];

const unwrapResponseData = (response) => response?.data?.data || response?.data || response;

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
  const { items, totalPrice, fetchCart } = useCartStore();
  const { user } = useAuthStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState(DEFAULT_PAYMENT_METHODS);

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [availableCoupons, setAvailableCoupons] = useState([]);

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);

  // Address management states
  const [addressMode, setAddressMode] = useState("new"); // "existing" or "new"
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [newAddressType, setNewAddressType] = useState("home"); // "home" or "office"

  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    phoneNumber: user?.phoneNumber || "",
    email: user?.email || "",
    shipAddress: "",
    note: "",
    paymentMethod: "COD",
  });

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

    const fetchSavedAddresses = async () => {
      setIsLoadingAddresses(true);
      try {
        const response = await addressAPI.getMyAddresses();
        console.log('Addresses response:', response);
        
        // API returns { success: true, data: addresses }
        const addresses = response?.data?.data || response?.data || [];
        console.log('Parsed addresses:', addresses);
        
        setSavedAddresses(addresses);
        
        // Nếu có địa chỉ lưu, mặc định chọn mode "existing" và địa chỉ đầu tiên
        if (Array.isArray(addresses) && addresses.length > 0) {
          setAddressMode("existing");
          setSelectedAddressId(addresses[0].id);
          console.log('Selected first address:', addresses[0].id);
        } else {
          setAddressMode("new");
        }
      } catch (error) {
        console.error("Error fetching addresses:", error);
        // Không hiển thị lỗi, CHỈ cho phép dùng "thêm mới"
        setSavedAddresses([]);
        setAddressMode("new");
      } finally {
        setIsLoadingAddresses(false);
      }
    };

    fetchProvinces();
    fetchSavedAddresses();
  }, [toast]);

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
            enabled: method.code === "COD" ? true : enabledCodes.has(method.code),
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

    const province = provinces.find((p) => p.code === parseInt(provinceCode, 10));
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

  const handleDistrictChange = async (e) => {
    const districtCode = e.target.value;
    if (!districtCode) {
      setSelectedDistrict(null);
      setWards([]);
      setSelectedWard(null);
      return;
    }

    const district = districts.find((d) => d.code === parseInt(districtCode, 10));
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

  const handleWardChange = (e) => {
    const wardCode = e.target.value;
    if (!wardCode) {
      setSelectedWard(null);
      return;
    }

    const ward = wards.find((w) => w.code === parseInt(wardCode, 10));
    setSelectedWard(ward);
  };

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      toast.error("Vui lòng nhập mã giảm giá");
      return;
    }

    setIsValidatingCoupon(true);

    const foundCoupon = availableCoupons.find(
      (coupon) => coupon.code.toUpperCase() === couponCode.toUpperCase(),
    );

    if (!foundCoupon) {
      toast.error("Mã giảm giá không tồn tại");
      setIsValidatingCoupon(false);
      return;
    }

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

    if (foundCoupon.currentUsage >= foundCoupon.usageLimit) {
      toast.error("Mã giảm giá đã hết lượt sử dụng");
      setIsValidatingCoupon(false);
      return;
    }

    const discount = (totalPrice * foundCoupon.discountPercent) / 100;

    setAppliedCoupon(foundCoupon);
    setDiscountAmount(discount);
    toast.success(`Áp dụng mã giảm giá ${foundCoupon.discountPercent}% thành công!`);
    setIsValidatingCoupon(false);
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setAppliedCoupon(null);
    setDiscountAmount(0);
    toast.success("Đã xóa mã giảm giá");
  };

  const finalPrice = totalPrice - discountAmount;
  const selectedPaymentConfig =
    PAYMENT_METHOD_CONFIG[formData.paymentMethod] || PAYMENT_METHOD_CONFIG.COD;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate - phần nào phụ thuộc vào addressMode
    if (!formData.fullName || !formData.phoneNumber) {
      toast.error("Vui lòng điền đầy đủ thông tin cá nhân");
      return;
    }

    // Validate địa chỉ
    if (addressMode === "existing") {
      if (!selectedAddressId) {
        toast.error("Vui lòng chọn địa chỉ giao hàng");
        return;
      }
    } else if (addressMode === "new") {
      if (
        !formData.shipAddress ||
        !selectedProvince ||
        !selectedDistrict ||
        !selectedWard
      ) {
        toast.error("Vui lòng điền đầy đủ thông tin địa chỉ mới");
        return;
      }
    }

    if (!items || items.length === 0) {
      toast.error("Giỏ hàng trống");
      return;
    }

    setIsSubmitting(true);
    let createdOrderId = null;

    try {
      const orderData = {
        cartItems: items.map((item) => ({
          cartItemId: item.id || item.cartItemId,
          productId: item.productId || item.product_id,
          quantity: item.quantity,
        })),
        couponId: appliedCoupon?.id || null,
        paymentMethodCode: formData.paymentMethod,
      };

      // Thêm thông tin địa chỉ tùy theo mode
      if (addressMode === "existing") {
        orderData.addressId = selectedAddressId;
      } else if (addressMode === "new") {
        const fullAddress = [
          formData.shipAddress,
          selectedWard?.name,
          selectedDistrict?.name,
          selectedProvince?.name,
        ]
          .filter(Boolean)
          .join(", ");

        orderData.newAddress = {
          receiverName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          fullAddress: fullAddress,
          addressType: newAddressType,
          isDefault: false,
        };
      }

      const response = await orderAPI.createOrder(orderData);
      const createdOrder = unwrapResponseData(response);

      createdOrderId = createdOrder?.id || createdOrder?.orderId || null;
      if (!createdOrderId) {
        throw new Error("Không thể lấy mã đơn hàng sau khi tạo đơn");
      }

      if (formData.paymentMethod === "VNPAY") {
        const paymentData = createdOrder?.payment || null;
        if (!paymentData?.paymentUrl) {
          throw new Error("Không nhận được đường dẫn thanh toán VNPay");
        }

        toast.success("Đơn hàng đã được tạo. Đang chuyển sang VNPay...");
        window.location.assign(paymentData.paymentUrl);
        return;
      }

      setOrderId(createdOrderId);
      setOrderSuccess(true);
      await fetchCart();

      toast.success("Đặt hàng thành công!");

      setTimeout(() => {
        navigate("/profile/orders");
      }, 3000);
    } catch (error) {
      console.error("Lỗi khi đặt hàng:", error);
      toast.error(
        error?.message ||
          (createdOrderId
            ? `Đơn hàng #${createdOrderId} đã tạo nhưng chưa hoàn tất xử lý.`
            : null) ||
          "Không thể đặt hàng. Vui lòng thử lại",
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
            className="glass-panel-strong mx-auto max-w-md rounded-[32px] p-12 text-center"
          >
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100/80">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="mb-3 text-2xl font-bold text-gray-900">
              Đặt hàng thành công!
            </h2>
            <p className="mb-2 text-gray-600">Cảm ơn bạn đã đặt hàng tại CoffeeBot</p>
            {orderId && (
              <p className="mb-6 text-sm text-gray-500">
                Mã đơn hàng: <span className="font-mono font-bold">#{orderId}</span>
              </p>
            )}
            <p className="mb-6 text-sm text-gray-600">
              Chúng tôi sẽ liên hệ với bạn sớm nhất để xác nhận đơn hàng
            </p>
            <Button onClick={() => navigate("/profile/orders")} variant="primary">
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
        <h1 className="mb-8 text-3xl font-bold text-gray-900">Thanh toán</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <div className="glass-card rounded-[28px] p-6">
                <div className="mb-6 flex items-center gap-3">
                  <div className="glass-card rounded-2xl p-2">
                    <MapPin className="h-6 w-6 text-coffee-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Địa chỉ giao hàng</h2>
                </div>

                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Input
                    label="Họ và tên"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    icon={<User className="h-5 w-5" />}
                  />
                  <Input
                    label="Số điện thoại"
                    name="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    required
                    icon={<Phone className="h-5 w-5" />}
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
                </div>

                {/* Address selection mode */}
                <div className="mb-6 border-t border-white/25 pt-6">
                  <p className="mb-4 text-sm font-semibold text-gray-700">Chọn địa chỉ giao hàng</p>
                  
                  {/* Mode selection toggle */}
                  <div className="mb-5 flex gap-3">
                    {savedAddresses.length > 0 && (
                      <label className="glass-card flex flex-1 cursor-pointer items-center gap-3 rounded-[20px] border border-transparent p-3 transition-all hover:border-coffee-300">
                        <input
                          type="radio"
                          value="existing"
                          checked={addressMode === "existing"}
                          onChange={(e) => setAddressMode(e.target.value)}
                          className="h-4 w-4 text-coffee-600"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Sử dụng địa chỉ có sẵn ({savedAddresses.length})
                        </span>
                      </label>
                    )}
                    <label className="glass-card flex flex-1 cursor-pointer items-center gap-3 rounded-[20px] border border-transparent p-3 transition-all hover:border-coffee-300">
                      <input
                        type="radio"
                        value="new"
                        checked={addressMode === "new"}
                        onChange={(e) => setAddressMode(e.target.value)}
                        className="h-4 w-4 text-coffee-600"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Thêm địa chỉ mới
                      </span>
                    </label>
                  </div>

                  {/* Existing addresses list */}
                  {addressMode === "existing" && savedAddresses.length > 0 && (
                    <div className="mb-6 space-y-3">
                      {savedAddresses.map((addr) => (
                        <label
                          key={addr.id}
                          className={`glass-card flex cursor-pointer gap-4 rounded-[20px] border p-3 transition-all ${
                            selectedAddressId === addr.id
                              ? "border-coffee-400 bg-coffee-50/50"
                              : "border-white/25 hover:border-coffee-200"
                          }`}
                        >
                          <input
                            type="radio"
                            value={addr.id}
                            checked={selectedAddressId === addr.id}
                            onChange={(e) => setSelectedAddressId(parseInt(e.target.value))}
                            className="mt-1 h-4 w-4 text-coffee-600"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-gray-900">{addr.receiverName}</p>
                              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                addr.addressType === 'home'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-orange-100 text-orange-700'
                              }`}>
                                {addr.addressType === 'home' ? 'Nhà' : 'Văn phòng'}
                              </span>
                              {addr.isDefault && (
                                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                                  Mặc định
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{addr.phoneNumber}</p>
                            <p className="mt-1 text-sm text-gray-600">{addr.fullAddress}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* New address form */}
                  {addressMode === "new" && (
                    <div className="space-y-4">
                      <div>
                        <Input
                          label="Địa chỉ chi tiết (Số nhà, tên đường)"
                          name="shipAddress"
                          value={formData.shipAddress}
                          onChange={handleInputChange}
                          placeholder="VD: 123 Nguyễn Huệ..."
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Tỉnh / Thành phố <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={selectedProvince?.code || ""}
                          onChange={handleProvinceChange}
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

                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Quận / Huyện <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={selectedDistrict?.code || ""}
                          onChange={handleDistrictChange}
                          disabled={!selectedProvince}
                          className="glass-select w-full disabled:cursor-not-allowed disabled:bg-gray-100"
                        >
                          <option value="">Chọn quận/huyện</option>
                          {districts.map((district) => (
                            <option key={district.code} value={district.code}>
                              {district.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Phường / Xã <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={selectedWard?.code || ""}
                          onChange={handleWardChange}
                          disabled={!selectedDistrict}
                          className="glass-select w-full disabled:cursor-not-allowed disabled:bg-gray-100"
                        >
                          <option value="">Chọn phường/xã</option>
                          {wards.map((ward) => (
                            <option key={ward.code} value={ward.code}>
                              {ward.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Address type selection */}
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Loại địa chỉ <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-3">
                          <label className="glass-card flex flex-1 cursor-pointer items-center gap-2 rounded-[16px] border border-white/25 p-3 transition-all hover:border-coffee-300">
                            <input
                              type="radio"
                              value="home"
                              checked={newAddressType === "home"}
                              onChange={(e) => setNewAddressType(e.target.value)}
                              className="h-4 w-4"
                            />
                            <span className="text-sm font-medium text-gray-700">Nhà riêng</span>
                          </label>
                          <label className="glass-card flex flex-1 cursor-pointer items-center gap-2 rounded-[16px] border border-white/25 p-3 transition-all hover:border-coffee-300">
                            <input
                              type="radio"
                              value="office"
                              checked={newAddressType === "office"}
                              onChange={(e) => setNewAddressType(e.target.value)}
                              className="h-4 w-4"
                            />
                            <span className="text-sm font-medium text-gray-700">Văn phòng</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
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

              <div className="glass-card rounded-[28px] p-6">
                <div className="mb-6 flex items-center gap-3">
                  <div className="glass-card rounded-2xl p-2">
                    <CreditCard className="h-6 w-6 text-coffee-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Phương thức thanh toán</h2>
                </div>

                <div className="space-y-3">
                  {paymentMethods.map((method) => {
                    const config =
                      PAYMENT_METHOD_CONFIG[method.code] || PAYMENT_METHOD_CONFIG.COD;

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
                          className="h-5 w-5 text-coffee-600 focus:ring-coffee-500"
                        />
                        <div>
                          <p className="font-semibold text-gray-900">{config.title}</p>
                          <p className="text-sm text-gray-600">{config.description}</p>
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
                <p className="mt-4 text-sm text-slate-500">{selectedPaymentConfig.description}</p>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="glass-panel sticky top-28 rounded-[32px] p-6">
                <h2 className="mb-6 text-xl font-bold text-gray-900">Đơn hàng của bạn</h2>

                <div className="mb-6 max-h-60 space-y-3 overflow-y-auto">
                  {items?.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <img
                        src={getImageSrc(item.imageUrl)}
                        alt={item.name}
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <p className="line-clamp-2 text-sm font-medium text-gray-900">
                          {item.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {item.quantity} x {formatCurrency(item.unitPrice)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mb-4 border-t border-white/25 pt-4">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Mã giảm giá
                  </label>
                  {appliedCoupon ? (
                    <div className="glass-card flex items-center justify-between rounded-[20px] border border-emerald-200/70 p-3">
                      <div>
                        <p className="font-semibold text-green-700">{appliedCoupon.code}</p>
                        <p className="text-xs text-green-600">
                          Giảm {appliedCoupon.discountPercent}%
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-sm font-medium text-red-600 hover:text-red-700"
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

                <div className="mb-6 space-y-2 border-t border-white/25 pt-4">
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
                      <span className="text-coffee-600">{formatCurrency(finalPrice)}</span>
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
