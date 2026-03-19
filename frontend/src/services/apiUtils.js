const ROLE_CODE_BY_ID = {
  1: "ADMIN",
  2: "USER",
  3: "WAREHOUSE",
  4: "SALE",
  5: "HRM",
};

export const unwrapData = (response) => response?.data ?? response ?? null;

export const normalizeRoleCode = (roleCode, roleId) => {
  if (typeof roleCode === "string" && roleCode.trim()) {
    return roleCode.trim().toUpperCase();
  }

  if (typeof roleId === "number") {
    return ROLE_CODE_BY_ID[roleId] || null;
  }

  return null;
};

export const normalizeUser = (user) => {
  if (!user) return null;

  const roleId =
    user.role?.id ??
    user.roleId ??
    user.role_id ??
    (typeof user.role === "number" ? user.role : null);
  const roleCode = normalizeRoleCode(
    user.role?.code ?? user.roleCode ?? user.role_code ?? user.roleName ?? user.role,
    roleId,
  );

  return {
    ...user,
    name: user.name ?? user.fullName ?? user.full_name ?? "",
    phoneNumber: user.phoneNumber ?? user.phone ?? user.phone_number ?? "",
    isActive: user.isActive ?? user.is_active ?? true,
    roleId,
    roleCode,
    roleName: roleCode ? roleCode.toLowerCase() : null,
    role: {
      ...(typeof user.role === "object" && user.role ? user.role : {}),
      id: roleId,
      code: roleCode,
      name: user.role?.name ?? roleCode,
    },
  };
};

export const normalizeCoupon = (coupon) => {
  if (!coupon) return null;

  return {
    ...coupon,
    discountPercent:
      coupon.discountPercent ?? coupon.discountPercentage ?? coupon.discount_percent ?? 0,
    discountPercentage:
      coupon.discountPercentage ?? coupon.discountPercent ?? coupon.discount_percent ?? 0,
    validFrom: coupon.validFrom ?? coupon.startDate ?? coupon.start_date ?? null,
    validUntil: coupon.validUntil ?? coupon.endDate ?? coupon.end_date ?? null,
    startDate: coupon.startDate ?? coupon.validFrom ?? coupon.valid_from ?? null,
    endDate: coupon.endDate ?? coupon.validUntil ?? coupon.valid_until ?? null,
    usageLimit: coupon.usageLimit ?? coupon.usage_limit ?? 0,
    currentUsage:
      coupon.currentUsage ?? coupon.usedCount ?? coupon.used_count ?? coupon.current_usage ?? 0,
    isActive: coupon.isActive ?? coupon.is_active ?? true,
  };
};

export const normalizeOrderItem = (item) => {
  if (!item) return null;

  const unitPrice = Number(item.unitPrice ?? item.unit_price ?? item.price ?? 0);

  return {
    ...item,
    productId: item.productId ?? item.product_id ?? null,
    variantId: item.variantId ?? item.variant_id ?? null,
    productName: item.productName ?? item.product_name ?? item.product?.name ?? item.name ?? "",
    quantity: Number(item.quantity ?? 0),
    unitPrice,
    price: unitPrice,
    imageUrl: item.imageUrl ?? item.image_url ?? item.product?.imageUrl ?? null,
  };
};

export const normalizeOrder = (order) => {
  if (!order) return null;

  const items = Array.isArray(order.items) ? order.items.map(normalizeOrderItem) : [];

  return {
    ...order,
    status: String(order.status ?? "").toUpperCase(),
    orderDate: order.orderDate ?? order.createdAt ?? order.created_at ?? null,
    totalAmount: Number(order.totalAmount ?? order.total_amount ?? 0),
    customerName:
      order.customerName ??
      order.customer_name ??
      order.user?.name ??
      order.name ??
      "",
    phoneNumber: order.phoneNumber ?? order.phone_number ?? "",
    shipAddress: order.shipAddress ?? order.ship_address ?? "",
    items,
  };
};

export const normalizePaymentMethod = (method) => {
  if (!method) return null;

  return {
    ...method,
    id: method.id ?? method.payment_method_id ?? null,
    code: method.code ?? method.payment_method_code ?? null,
    name: method.name ?? method.payment_method_name ?? method.code ?? "",
  };
};
