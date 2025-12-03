-- CreateTable
CREATE TABLE "categories" (
    "category_id" SERIAL NOT NULL,
    "category_name" VARCHAR(100) NOT NULL,
    "description" TEXT,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "products" (
    "product_id" SERIAL NOT NULL,
    "product_name" VARCHAR(255) NOT NULL,
    "base_product_name" VARCHAR(255),
    "variant_name" VARCHAR(100),
    "quantity_value" DECIMAL(10,3),
    "quantity_unit" VARCHAR(20),
    "package_size" VARCHAR(50),
    "brand" VARCHAR(100),
    "category_id" INTEGER,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "products_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "shopping_list_items" (
    "item_id" SERIAL NOT NULL,
    "list_id" INTEGER,
    "product_id" INTEGER,
    "quantity" INTEGER DEFAULT 1,

    CONSTRAINT "shopping_list_items_pkey" PRIMARY KEY ("item_id")
);

-- CreateTable
CREATE TABLE "shopping_lists" (
    "list_id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "list_name" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shopping_lists_pkey" PRIMARY KEY ("list_id")
);

-- CreateTable
CREATE TABLE "users" (
    "user_id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "user_type" VARCHAR(20),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "vendor_listings" (
    "listing_id" SERIAL NOT NULL,
    "product_id" INTEGER,
    "vendor_id" INTEGER,
    "price" DECIMAL(10,2) NOT NULL,
    "stock_quantity" INTEGER DEFAULT 0,
    "is_available" BOOLEAN DEFAULT true,
    "last_updated" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendor_listings_pkey" PRIMARY KEY ("listing_id")
);

-- CreateTable
CREATE TABLE "vendors" (
    "vendor_id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "vendor_name" VARCHAR(100) NOT NULL,
    "contact_email" VARCHAR(255),
    "is_verified" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("vendor_id")
);

-- CreateTable
CREATE TABLE "vendor_uploads" (
    "upload_id" SERIAL NOT NULL,
    "vendor_id" INTEGER NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "file_url" VARCHAR(500),
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "uploaded_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(6),
    "error_message" TEXT,

    CONSTRAINT "vendor_uploads_pkey" PRIMARY KEY ("upload_id")
);

-- CreateTable
CREATE TABLE "password_resets" (
    "reset_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "token" VARCHAR(128) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_resets_pkey" PRIMARY KEY ("reset_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_category_name_key" ON "categories"("category_name");

-- CreateIndex
CREATE UNIQUE INDEX "unique_product_brand" ON "products"("product_name", "brand");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "unique_product_vendor" ON "vendor_listings"("product_id", "vendor_id");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_listings_product_id_vendor_id_key" ON "vendor_listings"("product_id", "vendor_id");

-- CreateIndex
CREATE UNIQUE INDEX "vendors_user_id_key" ON "vendors"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "password_resets_token_key" ON "password_resets"("token");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("category_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "shopping_list_items" ADD CONSTRAINT "shopping_list_items_list_id_fkey" FOREIGN KEY ("list_id") REFERENCES "shopping_lists"("list_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "shopping_list_items" ADD CONSTRAINT "shopping_list_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("product_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "shopping_lists" ADD CONSTRAINT "shopping_lists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "vendor_listings" ADD CONSTRAINT "vendor_listings_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("product_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "vendor_listings" ADD CONSTRAINT "vendor_listings_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("vendor_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
