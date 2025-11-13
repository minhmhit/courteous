# 🔐 Hệ Thống Phân Quyền - Coffee Shop Frontend

## 📋 Định nghĩa Roles

| Role ID | Tên Role          | Mô tả                                  |
| ------- | ----------------- | -------------------------------------- |
| `0`     | **Guest** (Khách) | Người dùng chưa đăng nhập              |
| `1`     | **Admin**         | Quản lý doanh nghiệp - Có tất cả quyền |
| `2`     | **Customer**      | Người dùng đã đăng nhập                |
| `3`     | **Warehouse**     | Quản lý kho                            |
| `4`     | **Sales**         | Nhân viên bán hàng                     |
| `5`     | **HRM**           | Nhân viên quản lý user                 |

---

## 🗺️ Phân Quyền Chi Tiết Theo Trang

### 1️⃣ **Public Routes** (Không cần đăng nhập - Role 0,1,2,3,4,5)

| Route               | Component         | Mô tả                 |
| ------------------- | ----------------- | --------------------- |
| `/`                 | HomePage          | Trang chủ             |
| `/products`         | ProductsPage      | Danh sách sản phẩm    |
| `/products/:id`     | ProductDetailPage | Chi tiết sản phẩm     |
| `/privacy-policy`   | PolicyPage        | Chính sách bảo mật    |
| `/terms-of-service` | PolicyPage        | Điều khoản sử dụng    |
| `/return-policy`    | PolicyPage        | Chính sách đổi trả    |
| `/shipping-policy`  | PolicyPage        | Chính sách vận chuyển |
| `/login`            | LoginPage         | Đăng nhập             |
| `/register`         | RegisterPage      | Đăng ký               |

**Lưu ý:** Tất cả mọi người đều có thể truy cập các trang này

---

### 2️⃣ **Customer Routes** (Yêu cầu đăng nhập - Role 2,3,4,5,1)

| Route             | Component        | Roles     | Mô tả             |
| ----------------- | ---------------- | --------- | ----------------- |
| `/cart`           | CartPage         | 1,2       | Giỏ hàng          |
| `/checkout`       | CheckoutPage     | 1,2       | Thanh toán        |
| `/profile`        | ProfilePage      | 1,2,3,4,5 | Thông tin cá nhân |
| `/profile/orders` | OrderHistoryPage | 1,2       | Lịch sử đơn hàng  |
| `/orders/:id`     | OrderDetailPage  | 1,2       | Chi tiết đơn hàng |

**Logic:**

- **Role 2 (Customer)**: Khách hàng bình thường - truy cập đầy đủ
- **Role 1 (Admin)**: Admin có thể truy cập như customer
- **Role 3,4,5**: Nhân viên có thể xem profile nhưng không mua hàng

---

### 3️⃣ **Admin Routes** (Enterprise Management)

#### A. **Dashboard & Analytics** (Role 1)

| Route              | Component          | Roles | Mô tả                |
| ------------------ | ------------------ | ----- | -------------------- |
| `/admin/dashboard` | DashboardPage      | 1     | Tổng quan kinh doanh |
| `/admin/analytics` | AdminAnalyticsPage | 1     | Phân tích & báo cáo  |

**Logic:** Chỉ Admin mới xem được tổng quan toàn bộ hệ thống

---

#### B. **Product Management** (Role 1, 3)

| Route               | Component           | Roles | Mô tả            |
| ------------------- | ------------------- | ----- | ---------------- |
| `/admin/products`   | AdminProductsPage   | 1,3   | Quản lý sản phẩm |
| `/admin/categories` | AdminCategoriesPage | 1,3   | Quản lý danh mục |

**Logic:**

- **Role 1 (Admin)**: CRUD đầy đủ
- **Role 3 (Warehouse)**: Cần xem sản phẩm để nhập kho

---

#### C. **Warehouse Management** (Role 1, 3)

| Route              | Component          | Roles | Mô tả                  |
| ------------------ | ------------------ | ----- | ---------------------- |
| `/admin/warehouse` | AdminWarehousePage | 1,3   | Quản lý kho, nhập hàng |

**Logic:**

- **Role 1 (Admin)**: Giám sát kho
- **Role 3 (Warehouse)**: Quản lý trực tiếp

---

#### D. **Order Management** (Role 1, 4)

| Route           | Component       | Roles | Mô tả            |
| --------------- | --------------- | ----- | ---------------- |
| `/admin/orders` | AdminOrdersPage | 1,4   | Quản lý đơn hàng |

**Logic:**

- **Role 1 (Admin)**: Xem tất cả đơn hàng
- **Role 4 (Sales)**: Xử lý đơn hàng, xuất hóa đơn

---

#### E. **User & HRM Management** (Role 1, 5)

| Route          | Component      | Roles | Mô tả              |
| -------------- | -------------- | ----- | ------------------ |
| `/admin/users` | AdminUsersPage | 1,5   | Quản lý khách hàng |
| `/admin/hrm`   | AdminHRMPage   | 1,5   | Quản lý nhân viên  |

**Logic:**

- **Role 1 (Admin)**: Quản lý toàn bộ
- **Role 5 (HRM)**: Quản lý user & nhân viên

---

#### F. **Settings** (Role 1)

| Route             | Component         | Roles | Mô tả            |
| ----------------- | ----------------- | ----- | ---------------- |
| `/admin/settings` | AdminSettingsPage | 1     | Cài đặt hệ thống |

**Logic:** Chỉ Admin mới được thay đổi cài đặt

---

## 📊 Bảng Tổng Hợp Phân Quyền

| Trang/Module        | Guest (0) | Admin (1) | Customer (2) | Warehouse (3) | Sales (4) | HRM (5) |
| ------------------- | --------- | --------- | ------------ | ------------- | --------- | ------- |
| **Public Pages**    | ✅        | ✅        | ✅           | ✅            | ✅        | ✅      |
| Cart & Checkout     | ❌        | ✅        | ✅           | ❌            | ❌        | ❌      |
| Order History       | ❌        | ✅        | ✅           | ❌            | ❌        | ❌      |
| Profile             | ❌        | ✅        | ✅           | ✅            | ✅        | ✅      |
| **Admin Dashboard** | ❌        | ✅        | ❌           | ❌            | ❌        | ❌      |
| **Analytics**       | ❌        | ✅        | ❌           | ❌            | ❌        | ❌      |
| **Products**        | ❌        | ✅        | ❌           | ✅            | ❌        | ❌      |
| **Categories**      | ❌        | ✅        | ❌           | ✅            | ❌        | ❌      |
| **Warehouse**       | ❌        | ✅        | ❌           | ✅            | ❌        | ❌      |
| **Orders**          | ❌        | ✅        | ❌           | ❌            | ✅        | ❌      |
| **Users**           | ❌        | ✅        | ❌           | ❌            | ❌        | ✅      |
| **HRM**             | ❌        | ✅        | ❌           | ❌            | ❌        | ✅      |
| **Settings**        | ❌        | ✅        | ❌           | ❌            | ❌        | ❌      |

---

## 🔧 Technical Implementation

### ProtectedRoute Component

```jsx
<ProtectedRoute allowedRoles={[1, 3]}>
  <AdminProductsPage />
</ProtectedRoute>
```

### Hành vi:

1. **Chưa đăng nhập (Role 0)**: Redirect → `/login`
2. **Không có quyền**: Redirect → `/` (HomePage)
3. **Admin (Role 1)**: Bypass tất cả - truy cập mọi trang admin
4. **Roles khác**: Check theo `allowedRoles`

---

## 🎯 Use Cases

### Kịch bản 1: Customer mua hàng

- ✅ Xem sản phẩm (public)
- ✅ Thêm vào giỏ (role 2)
- ✅ Checkout (role 2)
- ✅ Xem đơn hàng (role 2)

### Kịch bản 2: Warehouse nhập hàng

- ✅ Đăng nhập (role 3)
- ✅ Xem sản phẩm `/admin/products` (role 3)
- ✅ Nhập kho `/admin/warehouse` (role 3)
- ❌ Không thể vào `/admin/orders` (role 4)

### Kịch bản 3: Sales xử lý đơn

- ✅ Đăng nhập (role 4)
- ✅ Xử lý đơn `/admin/orders` (role 4)
- ❌ Không thể vào `/admin/warehouse` (role 3)

### Kịch bản 4: HRM quản lý nhân viên

- ✅ Đăng nhập (role 5)
- ✅ Quản lý user `/admin/users` (role 5)
- ✅ Quản lý nhân viên `/admin/hrm` (role 5)
- ❌ Không thể vào `/admin/products` (role 1,3)

### Kịch bản 5: Admin toàn quyền

- ✅ Truy cập TẤT CẢ các trang (role 1)
- ✅ Mua hàng như customer
- ✅ Quản lý mọi module

---

## 📝 Notes

- Admin (Role 1) có thể bypass tất cả các kiểm tra role
- Profile page cho phép tất cả users đã đăng nhập (để cập nhật thông tin)
- Cart/Checkout chỉ dành cho Customer và Admin (không dành cho nhân viên)
- Mỗi module admin có role riêng để phân quyền chi tiết

---

**Last Updated:** November 13, 2025
