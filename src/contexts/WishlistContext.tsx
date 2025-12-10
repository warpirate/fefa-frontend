'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import wishlistService from '@/services/wishlistService';
import { useAuth } from './AuthContext';

// Wishlist item interface matching backend structure
interface WishlistItem {
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
    variants?: Array<{
      _id: string;
      name: string;
      price: number;
      sku: string;
    }>;
    ratings: {
      average: number;
      count: number;
    };
    isActive: boolean;
  };
  variant?: {
    _id: string;
    name: string;
    price: number;
    sku: string;
  };
  addedAt: string;
  notes?: string;
}

// Wishlist interface matching backend structure
interface Wishlist {
  _id: string;
  user: string;
  items: WishlistItem[];
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

interface WishlistContextType {
  wishlist: Wishlist | null;
  isLoading: boolean;
  error: string | null;
  itemCount: number;
  addToWishlist: (productId: string, variantId?: string, notes?: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  updateWishlistItem: (productId: string, notes: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
  moveToCart: (productId: string, quantity?: number) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  refreshWishlist: () => Promise<void>;
  clearError: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  // Calculate derived values
  const itemCount = wishlist?.itemCount || 0;

  // Load wishlist when user authenticates
  useEffect(() => {
    if (isAuthenticated) {
      refreshWishlist();
    } else {
      // Clear wishlist when user logs out
      setWishlist(null);
    }
  }, [isAuthenticated]);

  const refreshWishlist = async () => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await wishlistService.getWishlist();
      if (response.success) {
        setWishlist(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch wishlist');
      }
    } catch (error: any) {
      console.error('Error refreshing wishlist:', error);
      setError(error.message || 'Failed to load wishlist');
    } finally {
      setIsLoading(false);
    }
  };

  const addToWishlist = async (productId: string, variantId?: string, notes?: string) => {
    if (!isAuthenticated) {
      throw new Error('Please log in to add items to wishlist');
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await (wishlistService as any).addToWishlist(productId, variantId, notes);
      if (response.success) {
        setWishlist(response.data);
      } else {
        throw new Error(response.message || 'Failed to add item to wishlist');
      }
    } catch (error: any) {
      console.error('Error adding to wishlist:', error);
      setError(error.message || 'Failed to add item to wishlist');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!isAuthenticated) {
      throw new Error('Please log in to remove items from wishlist');
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await wishlistService.removeFromWishlist(productId);
      if (response.success) {
        setWishlist(response.data);
      } else {
        throw new Error(response.message || 'Failed to remove item from wishlist');
      }
    } catch (error: any) {
      console.error('Error removing from wishlist:', error);
      setError(error.message || 'Failed to remove item from wishlist');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateWishlistItem = async (productId: string, notes: string) => {
    if (!isAuthenticated) {
      throw new Error('Please log in to update wishlist');
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await wishlistService.updateWishlistItem(productId, notes);
      if (response.success) {
        setWishlist(response.data);
      } else {
        throw new Error(response.message || 'Failed to update wishlist item');
      }
    } catch (error: any) {
      console.error('Error updating wishlist item:', error);
      setError(error.message || 'Failed to update wishlist item');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const clearWishlist = async () => {
    if (!isAuthenticated) {
      throw new Error('Please log in to clear wishlist');
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await wishlistService.clearWishlist();
      if (response.success) {
        setWishlist(response.data);
      } else {
        throw new Error(response.message || 'Failed to clear wishlist');
      }
    } catch (error: any) {
      console.error('Error clearing wishlist:', error);
      setError(error.message || 'Failed to clear wishlist');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const moveToCart = async (productId: string, quantity: number = 1) => {
    if (!isAuthenticated) {
      throw new Error('Please log in to move items to cart');
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await wishlistService.moveToCart(productId, quantity);
      if (response.success) {
        setWishlist(response.data);
      } else {
        throw new Error(response.message || 'Failed to move item to cart');
      }
    } catch (error: any) {
      console.error('Error moving to cart:', error);
      setError(error.message || 'Failed to move item to cart');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const isInWishlist = (productId: string): boolean => {
    if (!wishlist || !wishlist.items) return false;
    return wishlist.items.some(item => item.product._id === productId);
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    wishlist,
    isLoading,
    error,
    itemCount,
    addToWishlist,
    removeFromWishlist,
    updateWishlistItem,
    clearWishlist,
    moveToCart,
    isInWishlist,
    refreshWishlist,
    clearError,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
