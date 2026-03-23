import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import useCartStore from "../../stores/useCartStore";
import useToastStore from "../../stores/useToastStore";
import Button from "../../components/ui/Button";
import SkeletonLoader from "../../components/ui/SkeletonLoader";
import { formatCurrency } from "../../utils/formatDate";

const CartPage = () => {
  const navigate = useNavigate();
  const toast = useToastStore();
  const { items, totalItems, totalPrice, isLoading, fetchCart, updateQuantity, removeFromCart } = useCartStore();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleUpdateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await updateQuantity(cartItemId, newQuantity);
    } catch {
      toast.error("Không thể cập nhật số lượng");
    }
  };

  const handleRemove = async (cartItemId) => {
    try {
      await removeFromCart(cartItemId);
      toast.success("Đã xóa sản phẩm khỏi giỏ hàng");
    } catch {
      toast.error("Không thể xóa sản phẩm");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen px-3 py-8 md:px-6">
        <div className="mx-auto max-w-7xl">
          <SkeletonLoader className="h-96" />
        </div>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="min-h-screen px-3 py-10 md:px-6">
        <div className="mx-auto max-w-xl">
          <div className="glass-panel-strong rounded-[32px] p-12 text-center">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white/45">
              <ShoppingCart className="h-12 w-12 text-slate-400" />
            </div>
            <h2 className="mb-3 text-2xl font-bold text-slate-900">Giỏ hàng trống</h2>
            <p className="mb-6 text-slate-600">Bạn chưa có sản phẩm nào trong giỏ hàng.</p>
            <Link to="/products">
              <Button variant="primary">Khám phá sản phẩm</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-3 py-6 md:px-6 md:py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="glass-panel-strong rounded-[32px] px-6 py-8 md:px-8">
          <h1 className="text-3xl font-bold text-slate-900">Giỏ hàng của bạn</h1>
          <p className="mt-2 text-slate-600">{totalItems} sản phẩm đang chờ thanh toán.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-[28px] p-6"
              >
                <div className="flex flex-col gap-5 md:flex-row">
                  <Link to={`/products/${item.productId}`} className="flex-shrink-0">
                    <img
                      src={item.imageUrl || "https://via.placeholder.com/150"}
                      alt={item.name}
                      className="h-24 w-24 rounded-2xl object-cover"
                    />
                  </Link>

                  <div className="min-w-0 flex-1">
                    <Link to={`/products/${item.productId}`}>
                      <h3 className="mb-1 text-lg font-semibold text-slate-900 transition-colors hover:text-coffee-700">
                        {item.name || item.productName}
                      </h3>
                    </Link>
                    <p className="mb-4 text-sm text-slate-500">{item.description}</p>

                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="glass-card flex w-fit items-center rounded-2xl border border-white/40">
                        <button onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)} className="rounded-l-2xl px-3 py-3 hover:bg-white/35">
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="px-4 font-semibold">{item.quantity}</span>
                        <button onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)} className="rounded-r-2xl px-3 py-3 hover:bg-white/35">
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-xl font-bold text-coffee-700">{formatCurrency(item.unitPrice * item.quantity)}</p>
                        <p className="text-sm text-slate-500">{formatCurrency(item.unitPrice)} / sản phẩm</p>
                      </div>
                    </div>
                  </div>

                  <button onClick={() => handleRemove(item.id)} className="glass-card h-fit rounded-2xl p-3 text-red-600 hover:bg-red-50/80">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          <div>
            <div className="glass-panel sticky top-28 rounded-[32px] p-6">
              <h2 className="mb-6 text-xl font-bold text-slate-900">Tóm tắt đơn hàng</h2>
              <div className="mb-6 space-y-3">
                <div className="flex justify-between text-slate-600">
                  <span>Tạm tính ({totalItems} sản phẩm)</span>
                  <span>{formatCurrency(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Phí vận chuyển</span>
                  <span className="text-emerald-600">Miễn phí</span>
                </div>
                <div className="border-t border-white/25 pt-3">
                  <div className="flex justify-between text-lg font-bold text-slate-900">
                    <span>Tổng cộng</span>
                    <span className="text-coffee-700">{formatCurrency(totalPrice)}</span>
                  </div>
                </div>
              </div>

              <Button variant="primary" className="mb-3 w-full" onClick={() => navigate("/checkout")}>
                Tiến hành thanh toán
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <Link to="/products">
                <Button variant="outline" className="w-full">Tiếp tục mua sắm</Button>
              </Link>

              <div className="glass-card mt-6 rounded-[24px] p-4 text-sm text-slate-600">
                <p className="mb-1 font-semibold text-coffee-800">Ưu đãi đặc biệt</p>
                <p>Miễn phí vận chuyển cho đơn hàng trên 500.000đ.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
