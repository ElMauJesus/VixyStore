'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { CartItem, Product } from '@/types/store';
import { storeApi } from '@/lib/api';
import { useAuth } from './AuthContext';

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  isLoading: boolean;
  addToCart: (product: Product, quantity?: number) => Promise<{ success: boolean; message?: string }>;
  updateQuantity: (itemId: number | string, quantity: number) => Promise<boolean>;
  removeFromCart: (itemId: number | string) => Promise<boolean>;
  clearCart: () => void;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const GUEST_CART_KEY = 'vixy_guest_cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load cart on auth change
  const refreshCart = useCallback(async () => {
    if (isAuthenticated) {
      setIsLoading(true);
      try {
        const res = await storeApi.getCart();
        if (res.success && res.data?.items) {
          setItems(res.data.items);
        }
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    } else {
      // Load guest cart
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(GUEST_CART_KEY);
        if (saved) {
          try {
            setItems(JSON.parse(saved));
          } catch {
            setItems([]);
          }
        } else {
          setItems([]);
        }
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  // Sync guest cart to local storage when not authenticated
  const saveGuestCart = (newItems: CartItem[]) => {
    setItems(newItems);
    if (typeof window !== 'undefined') {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(newItems));
    }
  };

  const addToCart = async (product: Product, quantity: number = 1): Promise<{ success: boolean; message?: string }> => {
    if (quantity < 1) return { success: false, message: 'La cantidad debe ser mayor a 0' };

    if (isAuthenticated) {
      setIsLoading(true);
      try {
        const res = await storeApi.addToCart(product.id, quantity);
        if (res.success) {
          await refreshCart();
          return { success: true };
        }
        return { success: false, message: res.message || 'Error al agregar producto' };
      } catch (err: any) {
        return { success: false, message: err?.message || 'Error de conexión' };
      } finally {
        setIsLoading(false);
      }
    } else {
      // Guest cart
      const existingIndex = items.findIndex((i) => i.product_id === product.id);
      let updated: CartItem[];

      if (existingIndex > -1) {
        const newQty = items[existingIndex].quantity + quantity;
        if (newQty > product.stock_quantity) {
          return { success: false, message: `Stock insuficiente. Máximo: ${product.stock_quantity}` };
        }
        updated = items.map((item, idx) =>
          idx === existingIndex ? { ...item, quantity: newQty } : item
        );
      } else {
        if (quantity > product.stock_quantity) {
          return { success: false, message: `Stock insuficiente. Máximo: ${product.stock_quantity}` };
        }
        const newItem: CartItem = {
          id: `guest-${product.id}`,
          product_id: product.id,
          quantity,
          product_name: product.name,
          price: Number(product.price),
          sku: product.sku,
          imagen: product.imagen_principal,
        };
        updated = [newItem, ...items];
      }

      saveGuestCart(updated);
      return { success: true };
    }
  };

  const updateQuantity = async (itemId: number | string, quantity: number): Promise<boolean> => {
    if (quantity < 1) {
      return removeFromCart(itemId);
    }

    if (isAuthenticated) {
      try {
        const res = await storeApi.updateCartItem(itemId, quantity);
        if (res.success) {
          await refreshCart();
          return true;
        }
        return false;
      } catch {
        return false;
      }
    } else {
      const updated = items.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      );
      saveGuestCart(updated);
      return true;
    }
  };

  const removeFromCart = async (itemId: number | string): Promise<boolean> => {
    if (isAuthenticated) {
      try {
        const res = await storeApi.removeFromCart(itemId);
        if (res.success) {
          await refreshCart();
          return true;
        }
        return false;
      } catch {
        return false;
      }
    } else {
      const updated = items.filter((item) => item.id !== itemId);
      saveGuestCart(updated);
      return true;
    }
  };

  const clearCart = () => {
    setItems([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(GUEST_CART_KEY);
    }
  };

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        subtotal,
        isLoading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
