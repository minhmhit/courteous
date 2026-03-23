# Báo Cáo Redesign Prompt Pack cho Stich AI

## 1) Mục tiêu và phạm vi
- Tạo bộ prompt tiếng Việt theo mức senior UI/UX để redesign toàn bộ hệ thống `Customer + Auth + Admin`.
- Tập trung vào UI hiện đại, tối giản, ưu tiên UX, dùng Tailwind CSS và pastel palette.
- Đảm bảo responsive cho 3 thiết bị:
- Mobile: `390x844`
- Tablet: `834x1194`
- Laptop: `1440x900`
- Giai đoạn này chỉ tạo prompt và tài liệu, chưa chỉnh sửa code UI.

## 2) Tóm tắt hiện trạng UI trong `src`
### Customer
- Luồng mua hàng đầy đủ: Home -> Products -> Product Detail -> Cart -> Checkout.
- Có tách component section hợp lý.
- Hạn chế:
- Design language chưa đồng nhất mạnh giữa các section.
- Visual hierarchy chưa đủ nổi ở điểm chuyển đổi chính (CTA, summary, action ưu tiên).
- Responsive có xử lý nhưng chưa theo một tiêu chuẩn hệ thống.

### Auth
- Login/Register rõ chức năng, triển khai nhanh.
- Hạn chế:
- Chưa có nhiều trạng thái UX nâng cao (error presentation, helper clarity, consistency scale).

### Admin
- Có layout sidebar, dashboard, CRUD pages.
- Hạn chế:
- Cảm giác template và thiếu đồng bộ với customer-facing UI.
- Data-heavy pages thiếu chuẩn tương tác bảng thống nhất xuyên suốt.

### Vấn đề nền
- Có dấu hiệu text encoding lỗi tiếng Việt ở nhiều file, ảnh hưởng chất lượng copy hiển thị.
- Chưa có prompt framework chuẩn hóa để AI sinh UI nhất quán toàn hệ thống.

## 3) Vấn đề UX/UI theo mức độ ưu tiên
### Ưu tiên cao
- Thiếu design system xuyên suốt giữa customer/auth/admin.
- Thiếu chuẩn responsive theo device class cố định.
- Chưa đồng nhất interaction states (loading/empty/error/success/disabled).

### Ưu tiên trung bình
- Hierarchy ở dashboard, form checkout, product detail cần nhấn mạnh hơn.
- Navbar mobile và admin table behavior có thể tối ưu scanability.

### Ưu tiên thấp
- Motion đang có nhưng chưa có quy tắc chung để kiểm soát nhiễu.

## 4) Định hướng thiết kế mới
- Tone: hiện đại, tối giản, thân thiện, rõ hierarchy.
- Màu:
- Primary pastel coffee/peach
- Secondary pastel mint/sky
- Neutral warm gray
- Semantic pastel với tương phản đạt chuẩn.
- Layout:
- Spacing scale nhất quán.
- Container width hợp lý theo breakpoint.
- Sticky components chỉ dùng khi tăng UX thực tế.
- Accessibility:
- Focus ring rõ.
- Touch target tối thiểu 44x44.
- Keyboard flow và semantic labels đầy đủ.

## 5) Prompt architecture và lý do chia module
Tách prompt theo module để:
- Giảm độ dài mỗi prompt, tránh loãng chỉ dẫn.
- Dễ chạy Stitch theo từng cụm màn hình và kiểm soát chất lượng.
- Cho phép refinement pass vòng 2 mà không làm hỏng toàn bộ.

Bộ file đã tạo:
- `prompts/01_foundation_prompt.md`
- `prompts/02_customer_marketing_prompt.md`
- `prompts/03_customer_catalog_prompt.md`
- `prompts/04_customer_cart_checkout_prompt.md`
- `prompts/05_auth_prompt.md`
- `prompts/06_admin_layout_dashboard_prompt.md`
- `prompts/07_admin_crud_tables_prompt.md`
- `prompts/08_refinement_pass_prompt.md`

## 6) Full prompt pack (copy dùng ngay cho Stich)
Sử dụng theo thứ tự đề xuất:
1. Chạy `01_foundation_prompt.md` trước để khóa hệ quy chiếu.
2. Chạy lần lượt `02` đến `07` theo module.
3. Chạy `08_refinement_pass_prompt.md` để tối ưu vòng 2.

### Prompt 01
Xem: `prompts/01_foundation_prompt.md`

### Prompt 02
Xem: `prompts/02_customer_marketing_prompt.md`

### Prompt 03
Xem: `prompts/03_customer_catalog_prompt.md`

### Prompt 04
Xem: `prompts/04_customer_cart_checkout_prompt.md`

### Prompt 05
Xem: `prompts/05_auth_prompt.md`

### Prompt 06
Xem: `prompts/06_admin_layout_dashboard_prompt.md`

### Prompt 07
Xem: `prompts/07_admin_crud_tables_prompt.md`

### Prompt 08 (Refinement pass)
Xem: `prompts/08_refinement_pass_prompt.md`

## 7) Kết quả self-review theo rubric
Thang điểm: 1-5

| Prompt | Bao phủ nghiệp vụ | Responsive 3 thiết bị | States tương tác | Đồng nhất design system | Tailwind feasibility | Accessibility | Kết luận |
|---|---:|---:|---:|---:|---:|---:|---|
| 01 Foundation | 5 | 5 | 5 | 5 | 5 | 5 | Pass |
| 02 Customer Marketing | 5 | 4 | 4 | 5 | 5 | 4 | Pass |
| 03 Customer Catalog | 5 | 5 | 5 | 4 | 5 | 4 | Pass |
| 04 Cart & Checkout | 5 | 5 | 5 | 4 | 5 | 5 | Pass |
| 05 Auth | 4 | 5 | 5 | 4 | 5 | 5 | Pass |
| 06 Admin Layout & Dashboard | 5 | 4 | 4 | 5 | 5 | 4 | Pass |
| 07 Admin CRUD Tables | 5 | 5 | 5 | 5 | 5 | 5 | Pass |
| 08 Refinement | 4 | 5 | 5 | 5 | 5 | 5 | Pass |

Kết quả kiểm tra điều kiện pass:
- Không prompt nào dưới 4/5.
- Không thiếu state quan trọng.
- Không mâu thuẫn giữa foundation và module prompts.

## 8) Checklist nghiệm thu prompt
- Customer flow:
- Home, Products, Product Detail, Cart, Checkout, Profile/Order.
- Auth flow:
- Login/Register đầy đủ idle/error/success/loading.
- Admin flow:
- Role dashboard, CRUD table, modal form, filter/search/export.
- Responsive:
- Cả 3 viewport đã khóa.
- Accessibility:
- Focus ring, tab order, contrast, label/input pairing, touch target.

## 9) Rủi ro còn lại và đề xuất cải tiến tiếp theo
### Rủi ro
- Prompt tốt nhưng output AI có thể dao động theo phiên bản model hoặc token context.
- Nếu chạy prompt đơn lẻ không theo thứ tự, có thể giảm tính nhất quán.

### Đề xuất vòng sau
- Sau khi có output từ Stitch, chạy thêm một vòng QA prompt ngược theo trang lỗi.
- Chuẩn hóa thêm bộ UI tokens thực thi (màu, spacing, radius, shadow) thành checklist kỹ thuật để coder implement nhanh.
- Khi vào giai đoạn code, xử lý đồng thời lỗi encoding tiếng Việt để tránh lệch copy giữa design và code.

## 10) Kết luận
- Đã hoàn thành bộ prompt theo đúng phạm vi `Customer + Auth + Admin`.
- Đã chuẩn hóa framework chung, prompt module, và refinement pass.
- Đã tự review bằng rubric định lượng và đạt điều kiện pass.
