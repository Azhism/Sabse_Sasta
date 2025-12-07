import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

interface VendorOption {
  vendor: string;
  totalCost: number;
  availableItems: number;
  totalItems: number;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  unavailableItems: string[];
}

interface MegaOption {
  totalCost: number;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    vendor: string;
    price: number;
    total: number;
  }>;
}

export class ShoppingListService {
  static async createList(userId: string, name: string) {
    return prisma.shopping_lists.create({
      data: {
        user_id: parseInt(userId),
        list_name: name,
      },
      include: {
        shopping_list_items: {
          include: {
            products: true,
          },
        },
      },
    });
  }

  static async getUserLists(userId: string) {
    return prisma.shopping_lists.findMany({
      where: { user_id: parseInt(userId) },
      include: {
        shopping_list_items: {
          include: {
            products: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  static async getListById(listId: string, userId: string) {
    // Validate listId
    if (!listId || listId === 'undefined' || listId === 'null') {
      throw new Error('Invalid list ID');
    }
    
    // Convert listId to integer if it's a valid number
    const listIdNum = parseInt(listId, 10);
    if (isNaN(listIdNum)) {
      throw new Error('Invalid list ID: must be a number');
    }
    
    const list = await prisma.shopping_lists.findFirst({
      where: {
        list_id: listIdNum,
        user_id: parseInt(userId),
      },
      include: {
        shopping_list_items: {
          include: {
            products: true,
          },
        },
      },
    });

    if (!list) {
      throw new Error('Shopping list not found');
    }

    return list;
  }

  static async updateList(listId: string, userId: string, name: string) {
    const list = await this.getListById(listId, userId);
    
    // Convert listId to integer if it's a valid number
    const listIdNum = parseInt(listId, 10);
    const listIdFilter = isNaN(listIdNum) ? listId : listIdNum;

    return prisma.shopping_lists.update({
      where: { list_id: listIdNum },
      data: { list_name: name },
      include: {
        shopping_list_items: {
          include: {
            products: true,
          },
        },
      },
    });
  }

  static async deleteList(listId: string, userId: string) {
    const list = await this.getListById(listId, userId);
    
    // Convert listId to integer if it's a valid number
    const listIdNum = parseInt(listId, 10);
    const listIdFilter = isNaN(listIdNum) ? listId : listIdNum;

    // Remove all items first to avoid FK constraints
    await prisma.shopping_list_items.deleteMany({
      where: {
        list_id: listIdNum,
      },
    });

    return prisma.shopping_lists.delete({
      where: { list_id: listIdNum },
    });
  }

  static async clearAllItems(listId: string, userId: string) {
    const list = await this.getListById(listId, userId);
    
    // Convert listId to integer if it's a valid number
    const listIdNum = parseInt(listId, 10);

    // Remove all items from the list
    return prisma.shopping_list_items.deleteMany({
      where: {
        list_id: listIdNum,
      },
    });
  }

  static async addItemToList(
    listId: string,
    userId: string,
    productId: string,
    quantity: number = 1
  ) {
    const list = await this.getListById(listId, userId);
    
    // Convert listId and productId to integers if they're valid numbers
    const listIdNum = parseInt(listId, 10);
    const productIdNum = parseInt(productId, 10);
    const listIdFilter = isNaN(listIdNum) ? listId : listIdNum;
    const productIdFilter = isNaN(productIdNum) ? productId : productIdNum;

    // Check if item already exists - use Prisma field names (camelCase)
    const existingItem = await prisma.shopping_list_items.findFirst({
      where: {
        list_id: listIdNum,
        product_id: productIdNum,
      },
    });

    if (existingItem) {
      // Get the primary key field name (could be item_id or id)
      const itemPrimaryKey = (existingItem as any).item_id || (existingItem as any).id;
      return prisma.shopping_list_items.update({
        where: { item_id: itemPrimaryKey },
        data: { 
          quantity: ((existingItem.quantity || 0) + quantity),
        },
        include: {
          products: true,
        },
      });
    }

    return prisma.shopping_list_items.create({
      data: {
        list_id: listIdNum,
        product_id: productIdNum,
        quantity: quantity,
      },
      include: {
        products: true,
      },
    });
  }

  static async updateListItem(
    listId: string,
    userId: string,
    itemId: string,
    quantity: number
  ) {
    // Validate itemId
    if (!itemId || itemId === 'undefined' || itemId === 'null') {
      throw new Error('Invalid item ID');
    }
    
    const list = await this.getListById(listId, userId);
    
    // Convert itemId to integer if it's a valid number
    const itemIdNum = parseInt(itemId, 10);
    if (isNaN(itemIdNum)) {
      throw new Error('Invalid item ID: must be a number');
    }

    if (quantity <= 0) {
      return prisma.shopping_list_items.delete({
        where: { item_id: itemIdNum },
      });
    }

    return prisma.shopping_list_items.update({
      where: { item_id: itemIdNum },
      data: { quantity: quantity },
      include: {
        products: true,
      },
    });
  }

  static async removeItemFromList(
    listId: string,
    userId: string,
    itemId: string
  ) {
    // Validate itemId
    if (!itemId || itemId === 'undefined' || itemId === 'null') {
      throw new Error('Invalid item ID');
    }
    
    const list = await this.getListById(listId, userId);
    
    // Convert itemId to integer if it's a valid number
    const itemIdNum = parseInt(itemId, 10);
    if (isNaN(itemIdNum)) {
      throw new Error('Invalid item ID: must be a number');
    }

    return prisma.shopping_list_items.delete({
      where: { item_id: itemIdNum },
    });
  }

  static async calculateShoppingListCosts(listId: string, userId: string): Promise<{
    vendorOptions: VendorOption[];
    megaOption: MegaOption;
  }> {
    // Get the shopping list with items
    const list = await this.getListById(listId, userId);
    
    if (!list.shopping_list_items || list.shopping_list_items.length === 0) {
      return {
        vendorOptions: [],
        megaOption: { totalCost: 0, items: [] },
      };
    }

    // Fetch vendor listings joined with vendors so we always have vendor names
    let vendorListings: any[] = [];
    try {
      const listingsQuery = Prisma.sql`
        SELECT 
          vl.*,
          v.vendor_name AS vendor_name
        FROM vendor_listings vl
        LEFT JOIN vendors v ON vl.vendor_id = v.vendor_id
      `;
      vendorListings = await prisma.$queryRaw(listingsQuery) as any[];
    } catch (error: any) {
      console.error('Failed to fetch vendor listings with vendor names:', error.message);
      return {
        vendorOptions: [],
        megaOption: { totalCost: 0, items: [] },
      };
    }

    if (!vendorListings || vendorListings.length === 0) {
      console.warn('No vendor listings available for cost calculation');
      return {
        vendorOptions: [],
        megaOption: { totalCost: 0, items: [] },
      };
    }

    // Fetch products for name mapping
    const productNameMap = new Map<
      string,
      { display_name?: string; product_name?: string; base_product_name?: string }
    >();
    try {
      const productsRaw = await prisma.$queryRaw(Prisma.sql`
        SELECT product_id, display_name, product_name, base_product_name
        FROM products
      `) as any[];
      productsRaw.forEach((product) => {
        const id =
          product.product_id?.toString() ||
          product.id?.toString() ||
          product.productId?.toString();
        if (id) {
          productNameMap.set(id, {
            display_name: product.display_name,
            product_name: product.product_name,
            base_product_name: product.base_product_name,
          });
        }
      });
    } catch (error: any) {
      console.warn('Failed to fetch products for name mapping:', error.message);
    }

    const normalizeString = (value: any): string => {
      if (value === null || value === undefined) return '';
      return String(value).trim().toLowerCase();
    };

    const normalizeListingRow = (row: any) => {
      const productId =
        row.product_id ??
        row.productId ??
        row.productID ??
        row.id ??
        row.listing_product_id ??
        null;
      const productIdStr = productId ? productId.toString() : null;

      const productInfo = productIdStr
        ? productNameMap.get(productIdStr)
        : undefined;

      const displayName =
        productInfo?.display_name ??
        productInfo?.product_name ??
        row.display_name ??
        row.product_name ??
        row.base_product_name ??
        row.name ??
        row.title ??
        row.item_name ??
        '';

      const baseProductName =
        productInfo?.base_product_name ?? row.base_product_name ?? row.base_name ?? '';

      const vendorId =
        row.vendor_id ??
        row.vendorId ??
        row.vendorID ??
        row.vendor ??
        null;
      const vendorIdStr = vendorId ? vendorId.toString() : null;

      // Vendor name should be present from the JOIN with vendors
      let vendorNameRaw =
        row.vendor_name ??
        row.store_name ??
        row.shop_name ??
        row.seller ??
        row.supplier ??
        null;

      if (!vendorNameRaw) {
        vendorNameRaw = 'Unknown Vendor';
        console.warn(
          `Vendor name not found for vendor_id: ${vendorIdStr}, available fields:`,
          Object.keys(row).filter((k) => k.includes('vendor') || k.includes('name'))
        );
      }

      const priceCandidate =
        row.price ??
        row.listing_price ??
        row.amount ??
        row.unit_price ??
        0;
      const price = Number(priceCandidate) || 0;

      return {
        listingId: row.listing_id ?? row.id ?? null,
        productId: productIdStr,
        displayName: displayName || 'Unnamed Product',
        baseProductName,
        nameKey: normalizeString(displayName),
        baseNameKey: normalizeString(baseProductName),
        vendorName: vendorNameRaw || 'Unknown Vendor',
        vendorKey: normalizeString(vendorNameRaw || 'Unknown Vendor'),
        vendorId: vendorIdStr,
        price,
        stockQuantity: Number(row.stock_quantity ?? row.quantity ?? 0) || 0,
        isAvailable:
          row.is_available !== undefined
            ? Boolean(row.is_available)
            : row.in_stock !== undefined
            ? Boolean(row.in_stock)
            : true,
      };
    };

    const listings = vendorListings.map(normalizeListingRow);

    // Get unique vendors (keep both key + display value)
    const vendorMap = new Map<string, string>();
    listings.forEach((listing) => {
      if (!vendorMap.has(listing.vendorKey)) {
        vendorMap.set(listing.vendorKey, listing.vendorName);
      }
    });
    const uniqueVendors = Array.from(vendorMap.entries());

    // Calculate vendor options
    const vendorOptions: VendorOption[] = [];
    const megaOptionItems: MegaOption['items'] = [];

    for (const [vendorKey, vendorLabel] of uniqueVendors) {
      let totalCost = 0;
      const vendorItems: VendorOption['items'] = [];
      const unavailableItems: string[] = [];

      for (const listItem of list.shopping_list_items) {
        const productId = listItem.product_id || listItem.productId;
        const quantity = listItem.quantity_value || listItem.quantity || 1;
        
        // Find products matching this item from this vendor
        // Match by product_id or by name if product_id doesn't match
        const product = listItem.products;
        // Try multiple field names that Prisma might return
        const productName = product?.display_name || 
                           product?.product_name || 
                           product?.base_product_name ||
                           product?.name || 
                           (product as any)?.productName ||
                           '';
        const baseProductName = product?.base_product_name || 
                               (product as any)?.baseProductName ||
                               '';
        const productIdStr = productId ? productId.toString() : null;
        const productNameKey = normalizeString(productName);
        const baseNameKey = normalizeString(baseProductName);

        // Find matching products from this vendor
        const vendorProducts = listings.filter(p => 
          p.vendorKey === vendorKey &&
          (
            (productIdStr && p.productId === productIdStr) ||
            (productNameKey && p.nameKey === productNameKey) ||
            (baseNameKey && p.baseNameKey === baseNameKey)
          )
        );

        if (vendorProducts.length > 0) {
          // Get the cheapest option
          const cheapest = vendorProducts.reduce((min, p) => 
            p.price < min.price ? p : min
          );
          
          const itemTotal = cheapest.price * quantity;
          totalCost += itemTotal;
          
          // Use product name from shopping list item first, then from vendor listing
          const finalName = productName || 
                           baseProductName ||
                           cheapest.displayName || 
                           'Unnamed Product';

          vendorItems.push({
            productId: cheapest.productId || productIdStr || '',
            productName: finalName,
            quantity,
            price: cheapest.price,
            total: itemTotal,
          });
        } else {
          // Use the product name from the shopping list item
          const itemName = productName || baseProductName || `Product ${productId || 'Unknown'}`;
          unavailableItems.push(itemName);
        }
      }

      // Show all vendors, even if they have 0 items available
        vendorOptions.push({
          vendor: vendorLabel,
        totalCost,
        availableItems: vendorItems.length,
        totalItems: list.shopping_list_items.length,
        items: vendorItems,
        unavailableItems,
      });
    }

    // Calculate mega option (optimal mix - cheapest vendor for each product)
    let megaTotalCost = 0;
    
    for (const listItem of list.shopping_list_items) {
      const productId = listItem.product_id || listItem.productId;
      const quantity = listItem.quantity_value || listItem.quantity || 1;
      
      const product = listItem.products;
      // Try multiple field names that Prisma might return
      const productName = product?.display_name || 
                         product?.product_name || 
                         product?.base_product_name ||
                         product?.name || 
                         (product as any)?.productName ||
                         '';
      const baseProductName = product?.base_product_name || 
                             (product as any)?.baseProductName ||
                             '';
      const productIdStr = productId ? productId.toString() : null;
      const productNameKey = normalizeString(productName);
      const baseNameKey = normalizeString(baseProductName);

      // Find all products matching this item across all vendors
      const matchingProducts = listings.filter(p => 
        (productIdStr && p.productId === productIdStr) ||
        (productNameKey && p.nameKey === productNameKey) ||
        (baseNameKey && p.baseNameKey === baseNameKey)
      );

      if (matchingProducts.length > 0) {
        // Get the cheapest option across all vendors
        const cheapest = matchingProducts.reduce((min, p) => 
          p.price < min.price ? p : min
        );
        
        const itemTotal = cheapest.price * quantity;
        megaTotalCost += itemTotal;
        
        // Use product name from shopping list item first, then from vendor listing
        const finalName = productName || 
                         baseProductName ||
                         cheapest.displayName || 
                         'Unnamed Product';

        megaOptionItems.push({
          productId: cheapest.productId || productIdStr || '',
          productName: finalName,
          quantity,
          vendor: cheapest.vendorName,
          price: cheapest.price,
          total: itemTotal,
        });
      }
    }

    // Sort vendor options by total cost
    vendorOptions.sort((a, b) => a.totalCost - b.totalCost);

    return {
      vendorOptions,
      megaOption: {
        totalCost: megaTotalCost,
        items: megaOptionItems,
      },
    };
  }
}

