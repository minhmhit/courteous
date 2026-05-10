import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, CheckSquare, Square } from "lucide-react";
import useCartStore from "../../stores/useCartStore";
import useToastStore from "../../stores/useToastStore";
import Button from "../../components/ui/Button";
import SkeletonLoader from "../../components/ui/SkeletonLoader";
import { formatCurrency } from "../../utils/formatDate";

const CartPage = () => {
  const navigate = useNavigate();
  const toast = useToastStore();
  const { items, isLoading, fetchCart, updateQuantity, removeFromCart } = useCartStore();
  const [draftQuantities, setDraftQuantities] = useState({});
  const [quantityErrors, setQuantityErrors] = useState({});
  // Checkbox selection state - mặc định chọn tất cả
  const [selectedIds, setSelectedIds] = useState(new Set());

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Khi items thay đổi, đồng bộ draft quantities & giữ những id còn tồn tại
  useEffect(() => {
    setDraftQuantities(
      Object.fromEntries((items || []).map((item) => [item.id, String(item.quantity ?? 1)])),
    );
    setQuantityErrors({});
    // Thêm các item mới vào selected mặc định
    setSelectedIds((prev) => {
      const existingIds = new Set((items || []).map((i) => i.id));
      const next = new Set([...prev].filter((id) => existingIds.has(id)));
      // Thêm id mới chưa có trong prev
      (items || []).forEach((item) => {
        if (!prev.has(item.id)) next.add(item.id);
      });
      return next;
    });
  }, [items]);

  const allSelected = items?.length > 0 && selectedIds.size === items.length;
  const someSelected = selectedIds.size > 0 && !allSelected;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set((items || []).map((i) => i.id)));
    }
  };

  const toggleSelectItem = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Tóm tắt chỉ tính các sản phẩm được chọn
  const selectedItems = useMemo(
    () => (items || []).filter((item) => selectedIds.has(item.id)),
    [items, selectedIds],
  );
  const selectedTotalItems = selectedItems.reduce((sum, i) => sum + (i.quantity || 0), 0);
  const selectedTotalPrice = selectedItems.reduce(
    (sum, i) => sum + (i.unitPrice || 0) * (i.quantity || 0),
    0,
  );

  const getMaxStock = (item) => {
    const stock = Number(item?.stockQuantity);
    return Number.isFinite(stock) && stock > 0 ? stock : null;
  };

  const validateQuantity = (value, item) => {
    if (!value) return "Vui lòng nhập số lượng";
    const quantity = Number(value);
    if (!Number.isInteger(quantity) || quantity <= 0) return "Chỉ được nhập số nguyên dương";
    const maxStock = getMaxStock(item);
    if (maxStock !== null && quantity > maxStock) return `Chỉ còn ${maxStock} sản phẩm trong kho`;
    return "";
  };

  const handleUpdateQuantity = async (item, newQuantity) => {
    if (newQuantity < 1) return;
    const maxStock = getMaxStock(item);
    if (maxStock !== null && newQuantity > maxStock) {
      const message = `Chỉ còn ${maxStock} sản phẩm trong kho`;
      setQuantityErrors((prev) => ({ ...prev, [item.id]: message }));
      toast.error(message);
      return;
    }
    try {
      await updateQuantity(item.id, newQuantity);
      setQuantityErrors((prev) => ({ ...prev, [item.id]: "" }));
    } catch {
      toast.error("Không thể cập nhật số lượng");
    }
  };

  const handleQuantityInputChange = (item, value) => {
    const sanitizedValue = value.replace(/\D/g, "");
    setDraftQuantities((prev) => ({ ...prev, [item.id]: sanitizedValue }));
    setQuantityErrors((prev) => ({
      ...prev,
      [item.id]: validateQuantity(sanitizedValue, item),
    }));
  };

  const commitQuantityInput = async (item) => {
    const draftValue = draftQuantities[item.id] ?? String(item.quantity ?? 1);
    const errorMessage = validateQuantity(draftValue, item);
    if (errorMessage) {
      setQuantityErrors((prev) => ({ ...prev, [item.id]: errorMessage }));
      setDraftQuantities((prev) => ({ ...prev, [item.id]: String(item.quantity ?? 1) }));
      toast.error(errorMessage);
      return;
    }
    const nextQuantity = Number(draftValue);
    if (nextQuantity === Number(item.quantity)) return;
    await handleUpdateQuantity(item, nextQuantity);
  };

  const handleRemove = async (cartItemId) => {
    try {
      await removeFromCart(cartItemId);
      toast.success("Đã xóa sản phẩm khỏi giỏ hàng");
    } catch {
      toast.error("Không thể xóa sản phẩm");
    }
  };

  const handleCheckout = () => {
    if (selectedIds.size === 0) {
      toast.error("Vui lòng chọn ít nhất một sản phẩm để thanh toán");
      return;
    }
    // Lưu danh sách selectedIds vào sessionStorage để CheckoutPage biết
    sessionStorage.setItem("checkout_selected_ids", JSON.stringify([...selectedIds]));
    navigate("/checkout");
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
          <p className="mt-2 text-slate-600">{items.length} sản phẩm trong giỏ.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Danh sách sản phẩm */}
          <div className="space-y-3 lg:col-span-2">
            {/* Select-all bar */}
            <div className="glass-card flex items-center gap-3 rounded-2xl px-5 py-3">
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-2 text-sm font-semibold text-slate-700 transition-colors hover:text-coffee-700"
                aria-label="Chọn tất cả"
              >
                {allSelected ? (
                  <CheckSquare className="h-5 w-5 text-coffee-600" />
                ) : someSelected ? (
                  <CheckSquare className="h-5 w-5 text-coffee-400" />
                ) : (
                  <Square className="h-5 w-5 text-slate-400" />
                )}
                <span>
                  {allSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                </span>
              </button>
              {selectedIds.size > 0 && (
                <span className="ml-auto text-xs text-slate-500">
                  Đã chọn <strong className="text-coffee-700">{selectedIds.size}</strong>/{items.length} sản phẩm
                </span>
              )}
            </div>

            {items.map((item) => {
              const maxStock = getMaxStock(item);
              const isSelected = selectedIds.has(item.id);

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`glass-card rounded-[28px] p-5 transition-all duration-200 ${
                    isSelected
                      ? "ring-2 ring-coffee-400/60 shadow-md shadow-coffee-100"
                      : "opacity-75"
                  }`}
                >
                  <div className="flex flex-col gap-4 md:flex-row">
                    {/* Checkbox */}
                    <div className="flex flex-shrink-0 items-start pt-1 md:pt-3">
                      <button
                        onClick={() => toggleSelectItem(item.id)}
                        className="flex-shrink-0 transition-transform hover:scale-110"
                        aria-label={`${isSelected ? "Bỏ chọn" : "Chọn"} ${item.name || item.productName}`}
                      >
                        {isSelected ? (
                          <CheckSquare className="h-5 w-5 text-coffee-600" />
                        ) : (
                          <Square className="h-5 w-5 text-slate-400" />
                        )}
                      </button>
                    </div>

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
                      <p className="mb-2 text-sm text-slate-500">{item.description}</p>
                      {maxStock !== null && (
                        <p className="mb-3 text-sm text-slate-500">Tồn kho: {maxStock}</p>
                      )}

                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <div className="glass-card flex w-fit items-center rounded-2xl border border-white/40">
                            <button
                              onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                              disabled={Number(item.quantity) <= 1}
                              className="rounded-l-2xl px-3 py-3 hover:bg-white/35 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <input
                              type="text"
                              inputMode="numeric"
                              value={draftQuantities[item.id] ?? String(item.quantity ?? 1)}
                              onChange={(e) => handleQuantityInputChange(item, e.target.value)}
                              onBlur={() => void commitQuantityInput(item)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") e.currentTarget.blur();
                              }}
                              className="w-20 border-x border-white/40 bg-transparent px-3 py-3 text-center font-semibold outline-none"
                              aria-label={`Số lượng ${item.name || item.productName}`}
                            />
                            <button
                              onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                              disabled={maxStock !== null && Number(item.quantity) >= maxStock}
                              className="rounded-r-2xl px-3 py-3 hover:bg-white/35 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          {quantityErrors[item.id] && (
                            <p className="mt-2 text-sm text-red-600">{quantityErrors[item.id]}</p>
                          )}
                        </div>

                        <div className="text-right">
                          <p className="text-xl font-bold text-coffee-700">
                            {formatCurrency(item.unitPrice * item.quantity)}
                          </p>
                          <p className="text-sm text-slate-500">
                            {formatCurrency(item.unitPrice)} / sản phẩm
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemove(item.id)}
                      className="glass-card h-fit rounded-2xl p-3 text-red-600 hover:bg-red-50/80"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Tóm tắt đơn hàng */}
          <div>
            <div className="glass-panel sticky top-28 rounded-[32px] p-6">
              <h2 className="mb-6 text-xl font-bold text-slate-900">Tóm tắt đơn hàng</h2>

              {selectedIds.size === 0 ? (
                <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/60 p-4 text-center text-sm text-amber-700">
                  Chưa chọn sản phẩm nào để thanh toán
                </div>
              ) : (
                <div className="mb-6 space-y-3">
                  <div className="flex justify-between text-slate-600">
                    <span>Sản phẩm đã chọn</span>
                    <span className="font-medium text-coffee-700">{selectedIds.size} loại</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Tạm tính ({selectedTotalItems} sản phẩm)</span>
                    <span>{formatCurrency(selectedTotalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Phí vận chuyển</span>
                    <span className="text-emerald-600">Miễn phí</span>
                  </div>
                  <div className="border-t border-white/25 pt-3">
                    <div className="flex justify-between text-lg font-bold text-slate-900">
                      <span>Tổng cộng</span>
                      <span className="text-coffee-700">{formatCurrency(selectedTotalPrice)}</span>
                    </div>
                  </div>
                </div>
              )}

              <Button
                variant="primary"
                className="mb-3 w-full"
                onClick={handleCheckout}
                disabled={selectedIds.size === 0}
              >
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
