# Phase 2 - User Profile & Order Management

## ✅ Hoàn thành

### 1. Cart Fix ✅

**Vấn đề:**

- Cart API chưa có trong Postman collection
- Response structure chưa rõ ràng từ backend

**Giải pháp:**

- Thêm error handling graceful trong `useCartStore`
- Handle nhiều response structures (nested data, different field names)
- Fallback to empty cart nếu backend chưa sẵn sàng
- Thêm debug console logs để tracking

**Files Modified:**

- `src/stores/useCartStore.js` - Enhanced error handling

---

### 2. ProfilePage ✅

**File:** `src/pages/customer/ProfilePage.jsx`

**Chức năng:**

- Sidebar navigation với avatar
- 4 tabs: Personal Info, Change Password, Orders, Settings
- Personal Info tab:
  - Form update name, email (disabled), phone
  - Save changes button
- Change Password tab:
  - Current password, new password, confirm password
  - Validation (min 6 chars, passwords match)
- Orders tab:
  - Link to OrderHistoryPage
- Settings tab:
  - Email notifications toggle
  - Language selector

**Features:**

- Framer Motion animations cho tab switching
- Auto-fill user info từ `useAuthStore`
- Toast notifications
- Loading states
- Responsive sidebar/tabs

**API Integration:**

- `useAuthStore.updateProfile()`
- `authAPI.changePassword()`

---

### 3. OrderHistoryPage ✅

**File:** `src/pages/customer/OrderHistoryPage.jsx`

**Chức năng:**

- Danh sách tất cả đơn hàng của user
- Filter tabs theo status:
  - Tất cả
  - Chờ xác nhận (pending)
  - Đã xác nhận (confirmed)
  - Đang giao (shipping)
  - Đã giao (delivered)
  - Đã hủy (cancelled)
- Mỗi order card hiển thị:
  - Order ID
  - Ngày đặt hàng
  - Status badge với icon và màu
  - Preview 2 items đầu tiên
  - Tổng tiền
  - Button "Xem chi tiết"

**Status System:**

```javascript
{
  pending: { label: "Chờ xác nhận", icon: Clock, color: yellow },
  confirmed: { label: "Đã xác nhận", icon: CheckCircle, color: blue },
  shipping: { label: "Đang giao", icon: Truck, color: purple },
  delivered: { label: "Đã giao", icon: CheckCircle, color: green },
  cancelled: { label: "Đã hủy", icon: XCircle, color: red }
}
```

**Empty State:**

- Icon + message khi chưa có đơn hàng
- CTA button "Khám phá sản phẩm"

**API Integration:**

- `orderAPI.getUserOrders()` - Lấy danh sách orders

---

### 4. OrderDetailPage ✅

**File:** `src/pages/customer/OrderDetailPage.jsx`

**Chức năng:**

- Chi tiết đầy đủ của 1 đơn hàng
- **Timeline tracking** - Progress steps:
  - Chờ xác nhận → Đã xác nhận → Đang giao → Đã giao
  - Visual timeline với icons và colors
  - Active/inactive states
  - Cancelled orders có timeline riêng
- **Products section:**
  - List tất cả items trong đơn
  - Ảnh, tên, số lượng, đơn giá
  - Subtotal cho mỗi item
- **Order summary sidebar:**
  - Tạm tính, phí ship, tổng cộng
  - Button "Hủy đơn hàng" (chỉ hiển thị khi status = pending)
- **Customer info:**
  - Họ tên, SĐT, email, địa chỉ giao hàng
  - Icons cho mỗi field
- **Payment method:**
  - COD hoặc Banking

**Cancel Order:**

- Confirm dialog
- Loading state
- Auto-refresh sau khi cancel
- Toast notification

**API Integration:**

- `orderAPI.getOrderById(id)`
- `orderAPI.cancelOrder(id)`

---

### 5. Order Tracking Component ✅

**Tích hợp trong:** `OrderDetailPage.jsx`

**Timeline Logic:**

```javascript
const getTimeline = (status) => {
  if (status === "cancelled") {
    return [
      { key: "pending", label: "Chờ xác nhận", completed: true },
      { key: "cancelled", label: "Đã hủy", completed: true },
    ];
  }

  const steps = [
    { key: "pending", label: "Chờ xác nhận" },
    { key: "confirmed", label: "Đã xác nhận" },
    { key: "shipping", label: "Đang giao hàng" },
    { key: "delivered", label: "Đã giao hàng" },
  ];

  // Mark completed based on current status
  return steps.map((step, index) => ({
    ...step,
    completed: index <= currentStatusIndex,
  }));
};
```

**Visual:**

- Vertical timeline với dots
- Green color cho completed steps
- Gray for pending steps
- Connecting lines between steps
- Timestamps cho completed steps

---

## 🔌 API Endpoints Used

### Orders:

```javascript
GET  /orders/           - getUserOrders()
GET  /orders/:id        - getOrderById(id)
PUT  /orders/:id/cancel - cancelOrder(id)
```

### User Profile:

```javascript
GET / auth / users / profile - getProfile();
PUT / users / profile - updateProfile(userData);
PUT / auth / users / password - changePassword(passwordData);
```

---

## 🎨 UI Components Created

### Pages:

1. ✅ ProfilePage - User dashboard với tabs
2. ✅ OrderHistoryPage - Danh sách đơn hàng
3. ✅ OrderDetailPage - Chi tiết đơn hàng với tracking

### Features:

- Sidebar navigation
- Tab system
- Order status badges
- Timeline component
- Empty states
- Loading skeletons
- Responsive grid layouts

---

## 📱 Routes Added

```javascript
/profile              → ProfilePage (protected)
/profile/orders       → OrderHistoryPage (protected)
/orders/:id           → OrderDetailPage (protected)
```

---

## ✨ Key Features

### Profile Management:

- ✅ Update personal info
- ✅ Change password với validation
- ✅ Email notifications settings
- ✅ Language selector

### Order Management:

- ✅ View all orders
- ✅ Filter by status
- ✅ View order details
- ✅ Track order progress
- ✅ Cancel pending orders
- ✅ Timeline visualization

### UX Enhancements:

- ✅ Framer Motion animations
- ✅ Toast notifications
- ✅ Loading states
- ✅ Empty states
- ✅ Confirm dialogs
- ✅ Responsive design
- ✅ Icon system

---

## 🔜 Wishlist Feature (Optional)

Tính năng này được đánh dấu **optional** trong requirements. Nếu cần, tôi có thể implement:

**Planned Features:**

- Add/Remove products to wishlist
- Wishlist page
- Wishlist icon in Navbar
- Quick add to cart from wishlist
- Share wishlist

**Would require:**

- wishlistAPI endpoints
- useWishlistStore
- WishlistPage component
- Integration với ProductCard

---

## 📊 Summary

### Files Created:

1. `src/pages/customer/OrderHistoryPage.jsx` - NEW (~280 lines)
2. `src/pages/customer/OrderDetailPage.jsx` - NEW (~340 lines)

### Files Modified:

1. `src/pages/customer/ProfilePage.jsx` - COMPLETE (~280 lines)
2. `src/stores/useCartStore.js` - Enhanced error handling
3. `src/App.jsx` - Added 2 new routes

### Total Lines Added: ~900+ LOC

---

## ✅ Phase 2 Status: COMPLETE

**Completed:**

- ✅ Cart fix với error handling
- ✅ ProfilePage với 4 tabs
- ✅ OrderHistoryPage với filter
- ✅ OrderDetailPage với tracking timeline
- ✅ Order tracking visual timeline
- ⏸️ Wishlist (optional - skipped for now)

**Next Phase (Phase 3 - Admin):**

- Admin Dashboard enhancement
- Admin Products CRUD
- Admin Orders management
- Admin Users management
- Admin Categories
- Admin Settings

---

**Date:** 2025-11-11
**Status:** ✅ Phase 2 Complete
**Ready for:** Phase 3 (Admin Panel)

---

© 2025 CoffeeBot - Phase 2 Implementation
