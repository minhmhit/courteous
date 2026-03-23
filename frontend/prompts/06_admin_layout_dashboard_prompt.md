# 06_admin_layout_dashboard_prompt

## Phạm vi màn hình
- AdminLayout (sidebar/topbar/main content)
- DashboardPage
- Role-specific dashboards (warehouse, sales, hrm) theo cùng design language

## Mục tiêu UX
- Tối ưu scanability cho người vận hành.
- Giảm thời gian tìm chức năng theo role.
- Dashboard thể hiện insight quan trọng ngay lập tức.

## Pain points
- Sidebar và content chưa có hierarchy mạnh.
- Dashboard card/table còn template-like.
- Chưa đồng nhất visual với customer-facing UI.

## Yêu cầu thiết kế
- Admin shell:
- Sidebar rõ active state, section grouping theo nghiệp vụ.
- Header vùng content có breadcrumbs/page title/actions.
- Role badge rõ nhưng không gây nhiễu.
- Dashboard:
- KPI cards dễ so sánh, có trend indicators rõ.
- Quick status blocks (pending/completed) rõ ưu tiên.
- Recent orders table tăng khả năng quét (zebra/hover/spacing).
- Chuẩn hóa màu semantic cho status.

## Responsive
- Mobile:
- Sidebar chuyển thành drawer/collapsible nav.
- KPI cards xếp dọc, table chuyển card/list khi cần.
- Tablet:
- Sidebar thu gọn icon + label tùy ngữ cảnh.
- Laptop:
- Sidebar đầy đủ, content density tối ưu cho quản trị.

## Accessibility + data UX
- Table header sticky nếu phù hợp.
- Sort/filter affordance rõ.
- Badge status có text + màu, không phụ thuộc màu đơn lẻ.

## Output expectation
- Full admin shell + dashboard redesign spec.
- Tailwind hints cho shell, cards, table, badges, nav states.
