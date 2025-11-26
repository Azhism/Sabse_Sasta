import { Prisma, PrismaClient } from '@prisma/client';
import { ProductSearchQuery } from '../types';

const prisma = new PrismaClient();

interface NormalizedProduct {
  id: string | null;
  product_id: string | null;
  display_name: string | null;
  product_name: string | null;
  base_product_name: string | null;
  name: string | null;
  category: string | null;
  category_name: string | null;
  brand: string | null;
  price: number | null;
  mrp?: number | null;
  package_size?: string | null;
  variant_name?: string | null;
  variant_info?: string | null;
  vendor_name?: string | null;
  vendor?: string | null;
  in_stock?: boolean;
  stock_quantity?: number | null;
  [key: string]: any;
}

const toNumber = (value: any): number | null => {
  if (value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeText = (value: any): string | null => {
  if (value === null || value === undefined) return null;
  return String(value);
};

const transformProduct = (row: any): NormalizedProduct => {
  const productId =
    row?.product_id ??
    row?.productId ??
    row?.id ??
    row?.sku ??
    row?.item_id ??
    row?.itemId;

  const displayName =
    row?.display_name ??
    row?.product_name ??
    row?.base_product_name ??
    row?.name ??
    row?.title ??
    row?.item_name ??
    null;

  const baseName = row?.base_product_name ?? row?.baseName ?? null;
  const category =
    row?.category_name ??
    row?.category ??
    row?.category_id ??
    row?.categoryId ??
    null;
  const brand = row?.brand ?? row?.brand_name ?? row?.manufacturer ?? null;
  const price =
    toNumber(row?.price) ??
    toNumber(row?.mrp) ??
    toNumber(row?.amount) ??
    toNumber(row?.unit_price) ??
    toNumber(row?.listing_price) ??
    null;

  const packageSize =
    row?.package_size ??
    row?.variant_info ??
    row?.size ??
    row?.weight ??
    row?.net_weight ??
    null;

  const variant =
    row?.variant_name ?? row?.variant ?? row?.variant_info ?? null;

  const vendorName =
    row?.vendor_name ??
    row?.vendor ??
    row?.store_name ??
    row?.seller ??
    row?.supplier ??
    null;

  const stockQuantity =
    toNumber(row?.stock_quantity) ?? toNumber(row?.inventory) ?? null;
  const inStock =
    row?.in_stock !== undefined
      ? Boolean(row?.in_stock)
      : stockQuantity !== null
      ? stockQuantity > 0
      : true;

  return {
    ...row,
    id: productId ? String(productId) : null,
    product_id: productId ? String(productId) : null,
    display_name: normalizeText(displayName),
    product_name: normalizeText(row?.product_name ?? displayName),
    base_product_name: normalizeText(baseName),
    name: normalizeText(displayName),
    category: normalizeText(category),
    category_name: normalizeText(row?.category_name ?? category),
    brand: normalizeText(brand),
    price: price,
    mrp: toNumber(row?.mrp),
    package_size: normalizeText(packageSize),
    variant_name: normalizeText(variant),
    variant_info: normalizeText(row?.variant_info ?? variant),
    vendor_name: normalizeText(vendorName),
    vendor: normalizeText(row?.vendor ?? vendorName),
    in_stock: inStock,
    stock_quantity: stockQuantity,
  };
};

const getListingPrice = (listing: any): number | null => {
  return (
    toNumber(listing?.price) ??
    toNumber(listing?.listing_price) ??
    toNumber(listing?.amount) ??
    toNumber(listing?.unit_price) ??
    toNumber(listing?.mrp) ??
    toNumber(listing?.sale_price) ??
    toNumber(listing?.discount_price) ??
    null
  );
};

export class ProductService {
  private static async fetchAllProducts(): Promise<any[]> {
    const attempts = [
      Prisma.sql`SELECT * FROM products ORDER BY product_id ASC`,
      Prisma.sql`SELECT * FROM products ORDER BY id ASC`,
      Prisma.sql`SELECT * FROM products`,
    ];

    for (const query of attempts) {
      try {
        const rows = (await prisma.$queryRaw(query)) as any[];
        if (Array.isArray(rows)) {
          return rows;
        }
      } catch (error: any) {
        console.warn('Product query attempt failed:', error.message);
      }
    }

    return [];
  }

  private static normalizeProducts = async (): Promise<NormalizedProduct[]> => {
    const raw = await this.fetchAllProducts();
    return raw.map(transformProduct);
  };

  private static async fetchVendorListings(): Promise<any[]> {
    try {
      return (await prisma.$queryRaw(Prisma.sql`
        SELECT 
          vl.*,
          v.vendor_name
        FROM vendor_listings vl
        LEFT JOIN vendors v ON vl.vendor_id = v.vendor_id
      `)) as any[];
    } catch (error: any) {
      console.warn('Failed to fetch vendor listings:', error.message);
      return [];
    }
  }

  private static async buildProductPriceMap(): Promise<Map<string, number>> {
    const priceMap = new Map<string, number>();

    try {
      const listings = await this.fetchVendorListings();

      listings.forEach((listing) => {
        const productId =
          listing.product_id?.toString() ||
          listing.productId?.toString() ||
          listing.listing_product_id?.toString();

        if (!productId) return;

        const priceValue = getListingPrice(listing);

        if (priceValue === null) return;

        const existing = priceMap.get(productId);
        if (existing === undefined || priceValue < existing) {
          priceMap.set(productId, priceValue);
        }
      });
    } catch (error: any) {
      console.warn('Failed to fetch vendor listings for price map:', error.message);
    }

    return priceMap;
  }

  private static applyFilters(
    products: NormalizedProduct[],
    query: ProductSearchQuery
  ) {
    let filtered = [...products];

    if (query.name) {
      const nameSearch = query.name.toLowerCase();
      filtered = filtered.filter((product) => {
        const possibleNames = [
          product.display_name,
          product.product_name,
          product.base_product_name,
          product.name,
        ]
          .filter(Boolean)
          .map((value) => value!.toLowerCase());
        return possibleNames.some((value) => value.includes(nameSearch));
      });
    }

    if (query.category) {
      const categorySearch = query.category.toLowerCase();
      filtered = filtered.filter((product) => {
        const possibleCategories = [
          product.category,
          product.category_name,
        ]
          .filter(Boolean)
          .map((value) => value!.toLowerCase());
        return possibleCategories.some((value) =>
          value.includes(categorySearch)
        );
      });
    }

    if (query.brand) {
      const brandSearch = query.brand.toLowerCase();
      filtered = filtered.filter((product) => {
        const brandValue = product.brand?.toLowerCase();
        return brandValue ? brandValue.includes(brandSearch) : false;
      });
    }

    if (query.minPrice !== undefined) {
      filtered = filtered.filter((product) => {
        if (product.price === null || product.price === undefined) return false;
        return product.price >= query.minPrice!;
      });
    }

    if (query.maxPrice !== undefined) {
      filtered = filtered.filter((product) => {
        if (product.price === null || product.price === undefined) return false;
        return product.price <= query.maxPrice!;
      });
    }

    return filtered;
  }

  static async searchProducts(query: ProductSearchQuery) {
    const limit = query.limit ?? 500;
    const offset = query.offset ?? 0;

    const products = await this.normalizeProducts();
    const filtered = this.applyFilters(products, query);
    const productIdSet = new Set(
      filtered
        .map((product) => product.product_id || product.id)
        .filter(Boolean)
        .map((id) => id!.toString())
    );

    const vendorListings = await this.fetchVendorListings();
    const listingsByProduct = new Map<string, any[]>();

    vendorListings.forEach((listing) => {
      const productId =
        listing.product_id?.toString() ||
        listing.productId?.toString() ||
        listing.listing_product_id?.toString();

      if (!productId || !productIdSet.has(productId)) return;

      if (!listingsByProduct.has(productId)) {
        listingsByProduct.set(productId, []);
      }
      listingsByProduct.get(productId)!.push(listing);
    });

    const expanded = filtered.flatMap((product) => {
      const productId = product.product_id || product.id;
      const productIdStr = productId ? productId.toString() : null;
      const listings = productIdStr ? listingsByProduct.get(productIdStr) || [] : [];

      if (listings.length === 0) {
        return [
          {
            ...product,
            price: product.price,
            vendor: product.vendor_name || product.vendor || 'Unknown Vendor',
          },
        ];
      }

      return listings.map((listing) => ({
        ...product,
        price: getListingPrice(listing),
        vendor:
          listing.vendor_name ||
          listing.vendor ||
          product.vendor_name ||
          product.vendor ||
          'Unknown Vendor',
        vendor_listing_id: listing.listing_id ?? listing.id ?? null,
      }));
    });

    const total = expanded.length;
    const paginated = expanded.slice(offset, offset + limit);

    return {
      products: paginated,
      total,
      limit,
      offset,
    };
  }

  static async getFeaturedProducts(limit: number = 10) {
    const products = await this.normalizeProducts();
    const priceMap = await this.buildProductPriceMap();

    const featured = products.filter((product) => {
      if (product.is_featured !== undefined) {
        return Boolean(product.is_featured);
      }
      if (product.featured !== undefined) {
        return Boolean(product.featured);
      }
      if (product.tags && Array.isArray(product.tags)) {
        return product.tags.some((tag: string) =>
          String(tag).toLowerCase().includes('featured')
        );
      }
      return product.in_stock !== false;
    });

    const source =
      featured.length > 0
        ? featured
        : products.filter((product) => product.in_stock !== false);

    return source.slice(0, limit).map((product) => {
      const productId = product.product_id || product.id;
      const normalizedPrice =
        product.price ??
        (productId ? priceMap.get(productId) ?? null : null);

      return {
        ...product,
        price: normalizedPrice,
      };
    });
  }

  static async getAllProducts(limit: number = 1000, offset: number = 0) {
    const products = await this.normalizeProducts();
    return products.slice(offset, offset + limit);
  }

  static async getProductById(id: string) {
    if (!id) return null;
    const products = await this.normalizeProducts();
    const normalizedId = id.toString();

    return (
      products.find(
        (product) =>
          product.product_id === normalizedId || product.id === normalizedId
      ) ?? null
    );
  }

  static async getProductsByVendor(vendor: string) {
    if (!vendor) return [];
    const products = await this.normalizeProducts();
    const searchVendor = vendor.toLowerCase();
    return products.filter((product) => {
      const vendorName = product.vendor_name ?? product.vendor ?? '';
      return vendorName.toLowerCase().includes(searchVendor);
    });
  }

  static async getProductPriceComparison(name: string, brand?: string) {
    if (!name) return [];
    const searchResult = await this.searchProducts({
      name,
      brand,
      limit: 1000,
      offset: 0,
    });

    const products = searchResult.products;

    // Group products by vendor
    const vendorMap = new Map<
      string,
      { vendor: string; items: NormalizedProduct[]; totalCost: number }
    >();

    products.forEach((product) => {
      const vendorName =
        product.vendor_name ?? product.vendor ?? 'Unknown Vendor';
      const price = product.price ?? 0;
      if (!vendorMap.has(vendorName)) {
        vendorMap.set(vendorName, { vendor: vendorName, items: [], totalCost: 0 });
      }
      const entry = vendorMap.get(vendorName)!;
      entry.items.push(product);
      entry.totalCost += price;
    });

    return Array.from(vendorMap.values()).map((entry) => ({
      vendor: entry.vendor,
      totalCost: entry.totalCost,
      items: entry.items,
    }));
  }

  static async getVendorsForProduct(productId: string) {
    if (!productId) {
      throw new Error('Product ID is required');
    }

    const listings = await this.fetchVendorListings();
    const products = await this.normalizeProducts();
    const normalizedId = productId.toString();

    const product =
      products.find(
        (p) => p.product_id === normalizedId || p.id === normalizedId
      ) || null;

    const vendorEntries = listings
      .filter((listing) => {
        const listingProductId =
          listing.product_id?.toString() ||
          listing.productId?.toString() ||
          listing.listing_product_id?.toString();
        return listingProductId === normalizedId;
      })
      .map((listing) => ({
        vendorId:
          listing.vendor_id?.toString() ||
          listing.vendorId?.toString() ||
          listing.vendor?.toString() ||
          null,
        vendorName:
          listing.vendor_name ||
          listing.vendor ||
          'Unknown Vendor',
        price: getListingPrice(listing),
        stockQuantity:
          toNumber(listing.stock_quantity) ??
          toNumber(listing.quantity) ??
          null,
        isAvailable:
          listing.is_available !== undefined
            ? Boolean(listing.is_available)
            : listing.in_stock !== undefined
            ? Boolean(listing.in_stock)
            : true,
      }))
      .filter((entry) => entry.price !== null)
      .sort((a, b) => (a.price ?? 0) - (b.price ?? 0));

    return {
      product,
      vendors: vendorEntries,
    };
  }
}


