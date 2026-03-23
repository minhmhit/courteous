# 01_foundation_prompt

## Mục tiêu
Thiết kế lại toàn bộ UI cho hệ thống CoffeeBot (Customer + Auth + Admin) theo phong cách hiện đại, tối giản, trải nghiệm cao, sử dụng Tailwind CSS và bảng màu pastel. Đây là prompt nền để đảm bảo mọi màn hình có cùng design language.

## Bối cảnh sản phẩm
- Web app thương mại điện tử cà phê bột, có 3 nhóm người dùng chính: Customer, Employee/Admin theo role.
- Cần đồng nhất trải nghiệm giữa site mua hàng và admin dashboard.
- Không đổi nghiệp vụ, chỉ redesign UI/UX.

## Quy chuẩn responsive bắt buộc
- Mobile base: 390x844
- Tablet: 834x1194
- Laptop: 1440x900
- Tailwind mapping:
- Mobile: < md
- Tablet: md đến lg
- Laptop: xl+
- Với layout rộng, cần fallback tốt ở lg.

## Design system bắt buộc
- Tone tổng thể: hiện đại, tối giản, thân thiện, premium nhẹ.
- Màu pastel:
- Primary: pastel coffee/peach
- Secondary: pastel mint/sky
- Neutral: warm gray
- Semantic: success/warning/error/info ở phiên bản pastel nhưng vẫn đạt tương phản.
- Typography:
- Heading rõ hierarchy, letter spacing gọn.
- Body text ưu tiên readability, line-height thoáng.
- Icon style: line icon đồng nhất độ dày.
- Elevation:
- Card dùng bóng nhẹ, không lạm dụng.
- Có phân lớp rõ giữa nền, surface, interactive surface.
- Radius:
- Nút/input/card bo vừa phải, đồng nhất.

## Accessibility và usability
- Tương phản màu đạt chuẩn AA cho text chính.
- Focus ring rõ ràng trên keyboard navigation.
- Touch target tối thiểu 44x44 cho thao tác mobile.
- Form có label rõ, trạng thái lỗi hiển thị cụ thể.
- Trạng thái phải có đủ:
- default
- hover
- active
- focus
- disabled
- loading
- empty
- error
- success

## Quy tắc layout
- Dùng grid/flex theo ngữ cảnh, ưu tiên scanability.
- Spacing theo scale nhất quán (4/8/12/16/24/32/48).
- Container width giới hạn hợp lý trên laptop, không dàn quá rộng.
- Thành phần sticky chỉ dùng khi cải thiện UX (vd: order summary, admin action bar).

## Motion và feedback
- Motion tinh gọn, mục tiêu định hướng chú ý chứ không trang trí.
- Duration ngắn, easing mềm, tránh gây nhiễu.
- Skeleton/loading state rõ ràng cho list/table/card.

## Tailwind implementation hints
- Tạo style tokens bằng CSS variables và map vào Tailwind theme extension.
- Tách component class có thể tái sử dụng: button, input, badge, card, table, modal.
- Ưu tiên utility-first, hạn chế CSS custom rời rạc.

## Kỳ vọng output
Trả về đề xuất UI hoàn chỉnh ở mức implementation-ready gồm:
- Bố cục theo 3 breakpoint
- Component specs
- State specs
- Visual tokens
- Gợi ý className Tailwind cho từng vùng chính
- Rationale UX ngắn gọn cho quyết định quan trọng

## Tiêu chí đánh giá nội bộ
- Đồng nhất thiết kế giữa Customer/Auth/Admin
- Tối ưu thao tác chính theo từng role
- Không phá vỡ luồng nghiệp vụ hiện có
