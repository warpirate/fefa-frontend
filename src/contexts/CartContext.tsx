'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import cartService from '@/services/cartService';

// Type for cart service to handle variantId properly
type CartServiceAddToCart = (productId: string, quantity: number, variantId?: string) => Promise<any>;
import { useAuth } from './AuthContext';

// Cart item interface matching backend structure
interface CartItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    price: number;
    images: Array<{
      url: string;
      publicId: string;
      alt: string;
      isPrimary: boolean;
      sortOrder: number;
    }>;
    slug: string;
  };
  variant?: {
    _id: string;
    name: string;
    price: number;
  };
  quantity: number;
  price: number;
  total: number;
  addedAt: string;
}

// Cart interface matching backend structure
interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

interface CartContextType {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
  itemCount: number;
  totalQuantity: number;
  subtotal: number;
  total: number;
  currency: string;
  addToCart: (productId: string, quantity?: number, variantId?: string) => Promise<void>;
  updateCartItem: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  clearError: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  // Calculate derived values
  const itemCount = cart?.items.length || 0;
  const totalQuantity = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const subtotal = cart?.subtotal || 0;
  const total = cart?.total || 0;
  const currency = cart?.currency || 'INR';

  // Load cart when user authenticates
  useEffect(() => {
    if (isAuthenticated) {
      refreshCart();
    } else {
      // Clear cart when user logs out
      setCart(null);
    }
  }, [isAuthenticated]);

  const refreshCart = async () => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await cartService.getCart();
      if (response.success) {
        setCart(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch cart');
      }
    } catch (error: any) {
      console.error('Error refreshing cart:', error);
      setError(error.message || 'Failed to load cart');
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (productId: string, quantity: number = 1, variantId?: string) => {
    if (!isAuthenticated) {
      throw new Error('Please log in to add items to cart');
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await (cartService.addToCart as CartServiceAddToCart)(productId, quantity, variantId);
      if (response.success) {
        setCart(response.data);
      } else {
        throw new Error(response.message || 'Failed to add item to cart');
      }
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      setError(error.message || 'Failed to add item to cart');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCartItem = async (productId: string, quantity: number) => {
    if (!isAuthenticated) {
      throw new Error('Please log in to update cart');
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await cartService.updateCartItem(productId, quantity);
      if (response.success) {
        setCart(response.data);
      } else {
        throw new Error(response.message || 'Failed to update cart item');
      }
    } catch (error: any) {
      console.error('Error updating cart item:', error);
      setError(error.message || 'Failed to update cart item');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!isAuthenticated) {
      throw new Error('Please log in to remove items from cart');
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await cartService.removeFromCart(productId);
      if (response.success) {
        setCart(response.data);
      } else {
        throw new Error(response.message || 'Failed to remove item from cart');
      }
    } catch (error: any) {
      console.error('Error removing from cart:', error);
      setError(error.message || 'Failed to remove item from cart');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) {
      throw new Error('Please log in to clear cart');
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await cartService.clearCart();
      if (response.success) {
        setCart(response.data);
      } else {
        throw new Error(response.message || 'Failed to clear cart');
      }
    } catch (error: any) {
      console.error('Error clearing cart:', error);
      setError(error.message || 'Failed to clear cart');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    cart,
    isLoading,
    error,
    itemCount,
    totalQuantity,
    subtotal,
    total,
    currency,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    refreshCart,
    clearError,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
