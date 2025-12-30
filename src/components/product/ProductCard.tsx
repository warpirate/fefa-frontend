'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiShoppingBag, FiEye, FiCheck } from 'react-icons/fi';
import { StaticImageData } from 'next/image';
import { ProductImage, Category } from '@/types/data';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from '@/contexts/WishlistContext';
import '@/styles/components/product/ProductCard.css';

// Import product images for fallback
import product1 from '@/assets/images/product-1.png';
import product1Hover from '@/assets/images/product-1-hover.png';
import product2 from '@/assets/images/product-2.png';
import product2Hover from '@/assets/images/product-2-hover.png';
import product3 from '@/assets/images/product-3.png';
import product3Hover from '@/assets/images/product-3-hover.png';
import product4 from '@/assets/images/product-4.png';
import product4Hover from '@/assets/images/product-4-hover.png';
import product5 from '@/assets/images/product-5.png';
import product5Hover from '@/assets/images/product-5-hover.png';
import product6 from '@/assets/images/product-6.png';
import product6Hover from '@/assets/images/product-6-hover.png';
import product7 from '@/assets/images/product-7.png';
import product7Hover from '@/assets/images/product-7-hover.png';
import product8 from '@/assets/images/product-8.png';
import product8Hover from '@/assets/images/product-8-hover.png';

// Image mapping for fallback
const imageMap: { [key: string]: any } = {
  '/images/product-1.png': product1,
  '/images/product-1-hover.png': product1Hover,
  '/images/product-2.png': product2,
  '/images/product-2-hover.png': product2Hover,
  '/images/product-3.png': product3,
  '/images/product-3-hover.png': product3Hover,
  '/images/product-4.png': product4,
  '/images/product-4-hover.png': product4Hover,
  '/images/product-5.png': product5,
  '/images/product-5-hover.png': product5Hover,
  '/images/product-6.png': product6,
  '/images/product-6-hover.png': product6Hover,
  '/images/product-7.png': product7,
  '/images/product-7-hover.png': product7Hover,
  '/images/product-8.png': product8,
  '/images/product-8-hover.png': product8Hover,
};

interface ProductCardProps {
  _id?: string;
  id?: string;
  name: string;
  price: number;
  comparePrice?: number;
  originalPrice?: number;
  images: ProductImage[] | (string | StaticImageData)[];
  slug: string;
  category?: string | Category;
  occasions?: string[];
  isNew?: boolean;
  isBestSeller?: boolean;
  isFeatured?: boolean;
  isActive?: boolean;
  stockStatus?: 'in-stock' | 'out-of-stock' | 'low-stock';
  discountPercentage?: number;
  ratings?: {
    average: number;
    count: number;
  };
}

export default function ProductCard({
  _id,
  id,
  name,
  price,
  comparePrice,
  originalPrice,
  images,
  slug,
  category,
  occasions,
  isNew,
  isBestSeller,
  isFeatured,
  isActive,
  stockStatus,
  discountPercentage,
  ratings,
}: ProductCardProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { addToWishlist, removeFromWishlist, isInWishlist: checkIsInWishlist } = useWishlist();
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Check if product is in wishlist on mount and when product changes
  useEffect(() => {
    const productId = _id || id;
    if (productId && isAuthenticated) {
      const inWishlist = checkIsInWishlist(productId);
      setIsInWishlist(inWishlist);
    }
  }, [_id, id, isAuthenticated, checkIsInWishlist]);

  // Auto-slide images infinitely
  useEffect(() => {
    if (!images || images.length <= 1) return;
    if (isHovered) return; // Pause auto-slide on hover

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => {
        return (prevIndex + 1) % images.length;
      });
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, [images, isHovered]);
  
  const handleProductClick = () => {
    router.push(`/product/${slug}`);
  };
  
  // Helper function to get image URL
  const getImageUrl = (image: ProductImage | string | StaticImageData, index: number = 0): string | StaticImageData => {
    if (typeof image === 'string') {
      return imageMap[image] || image;
    }
    if (typeof image === 'object' && 'url' in image) {
      return image.url;
    }
    return image;
  };

  // Get current image
  const currentImage = images && images.length > 0 ? images[currentImageIndex] : null;
  const currentImageUrl = currentImage ? getImageUrl(currentImage as any) : null;

  const handleMouseEnter = () => {
    setIsHovered(true);
  };
  
  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsZoomed(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    
    const container = imageContainerRef.current;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate percentage position (0-100)
    const percentX = (x / rect.width) * 100;
    const percentY = (y / rect.height) * 100;
    
    // Clamp values between 0 and 100
    const clampedX = Math.max(0, Math.min(100, percentX));
    const clampedY = Math.max(0, Math.min(100, percentY));
    
    setZoomPosition({ x: clampedX, y: clampedY });
    setIsZoomed(true);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    
    const container = imageContainerRef.current;
    const rect = container.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    // Calculate percentage position (0-100)
    const percentX = (x / rect.width) * 100;
    const percentY = (y / rect.height) * 100;
    
    // Clamp values between 0 and 100
    const clampedX = Math.max(0, Math.min(100, percentX));
    const clampedY = Math.max(0, Math.min(100, percentY));
    
    setZoomPosition({ x: clampedX, y: clampedY });
    setIsZoomed(true);
  };

  const handleTouchEnd = () => {
    setIsZoomed(false);
  };

  const handleImageError = () => {
    setImageError(true);
  };
  
  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const productId = _id || id;
      
      if (!productId) {
        setNotificationMessage('Product ID not found');
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 2000);
        return;
      }

      if (isInWishlist) {
        await removeFromWishlist(productId);
        setIsInWishlist(false);
        setNotificationMessage('Removed from wishlist');
      } else {
        // Get primary image URL
        const primaryImage = images?.find((img): img is ProductImage => 
          typeof img === 'object' && 'isPrimary' in img && img.isPrimary
        ) || images?.[0];
        const imageUrl = (primaryImage && typeof primaryImage === 'object' && 'url' in primaryImage) 
          ? primaryImage.url 
          : '';

        // Add to wishlist with product info for local storage
        await addToWishlist(
          productId,
          undefined, // variantId
          undefined, // notes
          {
            name: name,
            image: imageUrl,
            slug: slug
          }
        );
        setIsInWishlist(true);
        setNotificationMessage('Added to wishlist');
      }
      
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 2000);
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update wishlist';
      setNotificationMessage(errorMessage);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    }
  };
  
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      setIsAddingToCart(true);
      const productId = _id || id;
      if (!productId) {
        setNotificationMessage('Product ID not found');
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 2000);
        return;
      }

      // Get primary image URL
      const primaryImage = images?.find((img): img is ProductImage => 
        typeof img === 'object' && 'isPrimary' in img && img.isPrimary
      ) || images?.[0];
      const imageUrl = (primaryImage && typeof primaryImage === 'object' && 'url' in primaryImage) 
        ? primaryImage.url 
        : '';

      // Add to cart with product info for local storage
      await addToCart(
        productId, 
        1,
        undefined, // variantId
        {
          name: name,
          image: imageUrl,
          slug: slug,
          price: price
        }
      );
      
      setIsAddedToCart(true);
      setNotificationMessage('Added to cart');
      setShowNotification(true);
      
      setTimeout(() => {
        setIsAddedToCart(false);
        setShowNotification(false);
      }, 2000);
    } catch (error: any) {
      setNotificationMessage(error.message || 'Failed to add to cart');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="group relative bg-white dark:bg-[#1F2937] rounded-xl shadow-lg dark:shadow-gray-900/50 hover:shadow-xl dark:hover:shadow-gray-900/70 transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 h-full flex flex-col"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Product Image */}
      <div 
        ref={imageContainerRef}
        className="block relative overflow-hidden rounded-t-xl bg-soft-pink-100 dark:bg-[#2D1A2F] aspect-square cursor-zoom-in flex-shrink-0 product-image-zoom-container"
        onClick={handleProductClick}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="w-full h-full relative">
          {currentImageUrl && !imageError ? (
            <>
              <Image
                src={currentImageUrl}
                alt={name}
                fill
                className={`object-cover hover-lift transition-transform duration-700 ease-in-out ${
                  isZoomed ? 'product-image-zoomed' : ''
                }`}
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                onError={handleImageError}
                style={{
                  transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                }}
              />
            </>
          ) : (
            <div className="w-full h-full bg-soft-pink-100 dark:bg-[#2D1A2F] flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <svg 
                    className="w-8 h-8 text-gray-400 dark:text-gray-500" 
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
                <span className="text-primary dark:text-[#E6C547] font-playfair text-sm">No Image</span>
              </div>
            </div>
          )}
        </div>
        
        
        {/* Quick Action Buttons */}
        <div 
          className={`absolute top-2 sm:top-3 right-2 sm:right-3 transition-all duration-300 flex flex-col gap-1 sm:gap-2 ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
          }`}
        >
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleToggleWishlist}
            animate={isInWishlist ? {
              scale: [1, 1.2, 1],
            } : {}}
            transition={isInWishlist ? {
              duration: 0.5,
              times: [0, 0.5, 1],
            } : {}}
            className={`p-2 sm:p-3 rounded-full shadow-lg transition-all duration-200 ${
              isInWishlist 
                ? 'bg-accent dark:bg-[#E6C547] text-white shadow-accent/25' 
                : 'bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm hover:bg-accent dark:hover:bg-[#E6C547] hover:text-white hover:shadow-accent/25'
            }`}
            aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
            suppressHydrationWarning
          >
            <motion.div
              animate={isInWishlist ? {
                scale: [1, 1.3, 1],
                rotate: [0, 10, -10, 0],
              } : {}}
              transition={isInWishlist ? {
                duration: 0.6,
                times: [0, 0.3, 0.6, 1],
              } : {}}
            >
              <FiHeart className={`w-3 h-3 sm:w-4 sm:h-4 ${isInWishlist ? 'fill-current' : ''}`} />
            </motion.div>
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm p-2 sm:p-3 rounded-full shadow-lg hover:bg-accent dark:hover:bg-[#E6C547] hover:text-white hover:shadow-accent/25 transition-all duration-200"
            aria-label="Quick view"
            suppressHydrationWarning
          >
            <FiEye className="w-3 h-3 sm:w-4 sm:h-4" />
          </motion.button>
        </div>
        
        {/* Notification */}
        <AnimatePresence>
          {showNotification && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8, x: '-50%' }}
              animate={{ 
                opacity: 1, 
                y: 0, 
                scale: 1,
                x: '-50%',
              }}
              exit={{ 
                opacity: 0, 
                y: -10, 
                scale: 0.8,
                x: '-50%',
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 25,
              }}
              className="absolute bottom-2 sm:bottom-3 left-1/2 transform -translate-x-1/2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm py-2 sm:py-3 px-3 sm:px-4 rounded-lg shadow-xl text-center text-xs sm:text-sm font-medium border border-gray-100 dark:border-gray-700 text-gray-900 dark:text-gray-100 z-50"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                className="flex items-center justify-center gap-2"
              >
                {notificationMessage.includes('Added') && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  >
                    <FiCheck className="w-4 h-4 text-green-500" />
                  </motion.div>
                )}
                <span>{notificationMessage}</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Product Info */}
      <div className="p-3 sm:p-4 text-center flex flex-col flex-grow">
        <h3 
          className="!font-cormorant font-medium text-primary dark:text-[#E6C547] text-sm sm:text-lg mb-2 line-clamp-2 cursor-pointer hover:text-accent dark:hover:text-[#E6C547]/80 transition-colors min-h-[2.5rem] sm:min-h-[3rem] flex items-center justify-center"
          onClick={handleProductClick}
        >
          {name}
        </h3>
        <div className="flex items-center justify-center gap-1 sm:gap-2 mb-3 sm:mb-4">
          <span className="font-semibold text-accent dark:text-[#E6C547] text-base sm:text-xl">₹{price.toFixed(2)}</span>
          {(comparePrice || originalPrice) && (
            <span className="text-gray-400 dark:text-gray-500 line-through text-xs sm:text-sm">
              ₹{((comparePrice || originalPrice) as number).toFixed(2)}
            </span>
          )}
        </div>
        
        {/* Add to Cart Button */}
        <motion.button
          whileHover={!isAddedToCart && !isAddingToCart && stockStatus !== 'out-of-stock' && isActive ? { scale: 1.02 } : {}}
          whileTap={!isAddedToCart && !isAddingToCart && stockStatus !== 'out-of-stock' && isActive ? { scale: 0.98 } : {}}
          onClick={handleAddToCart}
          disabled={stockStatus === 'out-of-stock' || !isActive || isAddingToCart}
          animate={isAddedToCart ? {
            scale: [1, 1.05, 1],
            backgroundColor: ['#10b981', '#059669', '#10b981'],
          } : {}}
          transition={isAddedToCart ? {
            duration: 0.6,
            times: [0, 0.5, 1],
          } : {}}
          className={`add-to-cart-button w-full mt-auto py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${
            isAddedToCart 
              ? 'bg-green-500 dark:bg-green-600 text-white' 
              : stockStatus === 'out-of-stock' || !isActive
              ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              : isAddingToCart
              ? 'bg-gray-400 dark:bg-gray-600 text-white cursor-not-allowed'
              : 'bg-primary dark:bg-[#6B1A7A] text-white hover:bg-accent dark:hover:bg-[#E6C547]'
          }`}
        >
          {isAddedToCart ? (
            <motion.span 
              className="flex items-center justify-center gap-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                  delay: 0.1
                }}
              >
                <FiCheck className="w-4 h-4" />
              </motion.div>
              Added to Cart
            </motion.span>
          ) : isAddingToCart ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Adding...
            </span>
          ) : stockStatus === 'out-of-stock' || !isActive ? (
            <span className="flex items-center justify-center gap-2">
              Out of Stock
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <FiShoppingBag className="w-4 h-4" />
              Add to Cart
            </span>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
