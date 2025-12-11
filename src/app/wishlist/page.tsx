'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingBag, FiTrash2, FiAlertCircle, FiHeart } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import MainLayout from '@/components/layout/MainLayout';
import '@/styles/components/wishlist/Wishlist.css';

export default function WishlistPage() {
  const [removingItemId, setRemovingItemId] = useState<string | null>(null);
  const [movingToCartId, setMovingToCartId] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();
  const { 
    wishlist, 
    isLoading, 
    error, 
    addToWishlist,
    removeFromWishlist, 
    moveToCart, 
    clearError 
  } = useWishlist();
  const { addToCart, refreshCart } = useCart();

  useEffect(() => {
    // Clear any errors when component mounts
    if (error) {
      clearError();
    }
  }, [error, clearError]);

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      setRemovingItemId(productId);
      await removeFromWishlist(productId);
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    } finally {
      setRemovingItemId(null);
    }
  };

  const handleMoveToCart = async (productId: string) => {
    try {
      setMovingToCartId(productId);
      await moveToCart(productId, 1);
      
      // Refresh cart to show updated cart count
      await refreshCart();
      
      // Show success animation
      const item = document.getElementById(`wishlist-item-${productId}`);
      if (item) {
        item.classList.add('added-to-cart');
        setTimeout(() => {
          item.classList.remove('added-to-cart');
        }, 1000);
      }
    } catch (error) {
      console.error('Error moving to cart:', error);
    } finally {
      setMovingToCartId(null);
    }
  };

  const handleAddToCart = async (productId: string) => {
    try {
      await addToCart(productId, 1);
      
      // Show success animation
      const item = document.getElementById(`wishlist-item-${productId}`);
      if (item) {
        item.classList.add('added-to-cart');
        setTimeout(() => {
          item.classList.remove('added-to-cart');
        }, 1000);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen pt-32 pb-16 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="flex flex-col items-center justify-center h-64">
              <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-primary font-medium">Loading your wishlist...</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen pt-32 pb-16 px-4">
        <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <h1 className="text-3xl md:text-4xl font-script text-accent">My Wishlist</h1>
          <div className="w-24 h-1 bg-accent mx-auto mt-2 rounded-full"></div>
          <p className="text-primary mt-4">
            {isAuthenticated 
              ? `${user?.firstName}'s favorite items` 
              : "Items you've added to your wishlist"}
          </p>
        </motion.div>


        {wishlist && wishlist.items && wishlist.items.length > 0 ? (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence>
              {wishlist.items
                .filter((wishlistItem) => wishlistItem.product !== null && wishlistItem.product !== undefined)
                .map((wishlistItem) => {
                const product = wishlistItem.product!; // Safe to use ! here since we filtered nulls
                
                // Handle both object and string array formats for images
                let imageUrl = '/images/logo.jpg'; // Default fallback
                
                if (product.images && product.images.length > 0) {
                  const firstImage = product.images[0];
                  
                  // Check if images are objects (backend format) or strings (sample data format)
                  if (typeof firstImage === 'string') {
                    // String format - use first image
                    imageUrl = firstImage;
                  } else if (typeof firstImage === 'object' && firstImage.url) {
                    // Object format - find primary image or use first
                    const primaryImage = product.images.find((img: any) => img.isPrimary) || firstImage;
                    imageUrl = primaryImage.url;
                  }
                  
                  // Ensure proper URL format
                  if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
                    imageUrl = `/images/${imageUrl}`;
                  }
                }
                
                const price = wishlistItem.variant?.price || product.price;
                
                return (
                  <motion.div
                    key={wishlistItem._id}
                    id={`wishlist-item-${product._id}`}
                    variants={item as any}
                    exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.3 } }}
                    className="bg-white rounded-lg shadow-soft overflow-hidden group"
                  >
                    <div className="relative aspect-square overflow-hidden bg-red-200 border-2 border-blue-500">
                      {/* Test fallback image */}
                      <img
                        src="/images/logo.jpg"
                        alt="Fallback"
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          zIndex: 0
                        }}
                      />
                      <Link href={`/product/${product.slug}`}>
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={product.name}
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              zIndex: 1
                            }}
                            className="transition-transform duration-500 group-hover:scale-105"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/images/logo.jpg';
                            }}
                          />
                        ) : (
                          <div className="absolute inset-0 w-full h-full bg-gray-200 flex items-center justify-center">
                            <div className="text-center">
                              <div className="w-16 h-16 mx-auto mb-2 bg-gray-300 rounded-full flex items-center justify-center">
                                <svg 
                                  className="w-8 h-8 text-gray-400" 
                                  fill="none" 
                                  stroke="currentColor" 
                                  viewBox="0 0 24 24"
                                >
                                  <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                                  />
                                </svg>
                              </div>
                              <span className="text-primary font-script text-sm">No Image</span>
                            </div>
                          </div>
                        )}
                      </Link>
                      
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
                      
                      <div className="absolute top-3 right-3 flex flex-col gap-2">
                        <button
                          onClick={() => handleRemoveFromWishlist(product._id)}
                          className="bg-white p-2 rounded-full shadow-md hover:bg-red-500 hover:text-white transition-colors"
                          disabled={removingItemId === product._id}
                          title="Remove from wishlist"
                        >
                          {removingItemId === product._id ? (
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <FiTrash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <Link href={`/product/${product.slug}`}>
                        <h3 className="font-medium text-primary hover:text-accent transition-colors line-clamp-2">
                          {product.name}
                        </h3>
                      </Link>
                      
                      {wishlistItem.variant && (
                        <p className="text-sm text-gray-600 mt-1">
                          {wishlistItem.variant.name}
                        </p>
                      )}
                      
                       <div className="mt-1 flex items-center">
                         <span className="font-medium text-accent">₹{price.toFixed(2)}</span>
                         {(product as any).comparePrice && (product as any).comparePrice > price && (
                           <span className="ml-2 text-gray-400 line-through text-sm">
                             ₹{(product as any).comparePrice.toFixed(2)}
                           </span>
                         )}
                       </div>
                      
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => handleMoveToCart(product._id)}
                          disabled={movingToCartId === product._id}
                          className="flex-1 bg-primary text-white py-2 px-4 rounded-md hover:bg-accent transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {movingToCartId === product._id ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <>
                              <FiShoppingBag className="w-4 h-4" />
                              <span>Move to Cart</span>
                            </>
                          )}
                        </button>
                        
                        <button
                          onClick={() => handleRemoveFromWishlist(product._id)}
                          disabled={removingItemId === product._id}
                          className="px-4 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
                          title="Remove from wishlist"
                        >
                          {removingItemId === product._id ? (
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <FiTrash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-col items-center justify-center py-16 px-4 text-center"
          >
            <div className="w-20 h-20 bg-soft-pink-100 rounded-full flex items-center justify-center mb-6">
              <FiHeart className="w-10 h-10 text-accent" />
            </div>
            <h2 className="text-2xl font-medium text-primary mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-8 max-w-md">
              {isAuthenticated 
                ? "Explore our collections and add your favorite items to your wishlist."
                : "Please log in to view your wishlist or explore our collections to add items."
              }
            </p>
            <div className="flex gap-4">
              {!isAuthenticated && (
                <Link
                  href="/auth/login"
                  className="bg-accent text-white py-3 px-8 rounded-md hover:bg-primary transition-colors"
                >
                  Log In
                </Link>
              )}
              <Link
                href="/collections"
                className="bg-primary text-white py-3 px-8 rounded-md hover:bg-accent transition-colors"
              >
                Explore Collections
              </Link>
            </div>
          </motion.div>
        )}

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-red-50 border border-red-200 rounded-lg p-4 text-center"
          >
            <div className="flex items-center justify-center gap-2 text-red-600">
              <FiAlertCircle className="w-5 h-5" />
              <span className="font-medium">Error loading wishlist</span>
            </div>
            <p className="text-red-500 text-sm mt-1">{error}</p>
            <button
              onClick={clearError}
              className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
            >
              Dismiss
            </button>
          </motion.div>
        )}
        </div>
      </div>
    </MainLayout>
  );
}
