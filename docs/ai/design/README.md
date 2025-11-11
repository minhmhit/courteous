# 🎨 AI-DevKit Phase: DESIGN

## Dự án: Hệ thống Bán Cà Phê Bột – Frontend Web

---

## 📋 Tổng quan

Phase DESIGN định nghĩa chi tiết về giao diện, trải nghiệm người dùng, và kiến trúc frontend cho hệ thống bán cà phê bột.

---

## 🎯 Design Goals

1. **Customer (B2C)**: Hiện đại, trendy, dễ sử dụng trên mobile
2. **Enterprise**: Tối giản, hiệu quả, tập trung vào quản lý
3. **Consistent**: Thống nhất về UI/UX giữa các module
4. **Accessible**: Tuân thủ chuẩn WCAG cơ bản

---

## 🎨 Design System

### Color Palette

#### Coffee Theme (Primary)

```css
coffee-50:  #fdf8f3  /* Background nhạt */
coffee-100: #f7ede0  /* Background */
coffee-200: #eed9bf  /* Border */
coffee-300: #e3bf98  /* Hover */
coffee-400: #d69d6f
coffee-500: #cb7f4f
coffee-600: #be6943  /* Primary */
coffee-700: #9e5439  /* Primary Dark */
coffee-800: #7f4533
coffee-900: #673a2b  /* Text Dark */
```

#### Cream Theme (Secondary)

```css
cream-50:  #fdfcfb
cream-100: #faf7f4
cream-200: #f5efe8
cream-300: #ede3d8
cream-400: #e1d1c1
cream-500: #d4bca6
cream-600: #c5a489
cream-700: #b08968
cream-800: #8f6f55
cream-900: #745a46
```

#### Functional Colors

- Success: Green-600 (#10b981)
- Error: Red-600 (#dc2626)
- Warning: Yellow-600 (#ca8a04)
- Info: Blue-600 (#2563eb)

### Typography

```css
Font Stack:
- Display: 'Poppins', system-ui, sans-serif  /* Headers */
- Sans: 'Inter', system-ui, sans-serif        /* Body */

Font Sizes:
- xs:   0.75rem  (12px)
- sm:   0.875rem (14px)
- base: 1rem     (16px)
- lg:   1.125rem (18px)
- xl:   1.25rem  (20px)
- 2xl:  1.5rem   (24px)
- 3xl:  1.875rem (30px)
- 4xl:  2.25rem  (36px)
- 5xl:  3rem     (48px)
```

### Spacing

```
4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px
```

### Border Radius

```
sm: 0.375rem (6px)
md: 0.5rem   (8px)
lg: 0.75rem  (12px)
xl: 1rem     (16px)
2xl: 1.5rem  (24px)
```

### Shadows

```css
sm:  0 1px 2px 0 rgb(0 0 0 / 0.05)
md:  0 4px 6px -1px rgb(0 0 0 / 0.1)
lg:  0 10px 15px -3px rgb(0 0 0 / 0.1)
xl:  0 20px 25px -5px rgb(0 0 0 / 0.1)
2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25)
```

---

## 🧩 Component Hierarchy

### Customer Site

```
App
├── ToastContainer (Global)
├── BrowserRouter
    ├── HomePage
    │   ├── Navbar
    │   ├── HeroSection
    │   ├── FeaturedProducts
    │   ├── Categories
    │   ├── PromoBanner
    │   └── Footer
    ├── ProductsPage
    │   ├── Navbar
    │   ├── FilterSidebar
    │   ├── ProductGrid
    │   │   └── ProductCard[]
    │   ├── Pagination
    │   └── Footer
    ├── ProductDetailPage
    │   ├── Navbar
    │   ├── ProductGallery
    │   ├── ProductInfo
    │   ├── AddToCartSection
    │   ├── RelatedProducts
    │   └── Footer
    ├── CartPage
    │   ├── Navbar
    │   ├── CartItemList
    │   │   └── CartItem[]
    │   ├── CartSummary
    │   └── Footer
    ├── CheckoutPage
    │   ├── Navbar
    │   ├── ShippingForm
    │   ├── PaymentMethod
    │   ├── OrderSummary
    │   └── Footer
    └── ProfilePage
        ├── Navbar
        ├── ProfileSidebar
        ├── ProfileContent
        │   ├── PersonalInfo
        │   ├── OrderHistory
        │   └── ChangePassword
        └── Footer
```

### Admin Panel

```
AdminLayout
├── Sidebar
│   ├── Logo
│   ├── Navigation[]
│   └── UserInfo
└── MainContent
    ├── DashboardPage
    │   ├── StatsCards[]
    │   ├── RevenueChart
    │   └── RecentOrders
    ├── AdminProductsPage
    │   ├── ProductTable
    │   ├── ProductFormModal
    │   └── DeleteConfirmModal
    ├── AdminOrdersPage
    │   ├── OrderTable
    │   ├── OrderDetailModal
    │   └── StatusUpdateModal
    ├── WarehousePage
    │   ├── InventoryTable
    │   ├── ImportFormModal
    │   └── SupplierManagement
    └── HRMPage
        ├── EmployeeTable
        ├── EmployeeFormModal
        └── RoleManagement
```

---

## 📱 Wireframes

### Customer - HomePage (Mobile-First)

```
+----------------------------------+
|  [☰]  LOGO         [🛒] [👤]    |
+----------------------------------+
|                                  |
|    🖼️  HERO BANNER               |
|    "Cà Phê Chất Lượng Cao"      |
|    [Mua Ngay]                    |
|                                  |
+----------------------------------+
|  Danh Mục Nổi Bật               |
|  +--------+ +--------+           |
|  | Coffee | | Arabica|           |
|  +--------+ +--------+           |
+----------------------------------+
|  Sản Phẩm Trending              |
|  +-------------+                 |
|  | 🖼️ Product  |                 |
|  | Name        |                 |
|  | 200,000đ    |                 |
|  | [🛒]        |                 |
|  +-------------+                 |
+----------------------------------+
```

### Admin - Dashboard (Desktop)

```
+----------+------------------------------------------+
| SIDEBAR  |  DASHBOARD                              |
|          |                                          |
| • Dash   |  +------------+ +------------+           |
| • Prods  |  | Đơn hàng   | | Doanh thu  |          |
| • Orders |  | 123        | | 50M đ      |          |
| • Users  |  +------------+ +------------+           |
|          |                                          |
| [Logout] |  📊 Biểu đồ doanh thu                   |
+----------+------------------------------------------+
```

---

## 🎭 Animation Guidelines

### Framer Motion Variants

```jsx
// Fade In
const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

// Slide Up
const slideUp = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: -20, opacity: 0 },
};

// Scale
const scale = {
  initial: { scale: 0.95 },
  animate: { scale: 1 },
  exit: { scale: 0.95 },
};

// Stagger Children
const stagger = {
  animate: {
    transition: { staggerChildren: 0.1 },
  },
};
```

### Hover Effects

- **Buttons**: Scale(1.02) + Shadow increase
- **Cards**: translateY(-5px) + Shadow increase
- **Icons**: Scale(1.1) + Rotate
- **Images**: Scale(1.05) với overflow hidden

---

## 📐 Layout Patterns

### Grid System

```css
/* Mobile First */
.container {
  padding: 1rem;
}

/* Tablet */
@media (min-width: 768px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Large Desktop */
@media (min-width: 1280px) {
  .grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

### Admin Layout

```
+---------+-----------------------------------+
| Sidebar | Header                           |
| 256px   |                                   |
|         +-----------------------------------+
|         | Content Area                      |
|         | padding: 2rem                     |
|         |                                   |
+---------+-----------------------------------+
```

---

## 🔄 State Management (Zustand)

### Stores Structure

```javascript
// useAuthStore
{
  user: { id, name, email, roleId },
  token: string,
  isAuthenticated: boolean,
  actions: { login, logout, register, updateProfile }
}

// useCartStore
{
  items: [],
  totalItems: number,
  totalPrice: number,
  actions: { addToCart, updateQuantity, removeFromCart }
}

// useToastStore
{
  toasts: [],
  actions: { success, error, info, warning }
}
```

---

## ✅ Acceptance Criteria

### Customer UI

- ✅ Responsive từ 320px đến 1920px
- ✅ Animation mượt (60fps)
- ✅ Loading states rõ ràng
- ✅ Toast notifications
- ✅ Accessible (keyboard navigation)

### Admin UI

- ✅ Data tables với sort/filter
- ✅ Form validation
- ✅ Modal workflows
- ✅ Confirm dialogs
- ✅ Real-time updates

---

## 📚 Design Resources

- **Icons**: Lucide React
- **Fonts**: Google Fonts (Inter, Poppins)
- **Images**: Placeholder sử dụng via.placeholder.com
- **Charts**: (Sẽ thêm Chart.js hoặc Recharts)

---

## 🚀 Next Phase

Phase tiếp theo: **PLANNING** - Định nghĩa chi tiết implementation plan, task breakdown, và timeline.

---

_Tài liệu này được tạo tự động bởi AI-DevKit_
_Cập nhật lần cuối: 2025-11-11_
