import api from './api';

export interface Product {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  brand?: string;
  variant?: string;
  size: string;
  price: number;
  vendor: string;
  imageUrl?: string;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductSearchParams {
  name?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  offset?: number;
}

export interface ProductSearchResponse {
  products: Product[];
  total: number;
  limit: number;
  offset: number;
}

export const productService = {
  search: async (params: ProductSearchParams): Promise<ProductSearchResponse> => {
    const response = await api.get('/products/search', { params });
    return response.data;
  },

  getFeatured: async (limit: number = 10): Promise<Product[]> => {
    const response = await api.get('/products/featured', {
      params: { limit },
    });
    return response.data;
  },

  getById: async (id: string): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  compare: async (name: string, brand?: string): Promise<Product[]> => {
    const response = await api.get(`/products/compare/${encodeURIComponent(name)}`, {
      params: { brand },
    });
    return response.data;
  },
};

