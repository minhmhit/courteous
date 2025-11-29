# Đồ án môn phân tích thiết kế hướng đối tượng (OOAD)

# Tên dự án: Coffee Powder System
> Ứng dụng web bán cà phê bột hiện đại với React, TailwindCSS và Express.js

# Thông tin các thành viên tham gia
| STT | Họ và tên         | MSSV       |
| --- | ----------------- | ---------- |
| 1   | Mai Hoàng Minh    | 3123410217 |
| 2   | Nguyễn Hoài Nam   |            |
| 3   | Nguyễn Đức Minh   |            |
| 4   | Nguyễn Dương      |            |
| 5   | Thôi Tạ Thiên Đỉnh|            |

##  Mục lục

- [Giới thiệu](#giới-thiệu)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Cài đặt](#cài-đặt)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [Chạy ứng dụng](#chạy-ứng-dụng)

---

## Giới thiệu

Hệ thống bán cà phê bột với hai giao diện chính:

- **Customer (B2C)**: Trải nghiệm mua hàng hiện đại, trendy
- **Enterprise (Admin)**: Quản trị tập trung với các module: Admin, Warehouse, HRM, Sales

---

## Công nghệ sử dụng

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

## Cài đặt

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

## Chạy ứng dụng

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
