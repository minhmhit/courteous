# 04_customer_cart_checkout_prompt

## Phạm vi màn hình
- CartPage
- CheckoutPage
- Order success block

## Mục tiêu UX
- Giảm bỏ giỏ bằng cách làm rõ thông tin và giảm tải nhận thức.
- Tối ưu luồng checkout nhiều trường nhập trên mobile.

## Pain points
- Cart summary và item actions cần hierarchy mạnh hơn.
- Checkout form dài, cần grouping và progressive disclosure.
- Coupon UX cần rõ trạng thái áp dụng/thất bại.

## Yêu cầu thiết kế
- Cart:
- Item row rõ ảnh, tên, đơn giá, số lượng, tổng dòng.
- Action xóa không gây nhầm, có affordance tốt.
- Summary card sticky trên desktop.
- CTA checkout nổi bật, CTA tiếp tục mua sắm là phụ.
- Checkout:
- Chia block: thông tin nhận hàng, địa chỉ, phương thức thanh toán, tóm tắt đơn.
- Select tỉnh/quận/phường có trạng thái disabled logic rõ.
- Coupon block có validate feedback rõ.
- Tổng tiền cuối cùng luôn dễ thấy.
- Success state:
- Thông báo thành công rõ, mã đơn hàng nổi bật, điều hướng tiếp theo rõ.

## Responsive chi tiết
- Mobile:
- Cart item dạng card dọc, nút số lượng đủ to.
- Checkout theo flow một cột, summary rút gọn rồi mở rộng.
- Tablet:
- 2 cột mềm cho checkout nếu đủ rộng.
- Laptop:
- Checkout 2-3 cột với summary sticky.

## Accessibility
- Label gắn với input/select/textarea.
- Error message đặt gần field.
- Radio payment có hit area rộng.
- Focus order đúng thứ tự.

## Output expectation
- Redesign chi tiết cart/checkout conversion-first.
- Tailwind class suggestions cho form controls, sticky summary, validation states.
