# 07_admin_crud_tables_prompt

## Phạm vi màn hình
- Các trang CRUD admin dạng bảng + modal: products, categories, orders, users, coupons, suppliers, warehouse, hrm

## Mục tiêu UX
- Thao tác CRUD nhanh, rõ, ít sai sót.
- Tăng khả năng đọc dữ liệu lớn và thao tác hàng loạt.

## Yêu cầu thiết kế
- Data table:
- Header cố định rõ cột.
- Search/filter/sort/action bar nhất quán giữa các trang.
- Row states: hover, selected, disabled.
- Empty/loading/error states đầy đủ.
- Pagination/rows per page rõ.
- Bulk action nếu phù hợp.
- CRUD modal/drawer:
- Form chia nhóm thông tin logic.
- Validation inline rõ ràng.
- Nút primary/secondary/destructive rõ cấp độ.
- Confirm destructive actions (delete) rõ và an toàn.
- File upload/image preview:
- Drag-drop zone hoặc input chuẩn.
- Preview rõ, lỗi upload hiển thị cụ thể.

## Responsive
- Mobile:
- Table chuyển stacked cards hoặc horizontal scroll có chỉ dẫn.
- Action buttons gom vào menu contextual.
- Tablet:
- Ưu tiên cột quan trọng, cột phụ ẩn có điều kiện.
- Laptop:
- Full table controls + quick actions.

## Accessibility
- Modal trap focus đúng.
- Form field có label + error association.
- Bảng có semantic header và keyboard navigation cơ bản.

## Output expectation
- Mẫu chuẩn CRUD page reusable cho mọi module admin.
- Tailwind utility hints cho table, toolbar, modal, form, badge, pagination.
