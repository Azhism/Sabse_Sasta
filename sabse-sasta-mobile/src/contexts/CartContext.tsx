import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CartItem {
  id: string;
  productId: string;
  name: string;
  category: string;
  brand: string;
  size: string;
  price: number;
  vendor: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Omit<CartItem, 'quantity'>) => void;
  addMultipleToCart: (products: Omit<CartItem, 'quantity'>[]) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    loadCart();
  }, []);

  useEffect(() => {
    saveCart();
  }, [items]);

  const loadCart = async () => {
    try {
      const saved = await AsyncStorage.getItem('shopping-cart');
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const saveCart = async () => {
    try {
      await AsyncStorage.setItem('shopping-cart', JSON.stringify(items));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  };

  const addToCart = (product: Omit<CartItem, 'quantity'>) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === product.id);

      if (existingItem) {
        return currentItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...currentItems, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const addMultipleToCart = (products: Omit<CartItem, 'quantity'>[]) => {
    setItems((currentItems) => {
      let updatedItems = [...currentItems];

      // Add each new product
      for (const product of products) {
        const existingItem = updatedItems.find((item) => item.id === product.id);

        if (existingItem) {
          // If exact item exists, increase quantity
          updatedItems = updatedItems.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          // Add new item
          updatedItems.push({ ...product, quantity: 1 });
        }
      }

      // Now check for duplicates (same name and brand) and keep cheaper one
      const itemsByNameBrand = new Map<string, CartItem[]>();

      updatedItems.forEach((item) => {
        const key = `${item.name}-${item.brand}`;
        if (!itemsByNameBrand.has(key)) {
          itemsByNameBrand.set(key, []);
        }
        itemsByNameBrand.get(key)!.push(item);
      });

      // For each group with duplicates, keep only the cheapest
      const finalItems: CartItem[] = [];
      itemsByNameBrand.forEach((duplicates) => {
        if (duplicates.length === 1) {
          // No duplicates, keep as is
          finalItems.push(duplicates[0]);
        } else {
          // Multiple items with same name and brand, keep cheapest
          const cheapest = duplicates.reduce((prev, curr) =>
            curr.price < prev.price ? curr : prev
          );
          finalItems.push(cheapest);
        }
      });

      return finalItems;
    });
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        addMultipleToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

