import api from './api';

export interface ShoppingListItem {
  id: string;
  listId: string;
  productId: string;
  quantity: number;
  createdAt: string;
  product?: any;
}

export interface ShoppingList {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  items: ShoppingListItem[];
}

export interface CreateShoppingListData {
  name: string;
}

export interface AddItemData {
  productId: string;
  quantity?: number;
}

export const shoppingListService = {
  create: async (data: CreateShoppingListData): Promise<ShoppingList> => {
    const response = await api.post('/shopping-lists', data);
    return response.data;
  },

  getAll: async (): Promise<ShoppingList[]> => {
    const response = await api.get('/shopping-lists');
    return response.data;
  },

  getById: async (id: string): Promise<ShoppingList> => {
    const response = await api.get(`/shopping-lists/${id}`);
    return response.data;
  },

  update: async (id: string, name: string): Promise<ShoppingList> => {
    const response = await api.put(`/shopping-lists/${id}`, { name });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/shopping-lists/${id}`);
  },

  addItem: async (listId: string, data: AddItemData): Promise<ShoppingListItem> => {
    const response = await api.post(`/shopping-lists/${listId}/items`, data);
    return response.data;
  },

  updateItem: async (listId: string, itemId: string, quantity: number): Promise<ShoppingListItem> => {
    const response = await api.put(`/shopping-lists/${listId}/items/${itemId}`, { quantity });
    return response.data;
  },

  removeItem: async (listId: string, itemId: string): Promise<void> => {
    await api.delete(`/shopping-lists/${listId}/items/${itemId}`);
  },
};

