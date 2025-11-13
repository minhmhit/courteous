# 🔐 Phân Quyền Hệ Thống - Quick Reference

## 📊 Bảng Phân Quyền Nhanh

### Roles

| ID  | Tên        | Màu Badge | Quyền chính      |
| --- | ---------- | --------- | ---------------- |
| 0   | Khách      | Gray      | Xem public pages |
| 1   | **Admin**  | Red       | **TẤT CẢ**       |
| 2   | Khách hàng | Blue      | Mua hàng         |
| 3   | Kho        | Green     | Quản lý kho      |
| 4   | Bán hàng   | Purple    | Xử lý đơn        |
| 5   | HRM        | Yellow    | Quản lý nhân sự  |

---

## 🗺️ Routes theo Role

### 🌐 Public (0,1,2,3,4,5)

- `/` - Trang chủ
- `/products` - Sản phẩm
- `/products/:id` - Chi tiết
- `/privacy-policy`, `/terms-of-service`, `/return-policy`, `/shipping-policy`

### 👤 Customer (1,2)

- `/cart` - Giỏ hàng
- `/checkout` - Thanh toán
- `/profile/orders` - Lịch sử đơn
- `/orders/:id` - Chi tiết đơn

### 👥 All Authenticated (1,2,3,4,5)

- `/profile` - Thông tin cá nhân

### 🏢 Admin Routes

| Route               | Roles   | Mô tả               |
| ------------------- | ------- | ------------------- |
| `/admin/dashboard`  | **1**   | Dashboard tổng quan |
| `/admin/analytics`  | **1**   | Phân tích doanh thu |
| `/admin/products`   | **1,3** | Quản lý sản phẩm    |
| `/admin/categories` | **1,3** | Quản lý danh mục    |
| `/admin/warehouse`  | **1,3** | Quản lý kho         |
| `/admin/orders`     | **1,4** | Quản lý đơn hàng    |
| `/admin/users`      | **1,5** | Quản lý khách hàng  |
| `/admin/hrm`        | **1,5** | Quản lý nhân viên   |
| `/admin/settings`   | **1**   | Cài đặt hệ thống    |

---

## 💡 Use Cases

### Customer (Role 2)

```
✅ Xem sản phẩm → Thêm giỏ hàng → Checkout → Xem đơn hàng
❌ Không vào được /admin
```

### Warehouse (Role 3)

```
✅ /admin/products (xem sản phẩm)
✅ /admin/warehouse (nhập kho)
❌ /admin/orders (không xử lý đơn)
❌ /cart (không mua hàng)
```

### Sales (Role 4)

```
✅ /admin/orders (xử lý đơn hàng)
❌ /admin/warehouse (không nhập kho)
❌ /cart (không mua hàng)
```

### HRM (Role 5)

```
✅ /admin/users (quản lý khách hàng)
✅ /admin/hrm (quản lý nhân viên)
❌ /admin/products (không quản lý sản phẩm)
```

### Admin (Role 1)

```
✅ TẤT CẢ các trang
✅ Bypass mọi kiểm tra quyền
```

---

## 🔧 Code Examples

### App.jsx

```jsx
// Admin & Warehouse
<ProtectedRoute allowedRoles={[1, 3]}>
  <AdminProductsPage />
</ProtectedRoute>

// All authenticated users
<ProtectedRoute>
  <ProfilePage />
</ProtectedRoute>
```

### AdminLayout.jsx

- Menu tự động ẩn/hiện theo role
- Hiển thị role badge

---

**📄 Chi tiết đầy đủ:** Xem `PERMISSIONS.md`
