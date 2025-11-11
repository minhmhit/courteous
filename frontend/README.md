# ☕ Hệ Thống Bán Cà Phê Bột - Frontend

> Ứng dụng web bán cà phê bột hiện đại với React, TailwindCSS và Framer Motion

## 📋 Mục lục

- [Giới thiệu](#giới-thiệu)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Cài đặt](#cài-đặt)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [API Integration](#api-integration)
- [Chạy ứng dụng](#chạy-ứng-dụng)
- [Tài liệu](#tài-liệu)

---

## 🎯 Giới thiệu

Hệ thống bán cà phê bột với hai giao diện chính:

- **Customer (B2C)**: Trải nghiệm mua hàng hiện đại, trendy
- **Enterprise (Admin)**: Quản trị tập trung với các module: Admin, Warehouse, HRM, Sales

---

## 🛠️ Công nghệ sử dụng

| Công nghệ     | Version | Mô tả             |
| ------------- | ------- | ----------------- |
| React         | 18.3+   | UI Framework      |
| Vite          | 6.0+    | Build Tool        |
| TailwindCSS   | 3.4+    | CSS Framework     |
| Framer Motion | 11+     | Animation Library |
| Zustand       | 5+      | State Management  |
| React Router  | 6+      | Routing           |
| Axios         | 1.7+    | HTTP Client       |
| React Query   | 5+      | Data Fetching     |
| Lucide React  | Latest  | Icon Library      |

---

## 📦 Cài đặt

### Yêu cầu

- Node.js 18+
- npm hoặc yarn
- Backend API đang chạy tại `http://localhost:3000`

### Bước 1: Clone và cài đặt dependencies

```bash
# Di chuyển vào thư mục frontend
cd frontend

# Cài đặt dependencies
npm install
```

### Bước 2: Cấu hình môi trường

File `.env` đã được tạo sẵn với cấu hình mặc định:

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_POSTMAN_COLLECTION_PATH=../dev/ooad.postman_collection.json
VITE_APP_NAME=Hệ Thống Bán Cà Phê Bột
VITE_APP_VERSION=1.0.0
```

---

## 📁 Cấu trúc dự án

```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # UI components (Button, Input, Modal...)
│   │   ├── customer/       # Customer components (ProductCard...)
│   │   └── admin/          # Admin components
│   ├── pages/              # Page components
│   │   ├── customer/       # Customer pages
│   │   ├── admin/          # Admin pages
│   │   └── auth/           # Auth pages (Login, Register)
│   ├── services/           # API services
│   │   ├── axiosConfig.js
│   │   ├── authAPI.js
│   │   ├── productAPI.js
│   │   ├── cartAPI.js
│   │   ├── orderAPI.js
│   │   └── index.js
│   ├── stores/             # Zustand stores
│   │   ├── useAuthStore.js
│   │   ├── useCartStore.js
│   │   └── useToastStore.js
│   ├── App.jsx             # Main App component
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
├── .env                    # Environment variables
├── tailwind.config.js      # Tailwind configuration
├── vite.config.js          # Vite configuration
└── package.json
```

---

## 🔌 API Integration

### Postman Collection

API được định nghĩa trong file: `../dev/ooad.postman_collection.json`

### API Endpoints

#### Authentication

```javascript
POST /auth/register      # Đăng ký
POST /auth/login         # Đăng nhập
GET  /auth/users/profile # Lấy profile
PUT  /auth/users/password # Đổi mật khẩu
```

#### Products

```javascript
GET    /product/           # Lấy tất cả sản phẩm
GET    /product/:id        # Lấy sản phẩm theo ID
GET    /product/search     # Tìm kiếm sản phẩm
POST   /product/add        # Thêm sản phẩm (Admin)
PUT    /product/update/:id # Cập nhật sản phẩm (Admin)
DELETE /product/delete/:id # Xóa sản phẩm (Admin)
```

#### Cart

```javascript
GET    /cart/           # Lấy giỏ hàng
POST   /cart/add        # Thêm vào giỏ
PUT    /cart/update/:id # Cập nhật số lượng
DELETE /cart/remove/:id # Xóa khỏi giỏ
```

#### Orders

```javascript
POST /orders/add          # Tạo đơn hàng
GET  /orders/             # Lấy đơn hàng của user
GET  /orders/:id          # Chi tiết đơn hàng
PUT  /orders/:id/cancel   # Hủy đơn hàng
GET  /orders/admin/all    # Tất cả đơn hàng (Admin)
PUT  /orders/:id/status   # Cập nhật trạng thái (Admin)
```

### Sử dụng API Services

```javascript
import { authAPI, productAPI, cartAPI } from "./services";

// Đăng nhập
const response = await authAPI.login({ email, password });

// Lấy sản phẩm
const products = await productAPI.getAllProducts();

// Thêm vào giỏ hàng
await cartAPI.addToCart(productId, quantity);
```

---

## 🚀 Chạy ứng dụng

### Development

```bash
npm run dev
```

Ứng dụng sẽ chạy tại: `http://localhost:5173`

### Build Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

---

## 🎨 Design System

### Colors

- **Coffee**: `coffee-600` (#be6943) - Primary color
- **Cream**: `cream-600` (#c5a489) - Secondary color
- **Success**: `green-600`
- **Error**: `red-600`
- **Warning**: `yellow-600`

### Typography

- **Display**: Poppins (Headers)
- **Body**: Inter (Text)

### Components

#### Button

```jsx
<Button variant="primary" size="md">
  Click me
</Button>
```

#### Input

```jsx
<Input label="Email" type="email" required />
```

#### Toast

```jsx
import useToastStore from "./stores/useToastStore";

const toast = useToastStore();
toast.success("Thành công!");
toast.error("Có lỗi xảy ra!");
```

---

## 📚 Tài liệu

### Phase Documentation

- **Phase 1: REQUIREMENTS** - [copilot-instructions.md](../.github/copilot-instructions.md)
- **Phase 2: DESIGN** - [design/README.md](../docs/ai/design/README.md)
- **Phase 1 Complete** - [implementation/PHASE_1_COMPLETE.md](../docs/ai/implementation/PHASE_1_COMPLETE.md)

### Features Implemented (Phase 1)

✅ **Customer Pages:**

- HomePage với hero section, features, featured products
- ProductsPage với filters, search, pagination
- ProductDetailPage với image gallery, add to cart
- CartPage với quantity controls, order summary
- CheckoutPage với shipping form, payment methods
- Navbar với search, cart badge, user menu
- Footer với company info, links

✅ **Core Features:**

- Authentication flow (Login/Register)
- Protected routes
- Role-based access control
- Real-time cart updates
- Toast notifications
- Loading states & skeletons
- Empty states
- Responsive design
- Framer Motion animations

---

## 🔐 Authentication Flow

1. User đăng nhập tại `/login`
2. Token được lưu vào `localStorage`
3. Token tự động thêm vào header của mọi request
4. Khi token hết hạn (401), user được redirect về login

### Role-based Access

- **Customer** (roleId: 2): Truy cập customer pages
- **Admin** (roleId: 1): Truy cập admin panel
- **Warehouse** (roleId: 3): Truy cập warehouse module
- **Sales** (roleId: 4): Truy cập sales module

---

---

## 🎉 Phase 1 Status: COMPLETE

### Completed Components:

- ✅ Navbar (with search, cart badge, user menu)
- ✅ Footer (with company info, links)
- ✅ CustomerLayout (wrapper for customer pages)
- ✅ ProductCard (linked to detail page)

### Completed Pages:

- ✅ HomePage (hero, features, featured products)
- ✅ ProductsPage (filters, search, pagination)
- ✅ ProductDetailPage (gallery, add to cart)
- ✅ CartPage (quantity controls, summary)
- ✅ CheckoutPage (shipping form, payment)
- ✅ LoginPage (working)
- ✅ RegisterPage (working)

### Next Steps (Phase 2):

- ProfilePage với order history
- Admin Dashboard với real stats
- Admin Products CRUD
- Admin Orders management
- Admin Users management
- Admin Categories & Settings

---

_Cập nhật lần cuối: 2025-11-11 - Phase 1 Complete_

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
