# 02_customer_marketing_prompt

## Phạm vi màn hình
- CustomerLayout
- Navbar
- Footer
- HomePage sections: Hero, Features, Featured Products, Promotions, CTA, HowToOrder, Reviews, PolicyLinks, About/Contact teaser

## Mục tiêu UX
- Người dùng mới hiểu nhanh USP trong 5 giây đầu.
- Điều hướng đến sản phẩm mượt, ít ma sát.
- Tăng niềm tin qua social proof, policy, review.
- Trên mobile vẫn ưu tiên thao tác tìm kiếm + vào danh mục nhanh.

## Pain points cần giải quyết
- Visual hierarchy chưa đủ mạnh ở hero và section transitions.
- Ngôn ngữ thiết kế chưa đủ đồng nhất giữa các section.
- Navbar mobile cần rõ ưu tiên hành động và giảm rối.

## Yêu cầu thiết kế
- Hero:
- Headline rõ, subheadline ngắn, CTA chính nổi bật, CTA phụ tùy chọn.
- Dùng nền pastel có chiều sâu (gradient mềm + shape subtle), tránh phẳng.
- Ưu tiên text legibility.
- Section flow:
- Tạo nhịp điệu nội dung: intro -> lợi ích -> sản phẩm -> khuyến mãi -> cách mua -> review -> CTA.
- Xen kẽ surface sáng/tối nhẹ để tách section.
- Cards:
- Product/promo/feature card cùng ngôn ngữ bo góc, shadow, spacing.
- Hover state tinh tế.
- Navbar:
- Desktop: logo + menu + search + cart + account rõ lớp.
- Mobile: menu panel dễ quét, CTA đăng nhập/giỏ hàng rõ.
- Footer:
- Chia block thông tin rõ, tăng khả năng scan.
- Link policy/support rõ ràng, dễ click trên mobile.

## Responsive chi tiết
- Mobile:
- Hero ưu tiên copy + CTA trước, visual sau.
- Menu dạng drawer sạch, touch target >= 44.
- Product/feature cards 1 cột hoặc 2 cột tùy section.
- Tablet:
- Hero 2 cột cân bằng.
- Section cards 2-3 cột.
- Laptop:
- Hero 2 cột đầy đủ.
- Featured/promo 4 cột khi đủ không gian.

## Output expectation
- Redesign mock spec cho toàn bộ marketing flow.
- Component-level Tailwind class suggestions.
- States cho search, empty products, loading section, coupon unavailable.
