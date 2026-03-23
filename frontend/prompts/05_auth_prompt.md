# 05_auth_prompt

## Phạm vi màn hình
- LoginPage
- RegisterPage

## Mục tiêu UX
- Đăng nhập/đăng ký nhanh, tin cậy, ít lỗi.
- Bố cục hiện đại nhưng tối giản, tập trung form completion.

## Yêu cầu thiết kế
- Visual:
- Auth surface đặt giữa màn hình, nền pastel nhẹ có chiều sâu.
- Form card rõ ràng, không nặng bóng.
- Brand element tinh gọn, không chiếm chỗ quá nhiều.
- Form:
- Label rõ, helper text khi cần.
- Error state có màu + icon + message rõ.
- Success/loading state dễ hiểu.
- Hiển thị password toggle nếu hợp lý.
- CTA:
- Nút chính full-width, trạng thái loading rõ.
- Link chuyển login/register rõ cấp độ phụ.

## Responsive
- Mobile: form full-width an toàn, padding đủ.
- Tablet: card trung tâm rộng vừa.
- Laptop: card cân đối, khoảng trắng hợp lý.

## Accessibility
- Keyboard-first, focus ring rõ.
- Aria labels cho icon-only actions nếu có.
- Độ tương phản text/button đạt chuẩn.

## Output expectation
- Auth UI spec với states: idle, typing, validation error, submitting, success.
- Gợi ý Tailwind class cho input/button/error/helper/link.
