# 03_customer_catalog_prompt

## Phạm vi màn hình
- ProductsPage
- ProductCard
- ProductDetailPage

## Mục tiêu UX
- Giúp người dùng tìm sản phẩm nhanh, lọc dễ, so sánh thuận tiện.
- Nâng chất lượng trải nghiệm tại Product Detail để tăng add-to-cart.

## Vấn đề cần cải tiến
- Filter/sort mobile chưa đủ trực quan.
- Product list và PDP chưa có mức nhấn thị giác theo hành động chính.
- Chưa tối ưu đầy đủ empty/error/loading states theo ngữ cảnh tìm kiếm.

## Yêu cầu thiết kế
- Catalog listing:
- Header rõ context (search query, số kết quả).
- Sidebar filter desktop dạng sticky gọn.
- Mobile filter dùng bottom sheet hoặc panel có áp dụng/xóa rõ ràng.
- Sort control dễ hiểu.
- Product card:
- Ảnh sản phẩm nổi bật, title clamp hợp lý, giá và badge rõ.
- Nút hành động nhất quán.
- Thể hiện trạng thái hết hàng rõ.
- Product Detail:
- Gallery rõ primary image + thumbnails.
- Price block mạnh (giá hiện tại, giá gốc, mức giảm nếu có).
- Quantity selector trực quan, disabled khi hết hàng.
- CTA chính: Mua ngay. CTA phụ: Thêm giỏ.
- Related products đặt dưới nhưng không cạnh tranh CTA chính.

## Responsive chi tiết
- Mobile:
- Product grid 2 cột khi khả thi, nếu card dài chuyển 1 cột.
- PDP xếp dọc, CTA sticky bottom tùy đề xuất.
- Tablet:
- Listing 2-3 cột, filter panel cải tiến.
- PDP 2 cột nhẹ (ảnh trước, info sau).
- Laptop:
- Listing 3-4 cột.
- PDP 2 cột rõ với khoảng trắng hợp lý.

## States bắt buộc
- Loading: skeleton card/list/detail.
- Empty search: message + reset action.
- Error API: retry CTA.
- Out of stock: disable CTA + badge rõ.

## Output expectation
- UI spec cho list/detail + filter interaction model.
- Tailwind utility hints cho grid/card/panel/sticky CTA.
