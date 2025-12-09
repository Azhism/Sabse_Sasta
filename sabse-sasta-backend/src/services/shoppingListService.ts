import pool from '../config/database';

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
    const result = await pool.query(
      `INSERT INTO shopping_lists (user_id, list_name)
       VALUES ($1, $2)
       RETURNING list_id, user_id, list_name`,
      [parseInt(userId), name]
    );

    const list = result.rows[0];

    // Fetch items for this list (will be empty for new list)
    const itemsResult = await pool.query(
      `SELECT sli.*, p.product_id, p.product_name, p.brand, p.package_size
       FROM shopping_list_items sli
       LEFT JOIN products p ON sli.product_id = p.product_id
       WHERE sli.list_id = $1`,
      [list.list_id]
    );

    // Transform items to have nested products object
    const transformedItems = itemsResult.rows.map(row => ({
      item_id: row.item_id,
      list_id: row.list_id,
      product_id: row.product_id,
      quantity: row.quantity,
      products: row.product_id ? {
        product_id: row.product_id,
        product_name: row.product_name,
        brand: row.brand,
        package_size: row.package_size
      } : null
    }));

    return {
      ...list,
      shopping_list_items: transformedItems,
    };
  }

  static async getUserLists(userId: string) {
    const listsResult = await pool.query(
      `SELECT * FROM shopping_lists
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [parseInt(userId)]
    );

    const lists = await Promise.all(
      listsResult.rows.map(async (list) => {
        const itemsResult = await pool.query(
          `SELECT sli.*, p.product_id, p.product_name, p.brand, p.package_size
           FROM shopping_list_items sli
           LEFT JOIN products p ON sli.product_id = p.product_id
           WHERE sli.list_id = $1`,
          [list.list_id]
        );

        // Transform items to have nested products object
        const transformedItems = itemsResult.rows.map(row => ({
          item_id: row.item_id,
          list_id: row.list_id,
          product_id: row.product_id,
          quantity: row.quantity,
          products: row.product_id ? {
            product_id: row.product_id,
            product_name: row.product_name,
            brand: row.brand,
            package_size: row.package_size
          } : null
        }));

        return {
          ...list,
          shopping_list_items: transformedItems,
        };
      })
    );

    return lists;
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
    
    const listResult = await pool.query(
      `SELECT * FROM shopping_lists
       WHERE list_id = $1 AND user_id = $2`,
      [listIdNum, parseInt(userId)]
    );

    if (listResult.rows.length === 0) {
      throw new Error('Shopping list not found');
    }

    const list = listResult.rows[0];

    const itemsResult = await pool.query(
      `SELECT sli.*, p.product_id, p.product_name, p.brand, p.package_size
       FROM shopping_list_items sli
       LEFT JOIN products p ON sli.product_id = p.product_id
       WHERE sli.list_id = $1`,
      [listIdNum]
    );

    // Transform items to have nested products object
    const transformedItems = itemsResult.rows.map(row => ({
      item_id: row.item_id,
      list_id: row.list_id,
      product_id: row.product_id,
      quantity: row.quantity,
      products: row.product_id ? {
        product_id: row.product_id,
        product_name: row.product_name,
        brand: row.brand,
        package_size: row.package_size
      } : null
    }));

    return {
      ...list,
      shopping_list_items: transformedItems,
    };
  }

  static async updateList(listId: string, userId: string, name: string) {
    const list = await this.getListById(listId, userId);
    
    // Convert listId to integer if it's a valid number
    const listIdNum = parseInt(listId, 10);

    const result = await pool.query(
      `UPDATE shopping_lists
       SET list_name = $1
       WHERE list_id = $2
       RETURNING *`,
      [name, listIdNum]
    );

    const updatedList = result.rows[0];

    const itemsResult = await pool.query(
      `SELECT sli.*, p.product_id, p.product_name, p.brand, p.package_size
       FROM shopping_list_items sli
       LEFT JOIN products p ON sli.product_id = p.product_id
       WHERE sli.list_id = $1`,
      [listIdNum]
    );

    // Transform items to have nested products object
    const transformedItems = itemsResult.rows.map(row => ({
      item_id: row.item_id,
      list_id: row.list_id,
      product_id: row.product_id,
      quantity: row.quantity,
      products: row.product_id ? {
        product_id: row.product_id,
        product_name: row.product_name,
        brand: row.brand,
        package_size: row.package_size
      } : null
    }));

    return {
      ...updatedList,
      shopping_list_items: transformedItems,
    };
  }

  static async deleteList(listId: string, userId: string) {
    const list = await this.getListById(listId, userId);
    
    // Convert listId to integer if it's a valid number
    const listIdNum = parseInt(listId, 10);

    // Remove all items first to avoid FK constraints
    await pool.query(
      'DELETE FROM shopping_list_items WHERE list_id = $1',
      [listIdNum]
    );

    const result = await pool.query(
      'DELETE FROM shopping_lists WHERE list_id = $1 RETURNING *',
      [listIdNum]
    );

    return result.rows[0];
  }

  static async clearAllItems(listId: string, userId: string) {
    const list = await this.getListById(listId, userId);
    
    // Convert listId to integer if it's a valid number
    const listIdNum = parseInt(listId, 10);

    // Remove all items from the list
    const result = await pool.query(
      'DELETE FROM shopping_list_items WHERE list_id = $1',
      [listIdNum]
    );
    
    return { count: result.rowCount };
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

    // Check if item already exists
    const existingItemResult = await pool.query(
      `SELECT * FROM shopping_list_items
       WHERE list_id = $1 AND product_id = $2`,
      [listIdNum, productIdNum]
    );

    if (existingItemResult.rows.length > 0) {
      const existingItem = existingItemResult.rows[0];
      const itemPrimaryKey = existingItem.item_id || existingItem.id;
      
      const updateResult = await pool.query(
        `UPDATE shopping_list_items
         SET quantity = $1
         WHERE item_id = $2
         RETURNING *`,
        [(existingItem.quantity || 0) + quantity, itemPrimaryKey]
      );

      const updatedItem = updateResult.rows[0];

      // Fetch product details
      const productResult = await pool.query(
        'SELECT * FROM products WHERE product_id = $1',
        [productIdNum]
      );

      return {
        ...updatedItem,
        products: productResult.rows[0],
      };
    }

    const insertResult = await pool.query(
      `INSERT INTO shopping_list_items (list_id, product_id, quantity)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [listIdNum, productIdNum, quantity]
    );

    const newItem = insertResult.rows[0];

    // Fetch product details
    const productResult = await pool.query(
      'SELECT * FROM products WHERE product_id = $1',
      [productIdNum]
    );

    return {
      ...newItem,
      products: productResult.rows[0],
    };
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
      const result = await pool.query(
        'DELETE FROM shopping_list_items WHERE item_id = $1 RETURNING *',
        [itemIdNum]
      );
      return result.rows[0];
    }

    const updateResult = await pool.query(
      `UPDATE shopping_list_items
       SET quantity = $1
       WHERE item_id = $2
       RETURNING *`,
      [quantity, itemIdNum]
    );

    const updatedItem = updateResult.rows[0];

    // Fetch product details
    const productResult = await pool.query(
      'SELECT * FROM products WHERE product_id = $1',
      [updatedItem.product_id]
    );

    return {
      ...updatedItem,
      products: productResult.rows[0],
    };
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

    const result = await pool.query(
      'DELETE FROM shopping_list_items WHERE item_id = $1 RETURNING *',
      [itemIdNum]
    );

    return result.rows[0];
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
      const listingsResult = await pool.query(`
        SELECT 
          vl.*,
          v.vendor_name AS vendor_name
        FROM vendor_listings vl
        LEFT JOIN vendors v ON vl.vendor_id = v.vendor_id
      `);
      vendorListings = listingsResult.rows;
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
      const productsResult = await pool.query(`
        SELECT product_id, display_name, product_name, base_product_name
        FROM products
      `);
      productsResult.rows.forEach((product) => {
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

