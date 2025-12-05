--
-- Dữ liệu mock test cho cơ sở dữ liệu ecommerce_coffee đồ án môn ooad 
-- Lưu ý: tắt kiểm tra khoá ngoại khi nạp dữ liệu(dữ liệu đã được format chuẩn)
-- Hash lại password vì mỗi server sẽ hash ra kết quả khác nhau
--


-- --------------------------------------------------------


--
-- Đang đổ dữ liệu cho bảng `carts`
--

INSERT INTO `carts` (`id`, `userId`, `createdAt`) VALUES
(1, 3, '2025-11-11 17:14:01.642'),
(2, 8, '2025-11-11 19:52:19.296'),
(3, 2, '2025-11-11 20:12:27.842'),
(4, 4, '2025-11-13 19:24:22.117'),
(5, 5, '2025-11-13 19:59:55.289'),
(6, 6, '2025-11-13 20:00:41.766'),
(7, 9, '2025-11-13 20:41:10.072'),
(8, 10, '2025-11-14 07:58:29.879'),
(9, 12, '2025-12-02 18:26:18.918'),
(10, 21, '2025-12-05 08:27:16.086');

-- --------------------------------------------------------

--
-- Đang đổ dữ liệu cho bảng `cart_items`
--

INSERT INTO `cart_items` (`id`, `cartId`, `productId`, `variantId`, `quantity`, `unitPrice`) VALUES
(4, 2, 5, NULL, 2, 200000.00),
(5, 2, 4, NULL, 1, 400000.00),
(6, 2, 1, NULL, 1, 200000.00);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `categories`
--

--
-- Đang đổ dữ liệu cho bảng `categories`
--

INSERT INTO `categories` (`id`, `name`, `description`, `parentId`, `isActive`) VALUES
(1, 'Robusta', 'Chuyên robusta ', NULL, 1),
(3, 'Robusta Lam Dong', 'Mui huong em nong say', 1, 1),
(4, 'Robusta Dak Lak', 'Dac san ca phe cao nguyen', 1, 1),
(5, 'Robusta Ban Me', 'Thu phu ca phe viet nam', 1, 1),
(7, 'Arabica', 'Chua nhe cho buoi sang', NULL, 1),
(8, 'Arabica Lam Dong', 'Uong it thoi die som day', 7, 1),
(9, 'Arabica Gia Lai', 'Dang nhe cho buoi sang', 7, 1),
(10, 'Culi', 'Ca phe hau vi hoi dang', NULL, 0);

-- --------------------------------------------------------


--
-- Đang đổ dữ liệu cho bảng `coupons`
--

INSERT INTO `coupons` (`id`, `code`, `discountPercent`, `validFrom`, `validUntil`) VALUES
(1, 'VNTEACHERDAY', 10, '2025-11-05 00:00:00.000', '2025-12-25 23:59:59.000'),
(3, 'XMASPLUS', 25, '2025-11-11 17:56:44.000', '2025-12-21 17:56:51.000'),
(5, 'BANNHATRANO', 102, '2025-11-15 14:57:00.000', '2025-12-20 14:57:00.000');

-- --------------------------------------------------------

-- Đang đổ dữ liệu cho bảng `imports`
--

INSERT INTO `imports` (`id`, `supplier_id`, `total_amount`, `import_date`, `payment_status`) VALUES
(1, 1, 12000000.00, '2025-11-11 11:44:47', 'paid'),
(2, 6, 5000000.00, '2025-11-14 03:13:05', 'paid'),
(3, 6, 20000000.00, '2025-11-14 03:17:20', 'paid'),
(4, 7, 11090000.00, '2025-11-15 07:47:38', 'paid'),
(5, 3, 99999999.99, '2025-11-15 18:19:10', 'paid'),
(6, 6, 15000000.00, '2025-11-15 18:20:16', 'paid');

-- --------------------------------------------------------

--
-- Đang đổ dữ liệu cho bảng `import_details`
--

INSERT INTO `import_details` (`id`, `import_id`, `product_id_imports`, `quantity`, `unit_price`) VALUES
(1, 1, 1, 20, 200000.00),
(2, 1, 2, 20, 200000.00),
(3, 1, 3, 20, 200000.00),
(4, 2, 7, 100, 50000.00),
(5, 3, 6, 100, 200000.00),
(6, 4, 7, 10, 200000.00),
(7, 4, 5, 15, 300000.00),
(8, 4, 3, 17, 270000.00),
(9, 5, 22, 100, 250000.00),
(10, 5, 21, 100, 240000.00),
(11, 5, 20, 100, 230000.00),
(12, 5, 19, 100, 220000.00),
(13, 5, 18, 100, 210000.00),
(14, 5, 17, 100, 200000.00),
(15, 5, 16, 100, 260000.00),
(16, 5, 15, 100, 270000.00),
(17, 5, 14, 100, 280000.00),
(18, 5, 13, 100, 290000.00),
(19, 5, 12, 100, 300000.00),
(20, 5, 10, 100, 250000.00),
(21, 5, 9, 100, 240000.00),
(22, 5, 8, 100, 230000.00),
(23, 6, 11, 100, 150000.00);

-- --------------------------------------------------------



INSERT INTO `inventories` (`id`, `quantity`, `productId`) VALUES
(1, 57, 1),
(2, 44, 2),
(3, 54, 3),
(4, 4, 4),
(5, 27, 5),
(9, 100, 6),
(10, 110, 7),
(16, 100, 8),
(17, 100, 9),
(18, 100, 10),
(19, 100, 11),
(20, 100, 12),
(21, 100, 13),
(22, 99, 14),
(23, 100, 15),
(24, 100, 16),
(25, 99, 17),
(26, 100, 18),
(27, 100, 19),
(28, 99, 20),
(29, 99, 21),
(30, 98, 22);

-- --------------------------------------------------------

--
-- Đang đổ dữ liệu cho bảng `orders`
--

INSERT INTO `orders` (`id`, `orderDate`, `shipAddress`, `status`, `totalAmount`, `userId`, `couponId`) VALUES
(1, '2025-11-11 18:09:26.000', NULL, 'COMPLETED', 600000.00, 3, 1),
(2, '2025-11-11 18:11:57.000', NULL, 'CANCELLED', 1000000.00, 3, 1),
(3, '2025-11-11 18:19:10.000', NULL, 'COMPLETED', 600000.00, 3, 1),
(4, '2025-11-11 18:25:29.000', NULL, 'COMPLETED', 200000.00, 3, 1),
(5, '2025-11-13 20:55:35.000', NULL, 'COMPLETED', 1600000.00, 9, NULL),
(6, '2025-11-13 21:04:17.000', NULL, 'COMPLETED', 300000.00, 9, NULL),
(7, '2025-11-13 21:20:07.000', NULL, 'PENDING', 180000.00, 9, 1),
(8, '2025-11-14 07:59:49.000', NULL, 'PENDING', 225000.00, 10, 3),
(9, '2025-11-14 08:22:44.000', NULL, 'PENDING', 400000.00, 10, NULL),
(10, '2025-11-14 08:26:41.000', NULL, 'PENDING', 200000.00, 10, NULL),
(11, '2025-11-14 08:32:54.000', NULL, 'PENDING', 180000.00, 10, 1),
(12, '2025-11-14 08:33:51.000', NULL, 'COMPLETED', 400000.00, 10, NULL),
(13, '2025-11-14 08:35:16.000', NULL, 'COMPLETED', 200000.00, 10, NULL),
(14, '2025-11-14 08:37:07.000', NULL, 'COMPLETED', 400000.00, 10, NULL),
(15, '2025-11-14 08:40:11.000', NULL, 'COMPLETED', 200000.00, 10, NULL),
(16, '2025-11-14 08:42:32.000', NULL, 'COMPLETED', 500000.00, 10, NULL),
(17, '2025-11-14 08:49:15.000', NULL, 'COMPLETED', 450000.00, 10, 1),
(18, '2025-11-14 08:49:48.000', NULL, 'COMPLETED', 450000.00, 10, 1),
(19, '2025-11-14 08:51:07.000', NULL, 'COMPLETED', 450000.00, 10, 1),
(20, '2025-11-14 08:52:55.000', 'HCM', 'COMPLETED', 450000.00, 10, 1),
(21, '2025-11-14 08:55:58.000', 'An Dương vương', 'COMPLETED', 150000.00, 10, 3),
(22, '2025-12-02 18:28:27.000', 'An Dương Vương', 'COMPLETED', 1900000.00, 12, NULL),
(23, '2025-12-05 08:35:52.000', '04 Tú Xương, Phường Thống Nhất, Thị xã Buôn Hồ, Tỉnh Đắk Lắk', 'PENDING', 750000.00, 21, 3),
(24, '2025-12-05 08:37:57.000', '04 Tú Xương, Phường Thống Nhất, Thị xã Buôn Hồ, Tỉnh Đắk Lắk', 'PENDING', 599250.00, 21, 3);

-- --------------------------------------------------------

--
-- Đang đổ dữ liệu cho bảng `order_items`
--

INSERT INTO `order_items` (`id`, `quantity`, `orderId`, `productId`, `unitPrice`, `variantId`) VALUES
(1, 1, 1, 1, 200000.00, NULL),
(2, 1, 1, 4, 400000.00, NULL),
(3, 5, 2, 1, 200000.00, NULL),
(4, 1, 3, 1, 200000.00, NULL),
(5, 1, 3, 4, 400000.00, NULL),
(6, 1, 4, 1, 200000.00, NULL),
(7, 2, 5, 5, 200000.00, NULL),
(8, 1, 5, 4, 400000.00, NULL),
(9, 1, 5, 3, 300000.00, NULL),
(10, 1, 5, 2, 500000.00, NULL),
(11, 1, 6, 3, 300000.00, NULL),
(12, 1, 7, 5, 200000.00, NULL),
(13, 1, 8, 3, 300000.00, NULL),
(14, 1, 9, 4, 400000.00, NULL),
(15, 1, 10, 5, 200000.00, NULL),
(16, 1, 11, 5, 200000.00, NULL),
(17, 1, 12, 4, 400000.00, NULL),
(18, 1, 13, 5, 200000.00, NULL),
(19, 1, 14, 4, 400000.00, NULL),
(20, 1, 15, 5, 200000.00, NULL),
(21, 1, 16, 2, 500000.00, NULL),
(22, 1, 17, 2, 500000.00, NULL),
(23, 1, 18, 2, 500000.00, NULL),
(24, 1, 19, 2, 500000.00, NULL),
(25, 1, 20, 2, 500000.00, NULL),
(26, 1, 21, 5, 200000.00, NULL),
(27, 1, 22, 22, 600000.00, NULL),
(28, 1, 22, 20, 700000.00, NULL),
(29, 1, 22, 17, 600000.00, NULL),
(30, 1, 23, 22, 600000.00, NULL),
(31, 1, 23, 21, 400000.00, NULL),
(32, 1, 24, 14, 799000.00, NULL);

-- --------------------------------------------------------

--
-- Đang đổ dữ liệu cho bảng `products`
--

INSERT INTO `products` (`id`, `name`, `description`, `price`, `imageUrl`, `categoryId`, `supplierId`, `isActive`) VALUES
(1, 'Hưu Trí An Nhã', 'Đắng gắt ở hậu vị, dành cho cao niên lão làng', 200000.00, './asset/img/products/1764836149221.png', 1, 1, 1),
(2, 'Thiên Tầm Linh Trúc', 'Bùng nổ cafein vào máu', 500000.00, './asset/img/products/1764836098488.png', 1, 1, 1),
(3, 'Robusta Ban Mê', 'Quà quê cao cấp', 300000.00, './asset/img/products/1764836037026.png', 5, 1, 0),
(4, 'Hạ Nhớ', 'cà phê gói, thần tốc cafein', 400000.00, './asset/img/products/1764835957643.png', 1, 1, 1),
(5, 'Bình Minh', 'Chua nhẹ, trải nghiệm gần như ngay lập tức', 200000.00, './asset/img/products/1764835880613.png', 1, 1, 1),
(6, 'Ghiền Đen Đá', 'Thơm lâu, pha cold brew là hết sảy', 600000.00, './asset/img/products/1764835833991.png', 10, 7, 1),
(7, 'Ghiền Sữa Đá', 'Vị nhẹ nhàng, sâu lắng, thích hợp với kiểu pha phin', 500000.00, './asset/img/products/1764835730752.png', 5, 6, 1),
(8, 'Hắc Mộc Linh Hương', 'Hương thơm trầm ấm như linh mộc cổ thụ, vị đậm mạnh, dư vị kéo dài như dòng linh khí ngưng tụ.', 400000.00, './asset/img/products/1764835710011.png', 5, 2, 1),
(9, 'Huyền Sương Cổ Vị', 'Lớp hương nhẹ lẫn khói sương núi, vị chát dịu thanh tao, gợi cảm giác cổ xưa như bước vào tiên cảnh.', 399000.00, './asset/img/products/1764835694528.png', 7, 4, 1),
(10, 'Trầm Vân Định Ý', 'Vị đậm sâu như mây trầm tụ, giúp tinh thần tỉnh táo, tập trung như bước vào trạng thái nhập định.', 299000.00, './asset/img/products/1764835683610.png', 10, 2, 1),
(11, 'Huyết Y Thần Phách', 'Gu đậm mạnh, kích thích giác quan, mang sắc thái mãnh liệt như huyết khí bùng nổ khi vận công.', 199000.00, './asset/img/products/1764835671214.png', 7, 1, 1),
(12, 'Linh Cốt Hỏa Hương', 'Rang đậm theo “hỏa luyện”, tạo hương thơm mạnh và ấm, hậu vị dày như cốt khí tu sĩ.', 990000.00, './asset/img/products/1764835658863.png', 5, 1, 1),
(13, 'Tịch Dạ U Hương', 'Hương thơm trầm tĩnh, phủ nét u tối của đêm sâu, phù hợp người thích cà phê đen đậm.', 399000.00, './asset/img/products/1764835641005.png', 4, 5, 1),
(14, 'Thiên Vị Đạo Hỏa', 'Vị đậm bừng cháy, hương lan tỏa như vận thiên hỏa trong lò luyện đan.', 799000.00, './asset/img/products/1764835625480.png', 4, 6, 1),
(15, 'Hư Vô Thanh Vị', 'Hương nhẹ tinh khiết, vị thanh tao, mềm mại như sương tinh ngưng tụ giữa hư không.', 999999.00, './asset/img/products/1764835610611.png', 3, 7, 1),
(16, 'Cổ Phong Ma Ảnh', 'Gu đậm bí ẩn, đắng sâu, để lại dư vị mạnh mẽ như sát khí ẩn dưới bóng ma phong cổ.', 699000.00, './asset/img/products/1764835597715.png', 9, 1, 1),
(17, 'Linh Sơn Trầm Vị', 'Hương đất và gỗ nhẹ như khí núi linh thiêng, vị cân bằng, dễ uống.', 600000.00, './asset/img/products/1764835582533.png', 8, 2, 1),
(18, 'Vân Khởi Minh Hương', 'Hương thơm bùng lên như mây động lúc bình minh, vị nhẹ, phù hợp người thích gu thanh.', 500000.00, './asset/img/products/1764835562867.png', 7, 1, 1),
(19, 'Hỏa Trì Tinh Thơm', 'Rang bằng nhiệt độ cao “tinh luyện”, tạo ra mùi vị mạnh mẽ và sắc sảo.', 123456.00, './asset/img/products/1764835545361.png', 10, 3, 1),
(20, 'Trấn Tâm Trúc Mộc', 'Hương mộc nhẹ, vị trầm bình ổn, giúp tinh thần vững tâm như trúc giữa gió.', 700000.00, './asset/img/products/1764835532611.png', 1, 4, 1),
(21, 'U Cốc Hàn Vị', 'Vị đắng lạnh nhẹ, sắc nét, mang cảm giác cô tịch như thung lũng u tối.', 400000.00, './asset/img/products/1764835520991.png', 5, 5, 1),
(22, 'Thần Khí Dưỡng Tinh Khôn', 'Hương thơm thanh, vị mượt, giúp “tỉnh táo – dưỡng thần” phù hợp sử dụng buổi sáng.', 600000.00, './asset/img/products/1764835510275.png', 4, 6, 1);

-- --------------------------------------------------------

-- Đang đổ dữ liệu cho bảng `receipts`
--

INSERT INTO `receipts` (`id`, `amount`, `order_id`, `payment_method`, `description`, `created_at`) VALUES
(1, 200000.00, 4, 'cash', NULL, '2025-11-11 11:27:35'),
(2, 450000.00, 19, 'cash', NULL, '2025-11-14 02:13:06'),
(3, 600000.00, 1, 'cash', NULL, '2025-11-15 18:28:21'),
(4, 1600000.00, 5, 'cash', NULL, '2025-11-15 18:28:46'),
(5, 200000.00, 13, 'cash', NULL, '2025-11-15 18:30:14'),
(6, 400000.00, 12, 'cash', NULL, '2025-11-15 18:30:20'),
(7, 300000.00, 6, 'cash', NULL, '2025-11-15 18:30:26'),
(8, 1900000.00, 22, 'cash', NULL, '2025-12-05 02:04:16');

-- --------------------------------------------------------

--
-- Đang đổ dữ liệu cho bảng `roles`
--

INSERT INTO `roles` (`id`, `name`, `description`) VALUES
(1, 'admin', 'Quản lý doanh nghiệp'),
(2, 'user', 'Regular user'),
(3, 'warehouse', 'Warehouse staff'),
(4, 'sale', 'Sales staff'),
(5, 'hrm', 'HR Manager');

-- --------------------------------------------------------

--
-- Đang đổ dữ liệu cho bảng `suppliers`
--

INSERT INTO `suppliers` (`id`, `name`, `address`, `code`, `contactInfo`, `isActive`) VALUES
(1, 'NCC10', 'HCM-BenThanh', 'HCM1909', '01234561954', 1),
(2, 'NCC2', 'DAK LAK', 'NCCDL01', '0123456789', 1),
(3, 'NCC3', 'DAK LAK', 'NCCDL02', '012345678', 1),
(4, 'NCC4', 'DAK LAK', 'NCCDL03', '012345678', 1),
(5, 'NCC5', 'DAK LAK', 'NCCDL06', '012345678', 1),
(6, 'NCC6', 'DAK LAK', 'NCCDL05', '012345678', 1),
(7, 'NCC7', 'Lam Dong', 'NCCDL07', '012345678', 1),
(8, 'Minh\'s farm', 'DAK LAK', 'DL001', '0878254731', 1),
(9, 'Lam gau', 'hâhahaha', '112345', '01234561954', 0),
(10, 'Múc Đinh', 'DAK LAK', 'ABC123', '0878254732', 0);

-
--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `createdAt`, `email`, `name`, `phoneNumber`, `password`, `isActive`, `roleId`) VALUES
(2, '2025-11-10 18:32:30.396', 'a@gmail.com', 'minh2', '0935704208', '$2a$10$lEDy2Qp8mZi.c8RNr6CDXutcHdP.lLrhP1yJSfEzAaeiez4Yu1Fne', 1, 1),
(3, '2025-11-10 18:40:20.397', 'b@gmail.com', 'minhmh1', NULL, '$2a$10$aBR3dYJtSnGbZ2KCvT.OyewgGbHsAWL2o7/4De6Tvf9D28V.OGxX6', 0, 2),
(4, '2025-11-10 18:40:29.251', 'c@gmail.com', 'minhmh2', NULL, '$2a$10$RKCnZ6Lcr.xgwcXXXW0NV.r1uos/SgPUKafy28.FD5mCCLs0yHgVO', 1, 3),
(5, '2025-11-10 18:40:38.727', 'd@gmail.com', 'minhmh3', NULL, '$2a$10$NXSJUwY200O5VhotBI0MK.d36eVQRTAavT38NbHRv9Gez2q.5VEdG', 1, 4),
(6, '2025-11-10 18:40:46.491', 'e@gmail.com', 'minhmh4', NULL, '$2a$10$JCepwS4zHQl/VGf5t8QYpOLGWNxPGd1xidz44YR.mJn6LLhvMC9si', 1, 5),
(7, '2025-11-10 18:42:25.874', 'f@gmail.com', 'minhmh5', NULL, '$2a$10$N2d8266taTu7Rr/6116W3eENd1h0ZRUEvwYGmziwx8VODhYgvJvfW', 0, 2),
(8, '2025-11-11 19:32:21.037', 'minh@gmail.com', 'Mai Hoàng Minh', NULL, '$2a$10$1ogC7BeOnn6f7OsZCilxhelzAbDL5nJyZOMIsAk.n/42z/i5SjhnC', 0, 2),
(9, '2025-11-13 20:41:03.747', 'r@gmail.com', 'Thanh Nhã Roast', '01111111111', '$2a$10$U5TbNcp2Hk1eqLrhnrBnMeEQP5yj0Osm0Xi4i9.IkEeGV1bP6OLi6', 0, 2),
(10, '2025-11-14 07:58:15.101', 'g@gmail.com', 'Đức Minh', '01111111111', '$2a$10$jHR7VzDSYIEetAYY9n1mhe8QaDBDqrjtUowLY/25fI65q0fU3RJLK', 1, 2),
(11, '2025-11-15 15:30:56.080', 'admin@gmail.com', 'Nguyễn Văn Admin', NULL, '$2a$10$CmF0hcrOa0PcaTMm.TZwV.vX2ipW5KMh1ibTBmgVaVsiFAvpe4Rm2', 1, 1),
(12, '2025-11-15 15:33:32.684', 'sale@gmail.com', 'Sale thủ', NULL, '$2a$10$jAtfTWPruL8Gw.2Xvts3ruO5af7sA9ytpZoP8RSM.CTptnC0Uktfy', 1, 2),
(13, '2025-11-15 15:39:06.302', 'nguyenvana@gmail.com', 'Đức Minh', NULL, '$2a$10$fDB8fOEqlVAc6Nlj7aAAfemRkR4ACeIoeGXTb/w7xrJ.y5biDmaV.', 1, 2),
(14, '2025-11-15 15:45:21.038', 'nam@gmail.com', 'Đức Minh', NULL, '$2a$10$VO6cooyjIOKncoQM2AnOle669UPexybPfAc3rer4FSLBV2Kch2/32', 1, 2),
(15, '2025-11-15 15:49:56.530', 'ah@gmail.com', 'How', NULL, '$2a$10$T9h9vxB3.EPse9mHt1TT9OE7MRpfJnaHPE38BVyMzOc/IuYjkHqem', 1, 2),
(16, '2025-11-15 15:53:40.528', 'nguyenvanab@gmail.com', 'Đức Minh', NULL, '$2a$10$FBgrzHzUkV2Oe0IkRs3eruVHmHxKvgzknXIPNJnwtRyPM3cJ4HTRa', 1, 4),
(17, '2025-11-15 15:55:59.551', 'nguyenvanabc@gmail.com', 'Đức Minh', NULL, '$2a$10$qBhEKA.WtxFkY6jX6X1Z4OIvzOLiZa2DMRnI8aXYhM0xgdTf7N0Au', 1, 4),
(18, '2025-11-15 15:57:36.797', 'nguyenvanabcde@gmail.com', 'Nguyễn Văn Adminh', '01111111111111', '$2a$10$2KgjjavNCFPyRNwYVxXjwet9ggOLMZwG4Sklfv4grDB494eDpAx52', 1, 2),
(19, '2025-11-15 15:59:47.588', 'nguyenvanb@gmail.com', 'Thanh Nhã', '0123456111', '$2a$10$l8Z96KLUfzqQi9N.G2excuQPLkikquUW6Vqd7oVobLZlyZVk9gZDi', 1, 1),
(20, '2025-11-20 16:05:29.915', 'fs@gmail.com', 'minhmh5', NULL, '$2a$10$/a42KXedaL/zGeIMUSayCuSCF1sznmejMmscJOH.LzD58jIX.o7Ha', 1, 1),
(21, '2025-12-05 08:27:02.138', 'minhmh@gmail.com', 'Mai Hoàng Minh', '01111111111', '$2a$10$pZoJEC6lmbhiuoCvSkGbkOY5L88wSxOZqBHprpdzMZw6l82t5HeqS', 1, 2);


--
-- Đang đổ dữ liệu cho bảng `variants`
--

INSERT INTO `variants` (`id`, `name`, `productId`, `additionalPrice`) VALUES
(1, 'hey plus', 5, 500000.00);

