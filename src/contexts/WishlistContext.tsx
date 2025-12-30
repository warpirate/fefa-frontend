'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import wishlistService from '@/services/wishlistService';
import { useAuth } from './AuthContext';

// Local wishlist item interface (for unauthenticated users)
interface LocalWishlistItem {
  productId: string;
  variantId?: string;
  productName?: string;
  productImage?: string;
  productSlug?: string;
  addedAt: string;
  notes?: string;
}

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

const LOCAL_WISHLIST_KEY = 'fefa_local_wishlist';

// Helper functions for local storage
const getLocalWishlist = (): LocalWishlistItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(LOCAL_WISHLIST_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveLocalWishlist = (items: LocalWishlistItem[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_WISHLIST_KEY, JSON.stringify(items));
  } catch (error) {
    // Failed to save local wishlist
  }
};

const clearLocalWishlist = () => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(LOCAL_WISHLIST_KEY);
  } catch (error) {
    // Failed to clear local wishlist
  }
};

interface WishlistContextType {
  wishlist: Wishlist | null;
  localWishlist: LocalWishlistItem[];
  isLoading: boolean;
  error: string | null;
  itemCount: number;
  addToWishlist: (productId: string, variantId?: string, notes?: string, productInfo?: { name?: string; image?: string; slug?: string }) => Promise<void>;
  removeFromWishlist: (productId: string, variantId?: string) => Promise<void>;
  updateWishlistItem: (productId: string, notes: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
  moveToCart: (productId: string, quantity?: number, variantId?: string) => Promise<void>;
  isInWishlist: (productId: string, variantId?: string) => boolean;
  refreshWishlist: () => Promise<void>;
  clearError: () => void;
  getWishlistItems: () => WishlistItem[];
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [localWishlist, setLocalWishlist] = useState<LocalWishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  // Calculate derived values - use local wishlist if not authenticated
  const itemCount = isAuthenticated
    ? (wishlist?.itemCount || 0)
    : localWishlist.length;

  // Load local wishlist on mount if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      const local = getLocalWishlist();
      setLocalWishlist(local);
    }
  }, []);

  // Load wishlist when user authenticates, merge local wishlist
  useEffect(() => {
    if (isAuthenticated) {
      mergeLocalWishlistAndRefresh();
    } else {
      // Load local wishlist when user logs out
      const local = getLocalWishlist();
      setLocalWishlist(local);
      setWishlist(null);
    }
  }, [isAuthenticated]);

  // Merge local wishlist with server wishlist when user logs in
  const mergeLocalWishlistAndRefresh = async () => {
    const localItems = getLocalWishlist();
    
    try {
      setIsLoading(true);
      setError(null);
      
      // First, get the server wishlist
      const response = await wishlistService.getWishlist();
      if (response.success) {
        setWishlist(response.data);
        
        // Merge local items into server wishlist
        if (localItems.length > 0) {
          for (const localItem of localItems) {
            try {
              await (wishlistService as any).addToWishlist(
                localItem.productId,
                localItem.variantId,
                localItem.notes
              );
            } catch (error) {
              // Continue with other items even if one fails
            }
          }
          
          // Clear local wishlist after merging
          clearLocalWishlist();
          setLocalWishlist([]);
          
          // Refresh wishlist to get updated state
          await refreshWishlist();
        }
      } else {
        throw new Error(response.message || 'Failed to fetch wishlist');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load wishlist');
    } finally {
      setIsLoading(false);
    }
  };

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
      setError(error.message || 'Failed to load wishlist');
    } finally {
      setIsLoading(false);
    }
  };

  const addToWishlist = async (
    productId: string, 
    variantId?: string, 
    notes?: string,
    productInfo?: { name?: string; image?: string; slug?: string }
  ) => {
    // If not authenticated, add to local storage
    if (!isAuthenticated) {
      const localItems = getLocalWishlist();
      
      // Check if item already exists
      const exists = localItems.some(
        item => item.productId === productId && 
        (!variantId || item.variantId === variantId)
      );
      
      if (exists) {
        // Item already in wishlist
        return;
      }
      
      // Add new item
      localItems.push({
        productId,
        variantId,
        productName: productInfo?.name,
        productImage: productInfo?.image,
        productSlug: productInfo?.slug,
        notes,
        addedAt: new Date().toISOString(),
      });
      
      saveLocalWishlist(localItems);
      setLocalWishlist(localItems);
      return;
    }

    // Authenticated: add to server
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
      setError(error.message || 'Failed to add item to wishlist');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWishlist = async (productId: string, variantId?: string) => {
    // If not authenticated, remove from local wishlist
    if (!isAuthenticated) {
      const localItems = getLocalWishlist();
      const filtered = localItems.filter(
        item => !(item.productId === productId && 
        (!variantId || item.variantId === variantId))
      );
      saveLocalWishlist(filtered);
      setLocalWishlist(filtered);
      return;
    }

    // Authenticated: remove from server wishlist
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
      setError(error.message || 'Failed to update wishlist item');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const clearWishlist = async () => {
    // If not authenticated, clear local wishlist
    if (!isAuthenticated) {
      clearLocalWishlist();
      setLocalWishlist([]);
      return;
    }

    // Authenticated: clear server wishlist
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
      setError(error.message || 'Failed to clear wishlist');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const moveToCart = async (productId: string, quantity: number = 1, variantId?: string) => {
    // If not authenticated, just remove from local wishlist
    // The page will handle adding to cart separately
    if (!isAuthenticated) {
      const localItems = getLocalWishlist();
      const filtered = localItems.filter(
        item => !(item.productId === productId && 
        (!variantId || item.variantId === variantId))
      );
      saveLocalWishlist(filtered);
      setLocalWishlist(filtered);
      return;
    }

    // Authenticated: use server API
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
      setError(error.message || 'Failed to move item to cart');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const isInWishlist = (productId: string, variantId?: string): boolean => {
    if (isAuthenticated) {
      if (!wishlist || !wishlist.items) return false;
      return wishlist.items.some(
        item => item.product && item.product._id === productId &&
        (!variantId || item.variant?._id === variantId)
      );
    } else {
      return localWishlist.some(
        item => item.productId === productId &&
        (!variantId || item.variantId === variantId)
      );
    }
  };

  // Get wishlist items (server or local)
  const getWishlistItems = () => {
    if (isAuthenticated && wishlist) {
      return wishlist.items;
    }
    // Return local wishlist items in a format compatible with WishlistItem
    return localWishlist.map(item => ({
      _id: `local_${item.productId}_${item.variantId || 'none'}`,
      product: {
        _id: item.productId,
        name: item.productName || 'Product',
        price: 0, // Price not stored in local wishlist
        images: item.productImage ? [{
          url: item.productImage,
          publicId: '',
          alt: item.productName || 'Product',
          isPrimary: true,
          sortOrder: 0,
        }] : [],
        slug: item.productSlug || '',
        variants: [],
        ratings: {
          average: 0,
          count: 0,
        },
        isActive: true,
      },
      variant: item.variantId ? {
        _id: item.variantId,
        name: '',
        price: 0,
        sku: '',
      } : undefined,
      addedAt: item.addedAt,
      notes: item.notes,
    }));
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    wishlist: isAuthenticated ? wishlist : null,
    localWishlist: !isAuthenticated ? localWishlist : [],
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
    getWishlistItems,
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
