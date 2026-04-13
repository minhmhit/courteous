# Kế hoạch chỉnh sửa Lịch sử đơn hàng bên user

## 1. Yêu cầu và phạm vi
- Mục tiêu: chỉnh sửa frontend user để trang `Lịch sử đơn hàng` và `Chi tiết đơn hàng` hiển thị đúng các trạng thái đơn hàng mà backend đang trả về.
- Không chỉnh sửa backend.
- Không động vào các flow khác như checkout, cart, admin order, VNPay return, profile info, address.
- Làm tuần tự từng bước, ưu tiên thay đổi nhỏ, dễ kiểm soát, có thể test độc lập.

## 2. Hiện trạng backend đang cung cấp
### API user order
- `GET /orders/` đang là API lấy danh sách đơn của chính user tại `ACE/src/routes/order.routes.js` và `ACE/src/controllers/OrderController.js:29`.
- API này gọi `OrderModel.getOrdersByUser(...)` tại `ACE/src/models/OrderModel.js:214`.
- Query hiện tại trả về `id`, `totalAmount`, `orderDate`, `status`, `couponId`, `shipAddress` và có phân trang theo `page`, `limit` tại `ACE/src/models/OrderModel.js:220`.

### API order detail
- `GET /orders/:id` dùng cho user xem chi tiết đơn của mình tại `ACE/src/controllers/OrderController.js:55`.
- Backend có trả `items` cho chi tiết đơn trong `ACE/src/models/OrderModel.js:229`.

### Trạng thái order hợp lệ phía backend
- Validation backend hiện chỉ chấp nhận 4 trạng thái order: `PENDING`, `COMPLETED`, `CANCELLED`, `SHIPPING` tại `ACE/src/middlewares/orderValidation.js:45`.
- Tài liệu backend mô tả các nhánh chính:
- `PENDING -> CANCELLED`
- `PENDING -> SHIPPING -> COMPLETED`
- `PENDING -> COMPLETED` khi thanh toán thành công
- Tham chiếu: `ACE/api_doc.md:503`, `ACE/api_doc.md:504`, `ACE/api_doc.md:505`.

### Lưu ý quan trọng về payment
- Payment có các trạng thái riêng như `PENDING`, `SUCCESS`, `FAILED`, nhưng đó là `payment.status`, không phải `order.status`.
- Tham chiếu: `ACE/helper.md:426`, `ACE/api_doc.md:496`, `ACE/api_doc.md:497`.
- Vì vậy UI lịch sử đơn hàng bên user không nên render `FAILED` hay `SUCCESS` như một order status nếu dữ liệu chỉ đến từ `orders`.

## 3. Hiện trạng frontend user
### Trang lịch sử đơn hàng
- File: `courteous/frontend/src/pages/customer/OrderHistoryPage.jsx`
- Đang gọi `orderAPI.getUserOrders()` tại dòng `70`.
- Đang có mapping hiển thị cho 4 trạng thái `PENDING`, `SHIPPING`, `COMPLETED`, `CANCELLED`.
- Trang hiện chưa có tầng chuẩn hóa dữ liệu response riêng cho order status, chỉ render trực tiếp `order.status`.

### Trang chi tiết đơn hàng
- File: `courteous/frontend/src/pages/customer/OrderDetailPage.jsx`
- Đang lấy chi tiết đơn bằng `orderAPI.getOrderById(id)` tại dòng `104`.
- Action hủy đơn dùng `cancelOrder(id)` tại dòng `128`.
- Có action "Đã nhận hàng" gọi `orderAPI.updateOrderStatus(id, "COMPLETED")` tại dòng `143`.

### API frontend
- File: `courteous/frontend/src/services/orderAPI.js`
- `getUserOrders(page = 1, limit = 10)` tại dòng `33`.
- `updateOrderStatus(...)` tại dòng `61`.
- `updateOrderStatus` đang gọi `PUT /orders/:id/status`, nhưng route backend này là route admin-only trong `ACE/src/routes/order.routes.js`.

## 4. Vấn đề đang có
### Vấn đề 1: User order history chỉ lấy 10 đơn mặc định
- `OrderHistoryPage` gọi `getUserOrders()` không truyền `limit`, nên frontend chỉ lấy 10 đơn đầu.
- Nếu user có nhiều đơn với status khác nằm ngoài 10 đơn gần nhất, họ sẽ hiểu nhầm là hệ thống "không hiển thị".
- Đây là vấn đề dữ liệu hiển thị, không phải backend không hỗ trợ.

### Vấn đề 2: Trạng thái đang bị hard-code phân tán ở nhiều file
- Mapping status đang nằm riêng ở `OrderHistoryPage.jsx` và `OrderDetailPage.jsx`.
- Nếu backend trả trạng thái hợp lệ nhưng frontend chưa map, UI sẽ rơi vào nhánh `"Không xác định"`.
- Việc để logic phân tán làm tăng rủi ro lệch label, màu, timeline, điều kiện hiển thị action.

### Vấn đề 3: Luồng action ở OrderDetailPage đang dính sai quyền
- User bấm "Đã nhận hàng" sẽ gọi `PUT /orders/:id/status`.
- Nhưng backend route này chỉ cho `ADMIN`, `SALE`.
- Kết quả thực tế nhiều khả năng là `403`, nghĩa là UI user đang gợi ý một action không thuộc flow user hiện tại.
- Vì yêu cầu là không đụng backend và không động flow khác, phần này phải được cô lập khi chỉnh.

### Vấn đề 4: Lịch sử đơn hàng chưa có tầng thích nghi với dữ liệu backend
- Hiện UI đã hỗ trợ 4 trạng thái cơ bản, nhưng chưa có chiến lược rõ ràng cho:
- Chuẩn hóa chữ hoa/chữ thường
- Fallback khi backend bổ sung trạng thái mới
- Filter/tab hiển thị theo status nếu cần mở rộng
- Thông điệp empty-state theo từng status

## 5. Nguyên tắc triển khai
- Chỉ sửa trong phạm vi:
- `src/pages/customer/OrderHistoryPage.jsx`
- `src/pages/customer/OrderDetailPage.jsx`
- `src/services/orderAPI.js`
- Có thể thêm 1 utility riêng cho order status nếu cần, miễn không lan sang flow khác.
- Không sửa backend.
- Không sửa admin pages.
- Không đổi contract API.
- Không can thiệp logic checkout/VNPay/profile ngoài phần link điều hướng vào lịch sử đơn hàng nếu thực sự cần.

## 6. Kế hoạch thực hiện tuần tự
### Bước 1: Chốt contract status dùng cho user order UI
- Mục tiêu: khóa danh sách trạng thái order thật sự được backend support để tránh render sai.
- Việc làm:
- Xác nhận UI user chỉ xử lý `PENDING`, `SHIPPING`, `COMPLETED`, `CANCELLED`.
- Tách bạch hoàn toàn `payment.status` khỏi `order.status`.
- Kết quả mong muốn:
- Một nguồn sự thật duy nhất cho label, màu, icon, thứ tự timeline, terminal state.

### Bước 2: Gom toàn bộ config status về một chỗ
- Mục tiêu: bỏ hard-code lặp ở `OrderHistoryPage` và `OrderDetailPage`.
- Việc làm:
- Tạo utility kiểu `src/utils/orderStatus.js` hoặc module tương đương.
- Module này nên có:
- `normalizeOrderStatus(status)`
- `getOrderStatusConfig(status)`
- `getOrderTimeline(status)`
- `isCancelableOrder(status)`
- `isUserReceivableOrder(status)` hoặc tương đương
- Kết quả mong muốn:
- Hai trang user order dùng chung cấu hình, không còn lệch label/màu/trạng thái.

### Bước 3: Mở rộng dữ liệu hiển thị ở OrderHistoryPage nhưng không đổi flow khác
- Mục tiêu: đảm bảo user thực sự thấy các đơn thuộc nhiều trạng thái backend đã trả về.
- Việc làm:
- Tăng `limit` khi gọi `getUserOrders()` ở trang lịch sử đơn hàng, ví dụ `50` hoặc `100`.
- Chỉ thay đổi tại trang lịch sử đơn hàng, không đổi toàn cục nếu chưa cần.
- Nếu muốn an toàn hơn, thêm comment rõ đây là lựa chọn UI để tránh bỏ sót order cũ.
- Kết quả mong muốn:
- User nhìn thấy đủ tập đơn đang có thay vì chỉ 10 đơn đầu.

### Bước 4: Chuẩn hóa render status tại OrderHistoryPage
- Mục tiêu: lịch sử đơn hàng hiển thị đúng mọi status backend hợp lệ và có fallback an toàn.
- Việc làm:
- Dùng `normalizeOrderStatus` trước khi render.
- Dùng config dùng chung thay vì object cục bộ.
- Nếu gặp trạng thái ngoài dự kiến:
- Vẫn render badge trung tính.
- Hiển thị nguyên mã status backend thay vì `"Không xác định"` nếu muốn hỗ trợ debug vận hành.
- Kết quả mong muốn:
- Trang lịch sử đơn hàng bền hơn khi dữ liệu backend không đồng đều.

### Bước 5: Thêm filter hiển thị theo trạng thái ngay trên user order history
- Mục tiêu: cho phép user xem nhóm đơn theo từng trạng thái mà backend đang trả về, không cần backend filter.
- Việc làm:
- Thêm filter client-side dạng tabs/select:
- `Tất cả`
- `Chờ xử lý`
- `Đang giao`
- `Hoàn tất`
- `Đã hủy`
- Filter chỉ thao tác trên dữ liệu đã fetch từ `GET /orders/`.
- Không gọi API mới, không thay đổi backend.
- Kết quả mong muốn:
- User có thể chủ động xem các đơn theo từng trạng thái.

### Bước 6: Điều chỉnh empty-state theo filter/status
- Mục tiêu: tránh hiểu lầm "không có đơn hàng" khi thực ra chỉ là "không có đơn thuộc status đang lọc".
- Việc làm:
- Nếu chưa có đơn nào: giữ empty-state hiện tại.
- Nếu có đơn nhưng filter hiện tại không có kết quả:
- Hiển thị thông điệp kiểu `Bạn chưa có đơn hàng ở trạng thái này`.
- Kết quả mong muốn:
- UX rõ ràng hơn, không ảnh hưởng flow khác.

### Bước 7: Đồng bộ OrderDetailPage theo cùng bộ status
- Mục tiêu: để trang chi tiết không lệch với trang lịch sử.
- Việc làm:
- Dùng chung utility status cho badge, timeline, action visibility.
- Không để timeline/build label tự quản lý tách riêng nữa.
- Kết quả mong muốn:
- Cùng một order sẽ có cách diễn giải trạng thái giống nhau ở cả 2 trang.

### Bước 8: Gỡ hoặc cô lập action không thuộc flow user hiện tại
- Mục tiêu: không để user bấm vào action mà backend không cho phép.
- Việc làm:
- Tạm ẩn hoặc vô hiệu hóa action `Đã nhận hàng` ở `OrderDetailPage` vì hiện đang gọi route admin-only.
- Giữ nguyên action hủy đơn khi status là `PENDING` vì backend user có hỗ trợ `PUT /orders/:id/cancel`.
- Nếu cần giữ UI, chỉ hiển thị trạng thái thông tin thay vì nút thao tác.
- Kết quả mong muốn:
- Không phát sinh lỗi `403` cho user.
- Không đụng backend.
- Không phát sinh flow mới.

### Bước 9: Kiểm thử cục bộ đúng phạm vi
- Mục tiêu: xác nhận thay đổi không lan sang flow khác.
- Checklist:
- `OrderHistoryPage` hiển thị được đơn `PENDING`, `SHIPPING`, `COMPLETED`, `CANCELLED`.
- Filter hoạt động đúng với dữ liệu đang có.
- Empty-state đúng trong 2 trường hợp: chưa có đơn và không có đơn theo filter.
- `OrderDetailPage` badge/timeline khớp với `OrderHistoryPage`.
- Hủy đơn `PENDING` vẫn hoạt động.
- Không gọi `updateOrderStatus` từ user flow nữa, hoặc nếu còn thì không render cho user.

## 7. Thứ tự commit/triển khai đề xuất
1. Tạo utility status dùng chung.
2. Refactor `OrderHistoryPage` sang utility mới.
3. Tăng `limit` fetch và thêm filter client-side cho lịch sử đơn hàng.
4. Cập nhật empty-state theo filter.
5. Refactor `OrderDetailPage` sang utility mới.
6. Ẩn hoặc vô hiệu hóa action `Đã nhận hàng` ở user detail.
7. Test thủ công các trạng thái hiện có.

## 8. Phần không làm trong đợt này
- Không thêm endpoint backend lọc order theo status.
- Không sửa flow thanh toán VNPay.
- Không thêm polling/websocket cho thay đổi trạng thái realtime.
- Không sửa admin order management.
- Không mở flow user tự xác nhận hoàn tất đơn hàng, vì backend hiện không support quyền đó.

## 9. Rủi ro và cách giảm rủi ro
### Rủi ro 1: User có nhiều hơn số lượng đơn được fetch
- Giảm rủi ro bằng cách tăng `limit` ở riêng trang lịch sử đơn hàng.
- Nếu sau này dữ liệu lớn hơn nữa, mới cân nhắc pagination UI riêng.

### Rủi ro 2: Backend trả trạng thái ngoài 4 trạng thái hiện tại
- Giảm rủi ro bằng fallback badge trung tính + hiển thị raw status.
- Không crash UI.

### Rủi ro 3: Đụng nhầm flow khác
- Giảm rủi ro bằng cách chỉ sửa file user order liên quan trực tiếp.
- Không sửa `CheckoutPage`, `VnpayReturnPage`, admin pages.

## 10. Kết luận
- Backend hiện đã đủ dữ liệu để frontend user hiển thị lịch sử đơn hàng theo các trạng thái order hợp lệ mà không cần sửa backend.
- Phần cần làm chủ yếu là chuẩn hóa status ở frontend, tăng độ bao phủ dữ liệu hiển thị, thêm filter client-side, và loại bỏ action user đang gọi nhầm route admin-only.
- Nên triển khai tuần tự theo 9 bước ở trên để tránh ảnh hưởng các flow khác.
