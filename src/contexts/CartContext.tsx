'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import cartService from '@/services/cartService';

// Type for cart service to handle variantId properly
type CartServiceAddToCart = (productId: string, quantity: number, variantId?: string) => Promise<any>;
import { useAuth } from './AuthContext';

// Local cart item interface (for unauthenticated users)
interface LocalCartItem {
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  productName?: string;
  productImage?: string;
  productSlug?: string;
  addedAt: string;
}

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
  localCart: LocalCartItem[];
  isLoading: boolean;
  error: string | null;
  itemCount: number;
  totalQuantity: number;
  subtotal: number;
  total: number;
  currency: string;
  addToCart: (productId: string, quantity?: number, variantId?: string, productInfo?: { name?: string; image?: string; slug?: string; price: number }) => Promise<void>;
  updateCartItem: (productId: string, quantity: number, variantId?: string) => Promise<void>;
  removeFromCart: (productId: string, variantId?: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  clearError: () => void;
  getCartItems: () => CartItem[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_CART_KEY = 'fefa_local_cart';

// Helper functions for local storage
const getLocalCart = (): LocalCartItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(LOCAL_CART_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveLocalCart = (items: LocalCartItem[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items));
  } catch (error) {
    // Failed to save local cart
  }
};

const clearLocalCart = () => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(LOCAL_CART_KEY);
  } catch (error) {
    // Failed to clear local cart
  }
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [localCart, setLocalCart] = useState<LocalCartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  // Calculate derived values - use local cart if not authenticated
  const itemCount = isAuthenticated 
    ? (cart?.items.length || 0)
    : localCart.length;
  const totalQuantity = isAuthenticated
    ? (cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0)
    : localCart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = isAuthenticated
    ? (cart?.subtotal || 0)
    : localCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = isAuthenticated
    ? (cart?.total || 0)
    : subtotal; // Local cart doesn't have tax/shipping yet
  const currency = cart?.currency || 'INR';

  // Load local cart on mount if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      const local = getLocalCart();
      setLocalCart(local);
    }
  }, []);

  // Load cart when user authenticates, merge local cart
  useEffect(() => {
    if (isAuthenticated) {
      mergeLocalCartAndRefresh();
    } else {
      // Load local cart when user logs out
      const local = getLocalCart();
      setLocalCart(local);
      setCart(null);
    }
  }, [isAuthenticated]);

  // Merge local cart with server cart when user logs in
  const mergeLocalCartAndRefresh = async () => {
    const localItems = getLocalCart();
    
    try {
      setIsLoading(true);
      setError(null);
      
      // First, get the server cart
      const response = await cartService.getCart();
      if (response.success) {
        setCart(response.data);
        
        // Merge local items into server cart
        if (localItems.length > 0) {
          for (const localItem of localItems) {
            try {
              await (cartService.addToCart as CartServiceAddToCart)(
                localItem.productId,
                localItem.quantity,
                localItem.variantId
              );
            } catch (error) {
              // Continue with other items even if one fails
            }
          }
          
          // Clear local cart after merging
          clearLocalCart();
          setLocalCart([]);
          
          // Refresh cart to get updated state
          await refreshCart();
        }
      } else {
        throw new Error(response.message || 'Failed to fetch cart');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load cart');
    } finally {
      setIsLoading(false);
    }
  };

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
      setError(error.message || 'Failed to load cart');
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (
    productId: string, 
    quantity: number = 1, 
    variantId?: string,
    productInfo?: { name?: string; image?: string; slug?: string; price: number }
  ) => {
    // If not authenticated, add to local storage
    if (!isAuthenticated) {
      const localItems = getLocalCart();
      
      // Check if item already exists
      const existingIndex = localItems.findIndex(
        item => item.productId === productId && 
        (!variantId || item.variantId === variantId)
      );
      
      if (existingIndex >= 0) {
        // Update quantity
        localItems[existingIndex].quantity += quantity;
      } else {
        // Add new item
        localItems.push({
          productId,
          variantId,
          quantity,
          price: productInfo?.price || 0,
          productName: productInfo?.name,
          productImage: productInfo?.image,
          productSlug: productInfo?.slug,
          addedAt: new Date().toISOString(),
        });
      }
      
      saveLocalCart(localItems);
      setLocalCart(localItems);
      return;
    }

    // Authenticated: add to server
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
      setError(error.message || 'Failed to add item to cart');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCartItem = async (productId: string, quantity: number, variantId?: string) => {
    // If not authenticated, update local cart
    if (!isAuthenticated) {
      const localItems = getLocalCart();
      const itemIndex = localItems.findIndex(
        item => item.productId === productId && 
        (!variantId || item.variantId === variantId)
      );
      
      if (itemIndex >= 0) {
        if (quantity <= 0) {
          localItems.splice(itemIndex, 1);
        } else {
          localItems[itemIndex].quantity = quantity;
        }
        saveLocalCart(localItems);
        setLocalCart(localItems);
      }
      return;
    }

    // Authenticated: update server cart
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
      setError(error.message || 'Failed to update cart item');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (productId: string, variantId?: string) => {
    // If not authenticated, remove from local cart
    if (!isAuthenticated) {
      const localItems = getLocalCart();
      const filtered = localItems.filter(
        item => !(item.productId === productId && 
        (!variantId || item.variantId === variantId))
      );
      saveLocalCart(filtered);
      setLocalCart(filtered);
      return;
    }

    // Authenticated: remove from server cart
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
      setError(error.message || 'Failed to remove item from cart');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    // If not authenticated, clear local cart
    if (!isAuthenticated) {
      clearLocalCart();
      setLocalCart([]);
      return;
    }

    // Authenticated: clear server cart
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
      setError(error.message || 'Failed to clear cart');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  // Get cart items (server or local)
  const getCartItems = () => {
    if (isAuthenticated && cart) {
      return cart.items;
    }
    // Return local cart items in a format compatible with CartItem
    return localCart.map(item => ({
      _id: `local_${item.productId}_${item.variantId || 'none'}`,
      product: {
        _id: item.productId,
        name: item.productName || 'Product',
        price: item.price,
        images: item.productImage ? [{
          url: item.productImage,
          publicId: '',
          alt: item.productName || 'Product',
          isPrimary: true,
          sortOrder: 0,
        }] : [],
        slug: item.productSlug || '',
      },
      variant: item.variantId ? {
        _id: item.variantId,
        name: '',
        price: item.price,
      } : undefined,
      quantity: item.quantity,
      price: item.price,
      total: item.price * item.quantity,
      addedAt: item.addedAt,
    }));
  };

  const value = {
    cart: isAuthenticated ? cart : null,
    localCart: !isAuthenticated ? localCart : [],
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
    getCartItems,
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
