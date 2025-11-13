# 🚀 Quick Start Guide - Coffee Shop Frontend

## ⚡ Instant Setup

### 1. Clone & Install

```bash
cd frontend
npm install
```

### 2. Start Development Server

```bash
npm run dev
# Opens at http://localhost:5174
```

### 3. Backend Required

Ensure backend API is running at:

```
http://localhost:3000/api/v1
```

---

## 👤 Test Accounts

### Customer Account

```
Email: customer@example.com
Password: 123456
Role: Customer (roleId: 2)
```

### Admin Account

```
Email: admin@example.com
Password: admin123
Role: Admin (roleId: 1)
```

---

## 🗺️ Route Map

### Customer Routes (Public)

```
/                    - HomePage
/products            - ProductsPage
/products/:id        - ProductDetailPage
/login              - LoginPage
/register           - RegisterPage
```

### Customer Routes (Protected)

```
/cart               - CartPage
/checkout           - CheckoutPage
/profile            - ProfilePage
/profile/orders     - OrderHistoryPage
/orders/:id         - OrderDetailPage
```

### Admin Routes (Role: Admin only)

```
/admin/dashboard    - DashboardPage
/admin/products     - AdminProductsPage (CRUD)
/admin/orders       - AdminOrdersPage
/admin/users        - AdminUsersPage
```

---

## 🎯 Key Features by Role

### 🛍️ Customer Can:

1. Browse & search products
2. View product details
3. Add to cart
4. Checkout & place order ✅ FIXED
5. View order history
6. Track order status
7. Update profile
8. Change password

### 👨‍💼 Admin Can:

1. View dashboard statistics
2. Manage products (CRUD)
3. Manage orders (view, update status)
4. Manage users (ban/unban)
5. View real-time analytics

---

## 🔧 Common Tasks

### Add New Product (Admin)

1. Go to `/admin/products`
2. Click "Thêm Sản Phẩm"
3. Fill form (name, price, category, supplier)
4. Submit

### Place Order (Customer)

1. Add products to cart
2. Go to `/cart`
3. Click "Thanh Toán"
4. Fill shipping info
5. Click "Đặt Hàng"

### Update Order Status (Admin)

1. Go to `/admin/orders`
2. Find order
3. Use status dropdown
4. Confirm update

---

## 🐛 Troubleshooting

### Checkout not working?

✅ **FIXED!** Order data format now matches backend API

### Cart showing empty?

✅ **FIXED!** Graceful error handling added

### Login not persisting?

✅ **FIXED!** Enhanced localStorage handling

### Can't access admin panel?

- Check user roleId === 1
- Login with admin account
- Check token in localStorage

---

## 📦 Build for Production

```bash
npm run build
npm run preview
```

Build output: `frontend/dist/`

---

## 🎨 UI Components

### Buttons

```jsx
<Button variant="primary">Primary</Button>
<Button variant="outline">Outline</Button>
```

### Inputs

```jsx
<Input label="Email" icon={<Mail />} required />
```

### Toast Notifications

```jsx
toast.success("Thành công!");
toast.error("Lỗi!");
toast.info("Thông tin");
```

---

## 🔑 Important Files

### Store State

```
useAuthStore.js    - Login, user, token
useCartStore.js    - Cart items, total
useToastStore.js   - Notifications
```

### API Services

```
authAPI.js         - Login, register
productAPI.js      - Products CRUD
orderAPI.js        - Orders
userAPI.js         - Users management
```

### Main Config

```
App.jsx            - Routes
axiosConfig.js     - HTTP client
```

---

## 📊 Quick Stats

- **Pages:** 15 pages
- **Components:** 20+ components
- **API Endpoints:** 30+ integrated
- **Features:** 27+ features
- **Lines of Code:** ~5000+ lines

---

## ✅ Phase Completion

- ✅ Phase 1: Customer Pages
- ✅ Phase 2: Profile & Orders
- ✅ Phase 3: Admin Panel
- ⏸️ Phase 4: Advanced Features (Future)

---

**🎉 Ready to use! Happy coding! ☕**
