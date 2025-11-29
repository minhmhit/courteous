--  carts 
CREATE TABLE `carts` (
  `id` int NOT NULL,
  `userId` int NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `carts_userId_key` (`userId`)
);

--  cart_items 
CREATE TABLE `cart_items` (
  `id` int NOT NULL,
  `cartId` int NOT NULL,
  `productId` int NOT NULL,
  `variantId` int DEFAULT NULL,
  `quantity` int NOT NULL,
  `unitPrice` decimal(65,2) NOT NULL,
  PRIMARY KEY (`id`)
);

--  categories 
CREATE TABLE `categories` (
  `id` int NOT NULL,
  `name` varchar(191) NOT NULL,
  `description` varchar(191),
  `parentId` int DEFAULT NULL,
  `isActive` int NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `categories_name_key` (`name`)
);

--  coupons 
CREATE TABLE `coupons` (
  `id` int NOT NULL,
  `code` varchar(191) NOT NULL,
  `discountPercent` double NOT NULL,
  `validFrom` datetime(3) NOT NULL,
  `validUntil` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
);

--  imports 
CREATE TABLE `imports` (
  `id` int NOT NULL,
  `supplier_id` int NOT NULL,
  `total_amount` decimal(10,2),
  `import_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `payment_status` varchar(255),
  PRIMARY KEY (`id`)
);

--  import_details 
CREATE TABLE `import_details` (
  `id` int NOT NULL,
  `import_id` int NOT NULL,
  `product_id_imports` int NOT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) GENERATED ALWAYS AS (`quantity` * `unit_price`) STORED,
  PRIMARY KEY (`id`)
);

--  inventories 
CREATE TABLE `inventories` (
  `id` int NOT NULL,
  `quantity` int NOT NULL,
  `productId` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY (`productId`)
);

--  orders 
CREATE TABLE `orders` (
  `id` int NOT NULL,
  `orderDate` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `shipAddress` varchar(50),
  `status` enum('PENDING','COMPLETED','CANCELLED','SHIPPING') NOT NULL DEFAULT 'PENDING',
  `totalAmount` decimal(65,2) NOT NULL,
  `userId` int NOT NULL,
  `couponId` int DEFAULT NULL,
  PRIMARY KEY (`id`)
);

--  order_items 
CREATE TABLE `order_items` (
  `id` int NOT NULL,
  `quantity` int NOT NULL,
  `orderId` int NOT NULL,
  `productId` int NOT NULL,
  `unitPrice` decimal(65,2) NOT NULL,
  `variantId` int DEFAULT NULL,
  PRIMARY KEY (`id`)
);

--  products 
CREATE TABLE `products` (
  `id` int NOT NULL,
  `name` varchar(191) NOT NULL,
  `description` varchar(191) NOT NULL,
  `price` decimal(65,2) NOT NULL,
  `imageUrl` varchar(191),
  `categoryId` int NOT NULL,
  `supplierId` int NOT NULL,
  `isActive` int NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`)
);

--  receipts 
CREATE TABLE `receipts` (
  `id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `order_id` int NOT NULL,
  `payment_method` enum('cash','bank_transfer','credit_card','momo') NOT NULL,
  `description` text,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
);

--  roles 
CREATE TABLE `roles` (
  `id` int NOT NULL,
  `name` varchar(191) NOT NULL,
  `description` varchar(191),
  PRIMARY KEY (`id`)
);

--  suppliers 
CREATE TABLE `suppliers` (
  `id` int NOT NULL,
  `name` varchar(191) NOT NULL,
  `address` varchar(191),
  `code` varchar(191) NOT NULL,
  `contactInfo` varchar(191),
  `isActive` int NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`)
);

--  users 
CREATE TABLE `users` (
  `id` int NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `email` varchar(191) NOT NULL,
  `name` varchar(191),
  `phoneNumber` varchar(20),
  `password` varchar(191) NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `roleId` int NOT NULL,
  PRIMARY KEY (`id`)
);

--  variants 
CREATE TABLE `variants` (
  `id` int NOT NULL,
  `name` varchar(191) NOT NULL,
  `productId` int NOT NULL,
  `additionalPrice` decimal(65,2) NOT NULL,
  PRIMARY KEY (`id`)
);

--  FOREIGN KEYS 
ALTER TABLE carts ADD CONSTRAINT fk_cart_user FOREIGN KEY (userId) REFERENCES users(id);

ALTER TABLE cart_items 
  ADD CONSTRAINT fk_cartitem_cart FOREIGN KEY (cartId) REFERENCES carts(id),
  ADD CONSTRAINT fk_cartitem_product FOREIGN KEY (productId) REFERENCES products(id),
  ADD CONSTRAINT fk_cartitem_variant FOREIGN KEY (variantId) REFERENCES variants(id);

ALTER TABLE categories ADD CONSTRAINT fk_category_parent FOREIGN KEY (parentId) REFERENCES categories(id);

ALTER TABLE imports ADD CONSTRAINT fk_import_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id);

ALTER TABLE import_details 
  ADD CONSTRAINT fk_importdetails_import FOREIGN KEY (import_id) REFERENCES imports(id),
  ADD CONSTRAINT fk_importdetails_product FOREIGN KEY (product_id_imports) REFERENCES products(id);

ALTER TABLE inventories ADD CONSTRAINT fk_inventory_product FOREIGN KEY (productId) REFERENCES products(id);

ALTER TABLE orders 
  ADD CONSTRAINT fk_orders_user FOREIGN KEY (userId) REFERENCES users(id),
  ADD CONSTRAINT fk_orders_coupon FOREIGN KEY (couponId) REFERENCES coupons(id);

ALTER TABLE order_items 
  ADD CONSTRAINT fk_orderitems_order FOREIGN KEY (orderId) REFERENCES orders(id),
  ADD CONSTRAINT fk_orderitems_product FOREIGN KEY (productId) REFERENCES products(id),
  ADD CONSTRAINT fk_orderitems_variant FOREIGN KEY (variantId) REFERENCES variants(id);

ALTER TABLE products 
  ADD CONSTRAINT fk_products_category FOREIGN KEY (categoryId) REFERENCES categories(id),
  ADD CONSTRAINT fk_products_supplier FOREIGN KEY (supplierId) REFERENCES suppliers(id);

ALTER TABLE receipts ADD CONSTRAINT fk_receipts_order FOREIGN KEY (order_id) REFERENCES orders(id);

ALTER TABLE users ADD CONSTRAINT fk_users_role FOREIGN KEY (roleId) REFERENCES roles(id);

ALTER TABLE variants ADD CONSTRAINT fk_variant_product FOREIGN KEY (productId) REFERENCES products(id);
